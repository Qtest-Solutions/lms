import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authUserFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  const session = authUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 401 });
  }

  const { password, ...safeUser } = user;
  void password;
  return NextResponse.json(safeUser);
}

export async function PUT(req: Request) {
  const session = authUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { name, email, currentPassword, newPassword } = body ?? {};

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 401 });
  }

  const data: { name?: string; email?: string; password?: string } = {};

  if (typeof name === "string" && name.trim() && name.trim() !== user.name) {
    data.name = name.trim();
  }
  if (typeof email === "string" && email.trim() && email.trim() !== user.email) {
    const taken = await prisma.user.findUnique({ where: { email: email.trim() } });
    if (taken) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 });
    }
    data.email = email.trim();
  }
  if (newPassword) {
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json({ message: "New password must be at least 6 characters" }, { status: 400 });
    }
    if (typeof currentPassword !== "string" || !(await bcrypt.compare(currentPassword, user.password))) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
    }
    data.password = await bcrypt.hash(newPassword, 10);
  }

  const updated = Object.keys(data).length
    ? await prisma.user.update({ where: { id: user.id }, data })
    : user;

  const { password, ...safeUser } = updated;
  void password;
  return NextResponse.json(safeUser);
}