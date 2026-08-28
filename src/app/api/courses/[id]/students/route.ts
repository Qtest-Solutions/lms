import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const batches = await prisma.batch.findMany({
    where: { courseId: id },
    include: { students: { select: { id: true, name: true, email: true } } },
  });
  const students = batches.flatMap((b) => b.students);
  const unique = Array.from(new Map(students.map((s) => [s.id, s])).values());
  return NextResponse.json(unique);
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { studentId } = await req.json();
  if (!studentId) return NextResponse.json({ message: "studentId required" }, { status: 400 });

  let batch = await prisma.batch.findFirst({ where: { courseId: id } });
  if (!batch) {
    batch = await prisma.batch.create({ data: { name: "Default", courseId: id, teacherId: "" } });
  }

  await prisma.batch.update({
    where: { id: batch.id },
    data: { students: { connect: { id: studentId } } },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { studentId } = await req.json();
  if (!studentId) return NextResponse.json({ message: "studentId required" }, { status: 400 });

  const batches = await prisma.batch.findMany({ where: { courseId: id } });
  for (const batch of batches) {
    await prisma.batch.update({
      where: { id: batch.id },
      data: { students: { disconnect: { id: studentId } } },
    }).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}