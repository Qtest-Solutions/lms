import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const recordings = await prisma.recording.findMany({
    include: { session: true, students: true },
  });
  return NextResponse.json(
    recordings.map((r) => ({
      ...r,
      session: r.session ?? undefined,
    }))
  );
}

export async function POST(req: Request) {
  const body = await req.json();
  const { sessionId, title, url, duration, studentIds } = body ?? {};
  const recording = await prisma.recording.create({
    data: {
      sessionId,
      title,
      url,
      duration,
      students: studentIds?.length ? { connect: studentIds.map((id: string) => ({ id })) } : undefined,
    },
  });
  return NextResponse.json(recording);
}