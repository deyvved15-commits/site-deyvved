"use client";

import { useEffect, useState } from "react";

export default function ConfiguracoesPage() {
  const [pixelMeta, setPixelMeta] = useState("");
  const [pixelGtm, setPixelGtm] = useState("");
  const [pixelGa, setPixelGa] = useState("");
  const [pixelCustom, setPixelCustom] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/config")
      .then(r => r.json())
      .then(data => {
        setPixelMeta(data.pixelMeta ?? "");
        setPixelGtm(data.pixelGtm ?? "");
        setPixelGa(data.pixelGa ?? "");
        setPixelCustom(data.pixelCustom ?? "");
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pixelMeta: pixelMeta || null,
        pixelGtm: pixelGtm || null,
        pixelGa: pixelGa || null,
        pixelCustom: pixelCustom || null,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,122,0.18)",
    borderRadius: 12, padding: "11px 14px", fontSize: 13, color: "#fff",
    fontFamily: "'Poppins',sans-serif", outline: "none",
  };

  const labelStyle = {
    fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600 as const,
    letterSpacing: 3, textTransform: "uppercase" as const,
    color: "rgba(201,169,122,0.75)", display: "block" as const, marginBottom: 8,
  };

  const cardStyle = {
    borderRadius: 20, padding: "24px 28px",
    background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
    border: "1px solid rgba(201,169,122,0.12)", marginBottom: 20,
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Administração</div>
        <h1 className="ka-page-title">Configurações <span>da Plataforma</span></h1>
        <p className="ka-page-subtitle">Pixels de rastreamento e integrações externas</p>
      </div>

      <div className="ka-section" style={{ padding: "0 44px 44px", maxWidth: 720 }}>

        {/* Facebook / Meta Pixel */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2 }} />
            <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
              Meta / Facebook Pixel
            </h2>
          </div>
          <label style={labelStyle}>ID do Pixel</label>
          <input
            type="text"
            value={pixelMeta}
            onChange={e => setPixelMeta(e.target.value)}
            placeholder="Ex: 1234567890123456"
            style={inputStyle}
          />
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 6, fontFamily: "'Poppins',sans-serif" }}>
            Apenas o número do ID. O código completo será gerado automaticamente.
          </p>
        </div>

        {/* Google Tag Manager */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2 }} />
            <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
              Google Tag Manager
            </h2>
          </div>
          <label style={labelStyle}>ID do Contêiner</label>
          <input
            type="text"
            value={pixelGtm}
            onChange={e => setPixelGtm(e.target.value)}
            placeholder="Ex: GTM-XXXXXXX"
            style={inputStyle}
          />
        </div>

        {/* Google Analytics */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2 }} />
            <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
              Google Analytics (GA4)
            </h2>
          </div>
          <label style={labelStyle}>ID de Medição</label>
          <input
            type="text"
            value={pixelGa}
            onChange={e => setPixelGa(e.target.value)}
            placeholder="Ex: G-XXXXXXXXXX"
            style={inputStyle}
          />
        </div>

        {/* Código personalizado */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2 }} />
            <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
              Código Personalizado
            </h2>
          </div>
          <label style={labelStyle}>Scripts adicionais (inserido no &lt;head&gt;)</label>
          <textarea
            value={pixelCustom}
            onChange={e => setPixelCustom(e.target.value)}
            placeholder={"<script>...</script>"}
            rows={6}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
          />
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 6, fontFamily: "'Poppins',sans-serif" }}>
            Qualquer código HTML/script válido. Será injetado no &lt;head&gt; de todas as páginas.
          </p>
        </div>

        {/* Botão salvar */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px",
              borderRadius: 14, border: "none", cursor: saving ? "default" : "pointer",
              background: saving ? "rgba(201,169,122,0.20)" : "linear-gradient(135deg, #C9A97A, #A07840)",
              color: saving ? "rgba(255,255,255,0.3)" : "#060D1F",
              fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 11,
              letterSpacing: 2, textTransform: "uppercase",
              boxShadow: saving ? "none" : "0 4px 16px rgba(201,169,122,0.30)",
            }}
          >
            {saving ? "Salvando..." : "Salvar Configurações"}
          </button>

          {saved && (
            <span style={{ fontSize: 12, color: "#6ee7b7", fontFamily: "'Poppins',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Configurações salvas com sucesso
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
