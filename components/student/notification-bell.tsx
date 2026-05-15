"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, BookOpen, MessageSquare, Info } from "lucide-react";
import Link from "next/link";
import PushPermission from "./push-permission";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Polling every minute
    return () => clearInterval(interval);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {}
  }

  async function markAsRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {}
  }

  async function markAllAsRead() {
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {}
  }

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "NEW_LESSON": return <BookOpen size={14} className="text-blue-400" />;
      case "SUPPORT_REPLY": return <MessageSquare size={14} className="text-green-400" />;
      default: return <Info size={14} className="text-gold" />;
    }
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "none", border: "none", cursor: "pointer", position: "relative",
          padding: 8, borderRadius: "50%", color: "var(--gold-light)",
          transition: "all 0.2s"
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(201,169,122,0.1)"}
        onMouseLeave={e => e.currentTarget.style.background = "none"}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: 6, right: 6,
            width: 14, height: 14, borderRadius: "50%",
            background: "#E63946", border: "2px solid #060D1F",
            color: "white", fontSize: 8, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: "absolute", top: "100%", left: -10, marginTop: 12,
          width: "min(350px, 80vw)", maxHeight: 480, overflowY: "auto",
          background: "var(--navy-card)", border: "1px solid rgba(201,169,122,0.25)",
          borderRadius: 20, boxShadow: "0 16px 64px rgba(0,0,0,0.8)",
          zIndex: 999, display: "flex", flexDirection: "column",
          backdropFilter: "blur(12px)",
        }}>
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "white" }}>NOTIFICAÇÕES</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <PushPermission />
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{ background: "none", border: "none", color: "var(--gold)", fontSize: 9, fontWeight: 600, cursor: "pointer", textTransform: "uppercase" }}
                >
                  Lidas
                </button>
              )}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
                Nenhuma notificação por aqui.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)",
                    background: n.read ? "transparent" : "rgba(201,169,122,0.04)",
                    transition: "all 0.2s", cursor: n.link ? "pointer" : "default"
                  }}
                  onClick={() => {
                    if (!n.read) markAsRead(n.id);
                    if (n.link) {
                      window.location.href = n.link;
                      setIsOpen(false);
                    }
                  }}
                >
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.03)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>
                      {getIcon(n.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: n.read ? 500 : 700, color: "white", marginBottom: 2 }}>{n.title}</p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4, marginBottom: 6 }}>{n.message}</p>
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>
                        {new Date(n.createdAt).toLocaleDateString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", marginTop: 6 }} />}
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div style={{ padding: 12, textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Ver tudo</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
