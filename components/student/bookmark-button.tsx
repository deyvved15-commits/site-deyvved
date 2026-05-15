"use client";

import { useState, useEffect } from "react";

export default function BookmarkButton({ lessonId }: { lessonId: string }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState<"saved" | "removed" | null>(null);

  useEffect(() => {
    fetch(`/api/lessons/${lessonId}/bookmark`)
      .then(r => r.json())
      .then(d => { setBookmarked(d.bookmarked); setLoading(false); })
      .catch(() => setLoading(false));
  }, [lessonId]);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    const res = await fetch(`/api/lessons/${lessonId}/bookmark`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    const d = await res.json();
    setBookmarked(d.bookmarked);
    setFlash(d.bookmarked ? "saved" : "removed");
    setLoading(false);
    setTimeout(() => setFlash(null), 2000);
  }

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button
        onClick={toggle}
        disabled={loading}
        title={bookmarked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "9px 16px", borderRadius: 10, border: "none", cursor: loading ? "default" : "pointer",
          background: bookmarked
            ? "linear-gradient(135deg, rgba(201,169,122,0.20), rgba(201,169,122,0.10))"
            : "rgba(255,255,255,0.04)",
          borderWidth: 1, borderStyle: "solid",
          borderColor: bookmarked ? "rgba(201,169,122,0.40)" : "rgba(201,169,122,0.18)",
          color: bookmarked ? "#E8D5A8" : "rgba(201,169,122,0.55)",
          transition: "all 0.2s",
          opacity: loading ? 0.6 : 1,
        }}
      >
        <svg
          width="15" height="15" viewBox="0 0 24 24"
          fill={bookmarked ? "currentColor" : "none"}
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>
          {bookmarked ? "Salvo" : "Favoritar"}
        </span>
      </button>

      {flash && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
          background: flash === "saved" ? "rgba(110,231,183,0.15)" : "rgba(230,57,70,0.12)",
          border: `1px solid ${flash === "saved" ? "rgba(110,231,183,0.30)" : "rgba(230,57,70,0.25)"}`,
          color: flash === "saved" ? "#6ee7b7" : "#FF8088",
          fontSize: 10, padding: "5px 12px", borderRadius: 8, whiteSpace: "nowrap",
          fontFamily: "'Cinzel',serif", letterSpacing: 1.5, textTransform: "uppercase",
          pointerEvents: "none", zIndex: 10,
        }}>
          {flash === "saved" ? "✓ Favoritado" : "Removido"}
        </div>
      )}
    </div>
  );
}
