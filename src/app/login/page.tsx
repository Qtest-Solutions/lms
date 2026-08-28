"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { http, setToken, saveMe, AuthResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconZap } from "@/lib/icons";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await http.post<AuthResponse>("/auth/login", { email, password });
      setToken(res.accessToken);
      saveMe(res.user);
      const dest = res.user.role === "student" ? "/dashboard" : res.user.role === "teacher" ? "/teacher" : "/admin";
      router.push(search.get("next") || dest);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-10">
          <img src="/qtest.png" alt="QTest Solutions" className="h-20 w-20 rounded-[var(--radius-md)] object-cover" />
        </div>

        <div className="flowmark-card">
          <h1 className="font-display-lg-mobile mb-1 text-primary">Welcome back</h1>
          <p className="text-body-lg text-on-surface-variant mb-8">Sign in to continue learning</p>

          {error && (
            <div className="mb-4 p-3 rounded-[var(--radius-md)] bg-error-container text-on-error-container text-body-sm">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded-[var(--radius-sm)] border-outline-variant accent-primary" />
                <span className="text-body-sm text-on-surface-variant">Remember me</span>
              </label>
              <Link href="/login" className="text-body-sm font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>

        <div className="mt-6 flowmark-card-glass p-4 text-body-sm text-on-surface-variant text-center">
          <p className="mb-1">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-academy-teal font-semibold hover:underline">
              Request enrollment
            </Link>
          </p>
          <Link href="/" className="inline-flex items-center gap-1 text-primary font-semibold mt-2 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}