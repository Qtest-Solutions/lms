import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { courseId, title } = body ?? {};
  const section = await prisma.section.create({ data: { courseId, title } });
  return NextResponse.json(section);
}