"use client";

import { useEffect, useState } from "react";
import { StudentShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { IconAward, IconDownload, IconEye } from "@/lib/icons";
import { http } from "@/lib/api";

interface Certificate {
  id: string;
  publicId: string;
  issuedAt: string;
  course?: { title: string; code: string };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function Certificates() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    http.get<Certificate[]>("/certificates").then(setCerts).catch(console.error);
  }, []);

  const previewCert = certs.find((c) => c.id === previewId);

  return (
    <StudentShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-headline-md text-primary mb-1">My Certificates</h1>
          <p className="text-body-sm text-on-surface-variant">Proof of everything you&apos;ve completed.</p>
        </div>
        <div className="space-y-3">
          {certs.map((c) => (
            <Card key={c.id} className="flex items-center justify-between gap-4 hover:shadow-card-hover transition-shadow duration-200">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-secondary-container/40 flex items-center justify-center shrink-0">
                  <IconAward size={22} className="text-secondary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-on-surface truncate">{c.course?.title ?? "Course"}</h3>
                    <Badge variant="success" size="sm">Earned</Badge>
                  </div>
                  <p className="text-label-caps text-on-surface-variant mt-0.5">
                    {c.course?.code} · {new Date(c.issuedAt).toLocaleDateString()} · {c.publicId}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setPreviewId(c.id)}>
                  <IconEye size={16} /> <span className="hidden sm:inline">Preview</span>
                </Button>
                <a href={`${API_BASE}/certificates/${c.id}/pdf`} target="_blank" rel="noreferrer">
                  <Button size="sm">
                    <IconDownload size={16} /> <span className="hidden sm:inline">Download</span><span className="sm:hidden">PDF</span>
                  </Button>
                </a>
              </div>
            </Card>
          ))}
          {certs.length === 0 && (
            <p className="text-body-sm text-on-surface-variant">No certificates yet. Complete a course to earn one!</p>
          )}
        </div>
      </div>

      <Modal open={!!previewId} onClose={() => setPreviewId(null)} title={previewCert?.course?.title ?? "Certificate"} maxWidth="max-w-4xl">
        {previewId && (
          <iframe
            src={`${API_BASE}/certificates/${previewId}/pdf`}
            className="w-full h-[70vh] rounded-[var(--radius-lg)] border border-outline-variant bg-white"
            title="Certificate preview"
          />
        )}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={() => setPreviewId(null)}>Close</Button>
          <a href={`${API_BASE}/certificates/${previewId}/pdf`} target="_blank" rel="noreferrer">
            <Button><IconDownload size={16} /> Download PDF</Button>
          </a>
        </div>
      </Modal>
    </StudentShell>
  );
}
