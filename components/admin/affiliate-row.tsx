"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  affiliate: {
    id: string;
    name: string;
    email: string;
    affiliateCode: string | null;
    affiliatePercentage: number | null;
    walletBalance: number;
    totalClicks: number;
    _count: { referralsMade: number };
  };
  isLast: boolean;
}

export default function AffiliateRow({ affiliate: a, isLast }: Props) {
  const [pct, setPct] = useState(a.affiliatePercentage !== null ? String(a.affiliatePercentage) : "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    const val = pct === "" ? null : parseFloat(pct);
    if (val !== null && (isNaN(val) || val < 0 || val > 100)) return;
    setSaving(true);
    await fetch(`/api/students/${a.id}/affiliate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ affiliatePercentage: val }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <tr style={{ borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.05)" }}>
      {/* Nome */}
      <td style={{ padding: "14px 20px" }}>
        <Link href={`/admin/alunos/${a.id}`} style={{ textDecoration: "none" }}>
          <p style={{ fontWeight: 600, color: "white", marginBottom: 2, fontSize: 13 }}>{a.name}</p>
          <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{a.email}</p>
        </Link>
      </td>

      {/* Código */}
      <td style={{ padding: "14px 20px" }}>
        <code style={{
          padding: "4px 10px", borderRadius: 8,
          background: "rgba(201,169,122,0.08)", border: "1px solid rgba(201,169,122,0.18)",
          color: "var(--gold)", fontSize: 12, fontWeight: 600,
        }}>
          {a.affiliateCode}
        </code>
      </td>

      {/* Cliques */}
      <td style={{ padding: "14px 20px", textAlign: "center", color: "#a78bfa", fontWeight: 600, fontSize: 13 }}>
        {a.totalClicks}
      </td>

      {/* Vendas */}
      <td style={{ padding: "14px 20px", textAlign: "center", color: "var(--text-secondary)", fontWeight: 600, fontSize: 13 }}>
        {a._count.referralsMade}
      </td>

      {/* % Comissão individual */}
      <td style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,122,0.18)", borderRadius: 10, overflow: "hidden", width: 90 }}>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={pct}
              onChange={e => { setPct(e.target.value); setSaved(false); }}
              placeholder="—"
              style={{
                width: "100%", background: "transparent", border: "none", outline: "none",
                padding: "7px 10px", fontSize: 12, color: "#fff", fontFamily: "'Poppins',sans-serif",
              }}
            />
            <span style={{ padding: "7px 8px 7px 0", fontSize: 11, color: "rgba(255,255,255,0.30)" }}>%</span>
          </div>
          <button
            onClick={save}
            disabled={saving}
            title="Salvar"
            style={{
              width: 28, height: 28, borderRadius: 8, border: "none", cursor: saving ? "default" : "pointer",
              background: saved ? "rgba(110,231,183,0.15)" : "rgba(201,169,122,0.15)",
              color: saved ? "#6ee7b7" : "var(--gold)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            {saving ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            ) : saved ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
            )}
          </button>
        </div>
        {pct === "" && (
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.20)", marginTop: 3, fontFamily: "'Poppins',sans-serif" }}>padrão do curso</p>
        )}
      </td>

      {/* Saldo */}
      <td style={{ padding: "14px 20px", textAlign: "right", fontWeight: 700, fontSize: 13, color: a.walletBalance > 0 ? "#6ee7b7" : "var(--text-muted)" }}>
        R$ {a.walletBalance.toFixed(2).replace(".", ",")}
      </td>
    </tr>
  );
}
