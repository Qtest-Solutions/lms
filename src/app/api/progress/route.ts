import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureCompletionCertificate } from "@/lib/certificates";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const studentId = url.searchParams.get("studentId");
  if (!studentId) return NextResponse.json({ message: "studentId is required" }, { status: 400 });

  const records = await prisma.lessonProgress.findMany({
    where: { studentId },
    select: { lessonId: true, completedAt: true },
    orderBy: { completedAt: "desc" },
  });
  return NextResponse.json(records);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { studentId, lessonId } = body ?? {};

  const record = await prisma.lessonProgress.upsert({
    where: { studentId_lessonId: { studentId, lessonId } },
    create: { studentId, lessonId },
    update: { completedAt: new Date() },
  });

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { section: { select: { courseId: true } } },
  });
  if (lesson) {
    try {
      await ensureCompletionCertificate(studentId, lesson.section.courseId);
    } catch (err) {
      console.error("ensureCompletionCertificate failed", err);
    }
  }

  return NextResponse.json(record);
}