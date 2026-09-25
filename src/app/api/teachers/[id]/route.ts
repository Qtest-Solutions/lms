import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isValidEmail } from "@/lib/utils";

async function teacherDetails(teacherId: string) {
  const [teacher, batches, sessions] = await Promise.all([
    prisma.user.findFirst({ where: { id: teacherId, role: "TEACHER" } }),
    prisma.batch.findMany({ where: { teacherId }, include: { students: true } }),
    prisma.liveSession.findMany({ where: { teacherId }, include: { students: true } }),
  ]);
  if (!teacher) return null;

  const batchStudentIds = new Set(batches.flatMap((b) => b.students.map((s) => s.id)));
  const sessionStudentIds = new Set(sessions.flatMap((s) => s.students.map((s) => s.id)));
  const ids = [...batchStudentIds, ...sessionStudentIds];

  const students = await prisma.user.findMany({
    where: { id: { in: ids }, role: "STUDENT" },
  });

  const assignedStudents = await prisma.user.findMany({
    where: { assignedTeacherId: teacherId, role: "STUDENT" },
    select: { id: true, name: true, email: true },
  });

  const serializedBatches = batches.map((b) => ({ ...b, studentIds: b.students.map((s) => s.id) }));

  return {
    ...teacher,
    password: undefined,
    batches: serializedBatches,
    students,
    assignedStudents,
  };
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const details = await teacherDetails(id);
  if (!details) return NextResponse.json({ message: "Teacher not found" }, { status: 404 });
  return NextResponse.json(details);
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  if (body?.email !== undefined && !isValidEmail(body.email ?? "")) {
    return NextResponse.json({ message: "A valid email address is required" }, { status: 400 });
  }
  const teacher = await prisma.user.update({ where: { id }, data: body });
  return NextResponse.json(teacher);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const teacher = await prisma.user.delete({ where: { id } });
  return NextResponse.json(teacher);
}