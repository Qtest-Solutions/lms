export type CertElement =
  | { id: string; type: "text"; x: number; y: number; width: number; text?: string; fontSize?: number; fontFamily?: string; fontWeight?: string; color?: string; align?: string }
  | { id: string; type: "line"; x: number; y: number; width: number; color?: string; thickness?: number }
  | { id: string; type: "rect"; x: number; y: number; width: number; height?: number; fill?: string }
  | { id: string; type: "image"; x: number; y: number; width: number; height?: number; src: string; opacity?: number; fit?: string };

export interface TemplateData {
  id?: string;
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

export interface SampleContext {
  student_name: string;
  student_email: string;
  course_name: string;
  course_code: string;
  date: string;
  year: string;
  certificate_id: string;
}

export const SAMPLE_CONTEXT: SampleContext = {
  student_name: "Maya Patel",
  student_email: "student@lms.test",
  course_name: "Manual Testing Fundamentals",
  course_code: "QA-101",
  date: "January 15, 2026",
  year: "2026",
  certificate_id: "CERT-123456",
};

export const TOKEN_HELP: { token: string; label: string }[] = [
  { token: "{student_name}", label: "Student name" },
  { token: "{student_email}", label: "Student email" },
  { token: "{course_name}", label: "Course title" },
  { token: "{course_code}", label: "Course code" },
  { token: "{date}", label: "Issue date" },
  { token: "{year}", label: "Issue year" },
  { token: "{certificate_id}", label: "Certificate ID" },
];

const FONT_FAMILIES: Record<string, string> = {
  sans: "system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "ui-monospace, monospace",
};

export function replaceTokens(text: string, ctx: SampleContext): string {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => ctx[key as keyof SampleContext] ?? `{${key}}`);
}

function wrapLines(c: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split("\n");
  const lines: string[] = [];
  for (const para of paragraphs) {
    if (!para) {
      lines.push("");
      continue;
    }
    const words = para.split(/\s+/);
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (c.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

export function elementLines(c: CanvasRenderingContext2D, el: CertElement, ctx: SampleContext): string[] {
  if (el.type !== "text") return [];
  const bold = el.fontWeight === "bold";
  c.font = `${bold ? "bold " : ""}${el.fontSize ?? 12}px ${FONT_FAMILIES[el.fontFamily ?? "sans"] ?? "sans-serif"}`;
  return wrapLines(c, replaceTokens(el.text ?? "", ctx), el.width || 100);
}

export function elementHeight(c: CanvasRenderingContext2D, el: CertElement, ctx: SampleContext): number {
  if (el.type === "rect") return el.height ?? 0;
  if (el.type === "line") return el.thickness ?? 2;
  if (el.type !== "text") return 0;
  const lines = elementLines(c, el, ctx);
  return lines.length * ((el.fontSize ?? 12) * 1.3);
}

export function elementBounds(el: CertElement, ctx: SampleContext, c?: CanvasRenderingContext2D) {
  if (el.type === "rect") return { x: el.x, y: el.y, w: el.width, h: el.height ?? 0 };
  if (el.type === "line") return { x: el.x, y: el.y - 4, w: el.width, h: 8 };
  if (el.type === "image") return { x: el.x, y: el.y, w: el.width, h: el.height ?? 80 };
  if (c) {
    const h = elementHeight(c, el, ctx);
    return { x: el.x, y: el.y, w: el.width, h };
  }
  return { x: el.x, y: el.y, w: el.width, h: 40 };
}

const loadedImages = new Map<string, HTMLImageElement>();
const pendingImages = new Map<string, Promise<HTMLImageElement>>();

export function loadImage(url: string): Promise<HTMLImageElement> {
  const hit = loadedImages.get(url);
  if (hit) return Promise.resolve(hit);
  const pending = pendingImages.get(url);
  if (pending) return pending;
  const p = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      loadedImages.set(url, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
  pendingImages.set(url, p);
  p.catch(() => pendingImages.delete(url));
  return p;
}

function imageLoaded(url: string): HTMLImageElement | undefined {
  return loadedImages.get(url);
}

function drawFit(c: CanvasRenderingContext2D, img: HTMLImageElement, el: Extract<CertElement, { type: "image" }>) {
  const dw = el.width || img.naturalWidth;
  const dh = el.height ?? img.naturalHeight;
  c.save();
  c.globalAlpha = el.opacity ?? 1;
  if (el.fit === "contain") {
    const scale = Math.min(dw / img.naturalWidth, dh / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    c.drawImage(img, el.x + (dw - w) / 2, el.y + (dh - h) / 2, w, h);
  } else {
    c.drawImage(img, el.x, el.y, dw, dh);
  }
  c.restore();
}

export function drawTemplate(
  canvas: HTMLCanvasElement,
  template: TemplateData,
  ctx: SampleContext,
  opts: { scale?: number; selectedId?: string | null; interactive?: boolean; onImageLoad?: () => void } = {}
) {
  const width = template.width ?? 841.89;
  const height = template.height ?? 595.28;
  const scale = opts.scale ?? 1;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * scale * dpr);
  canvas.height = Math.round(height * scale * dpr);
  const c = canvas.getContext("2d");
  if (!c) return;
  c.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
  c.clearRect(0, 0, width, height);

  c.fillStyle = template.background ?? "#FFFFFF";
  c.fillRect(0, 0, width, height);

  if (template.backgroundImage) {
    const bg = imageLoaded(template.backgroundImage);
    if (bg) {
      const s = Math.max(width / bg.naturalWidth, height / bg.naturalHeight);
      const w = bg.naturalWidth * s;
      const h = bg.naturalHeight * s;
      c.drawImage(bg, (width - w) / 2, (height - h) / 2, w, h);
    } else {
      loadImage(template.backgroundImage).then(() => opts.onImageLoad?.()).catch(() => {});
    }
  }

  if (template.borderStyle && template.borderStyle !== "none") {
    const bw = template.borderWidth ?? 3;
    c.strokeStyle = template.borderColor ?? "#000000";
    c.lineWidth = bw;
    if (template.borderStyle === "double") {
      c.strokeRect(bw / 2, bw / 2, width - bw, height - bw);
      c.strokeRect(bw * 2, bw * 2, width - bw * 4, height - bw * 4);
    } else if (template.borderStyle === "dashed") {
      c.setLineDash([bw * 2, bw * 1.5]);
      c.strokeRect(bw / 2, bw / 2, width - bw, height - bw);
      c.setLineDash([]);
    } else {
      c.strokeRect(bw / 2, bw / 2, width - bw, height - bw);
    }
  }

  const elements = [...(template.elements ?? [])].sort((a, b) => a.y - b.y);

  for (const el of elements) {
    if (el.type === "rect") {
      c.fillStyle = el.fill ?? "#000000";
      c.fillRect(el.x, el.y, el.width, el.height ?? 0);
    } else if (el.type === "line") {
      c.strokeStyle = el.color ?? "#000000";
      c.lineWidth = el.thickness ?? 2;
      c.beginPath();
      c.moveTo(el.x, el.y);
      c.lineTo(el.x + el.width, el.y);
      c.stroke();
    } else if (el.type === "image") {
      const img = imageLoaded(el.src);
      if (img) {
        drawFit(c, img, el);
      } else {
        c.save();
        c.globalAlpha = 0.4;
        c.strokeStyle = "#BF5700";
        c.setLineDash([4, 3]);
        c.strokeRect(el.x, el.y, el.width, el.height ?? 80);
        c.restore();
        loadImage(el.src).then(() => opts.onImageLoad?.()).catch(() => {});
      }
    } else if (el.type === "text") {
      const bold = el.fontWeight === "bold";
      c.font = `${bold ? "bold " : ""}${el.fontSize ?? 12}px ${FONT_FAMILIES[el.fontFamily ?? "sans"] ?? "sans-serif"}`;
      c.fillStyle = el.color ?? "#000000";
      c.textBaseline = "top";
      c.textAlign = el.align === "center" ? "center" : el.align === "right" ? "right" : "left";
      const lines = elementLines(c, el, ctx);
      const x = el.align === "center" ? el.x + el.width / 2 : el.align === "right" ? el.x + el.width : el.x;
      lines.forEach((line, i) => {
        c.fillText(line, x, el.y + i * (el.fontSize ?? 12) * 1.3);
      });
    }
  }

  if (opts.interactive && opts.selectedId) {
    const sel = elements.find((e) => e.id === opts.selectedId);
    if (sel) {
      const b = elementBounds(sel, ctx, c);
      c.strokeStyle = "#BF5700";
      c.lineWidth = 1.5 / scale;
      c.setLineDash([6 / scale, 4 / scale]);
      c.strokeRect(b.x - 4 / scale, b.y - 4 / scale, b.w + 8 / scale, b.h + 8 / scale);
      c.setLineDash([]);
    }
  }
}
