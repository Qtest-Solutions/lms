import { NextResponse } from "next/server";
import { Prisma, prisma } from "@/lib/db";

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, name, role } = body ?? {};
  const user = await prisma.user.create({
    data: { email, password, name, role: (role as Prisma.UserCreateInput["role"]) ?? "STUDENT" },
  });
  return NextResponse.json(user);
}