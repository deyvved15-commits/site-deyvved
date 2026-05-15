"use client";

import { useState, useEffect, useRef } from "react";

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; name: string };
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora mesmo";
  if (m < 60) return `${m}min atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d atrás`;
  return new Date(date).toLocaleDateString("pt-BR");
}

function initials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function LessonComments({
  lessonId,
  userId,
  isAdmin,
}: {
  lessonId: string;
  userId: string;
  isAdmin: boolean;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadComments(cursor?: string) {
    const url = `/api/lessons/${lessonId}/comments${cursor ? `?cursor=${cursor}` : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    return data as { comments: Comment[]; nextCursor: string | null };
  }

  useEffect(() => {
    setLoading(true);
    setComments([]);
    setNextCursor(null);
    loadComments()
      .then(({ comments, nextCursor }) => {
        setComments(comments);
        setNextCursor(nextCursor);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  async function handleLoadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const { comments: older, nextCursor: next } = await loadComments(nextCursor);
      setComments(prev => [...older, ...prev]);
      setNextCursor(next);
    } catch {}
    setLoadingMore(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/lessons/${lessonId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: body.trim() }),
    });
    if (res.ok) {
      const c: Comment = await res.json();
      setComments(prev => [...prev, c]);
      setBody("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
    setSubmitting(false);
  }

  async function handleDelete(commentId: string) {
    await fetch(`/api/admin/comments/${commentId}`, { method: "DELETE" });
    setComments(prev => prev.filter(c => c.id !== commentId));
  }

  return (
    <div style={{ margin: "8px 28px 28px" }}>
      <div style={{
        borderRadius: 16,
        background: "rgba(15,26,61,0.5)",
        border: "1px solid rgba(201,169,122,0.12)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "11px 20px",
          borderBottom: "1px solid rgba(201,169,122,0.08)",
          background: "rgba(201,169,122,0.03)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{ width: 3, height: 14, background: "var(--gold)", borderRadius: 2, boxShadow: "0 0 6px var(--gold)" }} />
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)" }}>
            Comentários
          </span>
          {comments.length > 0 && (
            <span style={{
              marginLeft: 4, fontSize: 10, fontWeight: 700,
              background: "rgba(201,169,122,0.12)", color: "var(--gold)",
              padding: "1px 8px", borderRadius: 999,
            }}>
              {comments.length}{nextCursor ? "+" : ""}
            </span>
          )}
        </div>

        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Load older */}
          {nextCursor && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              style={{
                background: "rgba(201,169,122,0.06)", border: "1px solid rgba(201,169,122,0.15)",
                borderRadius: 10, padding: "8px 14px", cursor: "pointer",
                fontSize: 11, color: "rgba(201,169,122,0.70)",
                fontFamily: "'Cinzel',serif", letterSpacing: 1.5, textTransform: "uppercase",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "all 0.15s", opacity: loadingMore ? 0.6 : 1,
              }}
            >
              {loadingMore ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"/>
                </svg>
              )}
              {loadingMore ? "Carregando..." : "Ver comentários anteriores"}
            </button>
          )}

          {/* Comment list */}
          {loading ? (
            <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>Carregando...</p>
          ) : comments.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
              Seja o primeiro a comentar nesta aula.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {comments.map(c => {
                const isOwn = c.user.id === userId;
                return (
                  <div key={c.id} style={{
                    display: "flex", gap: 10, alignItems: "flex-start",
                    padding: "10px 12px", borderRadius: 12,
                    background: isOwn ? "rgba(201,169,122,0.06)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isOwn ? "rgba(201,169,122,0.12)" : "rgba(255,255,255,0.04)"}`,
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                      background: isOwn
                        ? "radial-gradient(circle at 30% 30%, #E8D5A8, #C9A97A)"
                        : "rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 10,
                      color: isOwn ? "var(--navy-darkest)" : "rgba(255,255,255,0.40)",
                    }}>
                      {initials(c.user.name)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: isOwn ? "var(--gold-light)" : "var(--text-secondary)" }}>
                          {c.user.name}
                        </span>
                        {isOwn && (
                          <span style={{ fontSize: 9, background: "rgba(201,169,122,0.10)", color: "var(--gold)", padding: "1px 7px", borderRadius: 999, letterSpacing: 1, fontFamily: "'Cinzel',serif" }}>
                            Você
                          </span>
                        )}
                        <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: "auto" }}>
                          {timeAgo(c.createdAt)}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(c.id)}
                            title="Moderar comentário"
                            style={{
                              background: "none", border: "none", cursor: "pointer",
                              color: "rgba(255,128,136,0.40)", padding: "1px 4px", borderRadius: 4,
                              fontSize: 10, transition: "color 0.15s",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = "#FF8088")}
                            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,128,136,0.40)")}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                            </svg>
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.6, wordBreak: "break-word" }}>
                        {c.body}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Escreva um comentário..."
              rows={2}
              style={{
                flex: 1, background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,169,122,0.18)", borderRadius: 10,
                padding: "10px 14px", fontSize: 13, color: "#fff",
                outline: "none", fontFamily: "'Poppins',sans-serif",
                resize: "none", lineHeight: 1.6,
              }}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent); }
              }}
            />
            <button
              type="submit"
              disabled={submitting || !body.trim()}
              style={{
                alignSelf: "flex-end", padding: "10px 18px", borderRadius: 10,
                background: submitting || !body.trim()
                  ? "rgba(201,169,122,0.10)"
                  : "linear-gradient(135deg, #C9A97A, #A07840)",
                border: "none",
                color: submitting || !body.trim() ? "rgba(255,255,255,0.20)" : "#060D1F",
                fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 10,
                letterSpacing: 1.5, textTransform: "uppercase",
                cursor: submitting || !body.trim() ? "default" : "pointer",
                transition: "all 0.2s", flexShrink: 0,
              }}
            >
              {submitting ? "..." : "Enviar"}
            </button>
          </form>
          <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: -4 }}>
            Enter para enviar · Shift+Enter para nova linha
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
