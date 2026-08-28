"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { http } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { IconCheckCircle } from "@/lib/icons";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await http.post("/registration-requests", form);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-24 md:py-32">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display-xl text-primary mb-2">Request Enrollment</h1>
            <p className="text-body-lg text-on-surface-variant">
              Submit your details and our team will get back to you.
            </p>
          </div>

          {success ? (
            <div className="flowmark-card text-center py-10">
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <IconCheckCircle size={28} className="text-success" />
              </div>
              <h2 className="font-headline-md text-primary mb-2">Request Submitted</h2>
              <p className="text-body-sm text-on-surface-variant mb-6">
                Thank you for your interest! Our team will review your request and contact you soon.
              </p>
              <Link href="/">
                <Button variant="secondary">Back to Home</Button>
              </Link>
            </div>
          ) : (
            <div className="flowmark-card">
              {error && (
                <div className="mb-4 p-3 rounded-[var(--radius-md)] bg-error-container text-on-error-container text-body-sm">
                  {error}
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoComplete="name"
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+91 99615 44424"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <div>
                  <label className="font-label-caps text-on-surface-variant">Message (optional)</label>
                  <textarea
                    placeholder="Tell us about your learning goals..."
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="mt-1.5 w-full px-4 py-2.5 bg-surface-container-low text-on-surface rounded-[var(--radius-lg)] border border-outline-variant outline-none transition-all duration-200 placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary text-body-sm resize-none"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full bg-academy-blue hover:bg-academy-blue/90 text-white" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Request"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-body-sm text-on-surface-variant">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-academy-teal hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
              Back to home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}