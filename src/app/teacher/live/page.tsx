"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { TeacherShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IconCalendar, IconEdit2 as IconEdit, IconTrash2 as IconTrash, IconVideo } from "@/lib/icons";
import { http, getMe } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { errMessage } from "@/lib/utils";

interface Session {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  type: string;
  courseId?: string;
  batchId?: string;
}

export default function TeacherLive() {
  const me = getMe();
  const toast = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [batches, setBatches] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ title: "", courseId: "", batchId: "", startTime: "", endTime: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<Session | null>(null);

  const load = () => {
    http.get<Session[]>("/live-sessions").then(setSessions).catch(console.error);
    if (me) http.get<{ id: string; name: string }[]>(`/batches?teacherId=${me.id}`).then(setBatches).catch(console.error);
  };

  useEffect(load, [me]);

  const resetForm = () => {
    setForm({ title: "", courseId: "", batchId: "", startTime: "", endTime: "" });
    setEditingId(null);
  };

  const upsertSession = async (e: FormEvent) => {
    e.preventDefault();
    if (!me) return;
    const payload = {
      ...form,
      teacherId: me.id,
      duration: 60,
      type: form.batchId ? "batch" : "one-to-one",
    };
    if (editingId) {
      try {
        await http.put(`/live-sessions/${editingId}`, payload);
        toast.success("Class updated");
      } catch (err) {
        toast.error(errMessage(err));
      }
    } else {
      try {
        await http.post("/live-sessions", payload);
        toast.success("Class created");
      } catch (err) {
        toast.error(errMessage(err));
      }
    }
    resetForm();
    load();
  };

  const startEdit = (s: Session) => {
    setEditingId(s.id);
    setForm({
      title: s.title,
      courseId: s.courseId ?? "",
      batchId: s.batchId ?? "",
      startTime: s.startTime ?? "",
      endTime: s.endTime ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelSession = async () => {
    if (!cancelling) return;
    try {
      await http.del(`/live-sessions/${cancelling.id}`);
      toast.success("Class cancelled");
    } catch (err) {
      toast.error(errMessage(err));
    }
    setCancelling(null);
    load();
  };

  return (
    <TeacherShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-headline-md text-primary mb-1">Online Classes</h1>
          <p className="text-body-sm text-on-surface-variant">Create and manage your online classes.</p>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-secondary-container/40 flex items-center justify-center">
              <IconCalendar size={18} className="text-secondary" />
            </div>
            <h2 className="font-headline-md text-sm text-primary">
              {editingId ? "Edit class" : "Create a class"}
            </h2>
          </div>
          <form onSubmit={upsertSession} className="space-y-3">
            <Input placeholder="Title (e.g. Forces Review)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="p-3" required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={form.batchId}
                onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                className="p-3 rounded-[var(--radius-md)] border border-outline-variant bg-surface text-sm text-on-surface focus:border-primary focus:outline-none"
              >
                <option value="">1-to-1 (individual)</option>
                {batches.map((b) => <option key={b.id} value={b.id}>{b.name} (batch)</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-label-caps text-on-surface-variant mb-1.5 block">Class time</label>
                <div className="flex items-center gap-2">
                  <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="p-3" required />
                  <span className="text-on-surface-variant">to</span>
                  <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="p-3" required />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit">{editingId ? "Save changes" : "Create class"}</Button>
              {editingId && (
                <Button variant="ghost" type="button" onClick={resetForm}>Cancel edit</Button>
              )}
            </div>
          </form>
        </Card>

        <div className="space-y-3">
          {sessions.map((s) => (
            <Card key={s.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <h3 className="font-medium text-on-surface text-sm">{s.title}</h3>
                <p className="text-label-caps text-on-surface-variant">
                  {s.startTime && s.endTime ? `${s.startTime} – ${s.endTime}` : "No time set"} · {s.type}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={s.status === "SCHEDULED" ? "soft" : "secondary"} size="sm">{s.status}</Badge>
                {s.status === "SCHEDULED" && (
                  <>
                    <Link href={`/teacher/live/${s.id}`}>
                      <Button size="sm"><IconVideo size={16} /> Start</Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(s)} aria-label={`Edit ${s.title}`}>
                      <IconEdit size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setCancelling(s)} aria-label={`Cancel ${s.title}`}>
                      <IconTrash size={16} className="text-error" />
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
          {sessions.length === 0 && <p className="text-body-sm text-on-surface-variant">No classes yet.</p>}
        </div>
      </div>

      <ConfirmDialog
        open={!!cancelling}
        title="Cancel class"
        message={`Cancel "${cancelling?.title}"? Students will no longer see it.`}
        confirmLabel="Cancel class"
        onConfirm={cancelSession}
        onClose={() => setCancelling(null)}
      />
    </TeacherShell>
  );
}