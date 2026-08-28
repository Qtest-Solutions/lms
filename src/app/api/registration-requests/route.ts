import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const requests = await prisma.registrationRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, phone, message } = body ?? {};

  if (!name || !email) {
    return NextResponse.json({ message: "Name and email are required" }, { status: 400 });
  }

  const existing = await prisma.registrationRequest.findFirst({
    where: { email, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json({ message: "You have already submitted a request. We'll get back to you soon." }, { status: 409 });
  }

  const request = await prisma.registrationRequest.create({
    data: { name, email, phone: phone || null, message: message || null },
  });

  return NextResponse.json({ message: "Request submitted successfully", id: request.id }, { status: 201 });
}
