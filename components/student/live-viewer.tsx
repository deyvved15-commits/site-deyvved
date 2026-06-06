"use client";

import { useEffect, useState } from "react";

type Session = { id: string; title: string; roomName: string; youtubeUrl?: string | null } | null;

interface Props {
  initialSession: Session;
  displayName: string;
  email: string;
}

function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let videoId = "";
    if (u.hostname.includes("youtu.be")) {
      videoId = u.pathname.slice(1).split("?")[0];
    } else if (u.pathname.startsWith("/live/")) {
      videoId = u.pathname.replace("/live/", "").split("?")[0];
    } else {
      videoId = u.searchParams.get("v") ?? "";
    }
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  } catch {
    return null;
  }
}

export default function LiveViewer({ initialSession, displayName: _displayName, email: _email }: Props) {
  const [session, setSession] = useState<Session>(initialSession);

  // Polling a cada 15s para checar se uma sessão foi aberta
  useEffect(() => {
    if (session) return;
    const interval = setInterval(async () => {
      const res = await fetch("/api/live/session");
      if (res.ok) {
        const data = await res.json();
        if (data?.active) setSession(data);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [session]);

  // Polling para detectar se a sessão foi encerrada
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(async () => {
      const res = await fetch("/api/live/session");
      if (res.ok) {
        const data = await res.json();
        if (!data || !data.active) setSession(null);
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [session]);

  /* ── Aguardando ── */
  if (!session) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 44px" }}>
        <div style={{
          borderRadius: "var(--radius-2xl)", padding: "56px 48px", textAlign: "center", maxWidth: 420,
          background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
          border: "1px solid rgba(201,169,122,0.12)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.40)",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "var(--radius-xl)", margin: "0 auto 20px",
            background: "linear-gradient(135deg, rgba(201,169,122,0.15), rgba(201,169,122,0.05))",
            border: "1px solid var(--gold-20)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 24px rgba(201,169,122,0.12)",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="14" height="12" rx="2"/><path d="M22 8l-6 4 6 4V8z"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: "var(--font-cinzel)", fontWeight: 700, fontSize: 18, letterSpacing: 2, color: "var(--text-primary)", marginBottom: 10 }}>
            Nenhuma transmissão
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 20 }}>
            Não há aula ao vivo no momento. Quando o professor iniciar a transmissão, você será notificado automaticamente.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(201,169,122,0.40)", animation: "live-pulse 2s ease-in-out infinite" }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 1 }}>Verificando a cada 15 segundos...</span>
          </div>
        </div>
      </div>
    );
  }

  const embedUrl = session.youtubeUrl ? getYoutubeEmbedUrl(session.youtubeUrl) : null;

  /* ── YouTube embed ── */
  if (embedUrl) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 0 32px" }}>
        {/* Player */}
        <div style={{ width: "100%", background: "#000", position: "relative", paddingBottom: "56.25%" }}>
          <iframe
            src={embedUrl}
            title={session.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              border: "none",
            }}
          />
        </div>

        {/* Info + botão Meet (se houver link externo também) */}
        <div style={{ padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399", flexShrink: 0, animation: "live-pulse 1.5s ease-in-out infinite" }} />
            <div>
              <p style={{ fontFamily: "var(--font-cinzel)", fontWeight: 700, fontSize: 15, letterSpacing: 1, color: "var(--text-primary)", margin: 0 }}>
                {session.title}
              </p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "3px 0 0", fontFamily: "var(--font-poppins)" }}>
                Transmissão ao vivo · YouTube
              </p>
            </div>
          </div>

          {session.roomName?.startsWith("http") && (
            <a
              href={session.roomName}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => fetch("/api/live/attendance", { method: "POST" }).catch(() => {})}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 22px", borderRadius: 12, textDecoration: "none",
                background: "rgba(201,169,122,0.10)", border: "1px solid rgba(201,169,122,0.30)",
                color: "var(--gold)", fontFamily: "var(--font-cinzel)",
                fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="14" height="12" rx="2"/><path d="M22 8l-6 4 6 4V8z"/>
              </svg>
              Entrar no Meet
            </a>
          )}
        </div>
      </div>
    );
  }

  /* ── Somente Meet / link externo ── */
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 44px" }}>
      <div style={{
        borderRadius: "var(--radius-2xl)", padding: "48px 44px", textAlign: "center", maxWidth: 480,
        background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
        border: "1px solid rgba(52,211,153,0.25)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.40), 0 0 0 1px rgba(52,211,153,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 20 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green-bright)", boxShadow: "0 0 8px var(--green-bright)", animation: "live-pulse 1.5s ease-in-out infinite" }} />
          <span style={{ fontFamily: "var(--font-cinzel)", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "var(--green-light)" }}>
            Ao Vivo Agora
          </span>
        </div>
        <h2 style={{ fontFamily: "var(--font-cinzel)", fontWeight: 700, fontSize: 22, letterSpacing: 2, color: "var(--text-primary)", marginBottom: 10 }}>
          {session.title}
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 32, lineHeight: 1.7 }}>
          A transmissão está aberta. Clique abaixo para entrar na sala ao vivo.
        </p>
        <a
          href={session.roomName}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => fetch("/api/live/attendance", { method: "POST" }).catch(() => {})}
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "14px 36px", borderRadius: 14, textDecoration: "none",
            background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
            color: "var(--navy-darkest)", fontFamily: "var(--font-cinzel)",
            fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: "uppercase",
            boxShadow: "0 6px 24px rgba(201,169,122,0.40)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="14" height="12" rx="2"/><path d="M22 8l-6 4 6 4V8z"/>
          </svg>
          Entrar na Aula
        </a>
        <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 16, fontFamily: "var(--font-poppins)" }}>
          A sala abrirá em uma nova aba do navegador
        </p>
      </div>
    </div>
  );
}
