"use client";

import { useEffect, useState } from "react";
import { TeacherShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuestionPoolManager } from "@/components/admin/question-pool";
import { http, getMe } from "@/lib/api";

interface Course {
  id: string;
  title: string;
  code: string;
}

export default function TeacherQuestions() {
  const me = getMe();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [poolCount, setPoolCount] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!me) return;
    http.get<Course[]>(`/courses?teacherId=${me.id}`).then((list) => {
      setCourses(list);
      Promise.all(
        list.map((c) =>
          http.get<unknown[]>(`/questions?courseId=${c.id}`)
            .then((qs) => ({ id: c.id, n: qs.length }))
            .catch(() => ({ id: c.id, n: 0 }))
        )
      ).then((counts) => {
        const byId = Object.fromEntries(counts.map((x) => [x.id, x.n]));
        setPoolCount(byId);
        setSelected((prev) => {
          if (prev) return prev;
          const first = [...list].sort((a, b) => (byId[b.id] ?? 0) - (byId[a.id] ?? 0))[0];
          return first?.id ?? list[0]?.id ?? "";
        });
      });
    }).catch(console.error);
  }, [me?.id]);

  const selectedCourse = courses.find((c) => c.id === selected);

  return (
    <TeacherShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="font-headline-md text-primary mb-1">Question Pools</h1>
          <p className="text-body-sm text-on-surface-variant">
            Curate questions per course — each student quiz draws 20 random questions from the pool.
          </p>
        </div>

        {courses.length === 0 ? (
          <Card className="p-6 text-body-sm text-on-surface-variant">
            No courses assigned to you yet. Question pools appear here once you have a course.
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={`px-4 py-2 rounded-[var(--radius-md)] border text-body-sm font-medium transition-colors cursor-pointer ${
                    selected === c.id
                      ? "bg-secondary text-on-secondary border-secondary"
                      : "bg-surface-container-low text-on-surface-variant border-outline-variant hover:bg-surface-container-high"
                  }`}
                >
                  {c.title}
                  <span className="ml-2 opacity-70">({poolCount[c.id] ?? 0})</span>
                </button>
              ))}
            </div>

            {selectedCourse && (
              <div className="flowmark-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="soft">{selectedCourse.code}</Badge>
                  <p className="font-label-caps text-on-surface-variant">{selectedCourse.title}</p>
                </div>
                <QuestionPoolManager key={selected} courseId={selected} />
              </div>
            )}
          </>
        )}
      </div>
    </TeacherShell>
  );
}