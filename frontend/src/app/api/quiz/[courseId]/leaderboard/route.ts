import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, ctx: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await ctx.params;
  const attempts = await prisma.quizAttempt.findMany({
    where: { courseId },
    include: { student: { select: { name: true } } },
    orderBy: [{ score: "desc" }, { createdAt: "asc" }],
    take: 10,
  });
  return NextResponse.json(attempts);
}