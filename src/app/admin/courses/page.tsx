"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IconPlus, IconBookOpen, IconEdit2 as IconEdit, IconTrash2 as IconTrash, IconList } from "@/lib/icons";
import { http } from "@/lib/api";
import { errMessage } from "@/lib/utils";
import { useToast } from "@/lib/toast-context";

interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
}

export default function AdminCourses() {
  const toast = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({ title: "", code: "", description: "" });
  const [editing, setEditing] = useState<Course | null>(null);
  const [editForm, setEditForm] = useState({ title: "", code: "", description: "" });
  const [deleting, setDeleting] = useState<Course | null>(null);

  const load = () => http.get<Course[]>("/courses").then(setCourses).catch(console.error);
  useEffect(() => { void load(); }, []);

  const create = async () => {
    if (!form.title.trim() || !form.code.trim()) {
      toast.error("Title and code are required");
      return;
    }
    try {
      await http.post("/courses", form);
      toast.success("Course created");
    } catch (err) {
      toast.error(errMessage(err));
    }
    setForm({ title: "", code: "", description: "" });
    load();
  };

  const openEdit = (c: Course) => {
    setEditing(c);
    setEditForm({ title: c.title, code: c.code, description: c.description });
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (!editForm.title.trim() || !editForm.code.trim()) {
      toast.error("Title and code are required");
      return;
    }
    try {
      await http.put(`/courses/${editing.id}`, editForm);
      toast.success("Course updated");
    } catch (err) {
      toast.error(errMessage(err));
    }
    setEditing(null);
    load();
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await http.del(`/courses/${deleting.id}`);
      toast.success("Course deleted");
    } catch (err) {
      toast.error(errMessage(err));
    }
    setDeleting(null);
    load();
  };

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="font-headline-md text-primary mb-1">Courses</h1>
          <p className="text-body-sm text-on-surface-variant">Create and manage your course catalog.</p>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-primary/5 flex items-center justify-center">
              <IconPlus size={18} className="text-primary" />
            </div>
            <h2 className="font-headline-md text-sm text-primary">Create course</h2>
          </div>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" />
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Code (e.g. PHYS-101)" className="sm:max-w-52" />
            </div>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
              rows={2}
              className="w-full px-4 py-2.5 bg-surface-container-low text-on-surface rounded-[var(--radius-lg)] border border-outline-variant outline-none transition-all duration-200 placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary text-body-sm resize-none"
            />
            <Button onClick={create} disabled={!form.title.trim() || !form.code.trim()}>Create course</Button>
          </div>
        </Card>

        <div className="space-y-2">
          {courses.map((c) => (
            <Card key={c.id} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-primary/5 flex items-center justify-center shrink-0">
                <IconBookOpen size={20} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-on-surface text-sm">{c.title}</p>
                  <Badge variant="soft" size="sm">{c.code}</Badge>
                </div>
                <p className="text-label-caps text-on-surface-variant mt-0.5 line-clamp-1">{c.description}</p>
              </div>
              <Link href={`/admin/courses/${c.id}`}>
                <Button variant="secondary" size="sm">
                  <IconList size={15} /> Manage content
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => openEdit(c)} aria-label={`Edit ${c.title}`}>
                <IconEdit size={16} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDeleting(c)} aria-label={`Delete ${c.title}`}>
                <IconTrash size={16} className="text-error" />
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit course">
        <div className="space-y-3">
          <Input label="Title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
          <Input label="Code" value={editForm.code} onChange={(e) => setEditForm({ ...editForm, code: e.target.value })} />
          <div>
            <label className="font-label-caps text-on-surface-variant">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={3}
              className="mt-1.5 w-full px-4 py-2.5 bg-surface-container-low text-on-surface rounded-[var(--radius-lg)] border border-outline-variant outline-none transition-all duration-200 placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary text-body-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={!editForm.title.trim() || !editForm.code.trim()}>Save changes</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete course"
        message={`Delete ${deleting?.title}? All its sections, lessons, and certificates will be removed.`}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </AdminShell>
  );
}