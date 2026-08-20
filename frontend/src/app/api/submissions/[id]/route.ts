import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const { status, score, feedback, verifiedBy } = body ?? {};
  const submission = await prisma.assignmentSubmission.update({
    where: { id },
    data: {
      status,
      score: score ?? null,
      feedback: feedback ?? null,
      verifiedBy,
      verifiedAt: new Date(),
    },
  });
  return NextResponse.json(submission);
}