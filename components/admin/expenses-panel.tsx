"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  dueDate: string;
  status: string;
  paidAt: string | null;
  recurring: boolean;
  description: string | null;
}

const CATEGORIES = [
  { value: "FERRAMENTAS", label: "Ferramentas" },
  { value: "TRAFEGO", label: "Tráfego" },
  { value: "SALARIO", label: "Salário" },
  { value: "FREELANCER", label: "Freelancer" },
  { value: "INFRAESTRUTURA", label: "Infraestrutura" },
  { value: "IMPOSTOS", label: "Impostos" },
  { value: "MARKETING", label: "Marketing" },
  { value: "OUTROS", label: "Outros" },
];

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  PENDENTE: { label: "Pendente", color: "#FBBF24" },
  PAGO: { label: "Pago", color: "#6ee7b7" },
  CANCELADO: { label: "Cancelado", color: "rgba(255,255,255,0.35)" },
};

function fmt(v: number) {
  return "R$ " + v.toFixed(2).replace(".", ",");
}

const emptyForm = { title: "", amount: "", category: "FERRAMENTAS", dueDate: "", status: "PENDENTE", recurring: false, description: "" };

export default function ExpensesPanel({ expenses }: { expenses: Expense[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(e: Expense) {
    setEditing(e);
    setForm({
      title: e.title, amount: String(e.amount), category: e.category,
      dueDate: e.dueDate.slice(0, 10), status: e.status, recurring: e.recurring,
      description: e.description ?? "",
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.amount || !form.dueDate) return;
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      amount: Number(form.amount),
      category: form.category,
      dueDate: form.dueDate,
      status: form.status,
      recurring: form.recurring,
      description: form.description.trim() || null,
    };
    const res = editing
      ? await fetch(`/api/admin/expenses/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/admin/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (res.ok) {
      setModalOpen(false);
      router.refresh();
    } else {
      alert("Erro ao salvar despesa.");
    }
  }

  async function markPaid(e: Expense) {
    await fetch(`/api/admin/expenses/${e.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "PAGO" }) });
    router.refresh();
  }

  async function handleDelete(e: Expense) {
    if (!confirm(`Excluir a despesa "${e.title}"?`)) return;
    await fetch(`/api/admin/expenses/${e.id}`, { method: "DELETE" });
    router.refresh();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,122,0.18)",
    borderRadius: 10, padding: "9px 12px", fontSize: 13, color: "#fff",
    fontFamily: "'Poppins',sans-serif", outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 9, fontFamily: "'Cinzel',serif", letterSpacing: 2, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 5, display: "block",
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 3, height: 18, background: "linear-gradient(180deg, #FF8088, #E63946)", borderRadius: 2, boxShadow: "0 0 8px rgba(230,57,70,0.5)" }} />
          <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
            Despesas da Plataforma
          </h2>
        </div>
        <button
          onClick={openNew}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10,
            background: "linear-gradient(135deg, #C9A97A, #A07840)", border: "none",
            color: "#060D1F", fontSize: 11, fontFamily: "'Cinzel',serif", fontWeight: 700,
            letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer",
          }}
        >
          + Nova Despesa
        </button>
      </div>

      {expenses.length === 0 ? (
        <div style={{ borderRadius: 16, padding: "32px", textAlign: "center", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(230,57,70,0.15)" }}>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Nenhuma despesa cadastrada ainda.</p>
        </div>
      ) : (
        <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(230,57,70,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1.3fr 1fr 110px 100px 110px 140px",
            padding: "12px 24px", gap: 12,
            background: "rgba(230,57,70,0.04)",
            borderBottom: "1px solid rgba(230,57,70,0.10)",
          }} className="hidden md:grid">
            {["Título", "Categoria", "Vencimento", "Valor", "Status", ""].map(h => (
              <span key={h} style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "#FF8088" }}>
                {h}
              </span>
            ))}
          </div>
          <div style={{ background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)" }}>
            {expenses.map((e, i) => {
              const s = STATUS_CFG[e.status] ?? STATUS_CFG.PENDENTE;
              const isOverdue = e.status === "PENDENTE" && new Date(e.dueDate) < new Date();
              const catLabel = CATEGORIES.find(c => c.value === e.category)?.label ?? e.category;
              return (
                <div key={e.id} style={{
                  display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12,
                  padding: "14px 24px",
                  borderTop: i > 0 ? "1px solid rgba(230,57,70,0.06)" : "none",
                }}>
                  <div style={{ flex: "1.3 1 160px", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{e.title}</span>
                    {e.recurring && <span title="Recorrente mensal" style={{ fontSize: 10, color: "var(--gold)" }}>↻</span>}
                  </div>
                  <div style={{ flex: "1 1 110px" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, background: "rgba(201,169,122,0.08)", border: "1px solid rgba(201,169,122,0.18)", color: "var(--gold)", padding: "3px 10px", borderRadius: 999 }}>
                      {catLabel}
                    </span>
                  </div>
                  <div style={{ flex: "0 0 110px", fontSize: 11, color: isOverdue ? "#FF8088" : "var(--text-muted)" }}>
                    {new Date(e.dueDate).toLocaleDateString("pt-BR")}{isOverdue ? " · Vencida" : ""}
                  </div>
                  <div style={{ flex: "0 0 100px", fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 13, color: "#FF8088" }}>
                    {fmt(e.amount)}
                  </div>
                  <div style={{ flex: "0 0 110px" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999,
                      background: `${s.color}14`, color: s.color, fontSize: 9, fontWeight: 700, letterSpacing: 1,
                      fontFamily: "'Cinzel',serif", textTransform: "uppercase", border: `1px solid ${s.color}30`,
                    }}>
                      {s.label}
                    </span>
                  </div>
                  <div style={{ flex: "0 0 140px", display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    {e.status === "PENDENTE" && (
                      <button onClick={() => markPaid(e)} title="Marcar como pago" style={actionBtnStyle("#6ee7b7")}>Pagar</button>
                    )}
                    <button onClick={() => openEdit(e)} title="Editar" style={actionBtnStyle("rgba(255,255,255,0.5)")}>✎</button>
                    <button onClick={() => handleDelete(e)} title="Excluir" style={actionBtnStyle("#FF8088")}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 440, borderRadius: 20, padding: 28,
              background: "linear-gradient(160deg, #0F1A3D 0%, #0A122D 100%)",
              border: "1px solid rgba(201,169,122,0.20)", boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
            }}
          >
            <h3 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 18, color: "var(--gold-light)", marginBottom: 20 }}>
              {editing ? "Editar Despesa" : "Nova Despesa"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Título</label>
                <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Hospedagem Vercel" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Valor (R$)</label>
                  <input type="number" inputMode="decimal" style={inputStyle} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0,00" />
                </div>
                <div>
                  <label style={labelStyle}>Vencimento</label>
                  <input type="date" style={{ ...inputStyle, colorScheme: "dark" }} value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Categoria</label>
                  <select style={{ ...inputStyle, cursor: "pointer" }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select style={{ ...inputStyle, cursor: "pointer" }} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {Object.entries(STATUS_CFG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Observações <span style={{ opacity: 0.5, fontWeight: 400, textTransform: "none" }}>(opcional)</span></label>
                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 60 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={form.recurring} onChange={e => setForm(f => ({ ...f, recurring: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "var(--gold)" }} />
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Despesa recorrente (mensal)</span>
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "'Cinzel',serif", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ flex: 1, padding: "10px", borderRadius: 10, background: "linear-gradient(135deg, #C9A97A, #A07840)", border: "none", color: "#060D1F", fontSize: 11, fontFamily: "'Cinzel',serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", opacity: saving ? 0.6 : 1 }}
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function actionBtnStyle(color: string): React.CSSProperties {
  return {
    padding: "5px 10px", borderRadius: 8, fontSize: 10, fontFamily: "'Cinzel',serif", fontWeight: 600,
    letterSpacing: 1, textTransform: "uppercase", cursor: "pointer",
    background: `${color}14`, border: `1px solid ${color}30`, color,
  };
}
