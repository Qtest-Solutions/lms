"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { IconBookOpen } from "@/lib/icons";

interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  lessonCount: number;
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.id}`}>
      <div className="group flowmark-card hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 cursor-pointer h-full flex flex-col">
        {/* Course thumbnail placeholder */}
        <div className="h-44 rounded-[var(--radius-md)] bg-gradient-to-br from-academy-blue via-academy-blue/90 to-academy-teal/80 mb-5 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-3 right-3 w-20 h-20 border border-white/30 rounded-lg rotate-12" />
            <div className="absolute bottom-4 left-4 w-16 h-16 border border-white/20 rounded-full" />
            <div className="absolute top-8 left-8 w-8 h-8 bg-white/10 rounded-sm rotate-45" />
          </div>
          <IconBookOpen size={40} className="text-white relative z-10" />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" size="sm">{course.code}</Badge>
            <Badge variant="soft" size="sm">QA & Testing</Badge>
          </div>

          <h3 className="font-headline-md text-primary mb-2 group-hover:text-academy-teal transition-colors">
            {course.title}
          </h3>

          <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-4 flex-1">
            {course.description || "A comprehensive course designed to build practical skills."}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-outline-variant/40">
            <div className="flex items-center gap-1.5 text-on-surface-variant">
              <IconBookOpen size={14} />
              <span className="text-xs font-medium">{course.lessonCount} lessons</span>
            </div>
            <span className="text-sm font-semibold text-academy-teal group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
              View Course
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}