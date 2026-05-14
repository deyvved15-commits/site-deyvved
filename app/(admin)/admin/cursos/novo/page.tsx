"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const S = {
  field: { display: "flex", flexDirection: "column" as const, gap: 8 },
  label: { fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" as const, color: "rgba(201,169,122,0.75)" },
  input: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,122,0.18)", borderRadius: 12, padding: "13px 16px", fontSize: 13, color: "#fff", outline: "none", width: "100%", fontFamily: "'Poppins',sans-serif" } as React.CSSProperties,
  textarea: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,122,0.18)", borderRadius: 12, padding: "13px 16px", fontSize: 13, color: "#fff", outline: "none", width: "100%", fontFamily: "'Poppins',sans-serif", resize: "vertical" as const, lineHeight: 1.7, minHeight: 96 },
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 7, padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg, #C9A97A, #A07840)", border: "none", color: "#060D1F", fontSize: 11, fontFamily: "'Cinzel',serif", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, cursor: "pointer", boxShadow: "0 4px 16px rgba(201,169,122,0.30)" } as React.CSSProperties,
  btnGhost: { display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 22px", borderRadius: 12, background: "transparent", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.45)", fontSize: 11, fontFamily: "'Cinzel',serif", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, cursor: "pointer", textDecoration: "none" } as React.CSSProperties,
};

export default function NovoCursoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    thumbnail: "",
    price: "",
    paymentType: "ONE_TIME",
    teachers: [] as { teacherId: string; commissionPercentage: number; name: string }[],
  });
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch("/api/teachers")
      .then(res => res.json())
      .then(data => {
        setTeachers(data);
        const tId = searchParams.get("teacherId");
        if (tId) {
          const t = data.find((x: any) => x.id === tId);
          if (t) setForm(f => ({ ...f, teachers: [{ teacherId: tId, commissionPercentage: 0, name: t.name }] }));
        }
      });
  }, [searchParams]);

  function set(k: string, v: any) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description || undefined,
        thumbnail: form.thumbnail || undefined,
        price: form.price ? parseFloat(form.price) : undefined,
        paymentType: form.paymentType,
        teachers: form.teachers.map(t => ({
          teacherId: t.teacherId,
          commissionPercentage: t.commissionPercentage
        })),
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error?.fieldErrors?.title?.[0] ?? "Erro ao criar curso."); setLoading(false); return; }
    router.push(`/admin/cursos/${data.id}`);
  }

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      <Link href="/admin/cursos" className="ka-back-link">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Cursos
      </Link>

      <div className="ka-section" style={{ padding: "20px 44px 56px", maxWidth: 640 }}>

        {/* Header */}
        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, letterSpacing: 5, textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>
          Novo
        </p>
        <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 26, letterSpacing: 3, color: "var(--text-primary)", marginBottom: 32, textTransform: "uppercase" }}>
          Criar <span style={{ color: "var(--gold-light)" }}>Curso</span>
        </h1>

        {/* Card */}
        <div style={{
          borderRadius: 24, padding: "36px 32px",
          background: "linear-gradient(160deg, rgba(15,26,61,0.7) 0%, rgba(10,18,45,0.7) 100%)",
          border: "1px solid rgba(201,169,122,0.14)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.40)",
        }}>
          {/* Section label */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{ width: 3, height: 18, background: "linear-gradient(180deg, #E8D5A8, #C9A97A)", borderRadius: 2, boxShadow: "0 0 8px rgba(201,169,122,0.5)" }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "var(--gold)" }}>
              Informações do Curso
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Título */}
            <div style={S.field}>
              <label style={S.label}>Título do Curso *</label>
              <input style={S.input} value={form.title} onChange={e => set("title", e.target.value)}
                placeholder="Ex: Teologia Sistemática" required />
            </div>

            {/* Descrição */}
            <div style={S.field}>
              <label style={S.label}>Descrição</label>
              <textarea style={S.textarea} value={form.description} onChange={e => set("description", e.target.value)}
                placeholder="Descreva o conteúdo do curso..." rows={3} />
            </div>

            {/* URL Capa */}
            <div style={S.field}>
              <label style={S.label}>URL da Capa <span style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Poppins',sans-serif", fontSize: 9, letterSpacing: 0.5, textTransform: "none", fontWeight: 400 }}>800×1000px recomendado</span></label>
              <input style={S.input} value={form.thumbnail} onChange={e => set("thumbnail", e.target.value)}
                placeholder="https://drive.google.com/..." />
            </div>

            {/* Preço + Tipo */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={S.field}>
                <label style={S.label}>Preço <span style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Poppins',sans-serif", fontSize: 9, letterSpacing: 0, textTransform: "none", fontWeight: 400 }}>(vazio = manual)</span></label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "rgba(201,169,122,0.6)", fontFamily: "'Poppins',sans-serif", pointerEvents: "none" }}>R$</span>
                  <input type="number" min="0" step="0.01" style={{ ...S.input, paddingLeft: 36 }}
                    value={form.price} onChange={e => set("price", e.target.value)} placeholder="0,00" />
                </div>
              </div>
              <div style={S.field}>
                <label style={S.label}>Tipo de Acesso</label>
                <select value={form.paymentType} onChange={e => set("paymentType", e.target.value)}
                  style={{ ...S.input, cursor: "pointer", appearance: "none" as const }}>
                  <option value="ONE_TIME" style={{ background: "#0F1A3D" }}>Pagamento Único</option>
                  <option value="MONTHLY" style={{ background: "#0F1A3D" }}>Mensalidade (30 dias)</option>
                </select>
              </div>
            </div>

            {/* Professores e Comissões */}
            <div className="ka-field">
              <label style={S.label}>Professores e Comissões</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
                {teachers.map(t => {
                  const assoc = form.teachers.find(ct => ct.teacherId === t.id);
                  const isSelected = !!assoc;
                  return (
                    <div key={t.id} style={{ 
                      display: "flex", alignItems: "center", gap: 16, padding: "12px 16px",
                      background: isSelected ? "rgba(201,169,122,0.08)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isSelected ? "var(--gold-35)" : "rgba(255,255,255,0.05)"}`,
                      borderRadius: 14, transition: "all 0.2s"
                    }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flex: 1, fontSize: 13, color: isSelected ? "var(--gold)" : "rgba(255,255,255,0.6)" }}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={e => {
                            const checked = e.target.checked;
                            set("teachers", checked 
                              ? [...form.teachers, { teacherId: t.id, commissionPercentage: 0, name: t.name }]
                              : form.teachers.filter(ct => ct.teacherId !== t.id)
                            );
                          }}
                          style={{ width: 16, height: 16, accentColor: "var(--gold)" }}
                        />
                        {t.name}
                      </label>
                      
                      {isSelected && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Comissão:</span>
                          <div style={{ position: "relative", width: 80 }}>
                            <input 
                              type="number" min="0" max="100" 
                              value={assoc.commissionPercentage} 
                              onChange={e => {
                                const val = parseFloat(e.target.value) || 0;
                                set("teachers", form.teachers.map(ct => ct.teacherId === t.id ? { ...ct, commissionPercentage: val } : ct));
                              }}
                              style={{ ...S.input, padding: "6px 28px 6px 10px", textAlign: "right", fontSize: 12 }} 
                            />
                            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "var(--gold)", pointerEvents: "none" }}>%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(230,57,70,0.08)", border: "1px solid rgba(230,57,70,0.25)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF8088" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span style={{ fontSize: 12, color: "#FF8088", fontFamily: "'Poppins',sans-serif" }}>{error}</span>
              </div>
            )}

            {/* Ações */}
            <div style={{ display: "flex", gap: 10, paddingTop: 8, borderTop: "1px solid rgba(201,169,122,0.08)", marginTop: 4 }}>
              <button type="submit" disabled={loading} style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }}>
                {loading ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                )}
                {loading ? "Criando..." : "Criar Curso"}
              </button>
              <Link href="/admin/cursos" style={S.btnGhost}>Cancelar</Link>
            </div>
          </form>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
