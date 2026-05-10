"use client";

import { useState, useEffect } from "react";

export default function AulaSemanaAdminPage() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/weekly-lesson")
      .then(r => r.json())
      .then(d => { setYoutubeUrl(d.youtubeUrl ?? ""); setContent(d.content ?? ""); });
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/weekly-lesson", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youtubeUrl: youtubeUrl.trim(), content: content.trim() || null }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const S = {
    label: { fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" as const, color: "rgba(201,169,122,0.75)", marginBottom: 6, display: "block" },
    input: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,122,0.18)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#fff", outline: "none", width: "100%", fontFamily: "'Poppins',sans-serif", transition: "border-color 0.2s" } as React.CSSProperties,
    textarea: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,122,0.18)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#fff", outline: "none", width: "100%", fontFamily: "'Poppins',sans-serif", resize: "vertical" as const, lineHeight: 1.7 },
  };

  const ytId = youtubeUrl.match(/(?:youtu\.be\/|v=|embed\/)([a-zA-Z0-9_-]{11})/)?.[1];

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      <div style={{ padding: "32px 44px 44px", maxWidth: 800 }}>

        {/* Header */}
        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 5, textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>
          Conteúdo Gratuito
        </p>
        <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 24, letterSpacing: 2, color: "var(--text-primary)", marginBottom: 28, lineHeight: 1.2 }}>
          Aula da <span style={{ color: "var(--gold-light)" }}>Semana</span>
        </h1>

        {/* Card */}
        <div style={{
          borderRadius: 20,
          background: "linear-gradient(160deg, rgba(15,26,61,0.6) 0%, rgba(10,18,45,0.6) 100%)",
          border: "1px solid rgba(201,169,122,0.14)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}>
          <div style={{ padding: "14px 28px", borderBottom: "1px solid rgba(201,169,122,0.08)", background: "rgba(201,169,122,0.02)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, #E8D5A8, #C9A97A)", borderRadius: 2, boxShadow: "0 0 8px rgba(201,169,122,0.5)" }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "var(--gold)" }}>
              Configurar Aula da Semana
            </span>
          </div>

          <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

            {/* YouTube URL */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={S.label}>
                Link do YouTube
                <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 9, letterSpacing: 0, textTransform: "none", color: "rgba(255,255,255,0.25)", marginLeft: 8, fontWeight: 400 }}>
                  cole o link do vídeo da semana
                </span>
              </label>
              <input
                style={S.input}
                placeholder="https://youtu.be/... ou https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                onFocus={e => (e.target.style.borderColor = "rgba(201,169,122,0.5)")}
                onBlur={e => (e.target.style.borderColor = "rgba(201,169,122,0.18)")}
              />
            </div>

            {/* Preview */}
            {ytId && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={S.label}>Prévia</span>
                <div style={{ borderRadius: 12, overflow: "hidden", aspectRatio: "16/9", border: "1px solid rgba(201,169,122,0.15)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                    style={{ width: "100%", height: "100%", display: "block" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* HTML Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={S.label}>
                Conteúdo HTML
                <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 9, letterSpacing: 0, textTransform: "none", color: "rgba(255,255,255,0.25)", marginLeft: 8, fontWeight: 400 }}>
                  opcional — aparece abaixo do vídeo
                </span>
              </label>
              <textarea
                style={S.textarea}
                rows={10}
                placeholder="Cole aqui o HTML com o material de apoio, texto da aula, etc..."
                value={content}
                onChange={e => setContent(e.target.value)}
                onFocus={e => ((e.target as HTMLTextAreaElement).style.borderColor = "rgba(201,169,122,0.5)")}
                onBlur={e => ((e.target as HTMLTextAreaElement).style.borderColor = "rgba(201,169,122,0.18)")}
              />
            </div>

            {/* Save */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "11px 28px", borderRadius: 12,
                  background: saving ? "rgba(201,169,122,0.2)" : "linear-gradient(135deg, #C9A97A, #A07840)",
                  border: "none", color: saving ? "rgba(255,255,255,0.3)" : "#060D1F",
                  fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 11,
                  letterSpacing: 2, textTransform: "uppercase",
                  cursor: saving ? "default" : "pointer",
                  boxShadow: saving ? "none" : "0 4px 16px rgba(201,169,122,0.30)",
                  transition: "all 0.2s",
                }}
              >
                {saving ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                )}
                {saving ? "Salvando..." : "Salvar"}
              </button>

              {saved && (
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6ee7b7", fontFamily: "'Poppins',sans-serif" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Salvo com sucesso
                </span>
              )}
            </div>

            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'Poppins',sans-serif" }}>
              A página pública fica em{" "}
              <span style={{ color: "rgba(201,169,122,0.6)", fontFamily: "monospace" }}>/aula-da-semana</span>
              {" "}— compartilhe com qualquer pessoa, sem necessidade de login.
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
