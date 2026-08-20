import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const batch = await prisma.batch.update({
    where: { id },
    data: { students: { connect: { id: body.studentId } } },
  });
  return NextResponse.json(batch);
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const batch = await prisma.batch.update({
    where: { id },
    data: { students: { disconnect: { id: body.studentId } } },
  });
  return NextResponse.json(batch);
}