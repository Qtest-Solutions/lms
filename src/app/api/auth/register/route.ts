import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma, prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password: inputPassword, name, role } = body ?? {};

  if (!email || !inputPassword || !name) {
    return NextResponse.json({ message: "Email, password and name are required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ message: "Email already registered" }, { status: 401 });
  }

  const hash = await bcrypt.hash(inputPassword, 10);
  const user = await prisma.user.create({
    data: { email, password: hash, name, role: (role as Prisma.UserCreateInput["role"]) ?? "STUDENT" },
  });

  const payload = { sub: user.id, email: user.email, role: user.role };
  const token = signToken(payload);

  const { password: _pw, ...safeUser } = user;
  void _pw;
  return NextResponse.json({ accessToken: token, user: safeUser });
}