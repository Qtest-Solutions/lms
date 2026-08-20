import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const payload: Record<string, unknown> = {};
  if (body.title !== undefined) payload.title = body.title;
  if (body.description !== undefined) payload.description = body.description;
  if (body.points !== undefined) payload.points = body.points;
  if (body.dueAt !== undefined) payload.dueAt = body.dueAt ? new Date(body.dueAt) : null;
  const assignment = await prisma.assignment.update({ where: { id }, data: payload });
  return NextResponse.json(assignment);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const assignment = await prisma.assignment.delete({ where: { id } });
  return NextResponse.json(assignment);
}