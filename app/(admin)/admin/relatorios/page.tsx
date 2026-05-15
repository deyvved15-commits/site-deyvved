"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const TABS = [
  { id: "alunos",     label: "Alunos Matriculados" },
  { id: "financeiro", label: "Financeiro" },
  { id: "formados",   label: "Formados / Certificados" },
  { id: "progresso",  label: "Progresso por Curso" },
  { id: "log",        label: "Log dos Alunos" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Course { id: string; title: string }

function fmt(v: number) {
  return "R$ " + v.toFixed(2).replace(".", ",");
}

function fmtDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

export default function RelatoriosPage() {
  const [tab, setTab] = useState<TabId>("alunos");
  const [courseId, setCourseId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/cursos-list")
      .then(r => r.json())
      .then(d => setCourses(d.courses ?? []))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: tab });
      if (courseId) params.set("courseId", courseId);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`/api/admin/reports?${params}`);
      const json = await res.json();
      setData(json.data ?? []);
      setTotal(json.total ?? null);
    } finally {
      setLoading(false);
    }
  }, [tab, courseId, from, to]);

  useEffect(() => { load(); }, [load]);

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,122,0.18)",
    borderRadius: 10, padding: "8px 14px", color: "var(--text-primary)",
    fontSize: 12, fontFamily: "var(--font-poppins)", outline: "none",
    colorScheme: "dark",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: "none", paddingRight: 32, minWidth: 180,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C9A97A' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
  };

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .ka-sidebar, .ka-mobile-nav { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-table { color: black; }
          .ka-page-header { background: white !important; color: black !important; }
          .ka-page-title span { color: #8B6914 !important; }
          .print-card { background: #f9f9f9 !important; border: 1px solid #ddd !important; border-radius: 8px; }
          .print-row { border-bottom: 1px solid #eee !important; }
          .print-head { background: #f0ebe0 !important; color: #333 !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>

      {/* Header */}
      <div className="ka-page-header no-print">
        <div className="ka-page-eyebrow">Admin</div>
        <h1 className="ka-page-title">Relatórios <span>& Dados</span></h1>
        <p className="ka-page-subtitle">Visão completa da plataforma com filtros e exportação</p>
      </div>

      {/* Print Header — hidden on screen */}
      <div style={{ display: "none" }} className="print-header">
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 22, marginBottom: 4 }}>
          Kadima Academy — {TABS.find(t => t.id === tab)?.label}
        </h1>
        <p style={{ fontSize: 12, color: "#666", marginBottom: 16 }}>
          Gerado em {new Date().toLocaleString("pt-BR")}
          {from && ` | De ${fmtDate(from)}`}
          {to && ` até ${fmtDate(to)}`}
          {courseId && courses.find(c => c.id === courseId) && ` | Curso: ${courses.find(c => c.id === courseId)!.title}`}
        </p>
      </div>

      <div style={{ padding: "0 44px 48px" }}>

        {/* Tabs */}
        <div className="no-print" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "9px 18px", borderRadius: 10, fontSize: 11, cursor: "pointer",
                fontFamily: "var(--font-cinzel)", fontWeight: 600, letterSpacing: 1.2,
                textTransform: "uppercase", border: "1px solid",
                background: tab === t.id
                  ? "linear-gradient(135deg, rgba(201,169,122,0.22), rgba(201,169,122,0.08))"
                  : "rgba(255,255,255,0.03)",
                color: tab === t.id ? "var(--gold-light)" : "rgba(255,255,255,0.40)",
                borderColor: tab === t.id ? "rgba(201,169,122,0.40)" : "rgba(255,255,255,0.08)",
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters + Print */}
        <div className="no-print" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 28 }}>
          <select
            value={courseId}
            onChange={e => setCourseId(e.target.value)}
            style={selectStyle}
          >
            <option value="">Todos os cursos</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 11, color: "var(--text-muted)" }}>De</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inputStyle} />
            <label style={{ fontSize: 11, color: "var(--text-muted)" }}>até</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} style={inputStyle} />
          </div>

          <button
            onClick={() => { setCourseId(""); setFrom(""); setTo(""); }}
            style={{ ...inputStyle, cursor: "pointer", color: "var(--text-muted)", fontSize: 11 }}
          >
            Limpar
          </button>

          <div style={{ flex: 1 }} />

          {total !== null && tab === "financeiro" && (
            <span style={{
              fontFamily: "var(--font-cinzel)", fontWeight: 700, fontSize: 18,
              color: "var(--gold-bright)", marginRight: 8,
            }}>
              Total: {fmt(total)}
            </span>
          )}

          <button
            onClick={() => window.print()}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 20px", borderRadius: 10, cursor: "pointer",
              border: "1px solid rgba(201,169,122,0.35)",
              background: "linear-gradient(135deg, rgba(201,169,122,0.15), rgba(201,169,122,0.05))",
              color: "var(--gold-light)", fontSize: 11,
              fontFamily: "var(--font-cinzel)", fontWeight: 600, letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Imprimir
          </button>

          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {loading ? "Carregando..." : `${data.length} registro${data.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Print-only total */}
        {total !== null && tab === "financeiro" && (
          <div className="print-card" style={{ display: "none", padding: "12px 16px", marginBottom: 16, borderRadius: 8 }}>
            <strong>Total aprovado: {fmt(total)}</strong>
          </div>
        )}

        {/* Table */}
        <div style={{
          borderRadius: 20, overflow: "hidden",
          border: "1px solid rgba(201,169,122,0.12)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        }} className="print-table">
          {tab === "alunos" && <AlunosTable data={data} loading={loading} />}
          {tab === "financeiro" && <FinanceiroTable data={data} loading={loading} />}
          {tab === "formados" && <FormadosTable data={data} loading={loading} />}
          {tab === "progresso" && <ProgressoTable data={data} loading={loading} />}
          {tab === "log" && <LogTable data={data} loading={loading} />}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ loading }: { loading: boolean }) {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center", background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)" }}>
      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
        {loading ? "Carregando dados..." : "Nenhum registro encontrado."}
      </p>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  fontFamily: "var(--font-cinzel)", fontSize: 9, fontWeight: 600,
  letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)",
};
const headRow: React.CSSProperties = {
  display: "flex", padding: "12px 24px", gap: 12,
  background: "rgba(201,169,122,0.04)",
  borderBottom: "1px solid rgba(201,169,122,0.10)",
};
const bodyWrap: React.CSSProperties = {
  background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
};
const rowStyle = (i: number): React.CSSProperties => ({
  display: "flex", padding: "14px 24px", gap: 12, alignItems: "center",
  borderTop: i > 0 ? "1px solid rgba(201,169,122,0.06)" : "none",
});
const cellPrimary: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "var(--text-primary)" };
const cellMuted: React.CSSProperties = { fontSize: 11, color: "var(--text-muted)" };

function AlunosTable({ data, loading }: { data: any[]; loading: boolean }) {
  if (!data.length) return <EmptyState loading={loading} />;
  return (
    <>
      <div style={headRow} className="print-head">
        {["Aluno", "E-mail", "Telefone", "Igreja", "Curso", "Matriculado em", "Expira em"].map(h => (
          <span key={h} style={{ ...thStyle, flex: 1 }}>{h}</span>
        ))}
      </div>
      <div style={bodyWrap}>
        {data.map((e: any, i: number) => (
          <div key={e.id} style={rowStyle(i)} className="print-row">
            <span style={{ ...cellPrimary, flex: 1 }}>{e.user?.name ?? "—"}</span>
            <span style={{ ...cellMuted, flex: 1 }}>{e.user?.email ?? "—"}</span>
            <span style={{ ...cellMuted, flex: 1 }}>{e.user?.phone ?? "—"}</span>
            <span style={{ ...cellMuted, flex: 1 }}>{e.user?.church ?? "—"}</span>
            <span style={{ ...cellMuted, flex: 1 }}>{e.course?.title ?? "—"}</span>
            <span style={{ ...cellMuted, flex: 1 }}>{fmtDate(e.createdAt)}</span>
            <span style={{ ...cellMuted, flex: 1, color: e.expiresAt && new Date(e.expiresAt) < new Date() ? "var(--red)" : "var(--text-muted)" }}>
              {fmtDate(e.expiresAt) ?? "Vitalício"}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function FinanceiroTable({ data, loading }: { data: any[]; loading: boolean }) {
  if (!data.length) return <EmptyState loading={loading} />;
  return (
    <>
      <div style={headRow} className="print-head">
        {["Aluno", "Item", "Valor", "Método", "Data"].map(h => (
          <span key={h} style={{ ...thStyle, flex: 1 }}>{h}</span>
        ))}
      </div>
      <div style={bodyWrap}>
        {data.map((p: any, i: number) => (
          <div key={p.id} style={rowStyle(i)} className="print-row">
            <div style={{ flex: 1 }}>
              <span style={cellPrimary}>{p.user?.name ?? "—"}</span>
              <br />
              <span style={cellMuted}>{p.user?.email ?? "—"}</span>
            </div>
            <span style={{ ...cellMuted, flex: 1 }}>{p.course?.title ?? p.product?.title ?? "—"}</span>
            <span style={{ flex: 1, fontFamily: "var(--font-cinzel)", fontWeight: 700, fontSize: 14, color: "var(--gold-bright)" }}>
              {fmt(p.amount)}
            </span>
            <span style={{ ...cellMuted, flex: 1, textTransform: "uppercase", fontSize: 10 }}>{p.method}</span>
            <span style={{ ...cellMuted, flex: 1 }}>{fmtDate(p.createdAt)}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function FormadosTable({ data, loading }: { data: any[]; loading: boolean }) {
  if (!data.length) return <EmptyState loading={loading} />;
  return (
    <>
      <div style={headRow} className="print-head">
        {["Aluno", "E-mail", "Curso", "Certificado emitido em"].map(h => (
          <span key={h} style={{ ...thStyle, flex: 1 }}>{h}</span>
        ))}
      </div>
      <div style={bodyWrap}>
        {data.map((c: any, i: number) => (
          <div key={c.id} style={rowStyle(i)} className="print-row">
            <span style={{ ...cellPrimary, flex: 1 }}>{c.user?.name ?? "—"}</span>
            <span style={{ ...cellMuted, flex: 1 }}>{c.user?.email ?? "—"}</span>
            <span style={{ ...cellMuted, flex: 1 }}>{c.course?.title ?? "—"}</span>
            <span style={{ ...cellMuted, flex: 1 }}>{fmtDate(c.issuedAt)}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function ProgressoTable({ data, loading }: { data: any[]; loading: boolean }) {
  if (!data.length) return <EmptyState loading={loading} />;
  return (
    <>
      <div style={headRow} className="print-head">
        {["Curso", "Matriculados", "Total de Aulas", "Formados", "Média de Progresso"].map(h => (
          <span key={h} style={{ ...thStyle, flex: 1 }}>{h}</span>
        ))}
      </div>
      <div style={bodyWrap}>
        {data.map((c: any, i: number) => (
          <div key={c.id} style={rowStyle(i)} className="print-row">
            <span style={{ ...cellPrimary, flex: 1 }}>{c.title}</span>
            <span style={{ ...cellMuted, flex: 1 }}>{c.totalStudents}</span>
            <span style={{ ...cellMuted, flex: 1 }}>{c.totalLessons}</span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "var(--green)" }}>{c.graduated}</span>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{ width: `${c.avgPct}%`, height: "100%", background: "linear-gradient(90deg, var(--gold), var(--gold-bright))", borderRadius: 3 }} />
              </div>
              <span style={{ ...cellMuted, minWidth: 36, textAlign: "right" }}>{c.avgPct}%</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function LogTable({ data, loading }: { data: any[]; loading: boolean }) {
  if (!data.length) return <EmptyState loading={loading} />;
  return (
    <>
      <div style={headRow} className="print-head">
        {["Aluno", "Aula Concluída", "Módulo", "Curso", "Data"].map(h => (
          <span key={h} style={{ ...thStyle, flex: 1 }}>{h}</span>
        ))}
      </div>
      <div style={bodyWrap}>
        {data.map((p: any, i: number) => (
          <div key={p.id} style={rowStyle(i)} className="print-row">
            <div style={{ flex: 1 }}>
              <span style={cellPrimary}>{p.user?.name ?? "—"}</span>
              <br />
              <span style={cellMuted}>{p.user?.email ?? "—"}</span>
            </div>
            <span style={{ ...cellMuted, flex: 1 }}>{p.lesson?.title ?? "—"}</span>
            <span style={{ ...cellMuted, flex: 1 }}>{p.lesson?.module?.title ?? "—"}</span>
            <span style={{ ...cellMuted, flex: 1 }}>{p.lesson?.module?.course?.title ?? "—"}</span>
            <span style={{ ...cellMuted, flex: 1 }}>{fmtDate(p.completedAt ?? p.createdAt)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
