import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const { status } = body ?? {};

  if (!status || !["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ message: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.registrationRequest.update({
    where: { id },
    data: { status, reviewedAt: new Date() },
  });

  return NextResponse.json(updated);
}
