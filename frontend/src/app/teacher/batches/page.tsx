"use client";

import { useEffect, useState } from "react";
import { TeacherShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconGrid } from "@/lib/icons";
import { http, getMe } from "@/lib/api";

interface Batch {
  id: string;
  name: string;
  courseId: string;
  students: { name: string }[];
  course?: { title: string };
}

export default function TeacherBatches() {
  const me = getMe();
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    if (me) http.get<Batch[]>(`/batches?teacherId=${me.id}`).then(setBatches).catch(console.error);
  }, []);

  return (
    <TeacherShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-headline-md text-primary mb-1">Batches</h1>
          <p className="text-body-sm text-on-surface-variant">Groups of students you teach together.</p>
        </div>
        <div className="space-y-3">
          {batches.map((b) => (
            <Card key={b.id} className="p-5 hover:shadow-card-hover transition-shadow duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-primary/5 flex items-center justify-center">
                    <IconGrid size={20} className="text-primary" />
                  </div>
                  <h3 className="font-headline-md text-sm text-primary">{b.name}</h3>
                </div>
                <Badge variant="soft" size="sm">{b.students.length} students</Badge>
              </div>
              <p className="text-label-caps text-on-surface-variant mb-3">Course: {b.course?.title ?? "—"}</p>
              <div className="flex flex-wrap gap-2">
                {b.students.map((s, i) => (
                  <span key={i} className="px-3 py-1 rounded-[var(--radius-full)] bg-surface-variant text-xs text-on-surface-variant">{s.name}</span>
                ))}
              </div>
            </Card>
          ))}
          {batches.length === 0 && <p className="text-body-sm text-on-surface-variant">No batches assigned yet.</p>}
        </div>
      </div>
    </TeacherShell>
  );
}