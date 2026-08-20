"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  IconArrowLeft,
  IconBookOpen,
  IconPlus,
  IconPlay,
  IconListChecks,
  IconFileText,
  IconEdit2 as IconEdit,
  IconTrash2 as IconTrash,
} from "@/lib/icons";
import { http } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { errMessage } from "@/lib/utils";
import { QuestionPoolManager } from "@/components/admin/question-pool";

interface Lesson {
  id: string;
  title: string;
  type: string;
  content: string;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  sections: Section[];
}

const LESSON_TYPES = ["video", "text", "assignment"] as const;

const lessonIcon: Record<string, typeof IconPlay> = {
  video: IconPlay,
  text: IconListChecks,
  assignment: IconFileText,
};

const typeVariant: Record<string, "info" | "soft" | "secondary"> = {
  video: "info",
  text: "soft",
  assignment: "secondary",
};

type SectionModalState =
  | { kind: "create-section" }
  | { kind: "edit-section"; section: Section }
  | null;

type LessonModalState =
  | { kind: "create-lesson"; section: Section }
  | { kind: "edit-lesson"; section: Section; lesson: Lesson }
  | null;

type DeleteState =
  | { kind: "section"; section: Section }
  | { kind: "lesson"; section: Section; lesson: Lesson }
  | null;

const emptyLessonForm = { title: "", type: "text" as string, content: "" };

export default function AdminCourseContent() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [sectionModal, setSectionModal] = useState<SectionModalState>(null);
  const [sectionTitle, setSectionTitle] = useState("");
  const [lessonModal, setLessonModal] = useState<LessonModalState>(null);
  const [lessonForm, setLessonForm] = useState(emptyLessonForm);
  const [deleting, setDeleting] = useState<DeleteState>(null);

  const load = () => http.get<Course>(`/courses/${id}`).then(setCourse).catch(console.error);
  useEffect(() => { void load(); }, [id]);

  if (!course) {
    return (
      <AdminShell>
        <div className="max-w-3xl mx-auto text-on-surface-variant text-sm">Loading course content…</div>
      </AdminShell>
    );
  }

  const openCreateSection = () => {
    setSectionTitle("");
    setSectionModal({ kind: "create-section" });
  };

  const openEditSection = (section: Section) => {
    setSectionTitle(section.title);
    setSectionModal({ kind: "edit-section", section });
  };

  const saveSection = async () => {
    if (!sectionTitle.trim()) return;
    try {
      if (sectionModal?.kind === "edit-section") {
        await http.put(`/sections/${sectionModal.section.id}`, { title: sectionTitle });
        toast.success("Section updated");
      } else {
        await http.post("/sections", { courseId: course.id, title: sectionTitle });
        toast.success("Section added");
      }
    } catch (err) {
      toast.error(errMessage(err));
    }
    setSectionModal(null);
    load();
  };

  const openCreateLesson = (section: Section) => {
    setLessonForm(emptyLessonForm);
    setLessonModal({ kind: "create-lesson", section });
  };

  const openEditLesson = (section: Section, lesson: Lesson) => {
    setLessonForm({ title: lesson.title, type: lesson.type, content: lesson.content });
    setLessonModal({ kind: "edit-lesson", section, lesson });
  };

  const saveLesson = async () => {
    if (!lessonModal) return;
    if (!lessonForm.title.trim()) return;
    try {
      if (lessonModal.kind === "edit-lesson") {
        await http.put(`/lessons/${lessonModal.lesson.id}`, lessonForm);
        toast.success("Lesson updated");
      } else {
        await http.post("/lessons", { sectionId: lessonModal.section.id, ...lessonForm });
        toast.success("Lesson added");
      }
    } catch (err) {
      toast.error(errMessage(err));
    }
    setLessonModal(null);
    load();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      if (deleting.kind === "section") {
        await http.del(`/sections/${deleting.section.id}`);
        toast.success("Section deleted");
      } else {
        await http.del(`/lessons/${deleting.lesson.id}`);
        toast.success("Lesson deleted");
      }
    } catch (err) {
      toast.error(errMessage(err));
    }
    setDeleting(null);
    load();
  };

  const deleteMessage =
    deleting?.kind === "section"
      ? `Delete section "${deleting.section.title}" and all its lessons? This cannot be undone.`
      : `Delete lesson "${deleting?.lesson.title}"? Students' progress on it will be removed.`;

  return (
    <AdminShell>
      <div className="max-w-3xl mx-auto space-y-8">
        <button
          onClick={() => router.push("/admin/courses")}
          className="inline-flex items-center gap-1.5 text-body-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <IconArrowLeft size={15} /> Back to courses
        </button>

        <div className="flowmark-card bg-gradient-to-br from-leaf-green/10 via-surface-off-white to-soft-peach/10 border-none">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="soft">{course.code}</Badge>
            <Badge variant="info" size="sm">{course.sections.reduce((n, s) => n + s.lessons.length, 0)} lessons</Badge>
          </div>
          <h1 className="font-display-lg-mobile text-primary mb-2">{course.title}</h1>
          <p className="text-body-md text-on-surface-variant mb-4">{course.description}</p>
          <Button onClick={openCreateSection}>
            <IconPlus size={16} /> Add section
          </Button>
        </div>

        <div className="space-y-6">
          {course.sections.map((section) => {
            const Icon = lessonIcon[section.lessons[0]?.type ?? ""] ?? IconBookOpen;
            return (
              <section key={section.id} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-headline-md text-primary flex items-center gap-2">
                    <Icon size={18} className="text-primary" />
                    {section.title}
                  </h2>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditSection(section)} aria-label={`Edit section ${section.title}`}>
                      <IconEdit size={15} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleting({ kind: "section", section })} aria-label={`Delete section ${section.title}`}>
                      <IconTrash size={15} className="text-error" />
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => openCreateLesson(section)}>
                      <IconPlus size={14} /> Lesson
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {section.lessons.length === 0 && (
                    <p className="text-body-sm text-on-surface-variant px-1">No lessons yet — add one.</p>
                  )}
                  {section.lessons.map((lesson, li) => {
                    const LIcon = lessonIcon[lesson.type] ?? IconFileText;
                    return (
                      <Card key={lesson.id} className="flex items-center justify-between gap-3 p-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-[var(--radius-md)] bg-primary/5 flex items-center justify-center shrink-0">
                            <LIcon size={17} className="text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-on-surface text-sm truncate">{li + 1}. {lesson.title}</p>
                            <p className="text-label-caps text-on-surface-variant mt-0.5 truncate">{lesson.content}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={typeVariant[lesson.type] ?? "soft"} size="sm" className="capitalize">{lesson.type}</Badge>
                          <Button variant="ghost" size="sm" onClick={() => openEditLesson(section, lesson)} aria-label={`Edit lesson ${lesson.title}`}>
                            <IconEdit size={15} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleting({ kind: "lesson", section, lesson })} aria-label={`Delete lesson ${lesson.title}`}>
                            <IconTrash size={15} className="text-error" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </section>
            );
          })}
          {course.sections.length === 0 && (
            <p className="text-body-sm text-on-surface-variant">This course has no sections yet.</p>
          )}
        </div>

        <div className="flowmark-card p-6 space-y-4">
          <QuestionPoolManager courseId={course.id} />
        </div>
      </div>

      <Modal
        open={!!sectionModal}
        onClose={() => setSectionModal(null)}
        title={sectionModal?.kind === "edit-section" ? "Edit section" : "Add section"}
        maxWidth="max-w-md"
      >
        <div className="space-y-3">
          <Input
            label="Section title"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            placeholder="e.g. Fundamentals"
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setSectionModal(null)}>Cancel</Button>
            <Button onClick={saveSection} disabled={!sectionTitle.trim()}>
              {sectionModal?.kind === "edit-section" ? "Save changes" : "Add section"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!lessonModal}
        onClose={() => setLessonModal(null)}
        title={lessonModal?.kind === "edit-lesson" ? "Edit lesson" : "Add lesson"}
        maxWidth="max-w-lg"
      >
        <div className="space-y-3">
          <Input
            label="Lesson title"
            value={lessonForm.title}
            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
            placeholder="e.g. Forces & Newton's Laws"
            autoFocus
          />
          <div>
            <label className="font-label-caps text-on-surface-variant">Type</label>
            <div className="mt-1.5 flex gap-2">
              {LESSON_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setLessonForm({ ...lessonForm, type: t })}
                  className={`px-4 py-2 rounded-[var(--radius-md)] border text-body-sm font-medium capitalize transition-colors cursor-pointer ${
                    lessonForm.type === t
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface-container-low text-on-surface-variant border-outline-variant hover:bg-surface-container-high"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-label-caps text-on-surface-variant">
              {lessonForm.type === "video" ? "Video URL" : "Content"}
            </label>
            {lessonForm.type === "video" ? (
              <Input
                value={lessonForm.content}
                onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                placeholder="https://www.youtube.com/embed/…"
                className="mt-1.5"
              />
            ) : (
              <textarea
                value={lessonForm.content}
                onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                rows={4}
                placeholder="Lesson text, instructions, or assignment description…"
                className="mt-1.5 w-full px-4 py-2.5 bg-surface-container-low text-on-surface rounded-[var(--radius-lg)] border border-outline-variant outline-none transition-all duration-200 placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary text-body-sm resize-none"
              />
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setLessonModal(null)}>Cancel</Button>
            <Button onClick={saveLesson} disabled={!lessonForm.title.trim()}>
              {lessonModal?.kind === "edit-lesson" ? "Save changes" : "Add lesson"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title={deleting?.kind === "section" ? "Delete section" : "Delete lesson"}
        message={deleteMessage}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </AdminShell>
  );
}