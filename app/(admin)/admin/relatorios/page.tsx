"use client";

import { useState, useEffect, useCallback } from "react";

const TABS = [
  { id: "alunos",     label: "Alunos Matriculados" },
  { id: "financeiro", label: "Financeiro" },
  { id: "formados",   label: "Formados / Certificados" },
  { id: "progresso",  label: "Progresso por Curso" },
  { id: "log",        label: "Log dos Alunos" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Course  { id: string; title: string }
interface Student { id: string; name: string; email: string }

function fmt(v: number | null | undefined) {
  if (v == null || isNaN(Number(v))) return "—";
  return "R$ " + Number(v).toFixed(2).replace(".", ",");
}
function fmtDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}
function fmtDateTime(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR");
}

export default function RelatoriosPage() {
  const [tab,      setTab]      = useState<TabId>("alunos");
  const [courseId, setCourseId] = useState("");
  const [userId,   setUserId]   = useState("");
  const [from,     setFrom]     = useState("");
  const [to,       setTo]       = useState("");
  const [courses,  setCourses]  = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [data,     setData]     = useState<any[]>([]);
  const [extra,    setExtra]    = useState<Record<string, number>>({});
  const [loading,  setLoading]  = useState(false);

  // Carrega lista de cursos
  useEffect(() => {
    fetch("/api/admin/cursos-list")
      .then(r => r.json())
      .then(d => setCourses(d.courses ?? []))
      .catch(() => {});
  }, []);

  // Carrega lista de alunos (só quando tab = log)
  useEffect(() => {
    if (tab !== "log") return;
    fetch("/api/admin/students-list")
      .then(r => r.json())
      .then(d => setStudents(d.students ?? []))
      .catch(() => {});
  }, [tab]);

  // Limpa filtro de aluno ao trocar de aba
  useEffect(() => { setUserId(""); }, [tab]);

  const load = useCallback(async () => {
    setLoading(true);
    setData([]);
    setExtra({ total: 0, walletSum: 0 });
    try {
      const params = new URLSearchParams({ type: tab });
      if (courseId) params.set("courseId", courseId);
      if (userId)   params.set("userId",   userId);
      if (from)     params.set("from",     from);
      if (to)       params.set("to",       to);
      const res  = await fetch(`/api/admin/reports?${params}`);
      if (!res.ok) { console.error("[reports]", res.status, await res.text()); return; }
      const json = await res.json();
      if (json.error) { console.error("[reports]", json.error); return; }
      setData(Array.isArray(json.data) ? json.data : []);
      setExtra({ total: Number(json.total) || 0, walletSum: Number(json.walletSum) || 0 });
    } catch (e) {
      console.error("[reports] fetch error", e);
    } finally {
      setLoading(false);
    }
  }, [tab, courseId, userId, from, to]);

  useEffect(() => { load(); }, [load]);

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,122,0.18)",
    borderRadius: 10, padding: "8px 14px", color: "var(--text-primary)",
    fontSize: 12, fontFamily: "var(--font-poppins)", outline: "none", colorScheme: "dark",
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
          body, .ka-main { background: white !important; color: black !important; }
          .print-title { display: block !important; font-size: 20px; font-weight: 700; margin-bottom: 4px; }
          .print-sub   { display: block !important; font-size: 11px; color: #666; margin-bottom: 20px; }
          .print-kpi   { display: flex !important; gap: 32px; margin-bottom: 20px; }
          .print-kpi-item { text-align: center; }
          .rpt-head { background: #f0ebe0 !important; color: #333 !important; }
          .rpt-row  { border-bottom: 1px solid #eee !important; }
          .rpt-wrap { background: white !important; border: 1px solid #ddd !important; border-radius: 8px; overflow: hidden; }
          .rpt-cell-primary { color: #111 !important; }
          .rpt-cell-muted   { color: #555 !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>

      {/* Header */}
      <div className="ka-page-header no-print">
        <div className="ka-page-eyebrow">Admin</div>
        <h1 className="ka-page-title">Relatórios <span>& Dados</span></h1>
        <p className="ka-page-subtitle">Visão completa da plataforma com filtros e exportação</p>
      </div>

      {/* Print-only header */}
      <div style={{ display: "none", padding: "24px 44px 0" }}>
        <div className="print-title">
          Kadima Academy — {TABS.find(t => t.id === tab)?.label}
        </div>
        <div className="print-sub">
          Gerado em {new Date().toLocaleString("pt-BR")}
          {from && ` | De ${fmtDate(from)}`}
          {to && ` até ${fmtDate(to)}`}
          {courseId && courses.find(c => c.id === courseId) && ` | Curso: ${courses.find(c => c.id === courseId)!.title}`}
          {userId && students.find(s => s.id === userId) && ` | Aluno: ${students.find(s => s.id === userId)!.name}`}
        </div>
        {tab === "financeiro" && extra.total > 0 && (
          <div className="print-kpi">
            <div className="print-kpi-item">
              <div style={{ fontSize: 11, color: "#888" }}>Total aprovado</div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{fmt(extra.total)}</div>
            </div>
            <div className="print-kpi-item">
              <div style={{ fontSize: 11, color: "#888" }}>Usado da carteira</div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{fmt(extra.walletSum)}</div>
            </div>
            <div className="print-kpi-item">
              <div style={{ fontSize: 11, color: "#888" }}>Registros</div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{data.length}</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "0 44px 48px" }}>

        {/* Tabs */}
        <div className="no-print" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "9px 18px", borderRadius: 10, fontSize: 11, cursor: "pointer",
              fontFamily: "var(--font-cinzel)", fontWeight: 600, letterSpacing: 1.2,
              textTransform: "uppercase", border: "1px solid",
              background: tab === t.id
                ? "linear-gradient(135deg, rgba(201,169,122,0.22), rgba(201,169,122,0.08))"
                : "rgba(255,255,255,0.03)",
              color: tab === t.id ? "var(--gold-light)" : "rgba(255,255,255,0.40)",
              borderColor: tab === t.id ? "rgba(201,169,122,0.40)" : "rgba(255,255,255,0.08)",
              transition: "all 0.2s",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* KPIs do Financeiro */}
        {tab === "financeiro" && !loading && data.length > 0 && (
          <div className="no-print" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
            {[
              { label: "Total Aprovado",    value: fmt(extra.total),    color: "var(--green)" },
              { label: "Usado da Carteira", value: fmt(extra.walletSum), color: "var(--gold-bright)" },
              { label: "Transações",        value: String(data.length),  color: "#63B3ED" },
            ].map(k => (
              <div key={k.label} style={{
                borderRadius: 14, padding: "18px 20px",
                background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
                border: "1px solid rgba(201,169,122,0.10)",
              }}>
                <p style={{ fontSize: 9, fontFamily: "var(--font-cinzel)", letterSpacing: 2, textTransform: "uppercase", color: k.color, marginBottom: 8 }}>{k.label}</p>
                <p style={{ fontFamily: "var(--font-cinzel)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)" }}>{k.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="no-print" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 24 }}>
          {/* Filtro curso — não aparece no log se userId selecionado */}
          {tab !== "progresso" && (
            <select value={courseId} onChange={e => setCourseId(e.target.value)} style={selectStyle}>
              <option value="">Todos os cursos</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          )}

          {/* Filtro aluno — só no log */}
          {tab === "log" && (
            <select value={userId} onChange={e => setUserId(e.target.value)} style={{ ...selectStyle, minWidth: 220 }}>
              <option value="">Todos os alunos</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} — {s.email}</option>)}
            </select>
          )}

          {/* Intervalo de datas */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 11, color: "var(--text-muted)" }}>De</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inputStyle} />
            <label style={{ fontSize: 11, color: "var(--text-muted)" }}>até</label>
            <input type="date" value={to}   onChange={e => setTo(e.target.value)}   style={inputStyle} />
          </div>

          <button
            onClick={() => { setCourseId(""); setUserId(""); setFrom(""); setTo(""); }}
            style={{ ...inputStyle, cursor: "pointer", color: "var(--text-muted)", fontSize: 11 }}
          >
            Limpar
          </button>

          <div style={{ flex: 1 }} />

          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {loading ? "Carregando..." : `${data.length} registro${data.length !== 1 ? "s" : ""}`}
          </span>

          <button onClick={() => window.print()} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 20px", borderRadius: 10, cursor: "pointer",
            border: "1px solid rgba(201,169,122,0.35)",
            background: "linear-gradient(135deg, rgba(201,169,122,0.15), rgba(201,169,122,0.05))",
            color: "var(--gold-light)", fontSize: 11,
            fontFamily: "var(--font-cinzel)", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Imprimir
          </button>
        </div>

        {/* Tabela */}
        <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(201,169,122,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }} className="rpt-wrap">
          {tab === "alunos"     && <AlunosTable     data={data} loading={loading} />}
          {tab === "financeiro" && <FinanceiroTable data={data} loading={loading} />}
          {tab === "formados"   && <FormadosTable   data={data} loading={loading} />}
          {tab === "progresso"  && <ProgressoTable  data={data} loading={loading} />}
          {tab === "log"        && <LogTable        data={data} loading={loading} />}
        </div>
      </div>
    </div>
  );
}

// ── Helpers de layout ─────────────────────────────────────────────────────────

function EmptyState({ loading }: { loading: boolean }) {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center", background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)" }}>
      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
        {loading ? "Carregando dados..." : "Nenhum registro encontrado."}
      </p>
    </div>
  );
}

const TH = ({ label, flex = 1 }: { label: string; flex?: number }) => (
  <span style={{
    flex, fontFamily: "var(--font-cinzel)", fontSize: 9, fontWeight: 600,
    letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)",
  }}>{label}</span>
);

const headRowStyle: React.CSSProperties = {
  display: "flex", padding: "12px 24px", gap: 12,
  background: "rgba(201,169,122,0.04)",
  borderBottom: "1px solid rgba(201,169,122,0.10)",
};
const bodyStyle: React.CSSProperties = {
  background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
};
const row = (i: number): React.CSSProperties => ({
  display: "flex", padding: "14px 24px", gap: 12, alignItems: "center",
  borderTop: i > 0 ? "1px solid rgba(201,169,122,0.06)" : "none",
  flexWrap: "wrap",
});
const primary: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "var(--text-primary)" };
const muted:   React.CSSProperties = { fontSize: 11, color: "var(--text-muted)" };

// ── Tabelas ───────────────────────────────────────────────────────────────────

function AlunosTable({ data, loading }: { data: any[]; loading: boolean }) {
  if (!data.length) return <EmptyState loading={loading} />;
  return (
    <>
      <div style={headRowStyle} className="rpt-head">
        {["Aluno","E-mail","Telefone","Igreja","Curso","Matriculado em","Expira em"].map(h => <TH key={h} label={h} />)}
      </div>
      <div style={bodyStyle}>
        {data.map((e: any, i: number) => (
          <div key={e.id} style={row(i)} className="rpt-row">
            <span style={{ ...primary, flex: 1 }} className="rpt-cell-primary">{e.user?.name ?? "—"}</span>
            <span style={{ ...muted, flex: 1 }}   className="rpt-cell-muted">{e.user?.email  ?? "—"}</span>
            <span style={{ ...muted, flex: 1 }}   className="rpt-cell-muted">{e.user?.phone  ?? "—"}</span>
            <span style={{ ...muted, flex: 1 }}   className="rpt-cell-muted">{e.user?.church ?? "—"}</span>
            <span style={{ ...muted, flex: 1 }}   className="rpt-cell-muted">{e.course?.title ?? "—"}</span>
            <span style={{ ...muted, flex: 1 }}   className="rpt-cell-muted">{fmtDate(e.createdAt)}</span>
            {(() => {
              // Se expiresAt está null mas o curso é mensal, calcula createdAt + 30 dias
              const expiry = e.expiresAt
                ? new Date(e.expiresAt)
                : e.course?.paymentType === "MONTHLY"
                  ? new Date(new Date(e.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000)
                  : null;
              const expired = expiry && expiry < new Date();
              return (
                <span style={{ flex: 1, ...muted, color: expired ? "var(--red)" : "var(--text-muted)" }} className="rpt-cell-muted">
                  {expiry ? fmtDate(expiry) : "Vitalício"}
                </span>
              );
            })()}
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
      <div style={headRowStyle} className="rpt-head">
        {["Aluno","Item","Valor Total","Saldo Usado","Método","Data"].map(h => <TH key={h} label={h} />)}
      </div>
      <div style={bodyStyle}>
        {data.map((p: any, i: number) => (
          <div key={p.id} style={row(i)} className="rpt-row">
            <div style={{ flex: 1 }}>
              <div style={primary} className="rpt-cell-primary">{p.user?.name ?? "—"}</div>
              <div style={muted}   className="rpt-cell-muted">{p.user?.email ?? "—"}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, fontFamily: "var(--font-cinzel)", color: "var(--gold)", letterSpacing: 1, marginBottom: 3 }}>
                {p.courseId ? "Curso" : "Produto"}
              </div>
              <div style={{ ...muted }} className="rpt-cell-muted">{p.course?.title ?? p.product?.title ?? "—"}</div>
            </div>
            <span style={{ flex: 1, fontFamily: "var(--font-cinzel)", fontWeight: 700, fontSize: 14, color: "var(--gold-bright)" }}>
              {fmt(p.amount)}
            </span>
            <span style={{ ...muted, flex: 1 }} className="rpt-cell-muted">
              {p.walletUsed > 0 ? fmt(p.walletUsed) : "—"}
            </span>
            <span style={{ ...muted, flex: 1, textTransform: "uppercase", fontSize: 10 }} className="rpt-cell-muted">
              {p.method ?? "—"}
            </span>
            <span style={{ ...muted, flex: 1 }} className="rpt-cell-muted">
              {fmtDate(p.createdAt)}
            </span>
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
      <div style={headRowStyle} className="rpt-head">
        {["Aluno","E-mail","Curso","Certificado emitido em"].map(h => <TH key={h} label={h} />)}
      </div>
      <div style={bodyStyle}>
        {data.map((c: any, i: number) => (
          <div key={c.id} style={row(i)} className="rpt-row">
            <span style={{ ...primary, flex: 1 }} className="rpt-cell-primary">{c.user?.name  ?? "—"}</span>
            <span style={{ ...muted, flex: 1 }}   className="rpt-cell-muted">{c.user?.email  ?? "—"}</span>
            <span style={{ ...muted, flex: 1 }}   className="rpt-cell-muted">{c.course?.title ?? "—"}</span>
            <span style={{ ...muted, flex: 1 }}   className="rpt-cell-muted">{fmtDate(c.issuedAt)}</span>
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
      <div style={headRowStyle} className="rpt-head">
        {["Curso","Matriculados","Aulas","Formados","Média de Progresso"].map(h => <TH key={h} label={h} />)}
      </div>
      <div style={bodyStyle}>
        {data.map((c: any, i: number) => (
          <div key={c.id} style={row(i)} className="rpt-row">
            <span style={{ ...primary, flex: 1 }} className="rpt-cell-primary">{c.title}</span>
            <span style={{ ...muted, flex: 1 }}   className="rpt-cell-muted">{c.totalStudents}</span>
            <span style={{ ...muted, flex: 1 }}   className="rpt-cell-muted">{c.totalLessons}</span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "var(--green)" }}>{c.graduated}</span>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{ width: `${c.avgPct}%`, height: "100%", background: "linear-gradient(90deg, var(--gold), var(--gold-bright))", borderRadius: 3 }} />
              </div>
              <span style={{ ...muted, minWidth: 36, textAlign: "right" }}>{c.avgPct}%</span>
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
      <div style={headRowStyle} className="rpt-head">
        {["Aluno","Último Login","Matriculado em","Aula Concluída","Curso","Concluído em"].map(h => <TH key={h} label={h} />)}
      </div>
      <div style={bodyStyle}>
        {data.map((p: any, i: number) => (
          <div key={p.id} style={row(i)} className="rpt-row">
            <div style={{ flex: 1 }}>
              <div style={primary} className="rpt-cell-primary">{p.user?.name  ?? "—"}</div>
              <div style={muted}   className="rpt-cell-muted">{p.user?.email ?? "—"}</div>
            </div>
            <div style={{ flex: 1 }}>
              {p.user?.lastLoginAt ? (
                <>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--green-light)" }} className="rpt-cell-primary">
                    {fmtDateTime(p.user.lastLoginAt)}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>último acesso</div>
                </>
              ) : (
                <div style={muted} className="rpt-cell-muted">Nunca</div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={muted} className="rpt-cell-muted">{fmtDate(p.enrolledAt)}</div>
              {p.enrolledAt && (
                <div style={{ fontSize: 10, color: "var(--gold)", marginTop: 2 }}>entrada no curso</div>
              )}
            </div>
            <span style={{ ...muted, flex: 1 }} className="rpt-cell-muted">
              {p.lesson?.title ?? "—"}
              {p.lesson?.module?.title && (
                <div style={{ fontSize: 10, color: "var(--gold)", marginTop: 2 }}>{p.lesson.module.title}</div>
              )}
            </span>
            <span style={{ ...muted, flex: 1 }} className="rpt-cell-muted">{p.lesson?.module?.course?.title ?? "—"}</span>
            <span style={{ ...muted, flex: 1 }} className="rpt-cell-muted">{fmtDateTime(p.completedAt ?? p.createdAt)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
