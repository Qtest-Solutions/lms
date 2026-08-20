import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const { studentId, content, attachmentUrl } = body ?? {};
  const submission = await prisma.assignmentSubmission.upsert({
    where: { assignmentId_studentId: { assignmentId: id, studentId } },
    create: { assignmentId: id, studentId, content, attachmentUrl: attachmentUrl ?? null },
    update: {
      content,
      attachmentUrl: attachmentUrl ?? null,
      status: "SUBMITTED",
      score: null,
      feedback: null,
      verifiedBy: null,
      verifiedAt: null,
      submittedAt: new Date(),
    },
  });
  return NextResponse.json(submission);
}