"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { IconUserCheck, IconUserX, IconLink } from "@/lib/icons";
import { http } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { errMessage } from "@/lib/utils";

interface Student {
  id: string;
  name: string;
  email: string;
  assignedTeacher?: { id: string; name: string; email: string } | null;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  assignedStudents?: { id: string; name: string; email: string }[];
}

export default function AdminAssignments() {
  const toast = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignStudentId, setAssignStudentId] = useState("");
  const [assignTeacherId, setAssignTeacherId] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    http.get<Student[]>("/students").then(setStudents).catch(console.error);
    http.get<Teacher[]>("/teachers").then(setTeachers).catch(console.error);
  };
  useEffect(load, []);

  const unassigned = useMemo(() => students.filter((s) => !s.assignedTeacher), [students]);

  const assign = async () => {
    if (!assignStudentId || !assignTeacherId) {
      toast.show("Pick both a student and a teacher", "info");
      return;
    }
    setBusy(true);
    try {
      await http.put(`/students/${assignStudentId}/assign-teacher`, { teacherId: assignTeacherId });
      toast.success("Student assigned to teacher");
      setAssignStudentId("");
      load();
    } catch (err) {
      toast.error(errMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const unassign = async (studentId: string, name: string) => {
    setBusy(true);
    try {
      await http.put(`/students/${studentId}/assign-teacher`, { teacherId: null });
      toast.success(`${name} unassigned`);
      load();
    } catch (err) {
      toast.error(errMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const assignInline = async (studentId: string, teacherId: string) => {
    try {
      await http.put(`/students/${studentId}/assign-teacher`, { teacherId: teacherId || null });
      toast.success(teacherId ? "Assignment updated" : "Student unassigned");
      load();
    } catch (err) {
      toast.error(errMessage(err));
    }
  };

  const selectClass =
    "w-full px-4 py-2.5 bg-surface-container-low text-on-surface rounded-[var(--radius-lg)] border border-outline-variant outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary text-body-sm";

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="font-headline-md text-primary mb-1">Assignments</h1>
          <p className="text-body-sm text-on-surface-variant">Assign each student to one teacher (1-to-1), independent of batches.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-[var(--radius-lg)] bg-primary/5 flex items-center justify-center shrink-0 text-primary">
              <IconUserCheck size={20} />
            </div>
            <div>
              <p className="font-headline-md text-primary leading-none">{students.filter((s) => s.assignedTeacher).length}</p>
              <p className="font-label-caps text-on-surface-variant mt-1">Assigned</p>
            </div>
          </Card>
          <Card className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-[var(--radius-lg)] bg-secondary-container/40 flex items-center justify-center shrink-0 text-secondary">
              <IconUserX size={20} />
            </div>
            <div>
              <p className="font-headline-md text-primary leading-none">{unassigned.length}</p>
              <p className="font-label-caps text-on-surface-variant mt-1">Unassigned</p>
            </div>
          </Card>
          <Card className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-[var(--radius-lg)] bg-soft-peach/30 flex items-center justify-center shrink-0 text-primary">
              <IconLink size={20} />
            </div>
            <div>
              <p className="font-headline-md text-primary leading-none">{teachers.length}</p>
              <p className="font-label-caps text-on-surface-variant mt-1">Teachers</p>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-primary/5 flex items-center justify-center">
              <IconUserCheck size={18} className="text-primary" />
            </div>
            <h2 className="font-headline-md text-sm text-primary">Assign student to teacher</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select value={assignStudentId} onChange={(e) => setAssignStudentId(e.target.value)} className={selectClass}>
              <option value="">Select student</option>
              {unassigned.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
              ))}
            </select>
            <select value={assignTeacherId} onChange={(e) => setAssignTeacherId(e.target.value)} className={selectClass}>
              <option value="">Select teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <Button onClick={assign} disabled={busy} className="sm:w-auto">Assign 1:1</Button>
          </div>
          {unassigned.length === 0 && (
            <p className="text-body-sm text-on-surface-variant mt-3">All students are assigned. Use the list below to reassign.</p>
          )}
        </Card>

        <div>
          <h2 className="font-headline-md text-primary mb-3">All students</h2>
          <div className="space-y-2">
            {students.map((s) => (
              <Card key={s.id} className="flex items-center gap-4 p-4">
                <Avatar size="sm" name={s.name} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-on-surface text-sm">{s.name}</p>
                  <p className="text-label-caps text-on-surface-variant">{s.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {s.assignedTeacher && <Badge variant="secondary" size="sm">{s.assignedTeacher.name}</Badge>}
                  <select
                    className="w-44 px-3 py-2 bg-surface-container-low text-on-surface rounded-[var(--radius-md)] border border-outline-variant outline-none text-body-sm cursor-pointer"
                    value={s.assignedTeacher?.id ?? ""}
                    onChange={(e) => assignInline(s.id, e.target.value)}
                  >
                    <option value="">— None —</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </Card>
            ))}
            {students.length === 0 && <p className="text-body-sm text-on-surface-variant">No students yet.</p>}
          </div>
        </div>

        <div>
          <h2 className="font-headline-md text-primary mb-3">Teachers & their students</h2>
          <div className="space-y-3">
            {teachers.map((t) => (
              <Card key={t.id} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar size="sm" name={t.name} />
                  <div className="min-w-0">
                    <p className="font-medium text-on-surface text-sm">{t.name}</p>
                    <p className="text-label-caps text-on-surface-variant">{t.email} · {t.assignedStudents?.length ?? 0} assigned</p>
                  </div>
                </div>
                {(t.assignedStudents ?? []).length === 0 ? (
                  <p className="text-body-sm text-on-surface-variant">No students assigned yet.</p>
                ) : (
                  <div className="space-y-1">
                    {t.assignedStudents!.map((st) => (
                      <div key={st.id} className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] bg-surface-container-low px-3 py-2">
                        <span className="text-body-sm text-on-surface">{st.name}</span>
                        <button
                          onClick={() => unassign(st.id, st.name)}
                          className="text-body-sm font-semibold text-error hover:opacity-70 cursor-pointer"
                        >
                          Unassign
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
            {teachers.length === 0 && <p className="text-body-sm text-on-surface-variant">No teachers yet.</p>}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
