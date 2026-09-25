import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isValidEmail, isValidName } from "@/lib/utils";

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
  if (body?.name !== undefined) {
    if (!isValidName(body.name)) {
      return NextResponse.json(
        { message: "Name can only contain letters, spaces, hyphens, and apostrophes" },
        { status: 400 }
      );
    }
    body.name = body.name.trim();
  }
  if (body?.email !== undefined && !isValidEmail(body.email ?? "")) {
    return NextResponse.json({ message: "A valid email address is required" }, { status: 400 });
  }
  const student = await prisma.user.update({ where: { id }, data: body });
  return NextResponse.json(student);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const student = await prisma.user.delete({ where: { id } });
  return NextResponse.json(student);
}