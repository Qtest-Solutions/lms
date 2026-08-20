import { NextResponse } from "next/server";
import { certificatePdf } from "@/lib/certificates";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const buffer = await certificatePdf(id);
    const body = new Uint8Array(buffer);
    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="certificate-${id}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ message: "Certificate not found" }, { status: 400 });
  }
}