"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { http } from "@/lib/api";
import { IconArrowLeft, IconBookOpen } from "@/lib/icons";

interface Lesson {
  id: string;
  title: string;
  type: string;
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

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    http.get<Course>(`/courses/${id}`)
      .then(setCourse)
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [id]);

  const totalLessons = course?.sections.reduce((n, s) => n + s.lessons.length, 0) ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 md:pt-28">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          {/* Back link */}
          <button
            onClick={() => router.push("/courses")}
            className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface mb-8 transition-colors"
          >
            <IconArrowLeft size={16} />
            All Courses
          </button>

          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : !course ? (
            <div className="text-center py-20 flowmark-card">
              <h2 className="font-headline-md text-primary mb-2">Course Not Found</h2>
              <p className="text-body-sm text-on-surface-variant mb-6">
                This course may have been removed or is not available.
              </p>
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" size="sm">{course.code}</Badge>
                  <Badge variant="soft" size="sm">QA & Testing</Badge>
                </div>
                <h1 className="font-display-xl text-primary mb-3">{course.title}</h1>
                <p className="font-body-lg text-on-surface-variant max-w-3xl">
                  {course.description || "A comprehensive course designed to build practical skills."}
                </p>
              </div>

              {/* Meta */}
              <div className="flowmark-card mb-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  <div>
                    <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Sections</div>
                    <div className="text-lg font-bold text-primary">{course.sections.length}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Lessons</div>
                    <div className="text-lg font-bold text-primary">{totalLessons}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Format</div>
                    <div className="text-lg font-bold text-primary">Online</div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flowmark-card bg-gradient-to-br from-academy-blue to-academy-blue/90 text-white mb-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-headline-md mb-1">Ready to start learning?</h3>
                    <p className="text-sm text-white/60">Create your account and begin this course today.</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/register">
                      <Button className="bg-white text-academy-blue hover:bg-white/90">Register Now</Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="ghost" className="text-white border border-white/30 hover:bg-white/10">Login</Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Curriculum */}
              {course.sections.length > 0 && (
                <div>
                  <h2 className="font-headline-md text-primary mb-6">Course Curriculum</h2>
                  <div className="space-y-3">
                    {course.sections.map((section, si) => (
                      <div key={section.id} className="flowmark-card">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-academy-blue/5 flex items-center justify-center text-xs font-bold text-academy-blue">
                            {si + 1}
                          </div>
                          <h3 className="font-headline-md text-sm text-primary">{section.title}</h3>
                          <Badge variant="soft" size="sm" className="ml-auto">{section.lessons.length} lessons</Badge>
                        </div>
                        <div className="divide-y divide-outline-variant/30">
                          {section.lessons.map((lesson) => (
                            <div key={lesson.id} className="flex items-center gap-3 py-2.5 pl-11">
                              <IconBookOpen size={14} className="text-on-surface-variant/50 shrink-0" />
                              <span className="text-sm text-on-surface">{lesson.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}