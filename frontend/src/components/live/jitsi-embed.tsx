"use client";

import { useEffect, useRef } from "react";

interface Props {
  roomUrl: string;
  displayName?: string;
  jwt?: string;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI?: {
      new (host: string, options: Record<string, unknown>): {
        dispose: () => void;
      };
    };
  }
}

function externalApiUrlFor(roomUrl: string): string {
  const url = new URL(roomUrl);
  const [appId] = url.pathname.replace(/^\//, "").split("/");
  return appId ? `${url.origin}/${appId}/external_api.js` : `${url.origin}/external_api.js`;
}

export default function JitsiEmbed({ roomUrl, displayName, jwt }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ dispose: () => void } | null>(null);

  useEffect(() => {
    let disposed = false;

    const create = () => {
      if (disposed || !window.JitsiMeetExternalAPI || !containerRef.current) return;
      const url = new URL(roomUrl);
      const roomName = url.pathname.replace(/^\//, "");
      apiRef.current = new window.JitsiMeetExternalAPI(url.host, {
        roomName,
        parentNode: containerRef.current,
        width: "100%",
        height: "100%",
        userInfo: displayName ? { displayName } : undefined,
        ...(jwt ? { jwt } : {}),
      });
    };

    if (window.JitsiMeetExternalAPI) {
      create();
    } else {
      const script = document.createElement("script");
      script.src = externalApiUrlFor(roomUrl);
      script.async = true;
      script.onload = create;
      document.head.appendChild(script);
    }

    return () => {
      disposed = true;
      apiRef.current?.dispose();
      apiRef.current = null;
    };
  }, [roomUrl, displayName, jwt]);

  return <div ref={containerRef} className="h-full w-full" />;
}