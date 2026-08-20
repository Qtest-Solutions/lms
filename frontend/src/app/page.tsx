import Link from "next/link";
import { IconZap, IconBookOpen, IconTrendingUp, IconAward, IconPlay, IconCheckCircle } from "@/lib/icons";

const features = [
  { icon: IconBookOpen, title: "Structured Courses", description: "Well-organized modules with guided 1-to-1 teaching and clear progression." },
  { icon: IconPlay, title: "Live Lessons", description: "Interactive live classes with recordings you can review any time." },
  { icon: IconTrendingUp, title: "Smart Progress", description: "Track completion and lesson history at a glance for every course." },
  { icon: IconAward, title: "Earn Certificates", description: "Get credentialed for completing courses and showcase your achievement." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-surface-bright/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[var(--radius-md)] bg-primary flex items-center justify-center">
              <IconZap size={18} className="text-on-primary" />
            </div>
            <span className="font-headline-md text-primary">LMS</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2 rounded-[var(--radius-full)] text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-5 py-2 rounded-[var(--radius-full)] bg-primary text-on-primary text-body-sm font-semibold hover:opacity-90 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[var(--radius-full)] bg-leaf-green/20 text-[#004d00] text-label-caps mb-6 dark:text-leaf-green">
            <IconZap size={14} />
            The modern learning experience
          </div>
          <h1 className="text-[40px] md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-[-0.03em] text-primary mb-5">
            Learn better,<br />
            <span className="text-on-surface-variant">one-on-one</span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-xl mx-auto mb-8 leading-relaxed">
            A learning platform built for 1-to-1 and small-batch teaching. Track progress, attend live classes, earn certificates, and stay motivated.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="px-7 py-3 rounded-[var(--radius-full)] bg-primary text-on-primary text-body-lg font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
            >
              Start Learning
              <IconCheckCircle size={18} />
            </Link>
            <Link
              href="/login"
              className="px-7 py-3 rounded-[var(--radius-full)] border border-outline-variant text-body-lg font-semibold text-on-surface-variant hover:bg-surface-container-high transition-all inline-flex items-center gap-2"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 pb-16">
        <div className="flowmark-card-glass flex flex-col sm:flex-row items-center justify-around gap-6 py-6 px-8">
          {[
            { value: "1-to-1", label: "Focused Teaching" },
            { value: "10+", label: "Courses" },
            { value: "Live", label: "Classes & Recordings" },
            { value: "Cert", label: "Certificates Earned" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display-lg text-primary text-2xl md:text-3xl">{stat.value}</p>
              <p className="font-label-caps text-on-surface-variant mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.02em] text-primary mb-3">
            Everything you need to grow
          </h2>
          <p className="text-lg text-on-surface-variant max-w-lg mx-auto">
            A complete learning platform designed for modern students and teachers.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature) => (
            <div key={feature.title} className="flowmark-card text-center hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-primary/5 flex items-center justify-center mx-auto mb-4">
                <feature.icon size={22} className="text-primary" />
              </div>
              <h3 className="font-headline-md text-sm text-primary mb-2">{feature.title}</h3>
              <p className="text-body-sm text-on-surface-variant">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 pb-20">
        <div className="flowmark-card bg-gradient-to-br from-primary/5 via-surface-off-white to-secondary/5 border-none text-center py-12 px-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.02em] text-primary mb-3">
            Ready to start learning?
          </h2>
          <p className="text-lg text-on-surface-variant max-w-md mx-auto mb-6">
            Your learning journey starts here.
          </p>
          <Link
            href="/login"
            className="px-7 py-3 rounded-[var(--radius-full)] bg-primary text-on-primary text-body-lg font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
          >
            Get Started Free
            <IconZap size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant/20 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-primary flex items-center justify-center">
              <IconZap size={14} className="text-on-primary" />
            </div>
            <span className="font-headline-md text-sm text-primary">LMS</span>
          </div>
          <p className="text-body-sm text-on-surface-variant">
            &copy; 2026 LMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}