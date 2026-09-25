import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCachedCourses, setCachedCourses, invalidateCoursesCache } from "@/lib/courses-cache";

function withLessonCount<T extends { sections: { lessons: unknown[] }[] }>(courses: T[]) {
  return courses.map((c) => ({
    ...c,
    lessonCount: c.sections.reduce((n: number, s: { lessons: unknown[] }) => n + s.lessons.length, 0),
  }));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const teacherId = url.searchParams.get("teacherId");
  const studentId = url.searchParams.get("studentId");
  const hasStudents = url.searchParams.get("hasStudents");

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

  if (studentId) {
    const [batches, sessions] = await Promise.all([
      prisma.batch.findMany({ where: { students: { some: { id: studentId } } }, select: { courseId: true } }),
      prisma.liveSession.findMany({ where: { students: { some: { id: studentId } } }, select: { courseId: true } }),
    ]);
    const ids = new Set([...batches.map((b) => b.courseId), ...sessions.map((s) => s.courseId)]);
    if (ids.size === 0) return NextResponse.json([]);
    const courses = await prisma.course.findMany({
      where: { id: { in: [...ids] } },
      include: { sections: { include: { lessons: true } } },
    });
    return NextResponse.json(withLessonCount(courses));
  }

  if (hasStudents === "true") {
    const [batchCourseIds, sessionCourseIds] = await Promise.all([
      prisma.batch.findMany({ where: { students: { some: {} } }, select: { courseId: true } }),
      prisma.liveSession.findMany({ where: { students: { some: {} } }, select: { courseId: true } }),
    ]);
    const ids = new Set([...batchCourseIds.map((b) => b.courseId), ...sessionCourseIds.map((s) => s.courseId)]);
    if (ids.size === 0) return NextResponse.json([]);
    const courses = await prisma.course.findMany({
      where: { id: { in: [...ids] } },
      include: {
        sections: { include: { lessons: true } },
        batches: { include: { students: { select: { id: true } } } },
        sessions: { include: { students: { select: { id: true } } } },
      },
    });
    const result = courses.map((c) => {
      const studentIds = new Set([
        ...c.batches.flatMap((b) => b.students.map((s) => s.id)),
        ...c.sessions.flatMap((s) => s.students.map((s) => s.id)),
      ]);
      return {
        ...c,
        lessonCount: c.sections.reduce((n, s) => n + s.lessons.length, 0),
        studentCount: studentIds.size,
        batches: undefined,
        sessions: undefined,
      };
    });
    return NextResponse.json(result);
  }

  const hit = getCachedCourses<unknown>();
  if (hit !== undefined) {
    return NextResponse.json(hit);
  }

  const courses = await prisma.course.findMany({
    include: { sections: { include: { lessons: true } } },
  });
  const result = withLessonCount(courses);
  setCachedCourses(result);
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, description, code } = body ?? {};
  if (!title?.trim() || !code?.trim()) {
    return NextResponse.json({ message: "Title and code are required" }, { status: 400 });
  }
  const course = await prisma.course.create({ data: { title, description, code } });
  invalidateCoursesCache();
  return NextResponse.json(course);
}