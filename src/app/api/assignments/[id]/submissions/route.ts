import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const submissions = await prisma.assignmentSubmission.findMany({
    where: { assignmentId: id },
    include: { student: { select: { id: true, name: true, email: true } } },
    orderBy: { submittedAt: "asc" },
  });
  return NextResponse.json(submissions);
}