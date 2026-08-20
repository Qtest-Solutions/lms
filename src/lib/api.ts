const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";
const TOKEN_COOKIE = "lms_token";
const MAX_AGE = 60 * 60 * 24 * 7;

function setTokenCookie(t: string | null) {
  if (typeof document === "undefined") return;
  if (t) {
    document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(t)}; path=/; max-age=${MAX_AGE}; samesite=lax`;
  } else {
    document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; samesite=lax`;
  }
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "student" | "teacher" | "admin";
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

let token: string | null = null;

export function setToken(t: string | null) {
  token = t;
  setTokenCookie(t);
  if (typeof window !== "undefined") {
    if (t) localStorage.setItem("lms_token", t);
    else localStorage.removeItem("lms_token");
  }
}

export function getToken(): string | null {
  if (token) return token;
  if (typeof window !== "undefined") return localStorage.getItem("lms_token");
  return null;
}

export function getMe(): AuthUser | null {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("lms_user");
    return raw ? JSON.parse(raw) : null;
  }
  return null;
}

export function saveMe(user: AuthUser) {
  localStorage.setItem("lms_user", JSON.stringify(user));
}

export function logout() {
  setToken(null);
  if (typeof window !== "undefined") localStorage.removeItem("lms_user");
}

export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const t = getToken();
  if (t) headers["Authorization"] = `Bearer ${t}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    logout();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.text();
    let message = body || `Request failed: ${res.status}`;
    try {
      const parsed = JSON.parse(body);
      if (parsed && typeof parsed.message === "string") message = parsed.message;
    } catch {
      // keep raw body
    }
    throw new Error(message);
  }

  const ct = res.headers.get("content-type") || "";
  return (ct.includes("json") ? res.json() : res.text()) as T;
}

// Convenience helpers
export const http = {
  get: <T = any>(path: string) => api<T>(path),
  post: <T = any>(path: string, body: unknown) => api<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T = any>(path: string, body: unknown) => api<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  del: <T = any>(path: string) => api<T>(path, { method: "DELETE" }),
};

export interface UploadResult {
  key: string;
  publicUrl: string;
}

// Presign a PUT URL from the server, then upload the file directly to R2.
// Optionally report progress via onProgress (0-100).
export async function uploadFile(file: File, folder?: string, onProgress?: (percent: number) => void): Promise<UploadResult> {
  const presign = await http.post<{ key: string; uploadUrl: string; publicUrl: string }>("/uploads/presign", {
    filename: file.name,
    contentType: file.type || "application/octet-stream",
    folder,
  });

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presign.uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
    xhr.onerror = () => reject(new Error("Upload failed: network error"));
    xhr.send(file);
  });

  return { key: presign.key, publicUrl: presign.publicUrl };
}