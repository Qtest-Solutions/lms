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
  startTime: string;
  endTime: string;
  status: string;
  type: string;
  joinUrl: string;
}

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
            <h1 className="font-headline-md text-primary mb-1">Online Classes</h1>
            <p className="text-body-sm text-on-surface-variant">Join your scheduled classes anytime.</p>
          </div>
        </div>
        <div className="space-y-3">
          {sessions.map((s) => (
            <Card key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-headline-md text-sm text-primary">{s.title}</h3>
                  <Badge variant="secondary" size="sm">{s.type}</Badge>
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  {s.startTime && s.endTime ? `${s.startTime} – ${s.endTime}` : "No time set"}
                </p>
              </div>
              {s.joinUrl && (
                <Link href={`/dashboard/live/${s.id}`}>
                  <Button>Join class</Button>
                </Link>
              )}
            </Card>
          ))}
          {sessions.length === 0 && <p className="text-body-sm text-on-surface-variant">No classes yet.</p>}
        </div>
      </div>
    </StudentShell>
  );
}