"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StudentShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ProgressBar } from "@/components/ui/progress-bar";
import { IconArrowLeft, IconPlay, IconListChecks, IconFileText, IconCheckCircle, IconHelpCircle, IconFileCheck, IconTrophy, IconClipboardCheck, IconUpload, IconX } from "@/lib/icons";
import { http, getMe, uploadFile } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { errMessage } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  sections: {
    title: string;
    lessons: { id: string; title: string; type: string; content: string }[];
  }[];
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  points: number;
  dueAt: string | null;
  submissions: { id: string; content: string; attachmentUrl?: string | null; status: string; score: number | null; feedback: string | null }[];
}

interface LeaderboardEntry {
  id: string;
  score: number;
  total: number;
  createdAt: string;
  student: { name: string };
}

const typeConfig: Record<string, { icon: typeof IconFileText; container: string; badge: "soft" | "info" | "secondary"; label: string; hint: string }> = {
  text: { icon: IconListChecks, container: "bg-primary/5", badge: "soft", label: "Reading", hint: "Read the lesson to progress" },
  video: { icon: IconPlay, container: "bg-sky-tint/30", badge: "info", label: "Video", hint: "Watch the video lesson" },
  assignment: { icon: IconClipboardCheck, container: "bg-secondary-container text-on-secondary-container", badge: "secondary", label: "Assignment", hint: "Task — submit your work below" },
};

const submissionBadge: Record<string, "soft" | "success" | "secondary" | "info"> = {
  submitted: "info",
  verified: "success",
  returned: "secondary",
};

export default function CourseDetail() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const me = getMe();
  const [course, setCourse] = useState<Course | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [poolSize, setPoolSize] = useState(0);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [submitFor, setSubmitFor] = useState<Assignment | null>(null);
  const [submitText, setSubmitText] = useState("");
  const [attachment, setAttachment] = useState<{ file: File; url: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    http.get<Course>(`/courses/${id}`).then(setCourse).catch(console.error);
    if (me?.id) {
      http.get<{ lessonId: string }[]>(`/progress?studentId=${me.id}`)
        .then((p) => setCompleted(new Set(p.map((x) => x.lessonId))))
        .catch(console.error);
      http.get<unknown[]>(`/questions?courseId=${id}`).then((qs) => setPoolSize(qs.length)).catch(console.error);
      http.get<Assignment[]>(`/assignments?courseId=${id}&studentId=${me.id}`).then(setAssignments).catch(console.error);
      http.get<LeaderboardEntry[]>(`/quiz/${id}/leaderboard`).then(setLeaderboard).catch(console.error);
    }
  }, [id]);

  if (!course) {
    return (
      <StudentShell>
        <div className="max-w-3xl mx-auto text-on-surface-variant text-sm">Loading course…</div>
      </StudentShell>
    );
  }

  const allLessons = course.sections.flatMap((s) => s.lessons);
  const doneCount = allLessons.filter((l) => completed.has(l.id)).length;

  const openSubmit = (a: Assignment) => {
    setSubmitFor(a);
    setSubmitText(a.submissions[0]?.content ?? "");
    const existing = a.submissions[0]?.attachmentUrl;
    setAttachment(existing ? { file: new File([], existing.split("/").pop() ?? "attachment"), url: existing } : null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const result = await uploadFile(file, "assignments", setUploadProgress);
      setAttachment({ file, url: result.publicUrl });
      toast.success("File uploaded");
    } catch (err) {
      toast.error(errMessage(err));
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (e.target) e.target.value = "";
    }
  };

  const submitAssignment = async () => {
    if (!submitFor || !me) return;
    if (!submitText.trim()) {
      toast.error("Write your answer before submitting");
      return;
    }
    try {
      await http.post(`/assignments/${submitFor.id}/submit`, { studentId: me.id, content: submitText, attachmentUrl: attachment?.url ?? null });
      toast.success("Assignment submitted for verification");
    } catch (err) {
      toast.error(errMessage(err));
    }
    setSubmitFor(null);
    setSubmitText("");
    setAttachment(null);
    http.get<Assignment[]>(`/assignments?courseId=${id}&studentId=${me.id}`).then(setAssignments).catch(console.error);
  };

  return (
    <StudentShell>
      <div className="max-w-3xl mx-auto space-y-8">
        <button
          onClick={() => router.push("/dashboard/courses")}
          className="inline-flex items-center gap-1.5 text-body-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <IconArrowLeft size={15} /> Back to courses
        </button>

        {/* Course header */}
        <div className="flowmark-card bg-gradient-to-br from-leaf-green/10 via-surface-off-white to-soft-peach/10 border-none">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="soft">{course.code}</Badge>
            <Badge variant="info" size="sm">{allLessons.length} lessons</Badge>
          </div>
          <h1 className="font-display-lg-mobile text-primary mb-2">{course.title}</h1>
          <p className="text-body-md text-on-surface-variant mb-4">{course.description}</p>
          {allLessons.length > 0 && (
            <div>
              <ProgressBar value={doneCount} max={allLessons.length} showLabel />
              <p className="text-label-caps text-on-surface-variant mt-1.5">{doneCount} of {allLessons.length} lessons completed</p>
            </div>
          )}
        </div>

        {/* Quiz */}
        <div className="flowmark-card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-br from-primary/5 to-leaf-green/5 border-none">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-[var(--radius-lg)] bg-primary/10 flex items-center justify-center shrink-0">
              <IconHelpCircle size={22} className="text-primary" />
            </div>
            <div>
              <h2 className="font-headline-md text-sm text-primary mb-1">Course Quiz</h2>
              <p className="text-body-sm text-on-surface-variant">
                {poolSize >= 20
                  ? `${poolSize} questions in the pool — 20 random ones every attempt. Beat the leaderboard!`
                  : poolSize > 0
                  ? `${poolSize} questions in the pool — every attempt draws random ones. Beat the leaderboard!`
                  : "No questions in the pool yet — check back later."}
              </p>
            </div>
          </div>
          <Button onClick={() => router.push(`/dashboard/courses/${course.id}/quiz`)} disabled={poolSize === 0} className="sm:w-auto">
            {poolSize > 0 ? "Take the quiz" : "Coming soon"}
          </Button>
        </div>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <IconTrophy size={18} className="text-secondary" />
              <h2 className="font-headline-md text-sm text-primary">Quiz leaderboard</h2>
            </div>
            <div className="space-y-1.5">
              {leaderboard.map((e, i) => (
                <div key={e.id} className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] bg-surface-container-low">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-secondary text-on-secondary" : "bg-surface-container-high text-on-surface-variant"}`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-body-sm font-medium text-on-surface truncate">{e.student.name}</span>
                  <span className="text-body-sm font-semibold text-primary">{e.score}/{e.total}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Assignments */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <IconFileCheck size={20} className="text-primary" />
            <h2 className="font-headline-md text-primary">Assignments</h2>
          </div>
          {assignments.length === 0 ? (
            <Card className="p-6 text-body-sm text-on-surface-variant">No assignments yet for this course.</Card>
          ) : (
            assignments.map((a) => {
              const sub = a.submissions[0];
              return (
                <Card key={a.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-headline-md text-sm text-primary">{a.title}</h3>
                        <Badge variant="soft" size="sm">{a.points} pts</Badge>
                        {sub && <Badge variant={submissionBadge[sub.status.toLowerCase()] ?? "soft"} size="sm" className="capitalize">{sub.status}</Badge>}
                      </div>
                      {a.dueAt && (
                        <p className="font-label-caps text-on-surface-variant mt-0.5">Due {new Date(a.dueAt).toLocaleDateString()}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      {sub?.status?.toLowerCase() === "verified" ? (
                        <>
                          <p className="font-headline-md text-leaf-green">{sub.score}/{a.points}</p>
                          <p className="font-label-caps text-on-surface-variant">Verified</p>
                        </>
                      ) : sub?.status?.toLowerCase() === "returned" ? (
                        <>
                          <p className="font-headline-md text-secondary">Returned</p>
                          <p className="font-label-caps text-on-surface-variant">Resubmit below</p>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-body-sm text-on-surface-variant mt-2 whitespace-pre-wrap">{a.description}</p>
                  {sub?.feedback && (
                    <div className="mt-3 p-3 rounded-[var(--radius-md)] bg-surface-container-low text-body-sm text-on-surface">
                      <span className="font-semibold">Teacher feedback:</span> {sub.feedback}
                    </div>
                  )}
                  <div className="mt-3">
                    <Button variant={sub?.status?.toLowerCase() === "verified" ? "secondary" : "primary"} size="sm" onClick={() => openSubmit(a)}>
                      {sub?.status?.toLowerCase() === "verified" ? "View submission" : sub ? "Resubmit work" : "Submit work"}
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </section>

        {/* Lessons */}
        {course.sections.map((section, si) => (
          <section key={si} className="space-y-3">
            <h2 className="font-headline-md text-primary">{section.title}</h2>
            <div className="space-y-3">
{section.lessons.map((lesson, li) => {
                const cfg = typeConfig[lesson.type] ?? typeConfig.text;
                const Icon = cfg.icon;
                const isDone = completed.has(lesson.id);
                return (
                  <Card
                    key={lesson.id}
                    className={`flex items-center justify-between gap-3 hover:shadow-card-hover transition-shadow duration-200 cursor-pointer ${
                      lesson.type === "assignment" ? "border-secondary/50" : ""
                    }`}
                    onClick={() => router.push(`/dashboard/lessons/${course.id}/${lesson.id}`)}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-11 h-11 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 ${isDone ? "bg-leaf-green/10" : cfg.container}`}>
                        {isDone ? <IconCheckCircle size={20} className="text-leaf-green" /> : <Icon size={20} className="text-primary" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-on-surface text-sm truncate">{li + 1}. {lesson.title}</p>
                          <Badge variant={cfg.badge} size="sm">{cfg.label}</Badge>
                        </div>
                        <p className="font-label-caps text-on-surface-variant mt-0.5">{cfg.hint}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isDone && <Badge variant="success" size="sm">Completed</Badge>}
                      <Button variant={lesson.type === "assignment" ? "secondary" : "ghost"} size="sm">{isDone ? "Review" : "Start"}</Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <Modal open={!!submitFor} onClose={() => setSubmitFor(null)} title={submitFor?.title ?? "Submit work"} maxWidth="max-w-lg">
        <div className="space-y-3">
          <div>
            <label className="font-label-caps text-on-surface-variant">Your answer</label>
            <textarea
              value={submitText}
              onChange={(e) => setSubmitText(e.target.value)}
              rows={8}
              placeholder="Write your submission. Be thorough — your teacher grades it and awards points."
              className="mt-1.5 w-full px-4 py-2.5 bg-surface-container-low text-on-surface rounded-[var(--radius-lg)] border border-outline-variant outline-none transition-all duration-200 placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary text-body-sm resize-none"
            />
          </div>
          <div>
            <label className="font-label-caps text-on-surface-variant">Attachment</label>
            {attachment ? (
              <div className="mt-1.5 flex items-center justify-between gap-2 px-3 py-2 bg-surface-container-low text-on-surface rounded-[var(--radius-lg)] border border-outline-variant">
                <a href={attachment.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-body-sm text-primary hover:underline truncate">
                  <IconFileCheck size={16} />
                  <span className="truncate">{attachment.file.name}</span>
                </a>
                <button type="button" onClick={() => setAttachment(null)} className="text-on-surface-variant hover:text-error" aria-label="Remove attachment">
                  <IconX size={16} />
                </button>
              </div>
            ) : (
              <label className="mt-1.5 flex flex-col items-center justify-center gap-1 px-4 py-5 border-2 border-dashed border-outline-variant rounded-[var(--radius-lg)] cursor-pointer text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
                <input type="file" className="hidden" onChange={handleFileSelect} disabled={uploading} />
                {uploading ? (
                  <>
                    <span className="text-body-sm">Uploading… {uploadProgress}%</span>
                    <ProgressBar value={uploadProgress} max={100} />
                  </>
                ) : (
                  <>
                    <IconUpload size={20} />
                    <span className="text-body-sm">Upload a file (image, video, PDF, etc.)</span>
                  </>
                )}
              </label>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setSubmitFor(null)}>Cancel</Button>
            <Button onClick={submitAssignment}>Submit for verification</Button>
          </div>
        </div>
      </Modal>
    </StudentShell>
  );
}