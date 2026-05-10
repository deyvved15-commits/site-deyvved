"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    JitsiMeetExternalAPI: any;
  }
}

interface Props {
  roomName: string;
  displayName: string;
  email: string;
}

export default function JitsiMeet({ roomName, displayName, email }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiRef = useRef<any>(null);

  useEffect(() => {
    fetch("/api/live/attendance", { method: "POST" }).catch(() => {});
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => {
      if (!containerRef.current || apiRef.current) return;
      apiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", {
        roomName,
        parentNode: containerRef.current,
        userInfo: { displayName, email },
        height: "100%",
        width: "100%",
        configOverwrite: {
          startWithAudioMuted: true,
          disableDeepLinking: true,
          prejoinPageEnabled: false,
          requireDisplayName: false,
          enableLobbyChat: false,
          lobby: { autoKnock: false, enableChat: false },
          disableModeratorIndicator: false,
          startAudioOnly: false,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          TOOLBAR_BUTTONS: [
            "microphone", "camera", "desktop", "fullscreen",
            "fodeviceselection", "hangup", "chat", "raisehand",
            "tileview", "select-background",
          ],
        },
      });
    };
    document.head.appendChild(script);

    return () => {
      apiRef.current?.dispose();
      apiRef.current = null;
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, [roomName, displayName, email]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden border border-[rgba(201,169,122,0.12)]"
      style={{ height: "calc(100vh - 120px)" }}
    />
  );
}
