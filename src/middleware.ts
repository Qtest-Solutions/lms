import { NextResponse, type NextRequest } from "next/server";

const SECRET = "lms-mvp-secret";

const ROLE_HOME: Record<string, string> = {
  STUDENT: "/dashboard",
  TEACHER: "/teacher",
  ADMIN: "/admin",
};

function base64UrlToBytes(input: string): Uint8Array<ArrayBuffer> {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function verifyJwt(token: string): Promise<{ sub: string; role: string } | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlToBytes(signature),
    new TextEncoder().encode(`${header}.${payload}`)
  );
  if (!valid) return null;

  try {
    const data = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload)));
    if (!data.sub || !data.role) return null;
    return { sub: data.sub, role: String(data.role) };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("lms_token")?.value;

  if (!token) {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  const session = await verifyJwt(token);
  if (!session) {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  const home = ROLE_HOME[session.role];
  if (!home) return NextResponse.redirect(new URL("/login", req.url));

  const pathname = req.nextUrl.pathname;
  const allowed = pathname === home || pathname.startsWith(home + "/") || pathname === "/profile";

  if (!allowed) {
    return NextResponse.redirect(new URL(home, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/teacher/:path*", "/admin/:path*", "/profile"],
};