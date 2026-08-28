"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StudentShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/ui/progress-bar";
import { IconCalendar, IconBookOpen, IconChevronRight, IconPlay, IconAward } from "@/lib/icons";
import { http, getMe } from "@/lib/api";

interface Course {
  id: string;
  title: string;
  code: string;
  lessonCount: number;
}

interface CourseProgress {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
}

interface Session {
  id: string;
  title: string;
  scheduledAt: string;
  status: string;
  type: string;
  joinUrl: string;
  course?: Course;
}

interface Recording {
  id: string;
  title: string;
  url: string;
  duration: number;
}

export default function StudentDashboard() {
  const me = getMe();
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentId = me?.id;
    const jobs: Promise<void>[] = [
      http.get<Course[]>(studentId ? `/courses?studentId=${studentId}` : "/courses").then(setCourses),
      http.get<Session[]>("/live-sessions").then((s) => setSessions(s.filter((x) => x.status === "SCHEDULED" || x.status === "ACTIVE"))),
      http.get<Recording[]>("/recordings").then(setRecordings),
    ];
    if (studentId) {
      jobs.push(
        http.get<CourseProgress[]>(`/progress/overview?studentId=${studentId}`).then((p) =>
          setProgress(Object.fromEntries(p.map((x) => [x.courseId, x])))
        )
      );
    }
    Promise.allSettled(jobs).finally(() => setLoading(false));
  }, []);

  const upcoming = sessions[0];
  const nextRecording = recordings[0];

  return (
    <StudentShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Welcome hero */}
        <div className="flowmark-card bg-gradient-to-br from-leaf-green/10 via-surface-off-white to-soft-peach/10 border-none">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar size="lg" name={me?.name ?? "Student"} />
              <div>
                <p className="font-label-caps text-on-surface-variant mb-1">Welcome back</p>
                <h1 className="font-display-lg-mobile text-primary">{me?.name ?? "Student"}</h1>
                <p className="text-body-sm text-on-surface-variant mt-1">Here&apos;s what&apos;s next in your learning.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="font-headline-md text-primary">{courses.length}</p>
                <p className="font-label-caps text-on-surface-variant">Courses</p>
              </div>
              <div className="w-px h-12 bg-outline-variant/40" />
              <div className="text-center">
                <p className="font-headline-md text-leaf-green">{sessions.length}</p>
                <p className="font-label-caps text-on-surface-variant">Live classes</p>
              </div>
              <div className="w-px h-12 bg-outline-variant/40" />
              <div className="text-center">
                <p className="font-headline-md text-secondary">{recordings.length}</p>
                <p className="font-label-caps text-on-surface-variant">Recordings</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-body-sm text-on-surface-variant">Loading dashboard…</p>
        ) : (
          <>
            {/* Next live class */}
            {upcoming ? (
              <div className="flowmark-card-glass p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-[var(--radius-lg)] bg-primary/10 flex items-center justify-center shrink-0">
                    <IconCalendar size={22} className="text-primary" />
                  </div>
                  <div>
                    <Badge variant="success" size="sm" className="mb-1.5">Upcoming class</Badge>
                    <h3 className="font-headline-md text-sm text-primary">{upcoming.title}</h3>
                    <p className="text-body-sm text-on-surface-variant">
                      {new Date(upcoming.scheduledAt).toLocaleString()} · {upcoming.type}
                    </p>
                  </div>
                </div>
                <a href={upcoming.joinUrl} target="_blank" rel="noreferrer">
                  <Button size="lg">Join class</Button>
                </a>
              </div>
            ) : (
              <div className="flowmark-card flex items-center justify-between">
                <div>
                  <h3 className="font-headline-md text-sm text-primary mb-1">No upcoming classes</h3>
                  <p className="text-body-sm text-on-surface-variant">Keep learning at your own pace.</p>
                </div>
                <Link href="/dashboard/courses" className="text-body-sm font-semibold text-primary hover:underline flex items-center gap-1">
                  Browse courses <IconChevronRight size={14} />
                </Link>
              </div>
            )}

            {/* Courses */}
            {courses.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline-md text-primary">Your courses</h2>
                  <Link href="/dashboard/courses" className="text-body-sm font-semibold text-primary hover:underline flex items-center gap-1">
                    View all <IconChevronRight size={14} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {courses.slice(0, 4).map((c) => (
                    <Link key={c.id} href={`/dashboard/courses/${c.id}`}>
                      <Card className="h-full hover:shadow-card-hover transition-shadow duration-200 cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-primary/5 flex items-center justify-center">
                            <IconBookOpen size={20} className="text-primary" />
                          </div>
                          <Badge variant="soft" size="sm">{c.code}</Badge>
                        </div>
                        <h3 className="font-headline-md text-sm text-primary mb-1 line-clamp-1">{c.title}</h3>
                        <p className="text-body-sm text-on-surface-variant">{c.lessonCount} lessons</p>
                        {progress[c.id] && progress[c.id].totalLessons > 0 && (
                          <div className="mt-3">
                            <ProgressBar
                              value={progress[c.id].completedLessons}
                              max={progress[c.id].totalLessons}
                              size="sm"
                              showLabel
                            />
                          </div>
                        )}
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent recording */}
            {nextRecording && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline-md text-primary">Recent recording</h2>
                  <Link href="/dashboard/recordings" className="text-body-sm font-semibold text-primary hover:underline flex items-center gap-1">
                    All recordings <IconChevronRight size={14} />
                  </Link>
                </div>
                <Card className="flex items-center gap-4 hover:shadow-card-hover transition-shadow duration-200">
                  <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-surface-container flex items-center justify-center shrink-0 text-primary">
                    <IconPlay size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-on-surface text-sm truncate">{nextRecording.title}</h3>
                    <p className="text-xs text-on-surface-variant">{Math.round(nextRecording.duration / 60)} min session</p>
                  </div>
                  <a href={nextRecording.url} target="_blank" rel="noreferrer">
                    <Button variant="secondary" size="sm">Watch</Button>
                  </a>
                </Card>
              </div>
            )}

            {/* Certificates teaser */}
            <Card className="flex items-center justify-between bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-[var(--radius-lg)] bg-secondary-container/40 flex items-center justify-center shrink-0">
                  <IconAward size={22} className="text-secondary" />
                </div>
                <div>
                  <h3 className="font-headline-md text-sm text-primary mb-0.5">Your certificates</h3>
                  <p className="text-body-sm text-on-surface-variant">View and download completed course certificates.</p>
                </div>
              </div>
              <Link href="/dashboard/certificates">
                <Button variant="secondary">Open</Button>
              </Link>
            </Card>
          </>
        )}
      </div>
    </StudentShell>
  );
}