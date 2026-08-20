import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

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

export async function GET() {
  const teachers = await prisma.user.findMany({ where: { role: "TEACHER" } });
  const results = await Promise.all(teachers.map((u) => teacherDetails(u.id)));
  return NextResponse.json(results.filter((r) => r !== null));
}

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, name } = body ?? {};
  const hash = await bcrypt.hash(password, 10);
  const teacher = await prisma.user.create({
    data: { email, password: hash, name, role: "TEACHER" },
  });
  return NextResponse.json(teacher);
}