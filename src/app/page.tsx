"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { CourseCard } from "@/components/landing/course-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { http } from "@/lib/api";
import {
  IconBookOpen,
  IconVideo,
  IconAward,
  IconUsers,
  IconCheckCircle,
  IconPlay,
  IconCalendar,
  IconZap,
  IconTrendingUp,
} from "@/lib/icons";

interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  lessonCount: number;
}

const trustPoints = [
  { icon: IconZap, text: "Industry-focused curriculum" },
  { icon: IconVideo, text: "Live instructor-led classes" },
  { icon: IconUsers, text: "1-to-1 & small-batch learning" },
  { icon: IconBookOpen, text: "Practical projects" },
  { icon: IconAward, text: "Course certificates" },
];

const whyChoose = [
  {
    icon: IconZap,
    title: "Practical Learning",
    description: "Focus on skills you can actually apply in real software testing roles. No fluff, no theory-only approach.",
  },
  {
    icon: IconVideo,
    title: "Live Instructor Support",
    description: "Interact directly with instructors during live sessions. Ask questions, get answers, and learn in real time.",
  },
  {
    icon: IconUsers,
    title: "Personalized Learning",
    description: "Choose 1-to-1 teaching or small batches. Learning that adapts to your pace and goals.",
  },
  {
    icon: IconCheckCircle,
    title: "Real QA Perspective",
    description: "Learning connected to practical software-testing workflows used by actual QA professionals.",
  },
  {
    icon: IconTrendingUp,
    title: "Learn + Practice + Track",
    description: "Access the LMS, attend live sessions, and monitor your progress — all in one place.",
  },
  {
    icon: IconAward,
    title: "Certificate",
    description: "Receive a certificate after completing the course. Validate your skills for employers.",
  },
];

const processSteps = [
  { num: "01", title: "Choose Your Course", description: "Explore courses available in the academy." },
  { num: "02", title: "Register", description: "Create your student account in minutes." },
  { num: "03", title: "Learn With Your Instructor", description: "Attend structured lessons and live sessions." },
  { num: "04", title: "Practice & Track Progress", description: "Complete lessons and monitor your growth." },
  { num: "05", title: "Get Certified", description: "Complete the course and receive your certificate." },
];

const features = [
  {
    icon: IconBookOpen,
    title: "Student Dashboard",
    description: "Track enrolled courses, upcoming classes, and overall progress from a single dashboard.",
  },
  {
    icon: IconPlay,
    title: "Structured Lessons",
    description: "Follow a clear learning path with organized modules and hands-on exercises.",
  },
  {
    icon: IconVideo,
    title: "Live Online Classes",
    description: "Join real-time sessions with your instructor. Ask questions, share screens, and learn interactively.",
  },
  {
    icon: IconAward,
    title: "Certificates",
    description: "Earn recognized certificates upon course completion to showcase your skills.",
  },
];

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

export default function LandingPage() {
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

      {/* ─── Hero ─── */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
        {/* Grid lines background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(to right, var(--color-outline-variant) 1px, transparent 1px), linear-gradient(to bottom, var(--color-outline-variant) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          opacity: 0.15,
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
        <div className="mx-auto max-w-7xl px-5 lg:px-8 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-academy-teal/10 text-academy-teal text-xs font-bold uppercase tracking-wider mb-6">
              <IconZap size={12} />
              Practical QA Education
            </div>
            <h1 className="font-display-hero text-primary mb-6">
              Build Real-World QA Skills. Start Your Tech Career.
            </h1>
            <p className="font-body-lg text-on-surface-variant max-w-xl mb-8">
              QTest Solutions Academy teaches practical software testing through expert-led live classes,
              structured courses, and hands-on projects. Designed for students, beginners, and professionals
              ready to break into tech.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/courses">
                <Button size="lg" className="bg-academy-blue hover:bg-academy-blue/90 text-white">
                  Explore Courses
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="secondary">
                  Register Now
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero visual — abstract QA interface */}
          <div className="hidden lg:block absolute right-8 top-28 w-80">
            <div className="relative">
              <div className="w-72 h-56 rounded-2xl bg-gradient-to-br from-academy-blue to-academy-blue/80 shadow-[var(--shadow-elevated)] p-5 rotate-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="space-y-2">
                  <div className="h-2.5 bg-white/20 rounded-full w-3/4" />
                  <div className="h-2.5 bg-white/15 rounded-full w-1/2" />
                  <div className="h-8 bg-academy-teal/30 rounded-lg mt-3 flex items-center px-3">
                    <div className="h-1.5 bg-academy-teal rounded-full w-2/3" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="h-10 bg-white/10 rounded-md" />
                    <div className="h-10 bg-white/10 rounded-md" />
                    <div className="h-10 bg-white/10 rounded-md" />
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-6 w-40 h-32 rounded-xl bg-white shadow-[var(--shadow-card)] p-4 -rotate-3 border border-outline-variant/20">
                <div className="text-[10px] font-bold text-academy-teal uppercase tracking-wider mb-1">Progress</div>
                <div className="h-1.5 bg-surface-container-high rounded-full mb-2">
                  <div className="h-full bg-academy-teal rounded-full w-3/4" />
                </div>
                <div className="text-xs text-on-surface-variant">75% Complete</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust Strip ─── */}
      <section className="border-y border-outline-variant/30 bg-surface-container-low/50">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-8">
          <div className="flex flex-wrap justify-center gap-6">
            {trustPoints.map((t) => (
              <div key={t.text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[var(--radius-md)] bg-academy-teal/10 flex items-center justify-center shrink-0">
                  <t.icon size={16} className="text-academy-teal" />
                </div>
                <span className="text-sm font-medium text-on-surface">{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Courses ─── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display-xl text-primary mb-4">Explore Our Courses</h2>
            <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Learn practical skills with structured courses designed for students, beginners, and working professionals.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <CourseSkeleton key={i} />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16 flowmark-card max-w-lg mx-auto">
              <IconBookOpen size={40} className="text-on-surface-variant/30 mx-auto mb-4" />
              <h3 className="font-headline-md text-primary mb-2">Courses Coming Soon</h3>
              <p className="text-body-sm text-on-surface-variant mb-6">
                We&apos;re preparing our courses. In the meantime, get in touch to learn more.
              </p>
              <Link href="/contact">
                <Button>Contact Us</Button>
              </Link>
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

      {/* ─── Who We Are ─── */}
      <section className="py-20 md:py-28 bg-surface-container-low/50">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display-xl text-primary mb-6">Who We Are</h2>
              <p className="font-body-lg text-on-surface-variant mb-4">
                QTest Solutions is built around software quality and practical QA expertise.
                The academy extends this expertise into structured education.
              </p>
              <p className="font-body-lg text-on-surface-variant mb-6">
                We don&apos;t teach testing only as theory. We teach practical skills connected
                to real software quality work — the same skills used by QA professionals in the industry.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/about">
                  <Button variant="secondary">Learn More About Us</Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-academy-blue to-academy-blue/80 p-8 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-5xl font-bold mb-2">QTest</div>
                  <div className="text-sm font-semibold text-academy-teal tracking-widest uppercase">Solutions Academy</div>
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <IconBookOpen size={18} className="text-white" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <IconVideo size={18} className="text-white" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <IconAward size={18} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why Choose QTest ─── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display-xl text-primary mb-4">Why Choose QTest Solutions</h2>
            <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Not a generic IT company. A dedicated QA education partner focused on delivering practical skills.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChoose.map((item) => (
              <div key={item.title} className="flowmark-card hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                <div className="w-11 h-11 rounded-[var(--radius-lg)] bg-academy-teal/10 flex items-center justify-center mb-4">
                  <item.icon size={20} className="text-academy-teal" />
                </div>
                <h3 className="font-headline-md text-primary mb-2">{item.title}</h3>
                <p className="text-body-sm text-on-surface-variant">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How Learning Works ─── */}
      <section className="py-20 md:py-28 bg-academy-blue text-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display-xl mb-4">How Learning Works</h2>
            <p className="font-body-lg text-white/60 max-w-2xl mx-auto">
              A simple path from choosing a course to earning your certificate.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.num} className="text-center relative">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 border border-white/20">
                  <span className="text-lg font-bold text-academy-teal">{step.num}</span>
                </div>
                <h3 className="font-headline-md text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-white/50">{step.description}</p>
                {i < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(50%+32px)] w-[calc(100%-64px)] h-px bg-white/20" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Personalized Learning ─── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display-xl text-primary mb-6">Learning That Fits You</h2>
              <p className="font-body-lg text-on-surface-variant mb-6">
                The academy is not a library of recorded videos. Learn directly with an instructor
                through 1-to-1 sessions or small batches — whichever suits your learning style.
              </p>
              <div className="space-y-3">
                {[
                  "1-to-1 personalized teaching",
                  "Small batch sizes for focused learning",
                  "Teacher-assigned students",
                  "Individual progress tracking",
                  "Instructor-led live classes",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-academy-teal/10 flex items-center justify-center shrink-0">
                      <IconCheckCircle size={12} className="text-academy-teal" />
                    </div>
                    <span className="text-sm text-on-surface">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flowmark-card p-6">
              <div className="space-y-3">
                {[
                  { label: "Student", icon: IconUsers, color: "text-academy-teal" },
                  { label: "Teacher", icon: IconVideo, color: "text-secondary" },
                  { label: "Course", icon: IconBookOpen, color: "text-academy-blue" },
                  { label: "Live Session", icon: IconCalendar, color: "text-academy-gold" },
                  { label: "Progress", icon: IconTrendingUp, color: "text-success" },
                  { label: "Certificate", icon: IconAward, color: "text-academy-teal" },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-[var(--radius-md)] bg-surface-container-low flex items-center justify-center ${item.color}`}>
                      <item.icon size={18} />
                    </div>
                    <span className="text-sm font-medium text-on-surface">{item.label}</span>
                    {i < 5 && (
                      <svg className="ml-auto text-on-surface-variant/30" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Live Learning ─── */}
      <section className="py-20 md:py-28 bg-surface-container-low/50">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display-xl text-primary mb-4">Don&apos;t Just Watch. Learn.</h2>
            <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Join live classes with your instructor. Ask questions, share screens, and learn interactively.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: IconVideo, title: "Live Instructor Interaction", description: "Real-time guidance from experienced QA professionals." },
              { icon: IconUsers, title: "One-to-One & Groups", description: "Choose individual sessions or learn with a small group." },
              { icon: IconBookOpen, title: "Screen Sharing", description: "Watch live demos, test case walkthroughs, and practical exercises." },
              { icon: IconCheckCircle, title: "Q&A & Discussion", description: "Get your doubts cleared during live interactive sessions." },
              { icon: IconCalendar, title: "Flexible Schedule", description: "Classes designed to fit your learning pace." },
            ].map((item) => (
              <div key={item.title} className="flowmark-card">
                <div className="w-11 h-11 rounded-[var(--radius-lg)] bg-academy-teal/10 flex items-center justify-center mb-4">
                  <item.icon size={20} className="text-academy-teal" />
                </div>
                <h3 className="font-headline-md text-primary mb-2">{item.title}</h3>
                <p className="text-body-sm text-on-surface-variant">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LMS Experience ─── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display-xl text-primary mb-4">A Complete Learning Platform</h2>
            <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Registering gives you access to a complete learning environment — not just a static course website.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="flowmark-card text-center">
                <div className="w-12 h-12 rounded-full bg-academy-blue/5 flex items-center justify-center mx-auto mb-4">
                  <f.icon size={22} className="text-academy-blue" />
                </div>
                <h3 className="font-headline-md text-primary mb-2">{f.title}</h3>
                <p className="text-body-sm text-on-surface-variant">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-academy-blue to-academy-blue/90 text-white text-center">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="font-display-xl mb-4">Ready to Start Your QA Journey?</h2>
          <p className="font-body-lg text-white/60 max-w-xl mx-auto mb-8">
            Explore our courses and start building practical skills with QTest Solutions Academy.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/courses">
              <Button size="lg" variant="secondary" className="bg-white text-academy-blue hover:bg-white/90 font-bold">
                Explore Courses
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-white bg-white/10 border-white/30 hover:bg-white/20 font-bold">
                Register Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}