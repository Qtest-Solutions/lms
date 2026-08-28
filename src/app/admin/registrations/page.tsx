"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IconUser, IconCheckCircle, IconX } from "@/lib/icons";
import { http } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { errMessage } from "@/lib/utils";

interface RegistrationRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
}

const statusTone: Record<string, "soft" | "success" | "error"> = {
  PENDING: "soft",
  APPROVED: "success",
  REJECTED: "error",
};

export default function AdminRegistrations() {
  const toast = useToast();
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: "APPROVED" | "REJECTED" } | null>(null);

  const load = () => http.get<RegistrationRequest[]>("/registration-requests").then(setRequests).catch(console.error);
  useEffect(() => { void load(); }, []);

  const updateStatus = async () => {
    if (!confirmAction) return;
    try {
      await http.put(`/registration-requests/${confirmAction.id}`, { status: confirmAction.action });
      toast.success(`Request ${confirmAction.action.toLowerCase()}`);
    } catch (err) {
      toast.error(errMessage(err));
    }
    setConfirmAction(null);
    load();
  };

  const pending = requests.filter((r) => r.status === "PENDING");
  const reviewed = requests.filter((r) => r.status !== "PENDING");

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="font-headline-md text-primary mb-1">Registration Requests</h1>
          <p className="text-body-sm text-on-surface-variant">Review and manage student enrollment requests.</p>
        </div>

        {pending.length > 0 && (
          <div>
            <h2 className="font-headline-md text-sm text-primary mb-3">Pending ({pending.length})</h2>
            <div className="space-y-3">
              {pending.map((r) => (
                <Card key={r.id} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <IconUser size={16} className="text-on-surface-variant" />
                        <span className="font-medium text-on-surface text-sm">{r.name}</span>
                        <Badge variant={statusTone[r.status]} size="sm">{r.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                        <span className="text-body-sm">{r.email}</span>
                      </div>
                      {r.phone && (
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                          <span className="text-body-sm">{r.phone}</span>
                        </div>
                      )}
                      {r.message && (
                        <p className="text-body-sm text-on-surface-variant ml-6 italic">&ldquo;{r.message}&rdquo;</p>
                      )}
                      <p className="text-xs text-on-surface-variant/60 ml-6">
                        Submitted {new Date(r.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" onClick={() => setConfirmAction({ id: r.id, action: "APPROVED" })}>
                        <IconCheckCircle size={15} /> Approve
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmAction({ id: r.id, action: "REJECTED" })}>
                        <IconX size={15} className="text-error" /> Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {reviewed.length > 0 && (
          <div>
            <h2 className="font-headline-md text-sm text-on-surface-variant mb-3">Reviewed</h2>
            <div className="space-y-2">
              {reviewed.map((r) => (
                <Card key={r.id} className="flex items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-on-surface">{r.name}</span>
                      <span className="text-xs text-on-surface-variant">{r.email}</span>
                      <Badge variant={statusTone[r.status]} size="sm">{r.status}</Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {requests.length === 0 && (
          <Card className="p-10 text-center">
            <p className="text-body-sm text-on-surface-variant">No registration requests yet.</p>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.action === "APPROVED" ? "Approve request" : "Reject request"}
        message={confirmAction?.action === "APPROVED"
          ? "This person will be able to log in after you create their student account."
          : "Reject this enrollment request?"}
        confirmLabel={confirmAction?.action === "APPROVED" ? "Approve" : "Reject"}
        onConfirm={updateStatus}
        onClose={() => setConfirmAction(null)}
      />
    </AdminShell>
  );
}