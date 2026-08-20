import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function decorate<T extends { students: { id: string }[] }>(batches: T[]) {
  return batches.map((b) => ({
    ...b,
    studentIds: b.students.map((s) => s.id),
  }));
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const batch = await prisma.batch.findUnique({
    where: { id },
    include: { teacher: true, students: true, course: true },
  });
  if (!batch) return NextResponse.json({ message: "Batch not found" }, { status: 404 });
  return NextResponse.json(decorate([batch])[0]);
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const batch = await prisma.batch.update({ where: { id }, data: body });
  return NextResponse.json(batch);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const batch = await prisma.batch.delete({ where: { id } });
  return NextResponse.json(batch);
}