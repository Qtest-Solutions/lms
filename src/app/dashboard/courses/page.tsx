"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StudentShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconBookOpen, IconChevronRight } from "@/lib/icons";
import { http, getMe } from "@/lib/api";

interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  lessonCount: number;
}

export default function MyCourses() {
  const me = getMe();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!me?.id) return;
    http.get<Course[]>(`/courses?studentId=${me.id}`).then(setCourses).catch(console.error);
  }, [me?.id]);

  return (
    <StudentShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-headline-md text-primary mb-1">My Courses</h1>
          <p className="text-body-sm text-on-surface-variant">Continue where you left off.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <Link key={c.id} href={`/dashboard/courses/${c.id}`}>
              <Card className="h-full hover:shadow-card-hover transition-shadow duration-200 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-primary/5 flex items-center justify-center">
                    <IconBookOpen size={22} className="text-primary" />
                  </div>
                  <Badge variant="soft" size="sm">{c.code}</Badge>
                </div>
                <h3 className="font-headline-md text-sm text-primary mb-1 line-clamp-1">{c.title}</h3>
                <p className="text-body-sm text-on-surface-variant mb-4 line-clamp-2">{c.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-label-caps text-on-surface-variant">{c.lessonCount} lessons</span>
                  <span className="text-body-sm font-semibold text-primary inline-flex items-center gap-1">
                    Open <IconChevronRight size={14} />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </StudentShell>
  );
}