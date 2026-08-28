"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { IconArrowLeft } from "@/lib/icons";
import { http, getMe } from "@/lib/api";
import JitsiEmbed from "@/components/live/jitsi-embed";

interface Session {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  joinUrl: string;
}

export default function StartLiveClass() {
  const { id } = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    http.get<Session>(`/live-sessions/${id}`).then(setSession).catch(console.error);
    http.put<Session>(`/live-sessions/${id}`, { status: "ACTIVE" }).catch(console.error);
  }, [id]);

  return (
    <div className="flex h-dvh flex-col bg-surface">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-outline-variant bg-surface-container-low px-4">
        <button
          onClick={() => router.push("/teacher/live")}
          className="text-on-surface-variant hover:text-primary transition-colors"
          aria-label="Back to online classes"
        >
          <IconArrowLeft size={20} />
        </button>
        <h1 className="font-headline-md text-sm text-primary truncate">{session?.title ?? "Online class"}</h1>
        {session?.startTime && session?.endTime && (
          <span className="text-body-sm text-on-surface-variant">
            {session.startTime} – {session.endTime}
          </span>
        )}
      </header>
      <main className="flex-1 overflow-hidden">
        {session?.joinUrl ? (
          <JitsiEmbed roomUrl={session.joinUrl} displayName={getMe()?.name} />
        ) : (
          <div className="flex h-full items-center justify-center text-body-sm text-on-surface-variant">
            Loading meeting…
          </div>
        )}
      </main>
    </div>
  );
}