"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface MiniPlayerVideoProps {
  ytId: string;
  /** Quando informado, marca a aula como concluída automaticamente ao chegar no fim do vídeo. */
  lessonId?: string;
  lessonTitle?: string;
  completed?: boolean;
}

export default function MiniPlayerVideo({ ytId, lessonId, lessonTitle, completed }: MiniPlayerVideoProps) {
  const router = useRouter();
  const anchorRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerApiRef = useRef<any>(null);
  const firedRef = useRef(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const [isMini, setIsMini] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const rafRef = useRef<number | null>(null);

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    // Vira mini-player quando o player original quase saiu por cima da tela.
    setIsMini(r.bottom <= 64);
  }, []);

  useEffect(() => {
    updatePosition();
    const onScrollOrResize = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        updatePosition();
        rafRef.current = null;
      });
    };
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updatePosition]);

  // Reseta o "fechar" assim que o player volta a ficar visível no lugar normal.
  useEffect(() => {
    if (!isMini) setDismissed(false);
  }, [isMini]);

  const markCompleted = useCallback(async () => {
    if (!lessonId || firedRef.current || completed) return;
    firedRef.current = true;
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, completed: true }),
    });
    fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "LESSON_COMPLETE", metadata: lessonTitle ? { lesson: lessonTitle } : undefined }),
    }).catch(() => {});
    router.refresh();
  }, [lessonId, lessonTitle, completed, router]);

  // Escuta o fim do vídeo via YouTube IFrame API para marcar a aula como assistida.
  useEffect(() => {
    if (!lessonId || completed) return;

    function initPlayer() {
      if (!iframeRef.current || !window.YT?.Player || playerApiRef.current) return;
      playerApiRef.current = new window.YT.Player(iframeRef.current, {
        events: {
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) markCompleted();
          },
        },
      });
    }

    if (window.YT?.Player) {
      initPlayer();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { prev?.(); initPlayer(); };
      if (!document.getElementById("youtube-iframe-api")) {
        const script = document.createElement("script");
        script.id = "youtube-iframe-api";
        script.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(script);
      }
    }
  }, [lessonId, completed, markCompleted]);

  const showMini = isMini && !dismissed;

  function backToTop() {
    anchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const miniBtnStyle: React.CSSProperties = {
    width: 26, height: 26, borderRadius: 7,
    background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.15)",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", fontSize: 12, lineHeight: 1,
  };

  return (
    <>
      {/* Âncora: reserva o espaço do player no fluxo normal da página */}
      <div ref={anchorRef} style={{ width: "100%", aspectRatio: "16/9" }} />

      {/* Player real: sempre o mesmo elemento/iframe, só muda de posição via CSS */}
      <div
        style={
          showMini
            ? {
                position: "fixed", bottom: 16, right: 16,
                width: 300, maxWidth: "calc(100vw - 32px)", aspectRatio: "16/9",
                zIndex: 9998, borderRadius: 14, overflow: "hidden", background: "#000",
                border: "1px solid rgba(201,169,122,0.30)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
              }
            : rect
            ? {
                position: "fixed", top: rect.top, left: rect.left, width: rect.width, height: rect.height,
                borderRadius: 16, overflow: "hidden", background: "#000",
                border: "1px solid rgba(201,169,122,0.10)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.60)",
                zIndex: 1,
              }
            : { position: "fixed", top: -9999, left: -9999, width: 1, height: 1, visibility: "hidden" }
        }
      >
        {showMini && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, zIndex: 2,
            display: "flex", justifyContent: "flex-end", gap: 6, padding: 6,
            background: "linear-gradient(180deg, rgba(0,0,0,0.65), transparent)",
          }}>
            <button onClick={backToTop} title="Expandir" style={miniBtnStyle}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
            </button>
            <button onClick={() => setDismissed(true)} title="Fechar" style={miniBtnStyle}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&enablejsapi=1`}
          style={{ width: "100%", height: "100%", display: "block" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </>
  );
}
