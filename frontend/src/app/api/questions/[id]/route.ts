import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const payload: Record<string, unknown> = {};
  if (body.question !== undefined) payload.question = body.question;
  if (body.options !== undefined) payload.options = JSON.stringify(body.options);
  if (body.correctIndex !== undefined) payload.correctIndex = body.correctIndex;
  if (body.explanation !== undefined) payload.explanation = body.explanation;
  const question = await prisma.question.update({ where: { id }, data: payload });
  return NextResponse.json(question);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const question = await prisma.question.delete({ where: { id } });
  return NextResponse.json(question);
}