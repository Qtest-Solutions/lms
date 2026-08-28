"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IconGrid, IconPlus, IconEdit2 as IconEdit, IconTrash2 as IconTrash, IconUsers, IconX } from "@/lib/icons";
import { http } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { errMessage } from "@/lib/utils";

interface Batch {
  id: string;
  name: string;
  teacherId: string;
  courseId: string;
  teacher?: { id: string; name: string };
  course?: { id: string; title: string };
  students?: { id: string; name: string; email: string }[];
}

interface Student {
  id: string;
  name: string;
  email: string;
}

export default function AdminBatches() {
  const toast = useToast();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [form, setForm] = useState({ name: "", teacherId: "", courseId: "" });
  const [editing, setEditing] = useState<Batch | null>(null);
  const [editForm, setEditForm] = useState({ name: "", teacherId: "", courseId: "" });
  const [deleting, setDeleting] = useState<Batch | null>(null);

  const [managingStudents, setManagingStudents] = useState<Batch | null>(null);
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);

  const load = () => {
    http.get("/batches").then(setBatches).catch(console.error);
    http.get("/teachers").then(setTeachers).catch(console.error);
    http.get("/courses").then(setCourses).catch(console.error);
  };
  useEffect(load, []);

  const create = async () => {
    try {
      await http.post("/batches", form);
      toast.success("Batch created");
    } catch (err) {
      toast.error(errMessage(err));
    }
    setForm({ name: "", teacherId: "", courseId: "" });
    load();
  };

  const openEdit = (b: Batch) => {
    setEditing(b);
    setEditForm({ name: b.name, teacherId: b.teacherId, courseId: b.courseId });
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await http.put(`/batches/${editing.id}`, editForm);
      toast.success("Batch updated");
    } catch (err) {
      toast.error(errMessage(err));
    }
    setEditing(null);
    load();
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await http.del(`/batches/${deleting.id}`);
      toast.success("Batch deleted");
    } catch (err) {
      toast.error(errMessage(err));
    }
    setDeleting(null);
    load();
  };

  const openManageStudents = async (b: Batch) => {
    setManagingStudents(b);
    setLoadingStudents(true);
    try {
      const [batchData, all] = await Promise.all([
        http.get<Batch>(`/batches/${b.id}`),
        http.get<Student[]>("/students"),
      ]);
      setAssignedStudents(batchData.students ?? []);
      setAllStudents(all);
    } catch (err) {
      console.error(err);
    }
    setLoadingStudents(false);
  };

  const addStudent = async () => {
    if (!managingStudents || !selectedStudentId) return;
    try {
      await http.post(`/batches/${managingStudents.id}/students`, { studentId: selectedStudentId });
      toast.success("Student added");
      const updated = await http.get<Batch>(`/batches/${managingStudents.id}`);
      setAssignedStudents(updated.students ?? []);
      setSelectedStudentId("");
    } catch (err) {
      toast.error(errMessage(err));
    }
  };

  const removeStudent = async (studentId: string) => {
    if (!managingStudents) return;
    try {
      await http.del(`/batches/${managingStudents.id}/students`, { studentId });
      toast.success("Student removed");
      const updated = await http.get<Batch>(`/batches/${managingStudents.id}`);
      setAssignedStudents(updated.students ?? []);
    } catch (err) {
      toast.error(errMessage(err));
    }
  };

  const unassignedStudents = allStudents.filter((s) => !assignedStudents.some((a) => a.id === s.id));

  const selectClass =
    "w-full px-4 py-2.5 bg-surface-container-low text-on-surface rounded-[var(--radius-lg)] border border-outline-variant outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary text-body-sm";

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="font-headline-md text-primary mb-1">Batches</h1>
          <p className="text-body-sm text-on-surface-variant">Group students into batches with a teacher.</p>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-primary/5 flex items-center justify-center">
              <IconPlus size={18} className="text-primary" />
            </div>
            <h2 className="font-headline-md text-sm text-primary">Create batch</h2>
          </div>
          <div className="space-y-2">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Batch name" />
            <div className="flex flex-col sm:flex-row gap-2">
              <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} className={selectClass}>
                <option value="">Assign teacher</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className={selectClass}>
                <option value="">Link course</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <Button onClick={create}>Create batch</Button>
          </div>
        </Card>

        <div className="space-y-2">
          {batches.map((b) => (
            <Card key={b.id} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-primary/5 flex items-center justify-center shrink-0">
                <IconGrid size={20} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-on-surface text-sm">{b.name}</p>
                <p className="text-label-caps text-on-surface-variant mt-0.5">
                  {b.teacher?.name ?? "No teacher"} · {b.course?.title ?? "No course"} · {b.students?.length ?? 0} students
                </p>
              </div>
              <Badge variant="soft" size="sm">{b.students?.length ?? 0} students</Badge>
              <Button variant="secondary" size="sm" onClick={() => openManageStudents(b)}>
                <IconUsers size={15} /> Students
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openEdit(b)} aria-label={`Edit ${b.name}`}>
                <IconEdit size={16} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDeleting(b)} aria-label={`Delete ${b.name}`}>
                <IconTrash size={16} className="text-error" />
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit batch">
        <div className="space-y-3">
          <Input label="Batch name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <div>
            <label className="font-label-caps text-on-surface-variant">Teacher</label>
            <select
              value={editForm.teacherId}
              onChange={(e) => setEditForm({ ...editForm, teacherId: e.target.value })}
              className={`mt-1.5 ${selectClass}`}
            >
              <option value="">Assign teacher</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="font-label-caps text-on-surface-variant">Course</label>
            <select
              value={editForm.courseId}
              onChange={(e) => setEditForm({ ...editForm, courseId: e.target.value })}
              className={`mt-1.5 ${selectClass}`}
            >
              <option value="">Link course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!managingStudents} onClose={() => setManagingStudents(null)} title={`Manage students — ${managingStudents?.name}`}>
        {loadingStudents ? (
          <p className="text-body-sm text-on-surface-variant py-4">Loading…</p>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-surface-container-low text-on-surface rounded-[var(--radius-lg)] border border-outline-variant outline-none text-body-sm"
              >
                <option value="">Select student…</option>
                {unassignedStudents.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                ))}
              </select>
              <Button onClick={addStudent} disabled={!selectedStudentId}>Add</Button>
            </div>

            {assignedStudents.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant py-2">No students in this batch yet.</p>
            ) : (
              <div className="divide-y divide-outline-variant/40">
                {assignedStudents.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-body-sm text-on-surface">{s.name}</p>
                      <p className="text-label-caps text-on-surface-variant">{s.email}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeStudent(s.id)}>
                      <IconX size={16} className="text-error" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete batch"
        message={`Delete batch "${deleting?.name}"? Students will no longer be grouped in it.`}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </AdminShell>
  );
}