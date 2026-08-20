"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/toast-context";
import { errMessage } from "@/lib/utils";
import { http, uploadFile } from "@/lib/api";
import CertificateCanvas from "@/components/certificates/certificate-canvas";
import { CertElement, TemplateData, SAMPLE_CONTEXT, TOKEN_HELP } from "@/components/certificates/render";
import { IconArrowLeft, IconSave, IconTrash2 as IconTrash, IconType, IconMinus, IconSquare, IconImage, IconUpload } from "@/lib/icons";

const fieldCls =
  "w-full px-3 py-2 bg-surface-container-low text-on-surface rounded-[var(--radius-md)] border border-outline-variant outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary text-body-sm";

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="font-label-caps text-on-surface-variant mb-1 block">{label}</label>
      {children}
    </div>
  );
}

let uid = 0;
const nextId = () => `el-${Date.now()}-${uid++}`;

export default function CertificateEditor() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const imgTargetRef = useRef<"new" | "replace">("new");

  useEffect(() => {
    http.get<TemplateData>(`/certificates/templates/${id}`).then((t) => {
      setTemplate({ ...t, elements: t.elements ?? [] });
    }).catch(console.error);
  }, [id]);

  const elements = useMemo(() => template?.elements ?? [], [template]);

  const patch = (tpl: TemplateData) => setTemplate(tpl);

  const patchElement = (elId: string, p: Partial<CertElement>) => {
    if (!template) return;
    patch({
      ...template,
      elements: (template.elements ?? []).map((el) => (el.id === elId ? ({ ...el, ...p } as CertElement) : el)),
    });
  };

  const addElement = (type: CertElement["type"]) => {
    if (!template) return;
    const elId = nextId();
    let el: CertElement;
    if (type === "text") {
      el = { id: elId, type: "text", x: 200, y: 200, width: 400, text: "Add your text here", fontSize: 24, fontFamily: "sans", fontWeight: "normal", color: "#1F2937", align: "center" };
    } else if (type === "line") {
      el = { id: elId, type: "line", x: 200, y: 300, width: 400, color: "#BF5700", thickness: 2 };
    } else if (type === "rect") {
      el = { id: elId, type: "rect", x: 0, y: 0, width: 841.89, height: 40, fill: "#BF5700" };
    } else {
      return;
    }
    patch({ ...template, elements: [...(template.elements ?? []), el] });
    setSelectedId(elId);
  };

  const removeElement = (elId: string) => {
    if (!template) return;
    patch({ ...template, elements: (template.elements ?? []).filter((el) => el.id !== elId) });
    setSelectedId(null);
  };

  const uploadBg = async (file: File) => {
    if (!template) return;
    setUploadingBg(true);
    try {
      const { publicUrl } = await uploadFile(file, "certificates");
      patch({ ...template, backgroundImage: publicUrl });
      toast.success("Background image uploaded");
    } catch (err) {
      toast.error(errMessage(err));
    } finally {
      setUploadingBg(false);
    }
  };

  const handleImgFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !template) return;
    setUploadingImg(true);
    try {
      const { publicUrl } = await uploadFile(file, "certificates");
      if (imgTargetRef.current === "new") {
        const elId = nextId();
        const el: CertElement = {
          id: elId,
          type: "image",
          src: publicUrl,
          x: Math.round(((template.width ?? 841.89) - 240) / 2),
          y: 40,
          width: 240,
          height: 120,
          fit: "contain",
          opacity: 1,
        };
        patch({ ...template, elements: [...(template.elements ?? []), el] });
        setSelectedId(elId);
      } else if (selectedId) {
        patchElement(selectedId, { src: publicUrl });
      }
    } catch (err) {
      toast.error(errMessage(err));
    } finally {
      setUploadingImg(false);
    }
  };

  const insertToken = (token: string) => {
    const sel = elements.find((el) => el.id === selectedId);
    if (!sel || sel.type !== "text") {
      toast.show("Select a text element first", "info");
      return;
    }
    patchElement(sel.id, { text: `${sel.text ?? ""}${sel.text ? " " : ""}${token}` });
  };

  const save = async () => {
    if (!template) return;
    setSaving(true);
    try {
      const payload = {
        name: template.name,
        description: template.description,
        width: template.width,
        height: template.height,
        background: template.background,
        backgroundImage: template.backgroundImage,
        borderStyle: template.borderStyle,
        borderWidth: template.borderWidth,
        borderColor: template.borderColor,
        elements: template.elements,
      };
      await http.put(`/certificates/templates/${id}`, payload);
      toast.success("Template saved");
      router.refresh();
    } catch (err) {
      toast.error(errMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!template) {
    return (
      <AdminShell>
        <div className="max-w-5xl mx-auto text-on-surface-variant text-sm p-10">Loading template…</div>
      </AdminShell>
    );
  }

  const selected = elements.find((el) => el.id === selectedId) ?? null;

  return (
    <AdminShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/admin/certificates")} className="text-on-surface-variant hover:text-primary transition-colors">
              <IconArrowLeft size={18} />
            </button>
            <div>
              <h1 className="font-headline-md text-primary">{template.name}</h1>
              <p className="text-body-sm text-on-surface-variant">Design canvas · sizes in points · A4 landscape = 841.89 × 595.28</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant={previewMode ? "secondary" : "ghost"} onClick={() => setPreviewMode(!previewMode)}>
              {previewMode ? "Edit mode" : "Preview with sample data"}
            </Button>
            <Button onClick={save} disabled={saving}>
              <IconSave size={16} /> {saving ? "Saving…" : "Save template"}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
          {/* Canvas */}
          <div className="space-y-4">
            {!previewMode && (
              <Card className="p-3 flex flex-wrap gap-2 items-center">
                <span className="font-label-caps text-on-surface-variant px-1">Add element:</span>
                <Button size="sm" variant="secondary" onClick={() => addElement("text")}><IconType size={15} /> Text</Button>
                <Button size="sm" variant="secondary" onClick={() => addElement("line")}><IconMinus size={15} /> Line</Button>
                <Button size="sm" variant="secondary" onClick={() => addElement("rect")}><IconSquare size={15} /> Band</Button>
                <Button size="sm" variant="secondary" disabled={uploadingImg} onClick={() => { imgTargetRef.current = "new"; imgInputRef.current?.click(); }}>
                  <IconImage size={15} /> {uploadingImg ? "Uploading…" : "Image"}
                </Button>
                {selectedId && (
                  <Button size="sm" variant="ghost" onClick={() => removeElement(selectedId)} className="text-error ml-auto">
                    <IconTrash size={15} /> Delete
                  </Button>
                )}
              </Card>
            )}
            <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadBg(f); e.target.value = ""; }} />
            <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImgFile} />
            <Card className="p-4 overflow-auto bg-surface-container-low/40">
              <CertificateCanvas
                template={previewMode ? { ...template, name: undefined } : template}
                sample={SAMPLE_CONTEXT}
                fitMaxWidth={previewMode ? 720 : 720}
                interactive={!previewMode}
                selectedId={previewMode ? null : selectedId}
                onSelectId={setSelectedId}
                onChangeElement={(elId, p) => patchElement(elId, p)}
                className="mx-auto"
              />
            </Card>
          </div>

          {/* Properties */}
          <div className="space-y-4">
            {previewMode ? (
              <Card className="p-4 text-body-sm text-on-surface-variant">
                Preview uses sample data. Placeholders like <code className="font-mono text-xs bg-surface-container-high px-1 rounded">{`{student_name}`}</code> will be filled with real values on issued certificates.
              </Card>
            ) : (
              <>
                <Card className="p-4 space-y-3">
                  <p className="font-label-caps text-on-surface-variant">Template</p>
                  <Field label="Name">
                    <Input value={template.name ?? ""} onChange={(e) => patch({ ...template, name: e.target.value })} />
                  </Field>
                  <Field label="Background color">
                    <input type="color" value={template.background ?? "#FFFFFF"} onChange={(e) => patch({ ...template, background: e.target.value })} className="h-10 w-full rounded-[var(--radius-md)] border border-outline-variant cursor-pointer" />
                  </Field>
                  <Field label="Background image">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" disabled={uploadingBg} onClick={() => bgInputRef.current?.click()}>
                        <IconUpload size={14} /> {uploadingBg ? "Uploading…" : template.backgroundImage ? "Replace" : "Upload image"}
                      </Button>
                      {template.backgroundImage && (
                        <Button size="sm" variant="ghost" className="text-error" onClick={() => patch({ ...template, backgroundImage: undefined })}>
                          Remove
                        </Button>
                      )}
                    </div>
                    {template.backgroundImage && (
                      <img src={template.backgroundImage} alt="Background" className="mt-2 h-24 w-full object-cover rounded-[var(--radius-md)] border border-outline-variant bg-surface-container-low" />
                    )}
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Border style">
                      <select value={template.borderStyle ?? "solid"} onChange={(e) => patch({ ...template, borderStyle: e.target.value })} className={fieldCls}>
                        <option value="solid">Solid</option>
                        <option value="double">Double</option>
                        <option value="dashed">Dashed</option>
                        <option value="none">None</option>
                      </select>
                    </Field>
                    <Field label="Border width">
                      <input type="number" min={0} step={0.5} value={String(template.borderWidth ?? 3)} onChange={(e) => patch({ ...template, borderWidth: Number(e.target.value) })} className={fieldCls} />
                    </Field>
                  </div>
                  <Field label="Border color">
                    <input type="color" value={template.borderColor ?? "#000000"} onChange={(e) => patch({ ...template, borderColor: e.target.value })} className="h-10 w-full rounded-[var(--radius-md)] border border-outline-variant cursor-pointer" />
                  </Field>
                </Card>

                <Card className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-label-caps text-on-surface-variant">Elements ({elements.length})</p>
                    {selected && (
                      <Badge variant="secondary" size="sm" className="capitalize">{selected.type}</Badge>
                    )}
                  </div>

                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {elements.map((el) => (
                      <button
                        key={el.id}
                        onClick={() => setSelectedId(el.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-[var(--radius-md)] text-body-sm transition-colors cursor-pointer flex items-center gap-2 ${
                          selectedId === el.id ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant hover:bg-surface-container-low"
                        }`}
                      >
                        <span className="capitalize">{el.type}</span>
                        {el.type === "text" && <span className="truncate flex-1 opacity-70">{(el.text ?? "").slice(0, 24)}</span>}
                        {el.type !== "text" && <span className="truncate flex-1 opacity-70">x {el.x} · y {el.y}</span>}
                      </button>
                    ))}
                    {elements.length === 0 && <p className="text-body-sm text-on-surface-variant">No elements yet.</p>}
                  </div>

                  {selected?.type === "text" && (
                    <>
                      <Field label="Text">
                        <textarea value={selected.text ?? ""} onChange={(e) => patchElement(selected.id, { text: e.target.value })} rows={2} className={`${fieldCls} resize-none`} />
                      </Field>
                      <div className="flex flex-wrap gap-1.5">
                        {TOKEN_HELP.map((t) => (
                          <button key={t.token} onClick={() => insertToken(t.token)} title={t.label} className="px-2 py-1 rounded-[var(--radius-md)] bg-primary/8 text-on-surface-variant hover:bg-primary/15 text-xs font-mono transition-colors cursor-pointer">
                            {t.token}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Font size">
                          <input type="number" min={4} value={String(selected.fontSize ?? 12)} onChange={(e) => patchElement(selected.id, { fontSize: Number(e.target.value) })} className={fieldCls} />
                        </Field>
                        <Field label="Weight">
                          <select value={selected.fontWeight ?? "normal"} onChange={(e) => patchElement(selected.id, { fontWeight: e.target.value })} className={fieldCls}>
                            <option value="normal">Regular</option>
                            <option value="bold">Bold</option>
                          </select>
                        </Field>
                        <Field label="Font family">
                          <select value={selected.fontFamily ?? "sans"} onChange={(e) => patchElement(selected.id, { fontFamily: e.target.value })} className={fieldCls}>
                            <option value="sans">Sans</option>
                            <option value="serif">Serif</option>
                            <option value="mono">Mono</option>
                          </select>
                        </Field>
                        <Field label="Align">
                          <select value={selected.align ?? "left"} onChange={(e) => patchElement(selected.id, { align: e.target.value })} className={fieldCls}>
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </select>
                        </Field>
                        <Field label="Color">
                          <input type="color" value={selected.color ?? "#000000"} onChange={(e) => patchElement(selected.id, { color: e.target.value })} className="h-10 w-full rounded-[var(--radius-md)] border border-outline-variant cursor-pointer" />
                        </Field>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <Field label="X"><input type="number" value={Math.round(selected.x)} onChange={(e) => patchElement(selected.id, { x: Number(e.target.value) })} className={fieldCls} /></Field>
                        <Field label="Y"><input type="number" value={Math.round(selected.y)} onChange={(e) => patchElement(selected.id, { y: Number(e.target.value) })} className={fieldCls} /></Field>
                        <Field label="Width"><input type="number" min={20} value={Math.round(selected.width)} onChange={(e) => patchElement(selected.id, { width: Number(e.target.value) })} className={fieldCls} /></Field>
                      </div>
                    </>
                  )}

                  {selected?.type === "line" && (
                    <>
                      <div className="grid grid-cols-3 gap-3">
                        <Field label="X"><input type="number" value={Math.round(selected.x)} onChange={(e) => patchElement(selected.id, { x: Number(e.target.value) })} className={fieldCls} /></Field>
                        <Field label="Y"><input type="number" value={Math.round(selected.y)} onChange={(e) => patchElement(selected.id, { y: Number(e.target.value) })} className={fieldCls} /></Field>
                        <Field label="Length"><input type="number" min={10} value={Math.round(selected.width)} onChange={(e) => patchElement(selected.id, { width: Number(e.target.value) })} className={fieldCls} /></Field>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Thickness">
                          <input type="number" min={1} value={String(selected.thickness ?? 2)} onChange={(e) => patchElement(selected.id, { thickness: Number(e.target.value) })} className={fieldCls} />
                        </Field>
                        <Field label="Color">
                          <input type="color" value={selected.color ?? "#000000"} onChange={(e) => patchElement(selected.id, { color: e.target.value })} className="h-10 w-full rounded-[var(--radius-md)] border border-outline-variant cursor-pointer" />
                        </Field>
                      </div>
                    </>
                  )}

                  {selected?.type === "rect" && (
                    <>
                      <div className="grid grid-cols-4 gap-3">
                        <Field label="X"><input type="number" value={Math.round(selected.x)} onChange={(e) => patchElement(selected.id, { x: Number(e.target.value) })} className={fieldCls} /></Field>
                        <Field label="Y"><input type="number" value={Math.round(selected.y)} onChange={(e) => patchElement(selected.id, { y: Number(e.target.value) })} className={fieldCls} /></Field>
                        <Field label="W"><input type="number" min={10} value={Math.round(selected.width)} onChange={(e) => patchElement(selected.id, { width: Number(e.target.value) })} className={fieldCls} /></Field>
                        <Field label="H"><input type="number" min={10} value={Math.round(selected.height ?? 40)} onChange={(e) => patchElement(selected.id, { height: Number(e.target.value) })} className={fieldCls} /></Field>
                      </div>
                      <Field label="Fill color">
                        <input type="color" value={selected.fill ?? "#000000"} onChange={(e) => patchElement(selected.id, { fill: e.target.value })} className="h-10 w-full rounded-[var(--radius-md)] border border-outline-variant cursor-pointer" />
                      </Field>
                    </>
                  )}

                  {selected?.type === "image" && (
                    <>
                      <Field label="Image">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="secondary" disabled={uploadingImg} onClick={() => { imgTargetRef.current = "replace"; imgInputRef.current?.click(); }}>
                            <IconUpload size={14} /> {uploadingImg ? "Uploading…" : "Replace image"}
                          </Button>
                        </div>
                        {selected.src && (
                          <img src={selected.src} alt="" className="mt-2 h-20 w-full object-contain rounded-[var(--radius-md)] border border-outline-variant bg-surface-container-low" />
                        )}
                      </Field>
                      <div className="grid grid-cols-4 gap-3">
                        <Field label="X"><input type="number" value={Math.round(selected.x)} onChange={(e) => patchElement(selected.id, { x: Number(e.target.value) })} className={fieldCls} /></Field>
                        <Field label="Y"><input type="number" value={Math.round(selected.y)} onChange={(e) => patchElement(selected.id, { y: Number(e.target.value) })} className={fieldCls} /></Field>
                        <Field label="W"><input type="number" min={10} value={Math.round(selected.width)} onChange={(e) => patchElement(selected.id, { width: Number(e.target.value) })} className={fieldCls} /></Field>
                        <Field label="H"><input type="number" min={10} value={Math.round(selected.height ?? 80)} onChange={(e) => patchElement(selected.id, { height: Number(e.target.value) })} className={fieldCls} /></Field>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Opacity">
                          <input type="range" min={0.05} max={1} step={0.05} value={String(selected.opacity ?? 1)} onChange={(e) => patchElement(selected.id, { opacity: Number(e.target.value) })} className="w-full" />
                        </Field>
                        <Field label="Fit">
                          <select value={selected.fit ?? "fill"} onChange={(e) => patchElement(selected.id, { fit: e.target.value })} className={fieldCls}>
                            <option value="fill">Stretch</option>
                            <option value="contain">Contain</option>
                          </select>
                        </Field>
                      </div>
                    </>
                  )}

                  {!selected && <p className="text-body-sm text-on-surface-variant">Click an element on the canvas to edit it, or drag to move.</p>}
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
