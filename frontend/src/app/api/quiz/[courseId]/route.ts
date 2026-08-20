import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, ctx: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await ctx.params;
  const all = await prisma.question.findMany({
    where: { courseId },
    select: { id: true, question: true, options: true },
  });
  const shuffled = all.sort(() => Math.random() - 0.5);
  const limit = 20;
  const questions = shuffled.slice(0, Math.min(limit, all.length)).map((q) => ({
    id: q.id,
    question: q.question,
    options: JSON.parse(q.options) as string[],
  }));
  return NextResponse.json(questions);
}

export async function POST(req: Request, ctx: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await ctx.params;
  const body = await req.json();
  const { studentId, answers } = (body ?? {}) as {
    studentId: string;
    answers: { questionId: string; selectedIndex: number }[];
  };

  const questions = await prisma.question.findMany({
    where: { courseId },
    select: { id: true, correctIndex: true, explanation: true },
  });
  const byId = new Map(questions.map((q) => [q.id, q]));
  let score = 0;
  const results = answers.map((a: { questionId: string; selectedIndex: number }) => {
    const q = byId.get(a.questionId);
    if (!q) return null;
    const correct = a.selectedIndex === q.correctIndex;
    if (correct) score += 1;
    return {
      questionId: q.id,
      selectedIndex: a.selectedIndex,
      correctIndex: q.correctIndex,
      correct,
      explanation: q.explanation,
    };
  });

  const attempt = await prisma.quizAttempt.create({
    data: {
      courseId,
      studentId,
      score,
      total: answers.length,
      answers: JSON.stringify(answers.map((a) => ({ questionId: a.questionId, selectedIndex: a.selectedIndex }))),
    },
  });

  return NextResponse.json({ attempt, score, total: answers.length, results: results.filter(Boolean) });
}