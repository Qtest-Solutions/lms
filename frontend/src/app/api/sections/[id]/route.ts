import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const section = await prisma.section.update({ where: { id }, data: body });
  return NextResponse.json(section);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const section = await prisma.section.delete({ where: { id } });
  return NextResponse.json(section);
}