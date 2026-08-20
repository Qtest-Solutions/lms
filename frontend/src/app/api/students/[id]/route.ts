import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const student = await prisma.user.findFirst({
    where: { id, role: "STUDENT" },
    include: { assignedTeacher: { select: { id: true, name: true, email: true } } },
  });
  if (!student) return NextResponse.json({ message: "Student not found" }, { status: 404 });
  return NextResponse.json(student);
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const student = await prisma.user.update({ where: { id }, data: body });
  return NextResponse.json(student);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const student = await prisma.user.delete({ where: { id } });
  return NextResponse.json(student);
}