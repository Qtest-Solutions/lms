"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { IconUsers, IconUser, IconBookOpen, IconCalendar, IconChevronRight } from "@/lib/icons";
import { http } from "@/lib/api";

export default function AdminDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      http.get("/students"),
      http.get("/teachers"),
      http.get("/courses?hasStudents=true"),
      http.get("/live-sessions"),
    ])
      .then(([s, t, c, se]) => {
        setStudents(s); setTeachers(t); setCourses(c); setSessions(se);
      })
      .catch(console.error);
  }, []);

  const stats = [
    { label: "Students", value: students.length, icon: IconUsers, tint: "bg-primary/5", tone: "text-primary" },
    { label: "Teachers", value: teachers.length, icon: IconUser, tint: "bg-secondary-container/40", tone: "text-secondary" },
    { label: "Courses", value: courses.length, icon: IconBookOpen, tint: "bg-sky-tint/50", tone: "text-primary" },
    { label: "Online classes", value: sessions.length, icon: IconCalendar, tint: "bg-soft-peach/30", tone: "text-primary" },
  ];

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="font-headline-md text-primary mb-1">Admin Dashboard</h1>
          <p className="text-body-sm text-on-surface-variant">Overview of the learning system.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="flex items-center gap-4 p-5">
              <div className={`w-11 h-11 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 ${s.tint} ${s.tone}`}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="font-headline-md text-primary leading-none">{s.value}</p>
                <p className="font-label-caps text-on-surface-variant mt-1">{s.label}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline-md text-sm text-primary">Recent students</h3>
              <Link href="/admin/students" className="text-body-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
                Manage <IconChevronRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-outline-variant/40">
              {students.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center gap-3 py-2.5">
                  <Avatar size="sm" name={s.name} />
                  <span className="text-body-sm text-on-surface truncate">{s.name}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline-md text-sm text-primary">Recent online classes</h3>
              <Link href="/admin/courses" className="text-body-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
                Manage <IconChevronRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-outline-variant/40">
              {sessions.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2.5">
                  <span className="text-body-sm text-on-surface truncate">{s.title}</span>
                  <span className="font-label-caps text-on-surface-variant shrink-0 capitalize ml-2">{s.status}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {courses.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline-md text-sm text-primary">Courses with students</h3>
              <Link href="/admin/courses" className="text-body-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
                Manage <IconChevronRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-outline-variant/40">
              {courses.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2.5">
                  <span className="text-body-sm text-on-surface truncate">{c.title}</span>
                  <span className="font-label-caps text-on-surface-variant shrink-0 ml-2">{c.studentCount ?? 0} students</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AdminShell>
  );
}