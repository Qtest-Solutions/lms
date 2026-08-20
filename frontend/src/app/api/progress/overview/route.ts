import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const studentId = url.searchParams.get("studentId");
  if (!studentId) return NextResponse.json({ message: "studentId is required" }, { status: 400 });

  const [lessons, progress] = await Promise.all([
    prisma.lesson.findMany({
      select: { id: true, section: { select: { courseId: true } } },
    }),
    prisma.lessonProgress.findMany({ where: { studentId }, select: { lessonId: true } }),
  ]);

  const completed = new Set(progress.map((p) => p.lessonId));
  const totals = new Map<string, number>();
  const done = new Map<string, number>();

  for (const l of lessons) {
    const courseId = l.section.courseId;
    totals.set(courseId, (totals.get(courseId) ?? 0) + 1);
    if (completed.has(l.id)) done.set(courseId, (done.get(courseId) ?? 0) + 1);
  }

  return NextResponse.json(
    [...totals.entries()].map(([courseId, total]) => ({
      courseId,
      completedLessons: done.get(courseId) ?? 0,
      totalLessons: total,
    }))
  );
}