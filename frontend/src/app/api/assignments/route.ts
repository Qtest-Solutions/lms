import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const courseId = url.searchParams.get("courseId");
  const teacherId = url.searchParams.get("teacherId");
  const studentId = url.searchParams.get("studentId");

  if (teacherId) {
    const assignments = await prisma.assignment.findMany({
      where: { createdBy: teacherId },
      include: {
        course: { select: { id: true, title: true, code: true } },
        submissions: { include: { student: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(assignments);
  }

  if (!courseId) return NextResponse.json({ message: "courseId is required" }, { status: 400 });

  const assignments = await prisma.assignment.findMany({
    where: { courseId },
    include: {
      submissions: studentId ? { where: { studentId } } : true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(assignments);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { courseId, title, description, points, dueAt, createdBy } = body ?? {};
  const assignment = await prisma.assignment.create({
    data: {
      courseId,
      title,
      description,
      points: points ?? 10,
      dueAt: dueAt ? new Date(dueAt) : null,
      createdBy,
    },
  });
  return NextResponse.json(assignment);
}