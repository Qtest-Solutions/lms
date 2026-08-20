"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TeacherShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { IconUsers, IconGrid, IconChevronRight } from "@/lib/icons";
import { http, getMe } from "@/lib/api";

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  students: { id: string; name: string; email: string }[];
  batches: { id: string; name: string; studentIds: string[] }[];
}

export default function TeacherDashboard() {
  const me = getMe();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);

  useEffect(() => {
    if (me) http.get<TeacherProfile>(`/teachers/${me.id}`).then(setProfile).catch(console.error);
  }, []);

  const studentCount = profile?.students.length ?? 0;
  const batchCount = profile?.batches.length ?? 0;

  return (
    <TeacherShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Welcome hero */}
        <div className="flowmark-card bg-gradient-to-br from-primary/5 via-surface-off-white to-secondary/5 border-none">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar size="lg" name={me?.name ?? "Teacher"} />
              <div>
                <p className="font-label-caps text-on-surface-variant mb-1">Welcome back</p>
                <h1 className="font-display-lg-mobile text-primary">{me?.name?.split(" ")[0] ?? "Teacher"}</h1>
                <p className="text-body-sm text-on-surface-variant mt-1">Here&apos;s what needs your attention today.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="font-headline-md text-primary">{studentCount}</p>
                <p className="font-label-caps text-on-surface-variant">Students</p>
              </div>
              <div className="w-px h-12 bg-outline-variant/40" />
              <div className="text-center">
                <p className="font-headline-md text-secondary">{batchCount}</p>
                <p className="font-label-caps text-on-surface-variant">Batches</p>
              </div>
            </div>
          </div>
        </div>

        {profile && (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-md text-primary">Your students</h2>
                <Link href="/teacher/students" className="text-body-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
                  View all <IconChevronRight size={14} />
                </Link>
              </div>
              <div className="space-y-2">
                {profile.students.map((s) => (
                  <Card key={s.id} className="flex items-center justify-between p-4 hover:shadow-card-hover transition-shadow duration-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar size="sm" name={s.name} />
                      <div className="min-w-0">
                        <p className="font-medium text-on-surface text-sm truncate">{s.name}</p>
                        <p className="text-label-caps text-on-surface-variant">{s.email}</p>
                      </div>
                    </div>
                    <Link href="/teacher/students" className="text-body-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
                      View <IconChevronRight size={14} />
                    </Link>
                  </Card>
                ))}
                {profile.students.length === 0 && <p className="text-body-sm text-on-surface-variant">No students assigned yet.</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-md text-primary">Your batches</h2>
                <Link href="/teacher/batches" className="text-body-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
                  View all <IconChevronRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.batches.map((b) => (
                  <Link key={b.id} href="/teacher/batches">
                    <Card className="h-full hover:shadow-card-hover transition-shadow duration-200 cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-primary/5 flex items-center justify-center">
                          <IconGrid size={20} className="text-primary" />
                        </div>
                        <Badge variant="soft" size="sm">{b.studentIds.length} students</Badge>
                      </div>
                      <p className="font-headline-md text-sm text-primary">{b.name}</p>
                    </Card>
                  </Link>
                ))}
                {profile.batches.length === 0 && <p className="text-body-sm text-on-surface-variant">No batches assigned yet.</p>}
              </div>
            </div>
          </>
        )}
      </div>
    </TeacherShell>
  );
}