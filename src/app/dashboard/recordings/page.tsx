"use client";

import { useEffect, useState } from "react";
import { StudentShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconPlay } from "@/lib/icons";
import { http } from "@/lib/api";

interface Recording {
  id: string;
  title: string;
  url: string;
  duration: number;
  createdAt: string;
}

export default function Recordings() {
  const [recordings, setRecordings] = useState<Recording[]>([]);

  useEffect(() => {
    http.get<Recording[]>("/recordings").then(setRecordings).catch(console.error);
  }, []);

  return (
    <StudentShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-headline-md text-primary mb-1">Recordings</h1>
          <p className="text-body-sm text-on-surface-variant">Re-watch any class you missed.</p>
        </div>
        <div className="space-y-3">
          {recordings.map((r) => (
            <Card key={r.id} className="flex items-center gap-4 hover:shadow-card-hover transition-shadow duration-200">
              <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-primary/5 flex items-center justify-center shrink-0 text-primary">
                <IconPlay size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-on-surface text-sm truncate">{r.title}</h3>
                <p className="text-label-caps text-on-surface-variant">
                  {new Date(r.createdAt).toLocaleDateString()} · {Math.round(r.duration / 60)} min
                </p>
              </div>
              <a href={r.url} target="_blank" rel="noreferrer">
                <Button variant="secondary" size="sm">Watch</Button>
              </a>
            </Card>
          ))}
        </div>
      </div>
    </StudentShell>
  );
}