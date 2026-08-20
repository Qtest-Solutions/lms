import { NextResponse } from "next/server";
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