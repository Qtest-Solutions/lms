"use client";

import { useEffect, useState } from "react";
import { TeacherShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { IconUserCheck } from "@/lib/icons";
import { http, getMe } from "@/lib/api";

interface TeacherProfile {
  id: string;
  students: { id: string; name: string; email: string }[];
  assignedStudents: { id: string; name: string; email: string }[];
}

export default function TeacherStudents() {
  const me = getMe();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);

  useEffect(() => {
    if (me) http.get<TeacherProfile>(`/teachers/${me.id}`).then(setProfile).catch(console.error);
  }, []);

  const batchStudents = profile?.students ?? [];
  const assigned = profile?.assignedStudents ?? [];

  return (
    <TeacherShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-headline-md text-primary mb-1">Students</h1>
          <p className="text-body-sm text-on-surface-variant">Students across all your classes and your 1-to-1 assignments.</p>
        </div>

        {assigned.length > 0 && (
          <div>
            <h2 className="font-headline-md text-primary text-sm mb-2 flex items-center gap-2">
              <IconUserCheck size={16} /> My assigned students <Badge variant="secondary" size="sm">{assigned.length}</Badge>
            </h2>
            <div className="space-y-2">
              {assigned.map((s) => (
                <Card key={s.id} className="flex items-center gap-4 p-4 hover:shadow-card-hover transition-shadow duration-200">
                  <Avatar size="sm" name={s.name} />
                  <div className="min-w-0">
                    <p className="font-medium text-on-surface text-sm">{s.name}</p>
                    <p className="text-label-caps text-on-surface-variant">{s.email}</p>
                  </div>
                  <Badge variant="success" size="sm" className="ml-auto">1:1</Badge>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="font-headline-md text-primary text-sm mb-2">
            Class students <Badge variant="secondary" size="sm">{batchStudents.length}</Badge>
          </h2>
          <div className="space-y-2">
            {batchStudents.map((s) => (
              <Card key={s.id} className="flex items-center gap-4 p-4 hover:shadow-card-hover transition-shadow duration-200">
                <Avatar size="sm" name={s.name} />
                <div className="min-w-0">
                  <p className="font-medium text-on-surface text-sm">{s.name}</p>
                  <p className="text-label-caps text-on-surface-variant">{s.email}</p>
                </div>
              </Card>
            ))}
            {batchStudents.length === 0 && <p className="text-body-sm text-on-surface-variant">No students in your classes yet.</p>}
          </div>
        </div>
      </div>
    </TeacherShell>
  );
}
