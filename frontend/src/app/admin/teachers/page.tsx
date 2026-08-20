"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IconUserPlus, IconEdit2 as IconEdit, IconTrash2 as IconTrash } from "@/lib/icons";
import { http } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { errMessage } from "@/lib/utils";

interface Teacher {
  id: string;
  name: string;
  email: string;
  batches?: { id: string }[];
}

export default function AdminTeachers() {
  const toast = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [newTeacher, setNewTeacher] = useState({ name: "", email: "", password: "password" });
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [deleting, setDeleting] = useState<Teacher | null>(null);

  const load = () => http.get<Teacher[]>("/teachers").then(setTeachers).catch(console.error);
  useEffect(() => { void load(); }, []);

  const create = async () => {
    try {
      await http.post("/teachers", newTeacher);
      toast.success("Teacher created");
    } catch (err) {
      toast.error(errMessage(err));
    }
    setNewTeacher({ name: "", email: "", password: "password" });
    load();
  };

  const openEdit = (t: Teacher) => {
    setEditing(t);
    setEditForm({ name: t.name, email: t.email });
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await http.put(`/teachers/${editing.id}`, editForm);
      toast.success("Teacher updated");
    } catch (err) {
      toast.error(errMessage(err));
    }
    setEditing(null);
    load();
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await http.del(`/teachers/${deleting.id}`);
      toast.success("Teacher deleted");
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
          <h1 className="font-headline-md text-primary mb-1">Teachers</h1>
          <p className="text-body-sm text-on-surface-variant">Add, edit, and manage teacher accounts.</p>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-primary/5 flex items-center justify-center">
              <IconUserPlus size={18} className="text-primary" />
            </div>
            <h2 className="font-headline-md text-sm text-primary">Add teacher</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input value={newTeacher.name} onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })} placeholder="Full name" />
            <Input value={newTeacher.email} onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })} placeholder="Email" />
            <Button className="sm:w-auto" onClick={create}>Add</Button>
          </div>
        </Card>

        <div className="space-y-2">
          {teachers.map((t) => (
            <Card key={t.id} className="flex items-center gap-4 p-4">
              <Avatar size="sm" name={t.name} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-on-surface text-sm">{t.name}</p>
                <p className="text-label-caps text-on-surface-variant">{t.email} · {t.batches?.length ?? 0} batches</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => openEdit(t)} aria-label={`Edit ${t.name}`}>
                <IconEdit size={16} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDeleting(t)} aria-label={`Delete ${t.name}`}>
                <IconTrash size={16} className="text-error" />
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit teacher">
        <div className="space-y-3">
          <Input label="Full name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <Input label="Email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete teacher"
        message={`Remove ${deleting?.name} (${deleting?.email})? Their batches and classes will be affected.`}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </AdminShell>
  );
}