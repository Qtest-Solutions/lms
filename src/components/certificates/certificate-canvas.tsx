"use client";

import { useRef, useLayoutEffect, useCallback, useState } from "react";
import {
  TemplateData,
  SampleContext,
  SAMPLE_CONTEXT,
  CertElement,
  drawTemplate,
  elementBounds,
} from "./render";

interface Props {
  template: TemplateData;
  sample?: SampleContext;
  scale?: number;
  fitMaxWidth?: number;
  interactive?: boolean;
  selectedId?: string | null;
  onSelectId?: (id: string | null) => void;
  onChangeElement?: (id: string, patch: Partial<CertElement>) => void;
  className?: string;
}

export default function CertificateCanvas({
  template,
  sample = SAMPLE_CONTEXT,
  scale,
  fitMaxWidth,
  interactive = false,
  selectedId,
  onSelectId,
  onChangeElement,
  className = "",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const [, setFrame] = useState(0);

  const width = template.width ?? 841.89;
  const height = template.height ?? 595.28;

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cssW = canvas.clientWidth;
    const s = scale ?? (cssW ? cssW / width : 1);
    drawTemplate(canvas, template, sample, {
      scale: s,
      selectedId,
      interactive,
      onImageLoad: () => setFrame((f) => f + 1),
    });
    ctxRef.current = canvas.getContext("2d");
  }, [template, sample, scale, selectedId, interactive, width, height]);

  const toPoints = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / rect.width) * width,
        y: ((clientY - rect.top) / rect.height) * height,
      };
    },
    [width, height]
  );

  const hitTest = useCallback(
    (px: number, py: number): string | null => {
      const c = ctxRef.current;
      const elements = [...(template.elements ?? [])].sort((a, b) => a.y - b.y);
      for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        const b = elementBounds(el, sample, c ?? undefined);
        const pad = 6;
        if (px >= b.x - pad && px <= b.x + b.w + pad && py >= b.y - pad && py <= b.y + b.h + pad) {
          return el.id;
        }
      }
      return null;
    },
    [template.elements, sample]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!interactive) return;
      const pt = toPoints(e.clientX, e.clientY);
      const id = hitTest(pt.x, pt.y);
      onSelectId?.(id);
      if (!id) return;
      const el = template.elements?.find((x) => x.id === id);
      if (!el) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.style.cursor = "grabbing";
      dragRef.current = { id, dx: pt.x - el.x, dy: pt.y - el.y };
    },
    [interactive, toPoints, hitTest, onSelectId, template.elements]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!interactive || !dragRef.current) return;
      const pt = toPoints(e.clientX, e.clientY);
      const d = dragRef.current;
      onChangeElement?.(d.id, {
        x: Math.round(Math.max(0, pt.x - d.dx)),
        y: Math.round(Math.max(0, pt.y - d.dy)),
      });
    },
    [interactive, toPoints, onChangeElement]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      dragRef.current = null;
      e.currentTarget.style.cursor = "pointer";
    },
    []
  );

  const containerStyle: React.CSSProperties = scale
    ? { width: Math.round(width * scale), maxWidth: fitMaxWidth ?? "100%" }
    : { width: "100%", maxWidth: fitMaxWidth ?? "100%" };

  return (
    <div className={className} style={containerStyle}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          aspectRatio: `${width} / ${height}`,
          height: "auto",
          cursor: interactive ? "pointer" : "default",
          touchAction: interactive ? "none" : "auto",
          display: "block",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
    </div>
  );
}
