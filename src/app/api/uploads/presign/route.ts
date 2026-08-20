import { NextResponse } from "next/server";
import { createPresignedUploadUrl, publicUrlForKey, isR2Configured } from "@/lib/r2";
import { authUserFromRequest } from "@/lib/auth";

const ALLOWED_EXTENSIONS = [
  "mp4", "webm", "mov", "avi", "mkv", "m4v",
  "jpg", "jpeg", "png", "gif", "webp", "svg", "avif",
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
  "txt", "zip", "csv",
];

function sanitizeFilename(filename: string): string {
  const base = filename.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_");
  return base.length > 100 ? base.slice(-100) : base;
}

export async function POST(req: Request) {
  const auth = authUserFromRequest(req);
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (!isR2Configured()) {
    return NextResponse.json(
      { message: "R2 storage is not configured. Set R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const { filename, contentType, folder = "uploads" } = body ?? {};
  if (!filename || !contentType) {
    return NextResponse.json({ message: "filename and contentType are required" }, { status: 400 });
  }

  const ext = (filename.split(".").pop() ?? "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json({ message: `File type .${ext} is not allowed` }, { status: 400 });
  }

  const safeFolder = folder.replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9/_-]/g, "");
  const key = `${safeFolder}/${Date.now()}-${sanitizeFilename(filename)}`;

  const uploadUrl = await createPresignedUploadUrl({ key, contentType });

  return NextResponse.json({
    key,
    uploadUrl,
    publicUrl: publicUrlForKey(key),
    expiresIn: 3600,
  });
}