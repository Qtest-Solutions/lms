import { NextResponse } from "next/server";
import { Prisma, prisma } from "@/lib/db";
import { A4_LANDSCAPE } from "@/lib/certificates";

export async function GET() {
  const templates = await prisma.certificateTemplate.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(templates);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, ...rest } = body ?? {};
  if (!name?.trim()) {
    return NextResponse.json({ message: "Template name is required" }, { status: 400 });
  }
  const template = await prisma.certificateTemplate.create({
    data: {
      name: name.trim(),
      description: "",
      width: rest.width ?? A4_LANDSCAPE.width,
      height: rest.height ?? A4_LANDSCAPE.height,
      background: rest.background ?? "#FFFFFF",
      backgroundImage: rest.backgroundImage ?? null,
      borderStyle: rest.borderStyle ?? "solid",
      borderWidth: rest.borderWidth ?? 3,
      borderColor: rest.borderColor ?? "#000000",
      elements: (rest.elements ?? []) as Prisma.InputJsonValue,
    },
  });
  return NextResponse.json(template);
}