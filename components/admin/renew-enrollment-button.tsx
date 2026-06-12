"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  enrollmentId: string;
  courseName: string;
  currentExpiresAt: string | null;
}

const QUICK_OPTIONS = [
  { label: "30 dias", days: 30 },
  { label: "3 meses", days: 90 },
  { label: "6 meses", days: 180 },
  { label: "1 ano", days: 365 },
];

export default function RenewEnrollmentButton({ enrollmentId, courseName, currentExpiresAt }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customDate, setCustomDate] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function renew(expiresAt: string | null) {
    setLoading(true);
    setMsg(null);
    const res = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expiresAt }),
    });
    setLoading(false);
    if (res.ok) {
      setMsg({ ok: true, text: expiresAt ? `Renovado até ${new Date(expiresAt).toLocaleDateString("pt-BR")}` : "Acesso vitalício definido" });
      router.refresh();
      setTimeout(() => { setOpen(false); setMsg(null); }, 2000);
    } else {
      setMsg({ ok: false, text: "Erro ao renovar." });
    }
  }

  function addDays(days: number): string {
    const base = currentExpiresAt && new Date(currentExpiresAt) > new Date()
      ? new Date(currentExpiresAt)
      : new Date();
    base.setDate(base.getDate() + days);
    return base.toISOString();
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Renovar acesso"
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "7px 14px", borderRadius: 9, cursor: "pointer",
          background: "rgba(110,231,183,0.10)", border: "1px solid rgba(110,231,183,0.30)",
          color: "#6ee7b7", fontFamily: "'Cinzel',serif",
          fontWeight: 700, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
          transition: "all 0.2s",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        Renovar
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 50,
          width: 260, borderRadius: 16, overflow: "hidden",
          background: "linear-gradient(160deg, #0F1A3D 0%, #0A122D 100%)",
          border: "1px solid rgba(110,231,183,0.20)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.60)",
        }}>
          {/* Header */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(110,231,183,0.05)" }}>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#6ee7b7", marginBottom: 2 }}>
              Renovar Acesso
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", fontFamily: "'Poppins',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {courseName}
            </p>
            {currentExpiresAt && (
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.30)", fontFamily: "'Poppins',sans-serif", marginTop: 2 }}>
                Atual: {new Date(currentExpiresAt) < new Date() ? "⚠ Expirado" : `válido até ${new Date(currentExpiresAt).toLocaleDateString("pt-BR")}`}
              </p>
            )}
          </div>

          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Opções rápidas */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {QUICK_OPTIONS.map(opt => (
                <button
                  key={opt.days}
                  onClick={() => renew(addDays(opt.days))}
                  disabled={loading}
                  style={{
                    padding: "8px 10px", borderRadius: 10, cursor: "pointer",
                    background: "rgba(110,231,183,0.08)", border: "1px solid rgba(110,231,183,0.20)",
                    color: "#6ee7b7", fontFamily: "'Cinzel',serif", fontWeight: 600,
                    fontSize: 10, letterSpacing: 1, textTransform: "uppercase",
                    transition: "all 0.15s", opacity: loading ? 0.6 : 1,
                  }}
                >
                  + {opt.label}
                </button>
              ))}
            </div>

            {/* Data personalizada */}
            <div style={{ display: "flex", gap: 6 }}>
              <input
                type="date"
                value={customDate}
                onChange={e => setCustomDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                style={{
                  flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,122,0.20)",
                  borderRadius: 10, padding: "7px 10px", fontSize: 12, color: "#fff",
                  outline: "none", fontFamily: "'Poppins',sans-serif",
                  colorScheme: "dark",
                }}
              />
              <button
                onClick={() => customDate && renew(new Date(customDate).toISOString())}
                disabled={!customDate || loading}
                style={{
                  padding: "7px 12px", borderRadius: 10, cursor: "pointer",
                  background: "linear-gradient(135deg, #C9A97A, #A07840)", border: "none",
                  color: "#060D1F", fontFamily: "'Cinzel',serif", fontWeight: 700,
                  fontSize: 10, letterSpacing: 1,
                  opacity: !customDate || loading ? 0.5 : 1,
                }}
              >
                OK
              </button>
            </div>

            {/* Vitalício */}
            <button
              onClick={() => renew(null)}
              disabled={loading}
              style={{
                padding: "8px", borderRadius: 10, cursor: "pointer",
                background: "rgba(201,169,122,0.06)", border: "1px solid rgba(201,169,122,0.15)",
                color: "rgba(201,169,122,0.70)", fontFamily: "'Cinzel',serif", fontWeight: 600,
                fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
                opacity: loading ? 0.6 : 1,
              }}
            >
              ∞ Tornar Vitalício
            </button>

            {/* Feedback */}
            {msg && (
              <p style={{
                fontSize: 11, textAlign: "center", padding: "6px 10px", borderRadius: 8,
                fontFamily: "'Poppins',sans-serif",
                color: msg.ok ? "#6ee7b7" : "#FF8088",
                background: msg.ok ? "rgba(110,231,183,0.08)" : "rgba(230,57,70,0.08)",
                border: `1px solid ${msg.ok ? "rgba(110,231,183,0.20)" : "rgba(230,57,70,0.20)"}`,
              }}>
                {loading ? "Salvando..." : msg.text}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
