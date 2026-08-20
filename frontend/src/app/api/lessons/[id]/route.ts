import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const lesson = await prisma.lesson.update({ where: { id }, data: body });
  return NextResponse.json(lesson);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const lesson = await prisma.lesson.delete({ where: { id } });
  return NextResponse.json(lesson);
}