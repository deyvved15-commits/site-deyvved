"use client";

import { useState } from "react";

interface Earning {
  id: string;
  amount: number;
  createdAt: string;
  paidAt: string | null;
  itemTitle: string;
  buyerName: string;
}

function fmt(v: number) {
  return "R$ " + v.toFixed(2).replace(".", ",");
}

export default function TeacherEarningsPanel({ teacherId, earnings }: { teacherId: string; earnings: Earning[] }) {
  const [items, setItems] = useState(earnings);
  const [loading, setLoading] = useState(false);

  const pending = items.filter(e => !e.paidAt);
  const paid = items.filter(e => e.paidAt);
  const totalPending = pending.reduce((s, e) => s + e.amount, 0);
  const totalPaid = paid.reduce((s, e) => s + e.amount, 0);

  async function markAllPaid() {
    if (pending.length === 0) return;
    if (!confirm(`Marcar ${pending.length} comissão(ões) pendente(s) — ${fmt(totalPending)} — como paga(s)?`)) return;
    setLoading(true);
    const res = await fetch("/api/admin/teacher-earnings/mark-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId }),
    });
    setLoading(false);
    if (!res.ok) { alert("Erro ao marcar como pago."); return; }
    const now = new Date().toISOString();
    setItems(prev => prev.map(e => (e.paidAt ? e : { ...e, paidAt: now })));
  }

  async function unmarkOne(id: string) {
    if (!confirm("Desfazer marcação de pago desta comissão?")) return;
    setLoading(true);
    const res = await fetch("/api/admin/teacher-earnings/mark-paid", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ earningIds: [id] }),
    });
    setLoading(false);
    if (!res.ok) { alert("Erro ao desfazer."); return; }
    setItems(prev => prev.map(e => (e.id === id ? { ...e, paidAt: null } : e)));
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 3, height: 18, background: "linear-gradient(180deg, #63B3ED, #3182CE)", borderRadius: 2, boxShadow: "0 0 8px rgba(99,179,237,0.5)" }} />
          <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
            Comissões
          </h2>
        </div>
        {pending.length > 0 && (
          <button
            onClick={markAllPaid}
            disabled={loading}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10,
              background: "linear-gradient(135deg, #6ee7b7, #34d399)", border: "none",
              color: "#052e1c", fontSize: 11, fontFamily: "'Cinzel',serif", fontWeight: 700,
              letterSpacing: 1.5, textTransform: "uppercase", cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            Marcar {pending.length} pendente{pending.length !== 1 ? "s" : ""} como paga{pending.length !== 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
        <div style={{
          borderRadius: 16, padding: "18px 20px",
          background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
          border: "1px solid rgba(251,191,36,0.20)",
        }}>
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "#FBBF24", marginBottom: 8 }}>
            A Receber
          </p>
          <p style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 22, color: "var(--text-primary)" }}>{fmt(totalPending)}</p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{pending.length} pendente{pending.length !== 1 ? "s" : ""}</p>
        </div>
        <div style={{
          borderRadius: 16, padding: "18px 20px",
          background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
          border: "1px solid rgba(110,231,183,0.20)",
        }}>
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "#6ee7b7", marginBottom: 8 }}>
            Já Pago
          </p>
          <p style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 22, color: "var(--text-primary)" }}>{fmt(totalPaid)}</p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{paid.length} repasse{paid.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ borderRadius: 16, padding: "32px", textAlign: "center", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(201,169,122,0.15)" }}>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Nenhuma comissão registrada ainda.</p>
        </div>
      ) : (
        <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(99,179,237,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 100px 110px 90px",
            padding: "12px 24px", gap: 12,
            background: "rgba(99,179,237,0.04)",
            borderBottom: "1px solid rgba(99,179,237,0.10)",
          }} className="hidden md:grid">
            {["Item", "Aluno", "Valor", "Status", "Data"].map(h => (
              <span key={h} style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "#63B3ED" }}>
                {h}
              </span>
            ))}
          </div>
          <div style={{ background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)" }}>
            {items.map((e, i) => (
              <div key={e.id} style={{
                display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16,
                padding: "14px 24px",
                borderTop: i > 0 ? "1px solid rgba(99,179,237,0.06)" : "none",
              }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{e.itemTitle}</p>
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{e.buyerName}</p>
                </div>
                <p style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 14, color: "var(--gold-light)", minWidth: 90 }}>
                  {fmt(e.amount)}
                </p>
                <div style={{ minWidth: 100 }}>
                  {e.paidAt ? (
                    <button
                      onClick={() => unmarkOne(e.id)}
                      disabled={loading}
                      title="Clique para desfazer"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999,
                        background: "rgba(110,231,183,0.08)", color: "#6ee7b7",
                        fontSize: 9, fontWeight: 700, letterSpacing: 1, fontFamily: "'Cinzel',serif", textTransform: "uppercase",
                        border: "1px solid rgba(110,231,183,0.20)", cursor: loading ? "default" : "pointer",
                      }}
                    >
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#6ee7b7" }} />
                      Pago
                    </button>
                  ) : (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999,
                      background: "rgba(251,191,36,0.08)", color: "#FBBF24",
                      fontSize: 9, fontWeight: 700, letterSpacing: 1, fontFamily: "'Cinzel',serif", textTransform: "uppercase",
                      border: "1px solid rgba(251,191,36,0.20)",
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FBBF24" }} />
                      Pendente
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", minWidth: 80 }}>
                  {new Date(e.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
