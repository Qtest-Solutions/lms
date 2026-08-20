"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StudentShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { http } from "@/lib/api";

interface Session {
  id: string;
  title: string;
  scheduledAt: string;
  status: string;
  type: string;
  joinUrl: string;
}

const statusTone: Record<string, "soft" | "success" | "secondary" | "error"> = {
  SCHEDULED: "soft",
  ACTIVE: "success",
  COMPLETED: "secondary",
  CANCELLED: "error",
};

export default function LiveClasses() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    http.get<Session[]>("/live-sessions").then(setSessions).catch(console.error);
  }, []);

  return (
    <StudentShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-md text-primary mb-1">Live Classes</h1>
            <p className="text-body-sm text-on-surface-variant">Join your next class right on time.</p>
          </div>
          <Button variant="secondary">Schedule a class</Button>
        </div>
        <div className="space-y-3">
          {sessions.map((s) => (
            <Card key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-headline-md text-sm text-primary">{s.title}</h3>
                  <Badge variant={statusTone[s.status] ?? "soft"} size="sm">{s.status}</Badge>
                  <Badge variant="secondary" size="sm">{s.type}</Badge>
                </div>
                <p className="text-body-sm text-on-surface-variant">{new Date(s.scheduledAt).toLocaleString()}</p>
              </div>
              {(s.status === "SCHEDULED" || s.status === "ACTIVE") && (
                <Link href={`/dashboard/live/${s.id}`}>
                  <Button>Join class</Button>
                </Link>
              )}
            </Card>
          ))}
        </div>
      </div>
    </StudentShell>
  );
}