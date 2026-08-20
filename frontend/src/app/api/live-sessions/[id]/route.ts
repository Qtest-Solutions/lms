import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jitsiRoomUrl } from "@/lib/live";

function decorate<T extends { id: string }>(sessions: T[]) {
  return sessions.map((s) => ({
    ...s,
    joinUrl: jitsiRoomUrl(s.id),
  }));
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = await prisma.liveSession.findUnique({
    where: { id },
    include: { teacher: true, students: true, course: true, batch: true, recording: true },
  });
  if (!session) return NextResponse.json({ message: "Session not found" }, { status: 404 });
  return NextResponse.json(decorate([session])[0]);
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const session = await prisma.liveSession.update({ where: { id }, data: body });
  return NextResponse.json(session);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = await prisma.liveSession.delete({ where: { id } });
  return NextResponse.json(session);
}