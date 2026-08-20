import { NextResponse } from "next/server";
import { Prisma, prisma } from "@/lib/db";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const tpl = await prisma.certificateTemplate.findUnique({ where: { id } });
  if (!tpl) return NextResponse.json({ message: "Template not found" }, { status: 404 });
  return NextResponse.json(tpl);
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const tpl = await prisma.certificateTemplate.findUnique({ where: { id } });
  if (!tpl) return NextResponse.json({ message: "Template not found" }, { status: 404 });

  const updated = await prisma.certificateTemplate.update({
    where: { id },
    data: {
      name: body.name ?? tpl.name,
      description: body.description ?? tpl.description,
      width: body.width ?? tpl.width,
      height: body.height ?? tpl.height,
      background: body.background ?? tpl.background,
      backgroundImage: body.backgroundImage !== undefined ? body.backgroundImage : tpl.backgroundImage,
      borderStyle: body.borderStyle ?? tpl.borderStyle,
      borderWidth: body.borderWidth ?? tpl.borderWidth,
      borderColor: body.borderColor ?? tpl.borderColor,
      elements: (body.elements ?? tpl.elements) as Prisma.InputJsonValue,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const tpl = await prisma.certificateTemplate.findUnique({ where: { id } });
  if (!tpl) return NextResponse.json({ message: "Template not found" }, { status: 404 });
  await prisma.certificateTemplate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}