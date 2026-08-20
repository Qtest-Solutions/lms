import { NextResponse } from "next/server";

export function json<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

export function error(message: string, status = 400): NextResponse {
  return NextResponse.json({ message }, { status });
}

export function notFound(message = "Not found"): NextResponse {
  return NextResponse.json({ message }, { status: 404 });
}

export function unauthorized(message = "Unauthorized"): NextResponse {
  return NextResponse.json({ message }, { status: 401 });
}

export async function body<T>(req: Request): Promise<T> {
  return (await req.json()) as T;
}
