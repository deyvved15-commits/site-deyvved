"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LiveSession = { id: string; title: string; roomName: string; active: boolean; createdAt: string } | null;

export default function LiveControls({ activeSession }: { activeSession: LiveSession }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [session, setSession] = useState(activeSession);

  async function createSession(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !meetingUrl.trim()) return;
    setLoading(true);
    const res = await fetch("/api/live/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, roomName: meetingUrl.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setSession(data);
      setTitle("");
      setMeetingUrl("");
      router.refresh();
    }
    setLoading(false);
  }

  async function endSession() {
    if (!confirm("Encerrar a transmissão atual?")) return;
    setLoading(true);
    await fetch("/api/live/session", { method: "DELETE" });
    setSession(null);
    router.refresh();
    setLoading(false);
  }

  /* ── Sessão ativa ── */
  if (session?.active) {
    return (
      <div style={{
        borderRadius: 20, overflow: "hidden",
        background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
        border: "1px solid rgba(52,211,153,0.25)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(52,211,153,0.10)",
        marginBottom: 28,
      }}>
        {/* Status bar */}
        <div style={{
          padding: "12px 24px",
          background: "rgba(52,211,153,0.08)",
          borderBottom: "1px solid rgba(52,211,153,0.15)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399", flexShrink: 0, animation: "live-pulse 1.5s ease-in-out infinite" }} />
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#6ee7b7" }}>
            Transmissão Ativa
          </span>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 18, color: "var(--text-primary)", marginBottom: 6 }}>
              {session.title}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 340 }}>
                🔗 <code style={{ color: "var(--gold)", fontSize: 11 }}>{session.roomName}</code>
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
                Iniciada: {new Date(session.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <a
              href={session.roomName}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "9px 18px", borderRadius: 10, textDecoration: "none",
                background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
                color: "var(--navy-darkest)", fontFamily: "'Cinzel',serif",
                fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                boxShadow: "0 4px 16px rgba(201,169,122,0.30)",
                display: "flex", alignItems: "center", gap: 7,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="14" height="12" rx="2"/><path d="M22 8l-6 4 6 4V8z"/>
              </svg>
              Entrar na Sala
            </a>
            <button
              onClick={endSession}
              disabled={loading}
              style={{
                padding: "9px 18px", borderRadius: 10, cursor: "pointer",
                background: "rgba(230,57,70,0.12)", border: "1px solid rgba(230,57,70,0.30)",
                color: "#FF8088", fontFamily: "'Cinzel',serif",
                fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                transition: "all 0.2s",
              }}
            >
              Encerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Nenhuma sessão ativa — formulário de criação ── */
  return (
    <div style={{
      borderRadius: 20,
      background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
      border: "1px solid rgba(201,169,122,0.12)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
      marginBottom: 28,
      overflow: "hidden",
    }}>
      <div style={{
        padding: "14px 24px",
        borderBottom: "1px solid rgba(201,169,122,0.10)",
        background: "rgba(201,169,122,0.03)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2, boxShadow: "0 0 8px var(--gold)" }} />
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
          Abrir Nova Transmissão
        </span>
      </div>

      <form onSubmit={createSession} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 7 }}>
            Título da transmissão *
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Aula Ao Vivo — Módulo 3"
            required
            style={{
              width: "100%", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(201,169,122,0.20)", borderRadius: 10,
              padding: "10px 14px", fontSize: 13, color: "var(--text-primary)",
              outline: "none", fontFamily: "'Poppins',sans-serif",
            }}
          />
        </div>

        <div>
          <label style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 7 }}>
            Link da reunião *
          </label>
          <input
            value={meetingUrl}
            onChange={e => setMeetingUrl(e.target.value)}
            placeholder="https://meet.google.com/xxx-xxxx-xxx"
            required
            style={{
              width: "100%", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(201,169,122,0.20)", borderRadius: 10,
              padding: "10px 14px", fontSize: 13, color: "var(--text-primary)",
              outline: "none", fontFamily: "'Poppins',sans-serif",
            }}
          />
          <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6, fontFamily: "'Poppins',sans-serif", lineHeight: 1.6 }}>
            Google Meet, Zoom, Teams, Jitsi — qualquer link de videochamada funciona.
          </p>
        </div>

        <div style={{ paddingTop: 4 }}>
          <button
            type="submit"
            disabled={loading || !title.trim() || !meetingUrl.trim()}
            style={{
              padding: "11px 28px", borderRadius: 12, cursor: "pointer",
              background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
              color: "var(--navy-darkest)", fontFamily: "'Cinzel',serif",
              fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: "uppercase",
              border: "none", boxShadow: "0 4px 16px rgba(201,169,122,0.35)",
              opacity: loading || !title.trim() || !meetingUrl.trim() ? 0.6 : 1,
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="14" height="12" rx="2"/><path d="M22 8l-6 4 6 4V8z"/>
            </svg>
            {loading ? "Abrindo..." : "Iniciar Transmissão"}
          </button>
        </div>
      </form>
    </div>
  );
}
