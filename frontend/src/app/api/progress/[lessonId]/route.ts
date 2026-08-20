import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(req: Request, ctx: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await ctx.params;
  const url = new URL(req.url);
  const studentId = url.searchParams.get("studentId");
  if (!studentId) return NextResponse.json({ message: "studentId is required" }, { status: 400 });

  await prisma.lessonProgress.deleteMany({ where: { studentId, lessonId } });
  return NextResponse.json({ success: true });
}