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

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const cert = await prisma.certificate.findUnique({ where: { id } });
  if (!cert) return NextResponse.json({ message: "Certificate not found" }, { status: 404 });
  const [n] = await decorate([cert]);
  return NextResponse.json(n);
}