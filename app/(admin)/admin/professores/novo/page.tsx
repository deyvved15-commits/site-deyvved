"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NovoProfessorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", church: "" });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Erro ao cadastrar."); setLoading(false); return; }
    router.push("/admin/professores");
  }

  const S = {
    label: { fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" as const, color: "rgba(201,169,122,0.75)", marginBottom: 6, display: "block" },
    input: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,122,0.18)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#fff", outline: "none", width: "100%", fontFamily: "'Poppins',sans-serif", transition: "border-color 0.2s" } as React.CSSProperties,
    field: { display: "flex", flexDirection: "column" as const, gap: 6 },
  };

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      {/* Back */}
      <Link href="/admin/professores" className="ka-back-link">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Professores
      </Link>

      <div style={{ padding: "20px 44px 44px", maxWidth: 640 }}>

        {/* Header */}
        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 5, textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>
          Novo
        </p>
        <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 24, letterSpacing: 2, color: "var(--text-primary)", marginBottom: 28, lineHeight: 1.2 }}>
          Cadastrar <span style={{ color: "var(--gold-light)" }}>Professor</span>
        </h1>

        {/* Card */}
        <div style={{
          borderRadius: 20,
          background: "linear-gradient(160deg, rgba(15,26,61,0.6) 0%, rgba(10,18,45,0.6) 100%)",
          border: "1px solid rgba(201,169,122,0.14)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}>

          {/* Card header */}
          <div style={{
            padding: "14px 28px",
            borderBottom: "1px solid rgba(201,169,122,0.08)",
            background: "rgba(201,169,122,0.02)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, #E8D5A8, #C9A97A)", borderRadius: 2, boxShadow: "0 0 8px rgba(201,169,122,0.5)" }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "var(--gold)" }}>
              Dados do Professor
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Nome */}
            <div style={S.field}>
              <label style={S.label}>Nome completo *</label>
              <input
                style={S.input}
                placeholder="Nome do professor"
                value={form.name}
                onChange={e => set("name", e.target.value)}
                required
                onFocus={e => (e.target.style.borderColor = "rgba(201,169,122,0.5)")}
                onBlur={e => (e.target.style.borderColor = "rgba(201,169,122,0.18)")}
              />
            </div>

            {/* Email + Telefone */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={S.field}>
                <label style={S.label}>E-mail *</label>
                <input
                  type="email"
                  style={S.input}
                  placeholder="email@exemplo.com"
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  required
                  onFocus={e => (e.target.style.borderColor = "rgba(201,169,122,0.5)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(201,169,122,0.18)")}
                />
              </div>
              <div style={S.field}>
                <label style={S.label}>Telefone</label>
                <input
                  style={S.input}
                  placeholder="(21) 99999-9999"
                  value={form.phone}
                  onChange={e => set("phone", e.target.value)}
                  onFocus={e => (e.target.style.borderColor = "rgba(201,169,122,0.5)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(201,169,122,0.18)")}
                />
              </div>
            </div>

            {/* Senha */}
            <div style={S.field}>
              <label style={S.label}>Senha de acesso *</label>
              <input
                style={S.input}
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={e => set("password", e.target.value)}
                required
                onFocus={e => (e.target.style.borderColor = "rgba(201,169,122,0.5)")}
                onBlur={e => (e.target.style.borderColor = "rgba(201,169,122,0.18)")}
              />
            </div>

            {/* Igreja */}
            <div style={S.field}>
              <label style={S.label}>Igreja / Organização</label>
              <input
                style={S.input}
                placeholder="Nome da igreja ou organização"
                value={form.church}
                onChange={e => set("church", e.target.value)}
                onFocus={e => (e.target.style.borderColor = "rgba(201,169,122,0.5)")}
                onBlur={e => (e.target.style.borderColor = "rgba(201,169,122,0.18)")}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                borderRadius: 10, background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.20)",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style={{ fontSize: 12, color: "#f87171", fontFamily: "'Poppins',sans-serif" }}>{error}</p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "11px 24px", borderRadius: 12,
                  background: loading ? "rgba(201,169,122,0.2)" : "linear-gradient(135deg, #C9A97A, #A07840)",
                  border: "none", color: loading ? "rgba(255,255,255,0.3)" : "#060D1F",
                  fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 11,
                  letterSpacing: 2, textTransform: "uppercase",
                  cursor: loading ? "default" : "pointer",
                  boxShadow: loading ? "none" : "0 4px 16px rgba(201,169,122,0.30)",
                  transition: "all 0.2s",
                }}
              >
                {loading ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                )}
                {loading ? "Cadastrando..." : "Cadastrar Professor"}
              </button>

              <Link href="/admin/professores" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "11px 20px", borderRadius: 12,
                background: "transparent", border: "1px solid rgba(255,255,255,0.10)",
                color: "rgba(255,255,255,0.4)",
                fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 11,
                letterSpacing: 2, textTransform: "uppercase", textDecoration: "none",
                transition: "all 0.2s",
              }}>
                Cancelar
              </Link>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>
        </div>
      </div>
    </div>
  );
}
