import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const courseId = url.searchParams.get("courseId");
  if (!courseId) return NextResponse.json({ message: "courseId is required" }, { status: 400 });

  const questions = await prisma.question.findMany({
    where: { courseId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(questions);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { courseId, question, options, correctIndex, explanation, createdBy } = body ?? {};
  const created = await prisma.question.create({
    data: {
      courseId,
      question,
      options: JSON.stringify(options),
      correctIndex,
      explanation: explanation ?? "",
      createdBy,
    },
  });
  return NextResponse.json(created);
}