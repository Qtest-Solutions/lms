import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function decorate<T extends { studentId: string; courseId: string }>(certs: T[]) {
  const [users, courses] = await Promise.all([
    prisma.user.findMany(),
    prisma.course.findMany(),
  ]);
  const u = new Map(users.map((x) => [x.id, x]));
  const c = new Map(courses.map((x) => [x.id, x]));
  return certs.map((cert) => ({
    ...cert,
    student: u.get(cert.studentId) ?? null,
    course: c.get(cert.courseId) ?? null,
  }));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const studentId = url.searchParams.get("studentId");

  if (studentId) {
    const certs = await prisma.certificate.findMany({
      where: { studentId },
      orderBy: { issuedAt: "desc" },
    });
    return NextResponse.json(await decorate(certs));
  }

  const certs = await prisma.certificate.findMany({ orderBy: { issuedAt: "desc" } });
  return NextResponse.json(await decorate(certs));
}

export async function POST(req: Request) {
  const body = await req.json();
  const { studentId, courseId, templateId } = body ?? {};

  const [student, course] = await Promise.all([
    prisma.user.findUnique({ where: { id: studentId } }),
    prisma.course.findUnique({ where: { id: courseId } }),
  ]);

  if (!student || !course) {
    return NextResponse.json({ message: "Student or course not found" }, { status: 400 });
  }
  if (student.role !== "STUDENT") {
    return NextResponse.json({ message: "Certificate can only be issued to a student" }, { status: 400 });
  }

  const tplId = templateId ?? null;
  if (tplId) {
    const tpl = await prisma.certificateTemplate.findUnique({ where: { id: tplId } });
    if (!tpl) return NextResponse.json({ message: "Template not found" }, { status: 400 });
  }

  const existing = await prisma.certificate.findFirst({
    where: { studentId, courseId },
  });

  const cert = existing
    ? await prisma.certificate.update({ where: { id: existing.id }, data: { templateId: tplId } })
    : await prisma.certificate.create({
        data: {
          studentId,
          courseId,
          templateId: tplId,
          publicId: "CERT-" + Math.floor(100000 + Math.random() * 899999),
        },
      });

  return NextResponse.json({
    ...cert,
    student: { id: student.id, name: student.name, email: student.email },
    course: { id: course.id, title: course.title, code: course.code },
    downloadable: true,
  });
}