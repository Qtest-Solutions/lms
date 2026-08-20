import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const teacherId = body?.teacherId ?? null;

  const student = await prisma.user.findFirst({ where: { id, role: "STUDENT" } });
  if (!student) return NextResponse.json({ message: "Student not found" }, { status: 404 });

  if (teacherId !== null) {
    const teacher = await prisma.user.findFirst({ where: { id: teacherId, role: "TEACHER" } });
    if (!teacher) return NextResponse.json({ message: "Teacher not found" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { assignedTeacherId: teacherId },
    include: { assignedTeacher: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(updated);
}