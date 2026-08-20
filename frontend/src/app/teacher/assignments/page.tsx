"use client";

import { useEffect, useState } from "react";
import { TeacherShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IconPlus, IconFileCheck, IconEdit2 as IconEdit, IconTrash2 as IconTrash, IconClipboardCheck } from "@/lib/icons";
import { http, getMe } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { errMessage } from "@/lib/utils";

interface Submission {
  id: string;
  content: string;
  attachmentUrl?: string | null;
  status: string;
  score: number | null;
  feedback: string | null;
  submittedAt: string;
  student: { id: string; name: string; email: string };
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  points: number;
  dueAt: string | null;
  course: { id: string; title: string; code: string };
  submissions: Submission[];
}

interface Course {
  id: string;
  title: string;
  code: string;
}

const blankForm = { courseId: "", title: "", description: "", points: 10, dueAt: "" };

const statusBadge: Record<string, "info" | "success" | "secondary"> = {
  submitted: "info",
  verified: "success",
  returned: "secondary",
};

export default function TeacherAssignments() {
  const me = getMe();
  const toast = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [modal, setModal] = useState<{ kind: "create" } | { kind: "edit"; a: Assignment } | null>(null);
  const [form, setForm] = useState(blankForm);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Assignment | null>(null);
  const [verifying, setVerifying] = useState<{ submission: Submission; assignment: Assignment } | null>(null);
  const [verifyForm, setVerifyForm] = useState({ score: 0, feedback: "" });

  const load = () => {
    if (!me) return;
    http.get<Course[]>(`/courses?teacherId=${me.id}`).then(setCourses).catch(console.error);
    http.get<Assignment[]>(`/assignments?teacherId=${me.id}`).then(setAssignments).catch(console.error);
  };

  useEffect(load, [me?.id]);

  const openCreate = () => {
    setForm({ ...blankForm, courseId: courses[0]?.id ?? "" });
    setModal({ kind: "create" });
  };

  const openEdit = (a: Assignment) => {
    setForm({
      courseId: a.course.id,
      title: a.title,
      description: a.description,
      points: a.points,
      dueAt: a.dueAt ? a.dueAt.slice(0, 16) : "",
    });
    setModal({ kind: "edit", a });
  };

  const save = async () => {
    if (!modal) return;
    if (!form.title.trim() || !form.courseId) {
      toast.error("Provide a title and choose a course");
      return;
    }
    try {
      const payload = { ...form, points: Number(form.points) || 10, dueAt: form.dueAt || null, createdBy: me!.id };
      if (modal.kind === "edit") {
        await http.put(`/assignments/${modal.a.id}`, payload);
        toast.success("Assignment updated");
      } else {
        await http.post("/assignments", payload);
        toast.success("Assignment assigned");
      }
    } catch (err) {
      toast.error(errMessage(err));
    }
    setModal(null);
    load();
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await http.del(`/assignments/${deleting.id}`);
      toast.success("Assignment deleted");
    } catch (err) {
      toast.error(errMessage(err));
    }
    setDeleting(null);
    load();
  };

  const openVerify = (submission: Submission, assignment: Assignment) => {
    setVerifying({ submission, assignment });
    setVerifyForm({ score: submission.score ?? assignment.points, feedback: submission.feedback ?? "" });
  };

  const verify = async (status: "VERIFIED" | "RETURNED") => {
    if (!verifying || !me) return;
    try {
      await http.put(`/submissions/${verifying.submission.id}`, {
        status,
        score: status === "VERIFIED" ? Number(verifyForm.score) || 0 : undefined,
        feedback: verifyForm.feedback || undefined,
        verifiedBy: me.id,
      });
      toast.success(status === "VERIFIED" ? "Submission verified" : "Submission returned for rework");
    } catch (err) {
      toast.error(errMessage(err));
    }
    setVerifying(null);
    load();
  };

  const selectClass =
    "w-full px-4 py-2.5 bg-surface-container-low text-on-surface rounded-[var(--radius-lg)] border border-outline-variant outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary text-body-sm";

  return (
    <TeacherShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline-md text-primary mb-1">Assignments</h1>
            <p className="text-body-sm text-on-surface-variant">Assign work to students and verify their submissions.</p>
          </div>
          <Button onClick={openCreate}>
            <IconPlus size={16} /> Assign
          </Button>
        </div>

        {assignments.length === 0 ? (
          <Card className="p-8 text-center text-body-sm text-on-surface-variant">
            No assignments yet. Click &quot;Assign&quot; to create your first one.
          </Card>
        ) : (
          assignments.map((a) => {
            const pending = a.submissions.filter((s) => s.status.toLowerCase() === "submitted").length;
            const verified = a.submissions.filter((s) => s.status.toLowerCase() === "verified");
            return (
              <Card key={a.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <IconFileCheck size={17} className="text-secondary" />
                      <h2 className="font-headline-md text-sm text-primary">{a.title}</h2>
                      <Badge variant="soft" size="sm">{a.course.code}</Badge>
                      <Badge variant="secondary" size="sm">{a.points} pts</Badge>
                    </div>
                    <p className="text-label-caps text-on-surface-variant mt-0.5">
                      {a.course.title} · {a.submissions.length} submissions
                      {pending > 0 && ` · ${pending} awaiting verification`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(a)} aria-label={`Edit ${a.title}`}>
                      <IconEdit size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleting(a)} aria-label={`Delete ${a.title}`}>
                      <IconTrash size={16} className="text-error" />
                    </Button>
                  </div>
                </div>

                <p className="text-body-sm text-on-surface-variant mt-2 whitespace-pre-wrap">{a.description}</p>

                {verified.length > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 text-body-sm">
                    <IconClipboardCheck size={15} className="text-leaf-green" />
                    <span className="text-on-surface-variant">Average:</span>
                    <span className="font-semibold text-primary">
                      {(verified.reduce((n, s) => n + (s.score ?? 0), 0) / verified.length).toFixed(1)} / {a.points}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                  className="mt-3 text-body-sm font-semibold text-primary hover:underline cursor-pointer"
                >
                  {expanded === a.id ? "Hide submissions" : `Review ${a.submissions.length} submissions`}
                </button>

                {expanded === a.id && (
                  <div className="mt-3 space-y-2">
                    {a.submissions.length === 0 && (
                      <p className="text-body-sm text-on-surface-variant">No submissions yet.</p>
                    )}
                    {a.submissions.map((s) => (
                      <div key={s.id} className="rounded-[var(--radius-lg)] bg-surface-container-low p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-body-sm font-semibold text-on-surface truncate">{s.student.name}</p>
                            <p className="font-label-caps text-on-surface-variant truncate">{s.student.email}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={statusBadge[s.status.toLowerCase()] ?? "info"} size="sm" className="capitalize">{s.status}</Badge>
                            {s.status.toLowerCase() === "verified" && <span className="text-body-sm font-semibold text-leaf-green">{s.score}/{a.points}</span>}
                            {s.status.toLowerCase() === "submitted" && (
                              <Button size="sm" onClick={() => openVerify(s, a)}>Verify</Button>
                            )}
                          </div>
                        </div>
                        <p className="text-body-sm text-on-surface mt-2 whitespace-pre-wrap line-clamp-3">{s.content}</p>
                        {s.attachmentUrl && (
                          <a href={s.attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-body-sm text-primary hover:underline mt-1.5">
                            <IconFileCheck size={15} /> View attachment
                          </a>
                        )}
                        {s.feedback && <p className="text-label-caps text-on-surface-variant mt-1.5">Feedback: {s.feedback}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.kind === "edit" ? "Edit assignment" : "Assign new work"} maxWidth="max-w-lg">
        <div className="space-y-3">
          <div>
            <label className="font-label-caps text-on-surface-variant">Course</label>
            <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className={`mt-1.5 ${selectClass}`}>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Week 2 Challenge: Test Cases" autoFocus />
          <div>
            <label className="font-label-caps text-on-surface-variant">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Describe the task, format, and what earns top marks…"
              className="mt-1.5 w-full px-4 py-2.5 bg-surface-container-low text-on-surface rounded-[var(--radius-lg)] border border-outline-variant outline-none transition-all duration-200 placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary text-body-sm resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Points" type="number" min={1} value={String(form.points)} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} />
            <Input label="Due date (optional)" type="datetime-local" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save}>{modal?.kind === "edit" ? "Save changes" : "Assign"}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!verifying} onClose={() => setVerifying(null)} title={`Verify: ${verifying?.submission.student.name}`} maxWidth="max-w-lg">
        <div className="space-y-3">
          <div>
            <label className="font-label-caps text-on-surface-variant">Submission</label>
            <div className="mt-1.5 rounded-[var(--radius-lg)] bg-surface-container-low p-4 text-body-sm text-on-surface whitespace-pre-wrap max-h-52 overflow-y-auto">
              {verifying?.submission.content}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={`Score (max ${verifying?.assignment.points})`}
              type="number"
              min={0}
              max={verifying?.assignment.points ?? 10}
              value={String(verifyForm.score)}
              onChange={(e) => setVerifyForm({ ...verifyForm, score: Number(e.target.value) })}
            />
            <Input
              label="Feedback"
              value={verifyForm.feedback}
              onChange={(e) => setVerifyForm({ ...verifyForm, feedback: e.target.value })}
              placeholder="What went well, what to improve…"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setVerifying(null)}>Cancel</Button>
            <Button variant="secondary" onClick={() => verify("RETURNED")}>Return for rework</Button>
            <Button onClick={() => verify("VERIFIED")}>Verify & award points</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete assignment"
        message={`Delete "${deleting?.title}" and all its submissions?`}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </TeacherShell>
  );
}