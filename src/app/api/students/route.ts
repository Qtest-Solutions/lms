import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { isValidEmail } from "@/lib/utils";

export async function GET() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: { assignedTeacher: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(students);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, name } = body ?? {};
  if (!isValidEmail(email ?? "")) {
    return NextResponse.json({ message: "A valid email address is required" }, { status: 400 });
  }
  const hash = await bcrypt.hash(password, 10);
  const student = await prisma.user.create({
    data: { email, password: hash, name, role: "STUDENT" },
  });
  return NextResponse.json(student);
}