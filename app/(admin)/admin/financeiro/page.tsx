import { prisma } from "@/lib/prisma";
import Link from "next/link";

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  approved: { label: "Aprovado",  color: "#6ee7b7", bg: "rgba(110,231,183,0.08)" },
  pending:  { label: "Pendente",  color: "#FBBF24", bg: "rgba(251,191,36,0.08)"  },
  rejected: { label: "Recusado",  color: "#FF8088", bg: "rgba(230,57,70,0.08)"   },
  cancelled:{ label: "Cancelado", color: "rgba(255,255,255,0.30)", bg: "rgba(255,255,255,0.04)" },
};

function fmt(v: number) {
  return "R$ " + v.toFixed(2).replace(".", ",");
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filterStatus = status && STATUS_LABEL[status] ? status : undefined;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [payments, totalApproved, monthApproved, totalCount] = await Promise.all([
    prisma.payment.findMany({
      where: filterStatus ? { status: filterStatus } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user:   { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    }),
    prisma.payment.aggregate({ where: { status: "approved" }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: "approved", createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
    prisma.payment.count(),
  ]);

  const totalReceita   = totalApproved._sum.amount ?? 0;
  const mesReceita     = monthApproved._sum.amount ?? 0;
  const totalPendente  = payments.filter(p => p.status === "pending").length;

  const cardStyle = {
    borderRadius: 18, padding: "22px 24px",
    background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
    border: "1px solid rgba(201,169,122,0.12)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
  };

  const filterBtnBase: React.CSSProperties = {
    padding: "7px 18px", borderRadius: 10, fontSize: 11,
    fontFamily: "'Cinzel',serif", fontWeight: 600, letterSpacing: 1.5,
    textTransform: "uppercase", textDecoration: "none", cursor: "pointer",
    border: "1px solid rgba(201,169,122,0.20)",
  };

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      {/* Header */}
      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Admin</div>
        <h1 className="ka-page-title">Relatório <span>Financeiro</span></h1>
        <p className="ka-page-subtitle">{totalCount} transação{totalCount !== 1 ? "s" : ""} registrada{totalCount !== 1 ? "s" : ""}</p>
      </div>

      <div style={{ padding: "0 44px 48px" }}>

        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            {
              eyebrow: "Receita do Mês",
              value: fmt(mesReceita),
              sub: new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" }),
              accent: "#6ee7b7",
            },
            {
              eyebrow: "Receita Total",
              value: fmt(totalReceita),
              sub: "Todos os tempos",
              accent: "#C9A97A",
            },
            {
              eyebrow: "Pendentes",
              value: String(totalPendente),
              sub: "Aguardando confirmação",
              accent: "#FBBF24",
            },
          ].map(({ eyebrow, value, sub, accent }) => (
            <div key={eyebrow} style={cardStyle}>
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: accent, marginBottom: 10 }}>
                {eyebrow}
              </p>
              <p style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 30, color: "var(--text-primary)", letterSpacing: 1, marginBottom: 4 }}>
                {value}
              </p>
              <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontFamily: "'Cinzel',serif", letterSpacing: 2, color: "var(--text-muted)", textTransform: "uppercase", marginRight: 4 }}>
            Filtrar:
          </span>
          {[
            { value: undefined, label: "Todos" },
            { value: "approved", label: "Aprovados" },
            { value: "pending",  label: "Pendentes" },
            { value: "rejected", label: "Recusados" },
            { value: "cancelled",label: "Cancelados" },
          ].map(opt => {
            const isActive = filterStatus === opt.value || (!filterStatus && !opt.value);
            return (
              <Link
                key={opt.label}
                href={opt.value ? `/admin/financeiro?status=${opt.value}` : "/admin/financeiro"}
                style={{
                  ...filterBtnBase,
                  background: isActive ? "linear-gradient(135deg, rgba(201,169,122,0.20), rgba(201,169,122,0.08))" : "rgba(255,255,255,0.03)",
                  color: isActive ? "var(--gold-light)" : "rgba(255,255,255,0.40)",
                  borderColor: isActive ? "rgba(201,169,122,0.35)" : "rgba(255,255,255,0.08)",
                }}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>

        {/* Table */}
        <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(201,169,122,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }}>

          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1.4fr 100px 110px 90px",
            padding: "12px 24px", gap: 12,
            background: "rgba(201,169,122,0.04)",
            borderBottom: "1px solid rgba(201,169,122,0.10)",
          }}>
            {["Aluno", "Curso", "Valor", "Status", "Data"].map(h => (
              <span key={h} style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)" }}>
                {h}
              </span>
            ))}
          </div>

          {payments.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)" }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Nenhuma transação encontrada.</p>
            </div>
          ) : (
            <div style={{ background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)" }}>
              {payments.map((p, i) => {
                const s = STATUS_LABEL[p.status] ?? STATUS_LABEL.pending;
                return (
                  <div
                    key={p.id}
                    style={{
                      display: "grid", gridTemplateColumns: "1fr 1.4fr 100px 110px 90px",
                      padding: "14px 24px", gap: 12, alignItems: "center",
                      borderTop: i > 0 ? "1px solid rgba(201,169,122,0.06)" : "none",
                      transition: "background 0.15s",
                    }}
                    className="admin-row-hover"
                  >
                    {/* Aluno */}
                    <div style={{ minWidth: 0 }}>
                      <Link href={`/admin/alunos/${p.user.id}`} style={{ textDecoration: "none" }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.user.name}
                        </p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.user.email}
                        </p>
                      </Link>
                    </div>

                    {/* Curso */}
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.course.title}
                    </p>

                    {/* Valor */}
                    <p style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 14, color: "var(--gold-light)" }}>
                      {fmt(p.amount)}
                    </p>

                    {/* Status */}
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "4px 10px", borderRadius: 999,
                      background: s.bg, color: s.color,
                      fontSize: 10, fontWeight: 600, letterSpacing: 1,
                      fontFamily: "'Cinzel',serif", textTransform: "uppercase",
                      width: "fit-content",
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                      {s.label}
                    </span>

                    {/* Data */}
                    <p style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
