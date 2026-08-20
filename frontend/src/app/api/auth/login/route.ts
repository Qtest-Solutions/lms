import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password: inputPassword } = body ?? {};

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(inputPassword, user.password))) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const payload = { sub: user.id, email: user.email, role: user.role };
  const token = signToken(payload);

  const { password: _pw, ...safeUser } = user;
  void _pw;
  return NextResponse.json({ accessToken: token, user: safeUser });
}