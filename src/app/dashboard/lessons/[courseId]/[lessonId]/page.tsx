"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StudentShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconCheckCircle, IconChevronRight } from "@/lib/icons";
import { http, getMe } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { errMessage } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  type: string;
  content: string;
}

interface Section {
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  sections: Section[];
}

export default function LessonPlayer() {
  const { courseId, lessonId } = useParams();
  const router = useRouter();
  const toast = useToast();
  const me = getMe();
  const [course, setCourse] = useState<Course | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    http.get<Course>(`/courses/${courseId}`).then(setCourse).catch(console.error);
    if (me?.id) {
      http.get<{ lessonId: string }[]>(`/progress?studentId=${me.id}`)
        .then((p) => setCompleted(p.some((x) => x.lessonId === lessonId)))
        .catch(console.error);
    }
  }, [courseId, lessonId]);

  const markComplete = async () => {
    if (!me) return;
    try {
      await http.post("/progress", { studentId: me.id, lessonId });
      setCompleted(true);
      toast.success("Lesson marked as complete");
    } catch (err) {
      toast.error(errMessage(err));
    }
  };

  const unmark = async () => {
    if (!me) return;
    try {
      await http.del(`/progress/${lessonId}?studentId=${me.id}`);
      setCompleted(false);
      toast.success("Lesson marked as incomplete");
    } catch (err) {
      toast.error(errMessage(err));
    }
  };

  if (!course) return (
    <StudentShell><div className="p-10 text-on-surface-variant text-sm">Loading lesson…</div></StudentShell>
  );

  const all = course.sections.flatMap((s) => s.lessons);
  const idx = all.findIndex((l) => l.id === lessonId);
  const lesson = all[idx];
  const next = all[idx + 1];
  const prev = all[idx - 1];

  if (!lesson) return (
    <StudentShell><div className="p-10 text-on-surface-variant text-sm">Lesson not found.</div></StudentShell>
  );

  return (
    <StudentShell>
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Lesson content */}
        <div className="flex-1 p-6 md:p-8 lg:p-10 min-w-0">
          <button
            onClick={() => router.push(`/dashboard/courses/${courseId}`)}
            className="inline-flex items-center gap-1.5 text-body-sm text-on-surface-variant hover:text-primary transition-colors mb-6"
          >
            <IconArrowLeft size={15} /> {course.title}
          </button>

          <div className="mb-4 flex items-center gap-3 flex-wrap">
            <Badge variant="soft" size="sm">Lesson {idx + 1} of {all.length}</Badge>
            {lesson.type === "assignment" && <Badge variant="secondary" size="sm">Assignment</Badge>}
            {lesson.type === "video" && <Badge variant="info" size="sm">Video lesson</Badge>}
            {lesson.type === "text" && <Badge variant="soft" size="sm">Reading</Badge>}
            {completed && (
              <Badge variant="success" size="sm">
                <IconCheckCircle size={12} className="mr-1" /> Completed
              </Badge>
            )}
          </div>
          <h1 className="font-display-lg-mobile text-primary mb-8">{lesson.title}</h1>

          {lesson.type === "assignment" && (
            <Card className="mb-6 p-4 bg-secondary-container/40 border-secondary/40">
              <p className="text-body-sm text-on-surface">
                <span className="font-semibold text-on-secondary-container">Assignment task.</span>{" "}
                Read the brief below, complete the work, then submit it from the course page via the{" "}
                <span className="font-semibold">Assignments</span> section — your teacher verifies it and awards points.
              </p>
            </Card>
          )}

          <Card className="mb-6 overflow-hidden p-0">
            {lesson.type === "video" ? (
              <div className="aspect-video bg-black">
                <iframe
                  src={lesson.content}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  title={lesson.title}
                />
              </div>
            ) : (
              <div className="p-6 text-on-surface leading-relaxed whitespace-pre-wrap">{lesson.content}</div>
            )}
          </Card>

          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" disabled={!prev} onClick={() => prev && router.push(`/dashboard/lessons/${courseId}/${prev.id}`)}>
              <IconArrowLeft size={16} /> Previous
            </Button>
            <div className="flex items-center gap-3">
              {completed && (
                <Button variant="ghost" size="sm" onClick={unmark}>Mark as incomplete</Button>
              )}
              {completed ? (
                next ? (
                  <Button onClick={() => router.push(`/dashboard/lessons/${courseId}/${next.id}`)}>
                    Next lesson <IconChevronRight size={16} />
                  </Button>
                ) : (
                  <Button onClick={() => router.push(`/dashboard/courses/${courseId}`)}>Course complete</Button>
                )
              ) : (
                <Button onClick={markComplete}>
                  <IconCheckCircle size={16} className="mr-1" /> Mark as complete
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Course outline */}
        <aside className="lg:w-72 lg:border-l border-outline-variant/60 bg-surface-off-white/60 p-6 shrink-0 hidden lg:block">
          <p className="font-label-caps text-on-surface-variant mb-4">Course content</p>
          {course.sections.map((section, si) => (
            <div key={si} className="mb-5">
              <p className="text-xs font-semibold text-on-surface mb-2">{section.title}</p>
              <div className="space-y-1">
                {section.lessons.map((l, li) => {
                  const isCurrent = l.id === lessonId;
                  return (
                    <button
                      key={l.id}
                      onClick={() => router.push(`/dashboard/lessons/${courseId}/${l.id}`)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
                        isCurrent
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-on-surface-variant hover:bg-surface-container-low"
                      }`}
                    >
                      {li + 1}. {l.title.length > 28 ? l.title.slice(0, 28) + "…" : l.title}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>
      </div>
    </StudentShell>
  );
}