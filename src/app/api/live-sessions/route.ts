import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jitsiRoomUrl } from "@/lib/live";

function decorate<T extends { id: string }>(sessions: T[]) {
  return sessions.map((s) => ({
    ...s,
    joinUrl: jitsiRoomUrl(s.id),
  }));
}

export async function GET() {
  const sessions = await prisma.liveSession.findMany({
    include: { teacher: true, students: true, course: true, batch: true },
  });
  return NextResponse.json(decorate(sessions));
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, teacherId, studentId, batchId, courseId, startTime, endTime, duration, type } = body ?? {};

  const studentIds: string[] = [];
  if (studentId) {
    studentIds.push(studentId);
  } else if (batchId) {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { students: true },
    });
    studentIds.push(...(batch?.students.map((s) => s.id) ?? []));
  }

  const session = await prisma.liveSession.create({
    data: {
      title,
      teacherId,
      batchId: batchId ?? null,
      courseId,
      startTime: startTime ?? null,
      endTime: endTime ?? null,
      duration,
      type: type === "batch" ? "BATCH" : "ONE_TO_ONE",
      students: studentIds.length ? { connect: studentIds.map((id) => ({ id })) } : undefined,
    },
  });

  return NextResponse.json({ ...session, joinUrl: jitsiRoomUrl(session.id) });
}