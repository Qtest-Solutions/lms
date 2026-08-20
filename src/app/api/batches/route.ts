import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function decorate<T extends { students: { id: string }[] }>(batches: T[]) {
  return batches.map((b) => ({
    ...b,
    studentIds: b.students.map((s) => s.id),
  }));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const teacherId = url.searchParams.get("teacherId");

  if (teacherId) {
    const batches = await prisma.batch.findMany({
      where: { teacherId },
      include: { teacher: true, students: true },
    });
    return NextResponse.json(decorate(batches));
  }

  const batches = await prisma.batch.findMany({
    include: { teacher: true, students: true, course: true },
  });
  return NextResponse.json(decorate(batches));
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, teacherId, courseId, studentIds } = body ?? {};
  const batch = await prisma.batch.create({
    data: {
      name,
      teacherId,
      courseId,
      students: studentIds?.length ? { connect: studentIds.map((id: string) => ({ id })) } : undefined,
    },
  });
  return NextResponse.json(batch);
}