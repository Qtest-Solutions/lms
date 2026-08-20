import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { sectionId, title, type, content } = body ?? {};
  const lesson = await prisma.lesson.create({ data: { sectionId, title, type, content } });
  return NextResponse.json(lesson);
}