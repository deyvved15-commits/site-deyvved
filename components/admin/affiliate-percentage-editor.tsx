"use client";

import { useState } from "react";

interface Props {
  studentId: string;
  affiliateCode: string | null;
  currentPercentage: number | null;
}

export default function AffiliatePercentageEditor({ studentId, affiliateCode, currentPercentage }: Props) {
  const [value, setValue] = useState(currentPercentage !== null ? String(currentPercentage) : "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    const pct = value === "" ? null : parseFloat(value);
    if (pct !== null && (isNaN(pct) || pct < 0 || pct > 100)) {
      setError("Informe um valor entre 0 e 100.");
      return;
    }
    setSaving(true);
    setError("");
    setSaved(false);
    const res = await fetch(`/api/students/${studentId}/affiliate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ affiliatePercentage: pct }),
    });
    setSaving(false);
    if (!res.ok) { setError("Erro ao salvar."); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div style={{
      borderRadius: 20, padding: "24px 28px",
      background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
      border: "1px solid rgba(201,169,122,0.12)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2, boxShadow: "0 0 8px var(--gold)" }} />
        <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
          Programa de Afiliado
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={{ borderRadius: 12, padding: "12px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>Código</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: affiliateCode ? "var(--text-primary)" : "var(--text-muted)", fontFamily: affiliateCode ? "monospace" : "inherit" }}>
            {affiliateCode ?? "Não ativado"}
          </p>
        </div>
        <div style={{ borderRadius: 12, padding: "12px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>% Atual</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
            {currentPercentage !== null ? `${currentPercentage}% (individual)` : "Padrão do curso"}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "rgba(201,169,122,0.75)", display: "block", marginBottom: 8 }}>
            Comissão Individual (%)
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 0, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,122,0.18)", borderRadius: 12, overflow: "hidden" }}>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Ex: 15"
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                padding: "11px 14px", fontSize: 13, color: "#fff", fontFamily: "'Poppins',sans-serif",
              }}
            />
            <span style={{ padding: "11px 14px", fontSize: 13, color: "rgba(255,255,255,0.30)", borderLeft: "1px solid rgba(201,169,122,0.10)" }}>%</span>
          </div>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 5, fontFamily: "'Poppins',sans-serif" }}>
            Deixe vazio para usar o padrão definido em cada curso.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 22px",
            borderRadius: 12, border: "none", cursor: saving ? "default" : "pointer",
            background: saving ? "rgba(201,169,122,0.20)" : "linear-gradient(135deg, #C9A97A, #A07840)",
            color: saving ? "rgba(255,255,255,0.3)" : "#060D1F",
            fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 10,
            letterSpacing: 2, textTransform: "uppercase",
            boxShadow: saving ? "none" : "0 4px 14px rgba(201,169,122,0.30)",
          }}
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>

        {saved && (
          <span style={{ fontSize: 12, color: "#6ee7b7", fontFamily: "'Poppins',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Salvo
          </span>
        )}
      </div>

      {error && <p style={{ fontSize: 11, color: "#FF8088", marginTop: 8, fontFamily: "'Poppins',sans-serif" }}>{error}</p>}
    </div>
  );
}
