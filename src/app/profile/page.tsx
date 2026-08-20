"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconUser, IconSettings, IconCheckCircle } from "@/lib/icons";
import { http, getMe, saveMe, logout, AuthUser } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { errMessage } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const me = getMe();
  const [form, setForm] = useState({ name: me?.name ?? "", email: me?.email ?? "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!me) router.replace("/login");
  }, [me, router]);

  if (!me) return null;

  const save = async () => {
    try {
      const updated = await http.put<AuthUser>(`/users/${me.id}`, { name: form.name, email: form.email });
      saveMe({ ...me, name: updated.name, email: updated.email });
      setSaved(true);
      toast.success("Profile updated");
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      toast.error(errMessage(err));
    }
  };

  const signOut = () => {
    logout();
    router.replace("/login");
  };

  return (
    <DashboardShell>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="font-headline-md text-primary mb-1">Profile & Settings</h1>
          <p className="text-body-sm text-on-surface-variant">Your account details and preferences.</p>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar size="lg" name={me.name} />
            <div>
              <h2 className="font-headline-md text-sm text-primary">{me.name}</h2>
              <p className="text-label-caps text-on-surface-variant">{me.email}</p>
              <Badge variant={me.role === "admin" ? "secondary" : me.role === "teacher" ? "info" : "success"} size="sm" className="mt-1 capitalize">
                {me.role}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Full name"
              value={form.name}
              onChange={(e) => { setForm({ ...form, name: e.target.value }); setSaved(false); }}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => { setForm({ ...form, email: e.target.value }); setSaved(false); }}
            />
            <div className="flex items-center gap-3">
              <Button onClick={save}>Save changes</Button>
              {saved && (
                <span className="inline-flex items-center gap-1.5 text-body-sm text-leaf-green">
                  <IconCheckCircle size={15} /> Saved
                </span>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-primary/5 flex items-center justify-center">
              <IconUser size={18} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-label-caps text-on-surface-variant">Role</p>
              <p className="text-sm font-medium text-on-surface capitalize">{me.role}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-primary/5 flex items-center justify-center">
              <IconUser size={18} className="text-primary" />
            </div>
            <div className="min-w-0 truncate">
              <p className="font-label-caps text-on-surface-variant">Email</p>
              <p className="text-sm font-medium text-on-surface truncate">{me.email}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-primary/5 flex items-center justify-center">
              <IconSettings size={18} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-label-caps text-on-surface-variant">Account</p>
              <p className="text-sm font-medium text-on-surface">Active</p>
            </div>
          </Card>
        </div>

        <Card className="p-6 flex items-center justify-between bg-surface-off-white/60">
          <div>
            <h3 className="font-headline-md text-sm text-primary mb-0.5">Sign out</h3>
            <p className="text-body-sm text-on-surface-variant">End your session on this device.</p>
          </div>
          <Button variant="secondary" onClick={signOut}>Sign out</Button>
        </Card>
      </div>
    </DashboardShell>
  );
}