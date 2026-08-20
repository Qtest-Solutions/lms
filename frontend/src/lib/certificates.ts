import PDFDocument from "pdfkit";
import { prisma } from "@/lib/db";

export const A4_LANDSCAPE = { width: 841.89, height: 595.28 };

export type CertElement =
  | { id: string; type: "text"; x: number; y: number; width: number; text: string; fontSize: number; fontFamily: string; fontWeight: string; color: string; align: string }
  | { id: string; type: "line"; x: number; y: number; width: number; color: string; thickness: number }
  | { id: string; type: "rect"; x: number; y: number; width: number; height: number; fill: string }
  | { id: string; type: "image"; x: number; y: number; width: number; height?: number; src: string; opacity?: number; fit?: string };

export interface TemplateData {
  id?: string | null;
  name?: string;
  description?: string;
  width?: number;
  height?: number;
  background?: string;
  backgroundImage?: string;
  borderStyle?: string;
  borderWidth?: number;
  borderColor?: string;
  elements?: CertElement[];
}

interface RenderContext {
  student_name: string;
  student_email: string;
  course_name: string;
  course_code: string;
  date: string;
  year: string;
  certificate_id: string;
}

const PDF_FONTS: Record<string, string> = {
  sans: "Helvetica",
  serif: "Times-Roman",
  mono: "Courier",
};

const FONT_WEIGHTS: Record<string, { normal: string; bold: string }> = {
  sans: { normal: "Helvetica", bold: "Helvetica-Bold" },
  serif: { normal: "Times-Roman", bold: "Times-Bold" },
  mono: { normal: "Courier", bold: "Courier-Bold" },
};

function fontFor(family: string, bold: boolean): string {
  const base = PDF_FONTS[family] ?? "Helvetica";
  const weights = FONT_WEIGHTS[family] ?? FONT_WEIGHTS.sans;
  return bold ? weights.bold : weights.normal ?? base;
}

function replaceTokens(text: string, ctx: RenderContext): string {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => ctx[key as keyof RenderContext] ?? `{${key}}`);
}

export function defaultTemplate(): TemplateData {
  return {
    id: null,
    name: "Classic",
    width: A4_LANDSCAPE.width,
    height: A4_LANDSCAPE.height,
    background: "#FFFDF7",
    borderStyle: "double",
    borderWidth: 3,
    borderColor: "#BF5700",
    elements: classicElements(),
  };
}

function classicElements(): CertElement[] {
  return [
    { id: "title", type: "text", x: 60, y: 95, width: 722, text: "Certificate of Completion", fontSize: 34, fontFamily: "serif", fontWeight: "bold", color: "#BF5700", align: "center" },
    { id: "intro", type: "text", x: 60, y: 175, width: 722, text: "This certifies that", fontSize: 16, fontFamily: "sans", fontWeight: "normal", color: "#2D3748", align: "center" },
    { id: "student", type: "text", x: 60, y: 205, width: 722, text: "{student_name}", fontSize: 30, fontFamily: "serif", fontWeight: "bold", color: "#1F2937", align: "center" },
    { id: "body", type: "text", x: 60, y: 265, width: 722, text: "has successfully completed the course", fontSize: 16, fontFamily: "sans", fontWeight: "normal", color: "#2D3748", align: "center" },
    { id: "course", type: "text", x: 60, y: 300, width: 722, text: "{course_name}", fontSize: 24, fontFamily: "sans", fontWeight: "bold", color: "#BF5700", align: "center" },
    { id: "line", type: "line", x: 300, y: 350, width: 242, color: "#E8C9A1", thickness: 2 },
    { id: "id", type: "text", x: 60, y: 385, width: 722, text: "Certificate ID: {certificate_id}", fontSize: 11, fontFamily: "sans", fontWeight: "normal", color: "#6B7280", align: "center" },
    { id: "date", type: "text", x: 60, y: 405, width: 722, text: "Issued on {date}", fontSize: 11, fontFamily: "sans", fontWeight: "normal", color: "#6B7280", align: "center" },
  ];
}

/** Issue a certificate only if the student has completed every lesson in the course. Idempotent. */
export async function ensureCompletionCertificate(studentId: string, courseId: string) {
  const existing = await prisma.certificate.findFirst({ where: { studentId, courseId } });
  if (existing) return existing;

  const lessons = await prisma.lesson.findMany({
    where: { section: { courseId } },
    select: { id: true },
  });
  if (lessons.length === 0) return null;

  const done = await prisma.lessonProgress.count({
    where: { studentId, lessonId: { in: lessons.map((l) => l.id) } },
  });
  if (done < lessons.length) return null;

  const [student, course] = await Promise.all([
    prisma.user.findUnique({ where: { id: studentId } }),
    prisma.course.findUnique({ where: { id: courseId } }),
  ]);
  if (!student || student.role !== "STUDENT" || !course) return null;

  return prisma.certificate.create({
    data: {
      studentId,
      courseId,
      templateId: null,
      publicId: "CERT-" + Math.floor(100000 + Math.random() * 899999),
    },
  });
}

export async function certificatePdf(id: string): Promise<Buffer> {
  const cert = await prisma.certificate.findUnique({
    where: { id },
    include: { student: true, course: true },
  });

  if (!cert) {
    throw new Error("Certificate not found");
  }

  const template = cert.templateId
    ? await prisma.certificateTemplate.findUnique({ where: { id: cert.templateId } })
    : null;

  const tpl: TemplateData = template
    ? {
        id: template.id,
        name: template.name,
        description: template.description,
        width: template.width,
        height: template.height,
        background: template.background,
        backgroundImage: template.backgroundImage ?? undefined,
        borderStyle: template.borderStyle,
        borderWidth: template.borderWidth,
        borderColor: template.borderColor,
        elements: Array.isArray(template.elements) ? (template.elements as unknown as CertElement[]) : [],
      }
    : defaultTemplate();

  const ctx: RenderContext = {
    student_name: cert.student.name,
    student_email: cert.student.email,
    course_name: cert.course.title,
    course_code: cert.course.code,
    date: new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    year: String(new Date(cert.issuedAt).getFullYear()),
    certificate_id: cert.publicId,
  };

  return renderPdf(tpl, ctx);
}

async function loadImageBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function renderPdf(tpl: TemplateData, ctx: RenderContext): Promise<Buffer> {
  const width = Number(tpl.width) || A4_LANDSCAPE.width;
  const height = Number(tpl.height) || A4_LANDSCAPE.height;
  const elements: CertElement[] = Array.isArray(tpl.elements) ? tpl.elements : [];

  const [bgBuf, imageBufs] = await Promise.all([
    tpl.backgroundImage ? loadImageBuffer(tpl.backgroundImage).catch(() => null) : Promise.resolve(null),
    Promise.all(
      elements
        .filter((el) => el.type === "image" && el.src)
        .map((el) => loadImageBuffer((el as Extract<CertElement, { type: "image" }>).src).catch(() => null))
    ),
  ]);
  const imageMap = new Map<string, Buffer | null>();
  let i = 0;
  for (const el of elements) {
    if (el.type === "image") imageMap.set(el.src, imageBufs[i++] ?? null);
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [width, height] });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.rect(0, 0, width, height).fill(tpl.background ?? "#FFFFFF");

    if (bgBuf) {
      try {
        const dims = (doc as unknown as { openImage(buf: Buffer): { width: number; height: number } }).openImage(bgBuf);
        const s = Math.max(width / dims.width, height / dims.height);
        const w = dims.width * s;
        const h = dims.height * s;
        doc.image(bgBuf, (width - w) / 2, (height - h) / 2, { width: w, height: h });
      } catch {
        // background image failed to render; keep solid color
      }
    }

    if (tpl.borderStyle && tpl.borderStyle !== "none") {
      const bw = Number(tpl.borderWidth) || 3;
      const color = tpl.borderColor ?? "#000000";
      if (tpl.borderStyle === "double") {
        doc.lineWidth(bw).strokeColor(color);
        doc.rect(bw / 2, bw / 2, width - bw, height - bw).stroke();
        doc.rect(bw * 2, bw * 2, width - bw * 4, height - bw * 4).stroke();
      } else if (tpl.borderStyle === "dashed") {
        doc.save().lineWidth(bw).strokeColor(color).dash(bw * 2, bw * 1.5);
        doc.rect(bw / 2, bw / 2, width - bw, height - bw).stroke();
        doc.restore();
      } else {
        doc.lineWidth(bw).strokeColor(color);
        doc.rect(bw / 2, bw / 2, width - bw, height - bw).stroke();
      }
    }

    for (const el of [...elements].sort((a, b) => a.y - b.y)) {
      if (el.type === "rect") {
        doc.rect(el.x, el.y, el.width, el.height).fill(el.fill ?? "#000000");
      } else if (el.type === "line") {
        doc.lineWidth(el.thickness ?? 2).strokeColor(el.color ?? "#000000");
        doc.moveTo(el.x, el.y).lineTo(el.x + el.width, el.y).stroke();
      } else if (el.type === "image") {
        const buf = imageMap.get(el.src);
        if (buf) {
          try {
            doc.save();
            if (el.opacity != null) doc.opacity(el.opacity);
            if (el.fit === "contain") {
              doc.image(buf, el.x, el.y, { fit: [el.width, el.height ?? el.width] });
            } else {
              doc.image(buf, el.x, el.y, { width: el.width, height: el.height ?? el.width });
            }
            doc.restore();
          } catch {
            // image failed to render; skip
          }
        }
      } else if (el.type === "text") {
        const bold = String(el.fontWeight ?? "normal") === "bold";
        const family = fontFor(el.fontFamily ?? "sans", bold);
        const text = replaceTokens(el.text ?? "", ctx);
        doc.font(family).fontSize(Number(el.fontSize) || 12).fillColor(el.color ?? "#000000");
        doc.text(text, el.x, el.y, {
          width: el.width,
          align: (el.align ?? "left") as "left" | "center" | "right",
          lineBreak: true,
          height: Math.max(0, height - el.y),
        });
      }
    }

    doc.end();
  });
}