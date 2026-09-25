import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: { sections: { include: { lessons: true } } },
  });
  if (!course) return NextResponse.json({ message: "Course not found" }, { status: 404 });
  return NextResponse.json(course);
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  if (("title" in body && !body.title?.trim()) || ("code" in body && !body.code?.trim())) {
    return NextResponse.json({ message: "Title and code are required" }, { status: 400 });
  }
  const course = await prisma.course.update({ where: { id }, data: body });
  return NextResponse.json(course);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const course = await prisma.course.delete({ where: { id } });
  return NextResponse.json(course);
}