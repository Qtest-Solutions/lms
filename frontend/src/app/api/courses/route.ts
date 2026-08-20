import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const CACHE_KEY = "courses:all";
const TTL = 60;
const cache: Record<string, { data: unknown; expires: number }> = {};

function withLessonCount<T extends { sections: { lessons: unknown[] }[] }>(courses: T[]) {
  return courses.map((c) => ({
    ...c,
    lessonCount: c.sections.reduce((n: number, s: { lessons: unknown[] }) => n + s.lessons.length, 0),
  }));
}

function invalidateCache() {
  delete cache[CACHE_KEY];
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const teacherId = url.searchParams.get("teacherId");

  if (teacherId) {
    const [batches, sessions] = await Promise.all([
      prisma.batch.findMany({ where: { teacherId }, select: { courseId: true } }),
      prisma.liveSession.findMany({ where: { teacherId }, select: { courseId: true } }),
    ]);
    const ids = new Set([...batches.map((b) => b.courseId), ...sessions.map((s) => s.courseId)]);
    const courses = await prisma.course.findMany({
      where: { id: { in: [...ids] } },
      include: { sections: { include: { lessons: true } } },
    });
    return NextResponse.json(withLessonCount(courses));
  }

  const hit = cache[CACHE_KEY];
  if (hit && hit.expires > Date.now()) {
    return NextResponse.json(hit.data);
  }

  const courses = await prisma.course.findMany({
    include: { sections: { include: { lessons: true } } },
  });
  const result = withLessonCount(courses);
  cache[CACHE_KEY] = { data: result, expires: Date.now() + TTL * 1000 };
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, description, code } = body ?? {};
  const course = await prisma.course.create({ data: { title, description, code } });
  invalidateCache();
  return NextResponse.json(course);
}