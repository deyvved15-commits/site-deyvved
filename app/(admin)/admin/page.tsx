import { prisma } from "@/lib/prisma";
import Link from "next/link";

function fmt(v: number) {
  return "R$ " + v.toFixed(2).replace(".", ",");
}

export default async function AdminDashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const in7Days = new Date(now.getTime() + 7 * 86400000);

  const [
    totalCourses, totalStudents, totalLessons, totalProducts,
    recentStudents, openTickets, churnCount,
    monthRevenue, lastMonthRevenue, totalRevenue,
    pendingCommissions, activeEnrollments, expiringSoon,
    recentPayments, monthsRevenue,
  ] = await Promise.all([
    prisma.course.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.lesson.count(),
    prisma.product.count(),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true, church: true, enrollments: { select: { courseId: true } } },
    }),
    prisma.ticket.count({ where: { status: { in: ["open", "in_progress"] } } }),
    prisma.user.count({ where: { role: "STUDENT", active: false } }),
    prisma.payment.aggregate({ where: { status: "approved", createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: "approved", createdAt: { gte: startOfLastMonth, lt: startOfMonth } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: "approved" }, _sum: { amount: true } }),
    prisma.teacherEarning.aggregate({ where: { paidAt: null }, _sum: { amount: true } }),
    prisma.enrollment.count({ where: { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] } }),
    prisma.enrollment.findMany({
      where: { expiresAt: { gte: now, lte: in7Days } },
      select: { id: true, expiresAt: true, user: { select: { name: true } }, course: { select: { title: true } } },
      orderBy: { expiresAt: "asc" },
      take: 5,
    }),
    prisma.payment.findMany({
      where: { status: "approved" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true, amount: true, createdAt: true,
        user: { select: { name: true } },
        course: { select: { title: true } },
        product: { select: { title: true } },
      },
    }),
    Promise.all(
      Array.from({ length: 6 }).map(async (_, i) => {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1);
        const sum = await prisma.payment.aggregate({
          where: { status: "approved", createdAt: { gte: monthStart, lt: monthEnd } },
          _sum: { amount: true },
        });
        return { label: monthStart.toLocaleDateString("pt-BR", { month: "short" }), total: sum._sum.amount ?? 0 };
      })
    ),
  ]);

  const month = monthRevenue._sum.amount ?? 0;
  const lastMonth = lastMonthRevenue._sum.amount ?? 0;
  const total = totalRevenue._sum.amount ?? 0;
  const pendingComm = pendingCommissions._sum.amount ?? 0;
  const growthPct = lastMonth > 0 ? Math.round(((month - lastMonth) / lastMonth) * 100) : (month > 0 ? 100 : 0);
  const maxMonth = Math.max(...monthsRevenue.map(m => m.total), 1);

  const attentionItems = [
    openTickets > 0 ? { label: `${openTickets} chamado${openTickets !== 1 ? "s" : ""} aberto${openTickets !== 1 ? "s" : ""}`, href: "/admin/tickets", color: "#f87171" } : null,
    pendingComm > 0 ? { label: `${fmt(pendingComm)} em comissões a pagar`, href: "/admin/financeiro", color: "#FBBF24" } : null,
    expiringSoon.length > 0 ? { label: `${expiringSoon.length} matrícula${expiringSoon.length !== 1 ? "s" : ""} expirando em 7 dias`, href: "/admin/churn", color: "#f59e0b" } : null,
  ].filter(Boolean) as { label: string; href: string; color: string }[];

  const financeStats = [
    { label: "Receita do Mês", value: fmt(month), sub: lastMonth > 0 ? `${growthPct >= 0 ? "+" : ""}${growthPct}% vs mês anterior` : "sem comparativo", accent: growthPct >= 0 ? "#6ee7b7" : "#f87171", href: "/admin/financeiro" },
    { label: "Receita Total", value: fmt(total), sub: "todos os tempos", accent: "#C9A97A", href: "/admin/financeiro" },
    { label: "Comissões a Pagar", value: fmt(pendingComm), sub: "pendente de repasse", accent: pendingComm > 0 ? "#FBBF24" : "rgba(255,255,255,0.3)", href: "/admin/financeiro" },
    { label: "Matrículas Ativas", value: String(activeEnrollments), sub: "em dia ou vitalícias", accent: "#63B3ED", href: "/admin/alunos" },
  ];

  const stats = [
    {
      label: "Cursos", value: totalCourses, href: "/admin/cursos",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5a2.5 2.5 0 0 0 0 5H20"/>
          <path d="M8 7h8M8 11h6"/>
        </svg>
      ),
    },
    {
      label: "Produtos", value: totalProducts || 0, href: "/admin/produtos",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      ),
    },
    {
      label: "Alunos", value: totalStudents, href: "/admin/alunos",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      label: "Aulas", value: totalLessons, href: "/admin/cursos",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      ),
    },
    {
      label: "Chamados", value: openTickets || 0, href: "/admin/tickets",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
    },
    {
      label: "Churn", value: churnCount || 0, href: "/admin/churn",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 18l-9-9-7 7-4-4"/>
          <path d="M17 18h6v-6"/>
        </svg>
      ),
    },
  ];

  const cardStyle = {
    borderRadius: 18, padding: "22px 24px",
    background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
    border: "1px solid rgba(201,169,122,0.12)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
  };

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      {/* Header */}
      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Painel de Controle</div>
        <h1 className="ka-page-title">Visão <span>Geral</span></h1>
        <p className="ka-page-subtitle">Gestão da plataforma Kadima Academy</p>
      </div>

      <div className="ka-section" style={{ padding: "32px 44px 44px" }}>

        {/* Precisa de atenção */}
        {attentionItems.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
            {attentionItems.map(item => (
              <Link key={item.label} href={item.href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 999,
                  background: `${item.color}14`, border: `1px solid ${item.color}40`,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: item.color, boxShadow: `0 0 6px ${item.color}`, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: item.color }}>{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Financeiro */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
          {financeStats.map(({ label, value, sub, accent, href }) => (
            <Link key={label} href={href} style={{ textDecoration: "none" }}>
              <div style={cardStyle} className="admin-stat-card">
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: accent, marginBottom: 10 }}>
                  {label}
                </p>
                <p style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 24, color: "var(--text-primary)", letterSpacing: 1, marginBottom: 4 }}>
                  {value}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Gráfico de receita (6 meses) */}
        <div style={{ ...cardStyle, marginBottom: 32, padding: "22px 24px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2, boxShadow: "0 0 8px var(--gold)" }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
              Receita — Últimos 6 Meses
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 140 }}>
            {monthsRevenue.map((m, i) => {
              const h = Math.max(4, Math.round((m.total / maxMonth) * 110));
              const isLast = i === monthsRevenue.length - 1;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'Poppins',sans-serif" }}>
                    {m.total > 0 ? fmt(m.total).replace("R$ ", "").split(",")[0] : ""}
                  </span>
                  <div style={{
                    width: "100%", maxWidth: 48, height: h, borderRadius: "6px 6px 2px 2px",
                    background: isLast ? "linear-gradient(180deg, #E8D5A8, #C9A97A)" : "linear-gradient(180deg, rgba(201,169,122,0.45), rgba(201,169,122,0.18))",
                    boxShadow: isLast ? "0 0 14px rgba(201,169,122,0.35)" : "none",
                    transition: "height 0.3s",
                  }} />
                  <span style={{ fontSize: 10, fontFamily: "'Cinzel',serif", letterSpacing: 1, textTransform: "uppercase", color: isLast ? "var(--gold-light)" : "var(--text-muted)" }}>
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats de conteúdo */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
          {stats.map(({ label, value, href, icon }) => (
            <Link key={label} href={href} style={{ textDecoration: "none" }}>
              <div style={{
                borderRadius: 18, padding: "24px 24px 20px",
                background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
                border: "1px solid rgba(201,169,122,0.12)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                cursor: "pointer",
              }}
              className="admin-stat-card">
                <div style={{
                  width: 40, height: 40, borderRadius: 12, marginBottom: 18,
                  background: "linear-gradient(135deg, rgba(201,169,122,0.18), rgba(201,169,122,0.06))",
                  border: "1px solid var(--gold-20)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--gold-light)",
                  boxShadow: "0 0 14px rgba(201,169,122,0.12)",
                }}>
                  {icon}
                </div>
                <p style={{
                  fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 38,
                  color: "var(--text-primary)", lineHeight: 1, marginBottom: 6,
                  letterSpacing: 1,
                }}>
                  {value}
                </p>
                <p style={{
                  fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600,
                  letterSpacing: 4, textTransform: "uppercase", color: "var(--gold)",
                }}>
                  {label}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }} className="admin-dash-grid">

          {/* Recent students */}
          <div style={{
            borderRadius: 20, overflow: "hidden",
            background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
            border: "1px solid rgba(201,169,122,0.12)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            alignSelf: "flex-start",
          }}>
            {/* Table header */}
            <div style={{
              padding: "16px 24px",
              borderBottom: "1px solid rgba(201,169,122,0.10)",
              background: "rgba(201,169,122,0.03)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2, boxShadow: "0 0 8px var(--gold)" }} />
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
                  Alunos Recentes
                </span>
              </div>
              <Link href="/admin/alunos" style={{
                fontSize: 11, fontWeight: 600, color: "var(--gold)", textDecoration: "none",
                letterSpacing: 1, display: "flex", alignItems: "center", gap: 5,
              }}>
                Ver todos →
              </Link>
            </div>

            {recentStudents.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Nenhum aluno cadastrado ainda.</p>
              </div>
            ) : (
              <div>
                {recentStudents.map((s, i) => {
                  const initials = s.name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";
                  return (
                    <Link key={s.id} href={`/admin/alunos/${s.id}`} style={{ textDecoration: "none" }}>
                      <div style={{
                        padding: "16px 24px",
                        borderTop: i > 0 ? "1px solid rgba(201,169,122,0.06)" : "none",
                        display: "flex", alignItems: "center", gap: 14,
                        flexWrap: "wrap",
                        transition: "background 0.2s",
                        cursor: "pointer",
                      }}
                      className="admin-row-hover">
                        <div style={{
                          width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                          background: "radial-gradient(circle at 30% 30%, var(--gold-bright), var(--gold) 50%, var(--gold-deep))",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 14,
                          color: "var(--navy-darkest)",
                          boxShadow: "0 0 12px rgba(201,169,122,0.30)",
                        }}>
                          {initials}
                        </div>

                        <div style={{ flex: 1, minWidth: "150px" }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{s.name}</p>
                          <p style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.email}</p>
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, flex: 1, minWidth: "200px", justifyContent: "space-between" }}>
                          {s.church ? (
                            <span style={{
                              fontSize: 10, fontWeight: 600, letterSpacing: 1,
                              background: "rgba(201,169,122,0.08)", border: "1px solid var(--gold-20)",
                              color: "var(--gold)", padding: "4px 12px", borderRadius: 999,
                              whiteSpace: "nowrap", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis"
                            }}>
                              {s.church}
                            </span>
                          ) : <div />}

                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--gold-light)", fontFamily: "'Cinzel',serif", whiteSpace: "nowrap" }}>
                              {s.enrollments.length} curso{s.enrollments.length !== 1 ? "s" : ""}
                            </p>
                            <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                              {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent sales */}
          <div style={{
            borderRadius: 20, overflow: "hidden",
            background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
            border: "1px solid rgba(201,169,122,0.12)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            alignSelf: "flex-start",
          }}>
            <div style={{
              padding: "16px 24px",
              borderBottom: "1px solid rgba(201,169,122,0.10)",
              background: "rgba(201,169,122,0.03)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, #6ee7b7, #34d399)", borderRadius: 2, boxShadow: "0 0 8px #6ee7b7" }} />
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
                  Vendas Recentes
                </span>
              </div>
              <Link href="/admin/financeiro" style={{
                fontSize: 11, fontWeight: 600, color: "var(--gold)", textDecoration: "none",
                letterSpacing: 1, display: "flex", alignItems: "center", gap: 5,
              }}>
                Ver todas →
              </Link>
            </div>

            {recentPayments.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Nenhuma venda registrada ainda.</p>
              </div>
            ) : (
              <div>
                {recentPayments.map((p, i) => (
                  <div key={p.id} style={{
                    padding: "14px 24px",
                    borderTop: i > 0 ? "1px solid rgba(201,169,122,0.06)" : "none",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.user.name}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.course?.title || p.product?.title || "Item removido"}
                      </p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 13, color: "#6ee7b7" }}>{fmt(p.amount)}</p>
                      <p style={{ fontSize: 10, color: "var(--text-muted)" }}>{new Date(p.createdAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <style>{`
          @media (max-width: 960px) {
            .admin-dash-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
