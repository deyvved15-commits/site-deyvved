"use client";

import { useState } from "react";
import { Trash2, Plus, Tag, Calendar, Hash, ToggleLeft, ToggleRight } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: Date | string | null;
  active: boolean;
  createdAt: Date | string;
}

export default function CouponList({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    maxUses: "",
    expiresAt: "",
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const newCoupon = await res.json();
        setCoupons([newCoupon, ...coupons]);
        setIsCreating(false);
        setForm({ code: "", discountType: "PERCENTAGE", discountValue: "", maxUses: "", expiresAt: "" });
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao criar cupom");
      }
    } catch (err) {
      setError("Erro de rede");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este cupom?")) return;

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons(coupons.filter(c => c.id !== id));
      }
    } catch (err) {
      alert("Erro ao excluir");
    }
  }

  async function toggleActive(coupon: Coupon) {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !coupon.active }),
      });
      if (res.ok) {
        setCoupons(coupons.map(c => c.id === coupon.id ? { ...c, active: !c.active } : c));
      }
    } catch (err) {
      alert("Erro ao atualizar");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
        <button
          onClick={() => setIsCreating(!isCreating)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12,
            background: "linear-gradient(135deg, var(--gold), var(--gold-deep))", border: "none",
            color: "var(--navy-darkest)", fontSize: 11, fontFamily: "'Cinzel',serif", fontWeight: 700,
            letterSpacing: 2, textTransform: "uppercase", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(201,169,122,0.35)",
          }}
        >
          {isCreating ? "Cancelar" : <><Plus size={16} /> Novo Cupom</>}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,169,122,0.15)",
          borderRadius: 20, padding: 28, marginBottom: 32, display: "flex", flexWrap: "wrap", gap: 20
        }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", fontSize: 10, fontFamily: "'Cinzel',serif", color: "var(--gold)", letterSpacing: 2, marginBottom: 8 }}>CÓDIGO (EX: KADIMA10)</label>
            <input
              required
              style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 12, color: "white" }}
              value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
            />
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <label style={{ display: "block", fontSize: 10, fontFamily: "'Cinzel',serif", color: "var(--gold)", letterSpacing: 2, marginBottom: 8 }}>TIPO</label>
            <select
              style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 12, color: "white" }}
              value={form.discountType}
              onChange={e => setForm({ ...form, discountType: e.target.value })}
            >
              <option value="PERCENTAGE">Porcentagem (%)</option>
              <option value="FIXED">Valor Fixo (R$)</option>
            </select>
          </div>
          <div style={{ flex: "1 1 100px" }}>
            <label style={{ display: "block", fontSize: 10, fontFamily: "'Cinzel',serif", color: "var(--gold)", letterSpacing: 2, marginBottom: 8 }}>VALOR</label>
            <input
              required type="number" step="0.01"
              style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 12, color: "white" }}
              value={form.discountValue}
              onChange={e => setForm({ ...form, discountValue: e.target.value })}
            />
          </div>
          <div style={{ flex: "1 1 100px" }}>
            <label style={{ display: "block", fontSize: 10, fontFamily: "'Cinzel',serif", color: "var(--gold)", letterSpacing: 2, marginBottom: 8 }}>MÁX. USOS</label>
            <input
              type="number"
              style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 12, color: "white" }}
              value={form.maxUses}
              onChange={e => setForm({ ...form, maxUses: e.target.value })}
            />
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <label style={{ display: "block", fontSize: 10, fontFamily: "'Cinzel',serif", color: "var(--gold)", letterSpacing: 2, marginBottom: 8 }}>EXPIRA EM</label>
            <input
              type="date"
              style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 12, color: "white" }}
              value={form.expiresAt}
              onChange={e => setForm({ ...form, expiresAt: e.target.value })}
            />
          </div>
          <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 16 }}>
            <button
              disabled={loading}
              style={{ padding: "12px 32px", borderRadius: 12, background: "var(--gold)", color: "var(--navy-darkest)", border: "none", fontWeight: 700, cursor: "pointer" }}
            >
              {loading ? "Criando..." : "Criar Cupom"}
            </button>
            {error && <p style={{ color: "#f87171", fontSize: 13 }}>{error}</p>}
          </div>
        </form>
      )}

      <div style={{
        borderRadius: 20, overflow: "hidden",
        background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
        border: "1px solid rgba(201,169,122,0.12)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(201,169,122,0.08)" }}>
              <th style={{ padding: "16px 24px", textAlign: "left", fontFamily: "'Cinzel',serif", fontSize: 10, color: "var(--gold)", letterSpacing: 2 }}>CÓDIGO</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontFamily: "'Cinzel',serif", fontSize: 10, color: "var(--gold)", letterSpacing: 2 }}>DESCONTO</th>
              <th style={{ padding: "16px 24px", textAlign: "center", fontFamily: "'Cinzel',serif", fontSize: 10, color: "var(--gold)", letterSpacing: 2 }}>USOS</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontFamily: "'Cinzel',serif", fontSize: 10, color: "var(--gold)", letterSpacing: 2 }}>EXPIRAÇÃO</th>
              <th style={{ padding: "16px 24px", textAlign: "right", fontFamily: "'Cinzel',serif", fontSize: 10, color: "var(--gold)", letterSpacing: 2 }}>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>Nenhum cupom encontrado.</td></tr>
            ) : (
              coupons.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < coupons.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Tag size={14} color="var(--gold)" />
                      <span style={{ fontWeight: 700, color: "white", letterSpacing: 1 }}>{c.code}</span>
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{ color: "#6ee7b7", fontWeight: 600 }}>
                      {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `R$ ${c.discountValue.toFixed(2)}`}
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "var(--text-muted)" }}>
                      <Hash size={12} />
                      {c.usedCount} {c.maxUses ? `/ ${c.maxUses}` : ""}
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)" }}>
                      <Calendar size={12} />
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("pt-BR") : "Nunca"}
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 16 }}>
                      <button
                        onClick={() => toggleActive(c)}
                        title={c.active ? "Desativar" : "Ativar"}
                        style={{ background: "none", border: "none", cursor: "pointer", color: c.active ? "#6ee7b7" : "rgba(255,255,255,0.2)" }}
                      >
                        {c.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,128,136,0.5)" }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
