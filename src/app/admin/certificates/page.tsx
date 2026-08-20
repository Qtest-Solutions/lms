"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/lib/toast-context";
import { errMessage } from "@/lib/utils";
import { http } from "@/lib/api";
import CertificateCanvas from "@/components/certificates/certificate-canvas";
import { TemplateData } from "@/components/certificates/render";
import { IconPlus, IconTrash2 as IconTrash, IconCopy, IconAward, IconWand2 } from "@/lib/icons";

interface Template extends TemplateData {
  id: string;
  name: string;
  description: string;
}

interface Student { id: string; name: string; email: string; }
interface Course { id: string; title: string; code: string; }

export default function AdminCertificates() {
  const router = useRouter();
  const toast = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [deleting, setDeleting] = useState<Template | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [issue, setIssue] = useState({ studentId: "", courseId: "", templateId: "" });

  const load = () => {
    http.get<Template[]>("/certificates/templates").then(setTemplates).catch(console.error);
  };

  useEffect(() => {
    load();
    http.get<Student[]>("/students").then(setStudents).catch(console.error);
    http.get<Course[]>("/courses").then(setCourses).catch(console.error);
  }, []);

  const create = async () => {
    if (!newName.trim()) {
      toast.error("Give the template a name");
      return;
    }
    try {
      const tpl = await http.post<Template>("/certificates/templates", { name: newName.trim() });
      toast.success("Template created");
      router.push(`/admin/certificates/${tpl.id}`);
    } catch (err) {
      toast.error(errMessage(err));
    }
  };

  const duplicate = async (t: Template) => {
    try {
      const copy = await http.post<Template>("/certificates/templates", {
        name: `${t.name} (copy)`,
        description: t.description,
        width: t.width,
        height: t.height,
        background: t.background,
        backgroundImage: t.backgroundImage,
        borderStyle: t.borderStyle,
        borderWidth: t.borderWidth,
        borderColor: t.borderColor,
        elements: t.elements,
      });
      toast.success("Template duplicated");
      load();
      return copy;
    } catch (err) {
      toast.error(errMessage(err));
      return null;
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await http.del(`/certificates/templates/${deleting.id}`);
      toast.success("Template deleted");
    } catch (err) {
      toast.error(errMessage(err));
    }
    setDeleting(null);
    load();
  };

  const openIssue = () => {
    setIssue({ studentId: students[0]?.id ?? "", courseId: courses[0]?.id ?? "", templateId: templates[0]?.id ?? "" });
    setIssuing(true);
  };

  const issueCert = async () => {
    if (!issue.studentId || !issue.courseId) {
      toast.error("Pick a student and a course");
      return;
    }
    try {
      await http.post("/certificates", issue);
      toast.success("Certificate issued");
      setIssuing(false);
    } catch (err) {
      toast.error(errMessage(err));
    }
  };

  const selectClass =
    "w-full px-4 py-2.5 bg-surface-container-low text-on-surface rounded-[var(--radius-lg)] border border-outline-variant outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary text-body-sm";

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-md text-primary mb-1">Certificate Maker</h1>
            <p className="text-body-sm text-on-surface-variant">
              Design reusable certificate templates with placeholders, then issue them to students.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={openIssue}>
              <IconAward size={16} /> Issue certificate
            </Button>
            <Button onClick={() => { setCreating(true); setNewName(""); }}>
              <IconPlus size={16} /> New template
            </Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5">
          {templates.map((t) => (
            <Card key={t.id} className="overflow-hidden">
              <Link href={`/admin/certificates/${t.id}`} className="block bg-surface-container-low/50 border-b border-outline-variant/60 p-4 hover:bg-surface-container-low transition-colors">
                <CertificateCanvas template={t} fitMaxWidth={560} className="mx-auto" />
              </Link>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline-md text-sm text-primary">{t.name}</h3>
                  <Badge variant="soft" size="sm">{t.borderStyle}</Badge>
                </div>
                <p className="text-body-sm text-on-surface-variant mt-1 line-clamp-2">{t.description || "No description."}</p>
                <div className="flex items-center justify-between mt-3">
                  <Link href={`/admin/certificates/${t.id}`}>
                    <Button variant="secondary" size="sm"><IconWand2 size={15} /> Open maker</Button>
                  </Link>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => duplicate(t)} aria-label={`Duplicate ${t.name}`}>
                      <IconCopy size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleting(t)} aria-label={`Delete ${t.name}`}>
                      <IconTrash size={16} className="text-error" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {templates.length === 0 && (
            <Card className="p-10 text-center text-body-sm text-on-surface-variant col-span-full">
              No templates yet. Create one to start designing certificates.
            </Card>
          )}
        </div>
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} title="New certificate template" maxWidth="max-w-sm">
        <div className="space-y-3">
          <Input label="Template name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Graduation Gold" autoFocus />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={create}>Create & open maker</Button>
          </div>
        </div>
      </Modal>

      <Modal open={issuing} onClose={() => setIssuing(false)} title="Issue a certificate" maxWidth="max-w-md">
        <div className="space-y-3">
          <div>
            <label className="font-label-caps text-on-surface-variant">Student</label>
            <select value={issue.studentId} onChange={(e) => setIssue({ ...issue, studentId: e.target.value })} className={`mt-1.5 ${selectClass}`}>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
            </select>
          </div>
          <div>
            <label className="font-label-caps text-on-surface-variant">Course</label>
            <select value={issue.courseId} onChange={(e) => setIssue({ ...issue, courseId: e.target.value })} className={`mt-1.5 ${selectClass}`}>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title} ({c.code})</option>)}
            </select>
          </div>
          <div>
            <label className="font-label-caps text-on-surface-variant">Template</label>
            <select value={issue.templateId} onChange={(e) => setIssue({ ...issue, templateId: e.target.value })} className={`mt-1.5 ${selectClass}`}>
              <option value="">Default</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIssuing(false)}>Cancel</Button>
            <Button onClick={issueCert}><IconAward size={16} /> Issue</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete template"
        message={`Delete "${deleting?.name}"? Issued certificates will fall back to the default design.`}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </AdminShell>
  );
}
