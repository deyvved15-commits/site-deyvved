"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface ChatUser { id: string; name: string; role: string; avatar?: string | null }
interface Message {
  id: string; text: string; pinned: boolean; isAnnouncement: boolean;
  createdAt: string; user: ChatUser;
}
interface PinnedMessage {
  id: string; text: string; createdAt: string; user: { id: string; name: string };
}

interface Props {
  sessionId: string;
  currentUser: { id: string; name: string; role: string };
}

const isPrivileged = (role: string) => role === "ADMIN" || role === "TEACHER";

function Avatar({ user }: { user: ChatUser }) {
  const initials = (user.name ?? "?").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  const isAdmin = isPrivileged(user.role);
  return (
    <div style={{
      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
      background: isAdmin
        ? "linear-gradient(135deg, #C9A97A, #A07840)"
        : "linear-gradient(135deg, #1e3a6e, #0f2044)",
      border: `1px solid ${isAdmin ? "rgba(201,169,122,0.5)" : "rgba(255,255,255,0.10)"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 10, fontWeight: 700,
      color: isAdmin ? "#060D1F" : "rgba(255,255,255,0.6)",
      fontFamily: "'Cinzel',serif",
    }}>
      {initials}
    </div>
  );
}

export default function LiveChat({ sessionId, currentUser }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pinned, setPinned] = useState<PinnedMessage | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [muteMenu, setMuteMenu] = useState<string | null>(null); // userId com menu aberto
  const [lastTimestamp, setLastTimestamp] = useState<string | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const admin = isPrivileged(currentUser.role);

  const fetchMessages = useCallback(async (initial = false) => {
    const params = new URLSearchParams({ sessionId });
    if (!initial && lastTimestamp) params.set("after", lastTimestamp);
    const res = await fetch(`/api/live/chat?${params}`);
    if (!res.ok) return;
    const data = await res.json();

    if (initial) {
      setMessages(data.messages ?? []);
    } else {
      if (data.messages?.length > 0) {
        setMessages(prev => [...prev, ...data.messages]);
      }
    }
    if (data.pinned !== undefined) setPinned(data.pinned);
    if (data.isMuted !== undefined) setIsMuted(data.isMuted);

    const all = initial ? (data.messages ?? []) : data.messages ?? [];
    if (all.length > 0) setLastTimestamp(all[all.length - 1].createdAt);
  }, [sessionId, lastTimestamp]);

  // Carga inicial
  useEffect(() => {
    fetchMessages(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Polling a cada 3s
  useEffect(() => {
    const id = setInterval(() => fetchMessages(false), 3000);
    return () => clearInterval(id);
  }, [fetchMessages]);

  // Auto-scroll ao receber nova mensagem
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending || isMuted) return;
    setSending(true);
    const res = await fetch("/api/live/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, text, isAnnouncement }),
    });
    setSending(false);
    if (res.ok) {
      const msg = await res.json();
      setMessages(prev => [...prev, msg]);
      setLastTimestamp(msg.createdAt);
      setText("");
      setIsAnnouncement(false);
      inputRef.current?.focus();
    }
  }

  async function deleteMessage(messageId: string) {
    await fetch(`/api/live/chat/${messageId}`, { method: "DELETE" });
    setMessages(prev => prev.filter(m => m.id !== messageId));
  }

  async function togglePin(messageId: string, currentPinned: boolean) {
    await fetch(`/api/live/chat/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !currentPinned }),
    });
    if (!currentPinned) {
      const msg = messages.find(m => m.id === messageId);
      if (msg) setPinned({ id: msg.id, text: msg.text, createdAt: msg.createdAt, user: { id: msg.user.id, name: msg.user.name } });
    } else {
      setPinned(null);
    }
  }

  async function muteUser(userId: string, minutes: number) {
    await fetch("/api/live/mute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, sessionId, minutes }),
    });
    setMuteMenu(null);
  }

  async function clearChat() {
    const toDelete = messages.map(m => m.id);
    await Promise.all(toDelete.map(id =>
      fetch(`/api/live/chat/${id}`, { method: "DELETE" })
    ));
    setMessages([]);
    setPinned(null);
    setClearConfirm(false);
  }

  const fmt = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: "linear-gradient(180deg, rgba(10,18,45,0.95) 0%, rgba(6,13,31,0.98) 100%)",
      borderLeft: "1px solid rgba(201,169,122,0.10)",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 16px", borderBottom: "1px solid rgba(201,169,122,0.10)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(201,169,122,0.03)", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)" }}>
            Bate-Papo
          </span>
          {messages.length > 0 && (
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'Poppins',sans-serif" }}>
              {messages.length}
            </span>
          )}
        </div>
        {admin && (
          <button
            onClick={() => setClearConfirm(true)}
            title="Limpar chat"
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", padding: 4, borderRadius: 6, display: "flex" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        )}
      </div>

      {/* Mensagem fixada */}
      {pinned && (
        <div style={{
          margin: "8px 10px 0", padding: "8px 12px", borderRadius: 10,
          background: "rgba(201,169,122,0.08)", border: "1px solid rgba(201,169,122,0.20)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--gold)" stroke="none">
              <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
            </svg>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)" }}>
              Fixado por {pinned.user.name}
            </span>
            {admin && (
              <button
                onClick={() => togglePin(pinned.id, true)}
                style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", padding: 2, display: "flex" }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-primary)", fontFamily: "'Poppins',sans-serif", lineHeight: 1.5 }}>
            {pinned.text}
          </p>
        </div>
      )}

      {/* Lista de mensagens */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px 4px", display: "flex", flexDirection: "column", gap: 2 }}>
        {messages.length === 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 10, opacity: 0.4 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "'Poppins',sans-serif", textAlign: "center" }}>
              Nenhuma mensagem ainda.<br />Seja o primeiro!
            </p>
          </div>
        )}

        {messages.map(msg => {
          const isOwn = msg.user.id === currentUser.id;
          const isMsgAdmin = isPrivileged(msg.user.role);

          if (msg.isAnnouncement) {
            return (
              <div key={msg.id} style={{
                margin: "6px 0", padding: "10px 14px", borderRadius: 12,
                background: "linear-gradient(135deg, rgba(201,169,122,0.12), rgba(201,169,122,0.06))",
                border: "1px solid rgba(201,169,122,0.25)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, fontWeight: 700, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase" }}>
                    Anúncio · {msg.user.name}
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-muted)", fontFamily: "'Poppins',sans-serif" }}>{fmt(msg.createdAt)}</span>
                  {admin && (
                    <button onClick={() => deleteMessage(msg.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,80,80,0.4)", padding: 2, display: "flex" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "'Poppins',sans-serif", lineHeight: 1.5 }}>{msg.text}</p>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "4px 6px", borderRadius: 10, position: "relative" }}
              onMouseEnter={e => { if (admin || isOwn) (e.currentTarget.querySelector(".msg-actions") as HTMLElement | null)?.style && ((e.currentTarget.querySelector(".msg-actions") as HTMLElement).style.opacity = "1"); }}
              onMouseLeave={e => { if (admin || isOwn) (e.currentTarget.querySelector(".msg-actions") as HTMLElement | null)?.style && ((e.currentTarget.querySelector(".msg-actions") as HTMLElement).style.opacity = "0"); }}
            >
              <Avatar user={msg.user} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                  <span style={{
                    fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 700,
                    color: isMsgAdmin ? "var(--gold)" : "var(--text-secondary)",
                    letterSpacing: isMsgAdmin ? 0.5 : 0,
                  }}>
                    {msg.user.name}
                    {isMsgAdmin && <span style={{ fontSize: 8, marginLeft: 4, opacity: 0.7 }}>· PROF</span>}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'Poppins',sans-serif" }}>{fmt(msg.createdAt)}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "'Poppins',sans-serif", lineHeight: 1.5, wordBreak: "break-word", marginTop: 2 }}>
                  {msg.text}
                </p>
              </div>

              {/* Ações ao hover */}
              {(admin || isOwn) && (
                <div className="msg-actions" style={{ display: "flex", gap: 2, opacity: 0, transition: "opacity 0.15s", flexShrink: 0 }}>
                  {admin && (
                    <>
                      <button
                        onClick={() => togglePin(msg.id, msg.pinned)}
                        title="Fixar mensagem"
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 3, borderRadius: 5, color: msg.pinned ? "var(--gold)" : "rgba(255,255,255,0.3)", display: "flex" }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                          <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                        </svg>
                      </button>
                      {!isPrivileged(msg.user.role) && (
                        <div style={{ position: "relative" }}>
                          <button
                            onClick={() => setMuteMenu(muteMenu === msg.user.id ? null : msg.user.id)}
                            title="Silenciar aluno"
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 3, borderRadius: 5, color: "rgba(255,255,255,0.3)", display: "flex" }}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23M12 20v4M8 20h8"/>
                            </svg>
                          </button>
                          {muteMenu === msg.user.id && (
                            <div style={{
                              position: "absolute", bottom: "calc(100% + 4px)", right: 0, zIndex: 50,
                              background: "#0F1A3D", border: "1px solid rgba(201,169,122,0.20)",
                              borderRadius: 10, overflow: "hidden", minWidth: 120,
                              boxShadow: "0 8px 24px rgba(0,0,0,0.50)",
                            }}>
                              <p style={{ padding: "8px 12px 4px", fontFamily: "'Cinzel',serif", fontSize: 8, fontWeight: 700, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase" }}>
                                Silenciar por
                              </p>
                              {[5, 10, 30, 60].map(min => (
                                <button
                                  key={min}
                                  onClick={() => muteUser(msg.user.id, min)}
                                  style={{
                                    display: "block", width: "100%", padding: "7px 12px", textAlign: "left",
                                    background: "none", border: "none", cursor: "pointer",
                                    fontSize: 12, color: "var(--text-primary)", fontFamily: "'Poppins',sans-serif",
                                  }}
                                >
                                  {min} minutos
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    title="Apagar mensagem"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 3, borderRadius: 5, color: "rgba(255,80,80,0.4)", display: "flex" }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "10px", borderTop: "1px solid rgba(201,169,122,0.08)", flexShrink: 0 }}>
        {isMuted ? (
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(230,57,70,0.08)", border: "1px solid rgba(230,57,70,0.20)", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "#FF8088", fontFamily: "'Poppins',sans-serif" }}>
              🔇 Você está temporariamente silenciado
            </p>
          </div>
        ) : (
          <form onSubmit={sendMessage} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {admin && (
              <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", userSelect: "none" }}>
                <input
                  type="checkbox"
                  checked={isAnnouncement}
                  onChange={e => setIsAnnouncement(e.target.checked)}
                  style={{ accentColor: "var(--gold)", width: 13, height: 13 }}
                />
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase" }}>
                  Enviar como anúncio
                </span>
              </label>
            )}
            <div style={{ display: "flex", gap: 7 }}>
              <input
                ref={inputRef}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Digite uma mensagem..."
                maxLength={500}
                style={{
                  flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,122,0.15)",
                  borderRadius: 10, padding: "9px 12px", fontSize: 13, color: "#fff",
                  outline: "none", fontFamily: "'Poppins',sans-serif",
                }}
              />
              <button
                type="submit"
                disabled={!text.trim() || sending}
                style={{
                  width: 38, height: 38, borderRadius: 10, border: "none", cursor: "pointer",
                  background: text.trim() ? "linear-gradient(135deg, var(--gold), var(--gold-deep))" : "rgba(255,255,255,0.06)",
                  color: text.trim() ? "#060D1F" : "rgba(255,255,255,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "all 0.2s",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Confirm limpar chat */}
      {clearConfirm && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(6,13,31,0.85)", backdropFilter: "blur(4px)", borderRadius: "inherit",
        }}>
          <div style={{ background: "#0F1A3D", border: "1px solid rgba(230,57,70,0.30)", borderRadius: 16, padding: "24px 28px", textAlign: "center", maxWidth: 260 }}>
            <p style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 8 }}>Limpar Chat?</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "'Poppins',sans-serif", marginBottom: 20, lineHeight: 1.6 }}>
              Todas as mensagens serão apagadas para todos os participantes.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setClearConfirm(false)} style={{ padding: "8px 18px", borderRadius: 9, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "var(--text-muted)", cursor: "pointer", fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>
                Cancelar
              </button>
              <button onClick={clearChat} style={{ padding: "8px 18px", borderRadius: 9, background: "rgba(230,57,70,0.15)", border: "1px solid rgba(230,57,70,0.30)", color: "#FF8088", cursor: "pointer", fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>
                Limpar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
