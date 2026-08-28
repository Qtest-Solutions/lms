"use client";

import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { IconZap, IconUsers, IconAward, IconVideo, IconBookOpen, IconCheckCircle } from "@/lib/icons";

const values = [
  {
    icon: IconZap,
    title: "Quality First",
    description: "We believe software quality is not optional. Every lesson is designed around practical QA skills that matter in the real world.",
  },
  {
    icon: IconUsers,
    title: "Student-Centered",
    description: "Small batches, 1-to-1 sessions, and personalized attention ensure every student gets the support they need.",
  },
  {
    icon: IconAward,
    title: "Industry Connected",
    description: "Our curriculum is built on real QA workflows. We teach the skills that employers actually look for.",
  },
  {
    icon: IconVideo,
    title: "Practical Education",
    description: "Hands-on projects, live classes, and interactive sessions — not just passive video lectures.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-20 bg-gradient-to-b from-academy-blue/[0.03] to-transparent">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h1 className="font-display-xl text-primary mb-4">About QTest Solutions Academy</h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl">
            The education arm of QTest Solutions — where real QA expertise meets structured learning.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display-xl text-primary mb-6">Who We Are</h2>
              <p className="font-body-lg text-on-surface-variant mb-4">
                QTest Solutions is a software testing and QA company. We specialize in ensuring
                software meets the highest quality standards — from manual testing to automation,
                performance, security, and API testing.
              </p>
              <p className="font-body-lg text-on-surface-variant mb-4">
                The academy extends this expertise into education. We don&apos;t just teach testing as theory —
                we teach practical skills connected to real software quality work.
              </p>
              <p className="font-body-lg text-on-surface-variant">
                Our courses are designed by QA professionals who work in the industry every day.
                When you learn with us, you learn skills that directly apply to real-world testing roles.
              </p>
            </div>
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-academy-blue to-academy-blue/80 p-8 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-5xl font-bold mb-2">QTest</div>
                <div className="text-sm font-semibold text-academy-teal tracking-widest uppercase">Solutions Academy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 md:py-20 bg-surface-container-low/50">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="font-display-xl text-primary mb-4 text-center">Our Expertise</h2>
          <p className="font-body-lg text-on-surface-variant text-center max-w-2xl mx-auto mb-12">
            QTest Solutions provides professional QA services across multiple testing domains.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Manual Testing",
              "Automation Testing",
              "Regression Testing",
              "Performance & Load Testing",
              "Security Testing",
              "API Testing",
            ].map((service) => (
              <div key={service} className="flowmark-card flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-academy-teal/10 flex items-center justify-center shrink-0">
                  <IconCheckCircle size={14} className="text-academy-teal" />
                </div>
                <span className="text-sm font-medium text-on-surface">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="font-display-xl text-primary mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="flowmark-card">
                <div className="w-11 h-11 rounded-[var(--radius-lg)] bg-academy-teal/10 flex items-center justify-center mb-4">
                  <v.icon size={20} className="text-academy-teal" />
                </div>
                <h3 className="font-headline-md text-primary mb-2">{v.title}</h3>
                <p className="text-body-sm text-on-surface-variant">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-academy-blue text-white text-center">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="font-display-xl mb-4">Start Your QA Journey</h2>
          <p className="font-body-lg text-white/60 max-w-xl mx-auto mb-8">
            Join QTest Solutions Academy and learn practical skills from real industry professionals.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/courses">
              <Button size="lg" className="bg-white text-academy-blue hover:bg-white/90">Explore Courses</Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="ghost" className="text-white border border-white/30 hover:bg-white/10">Register Now</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}