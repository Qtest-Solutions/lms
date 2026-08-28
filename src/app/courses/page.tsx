"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { CourseCard } from "@/components/landing/course-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { http } from "@/lib/api";
import { IconBookOpen } from "@/lib/icons";

interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  lessonCount: number;
}

function CourseSkeleton() {
  return (
    <div className="flowmark-card">
      <Skeleton className="h-44 rounded-[var(--radius-md)] mb-5" />
      <Skeleton className="h-5 w-24 mb-2" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    http.get<Course[]>("/courses")
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-36 md:pb-16 bg-gradient-to-b from-academy-blue/[0.03] to-transparent">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h1 className="font-display-xl text-primary mb-4">Our Courses</h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl">
            Browse structured courses designed to build practical software testing and QA skills.
          </p>
        </div>
      </section>

      {/* Course Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <CourseSkeleton key={i} />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 flowmark-card max-w-lg mx-auto">
              <IconBookOpen size={40} className="text-on-surface-variant/30 mx-auto mb-4" />
              <h3 className="font-headline-md text-primary mb-2">Courses Coming Soon</h3>
              <p className="text-body-sm text-on-surface-variant mb-6">
                We&apos;re preparing our courses. Get in touch to learn more about what&apos;s available.
              </p>
              <a href="/contact">
                <Button>Contact Us</Button>
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}