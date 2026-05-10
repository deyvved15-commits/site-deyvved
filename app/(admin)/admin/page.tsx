import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  const [totalCourses, totalStudents, totalLessons, recentStudents] = await Promise.all([
    prisma.course.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.lesson.count(),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true, church: true, enrollments: { select: { courseId: true } } },
    }),
  ]);

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
  ];

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      {/* Header */}
      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Painel de Controle</div>
        <h1 className="ka-page-title">Visão <span>Geral</span></h1>
        <p className="ka-page-subtitle">Gestão da plataforma Kadima Academy</p>
      </div>

      <div className="ka-section" style={{ padding: "32px 44px 44px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
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

        {/* Recent students */}
        <div style={{
          borderRadius: 20, overflow: "hidden",
          background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
          border: "1px solid rgba(201,169,122,0.12)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
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
                      padding: "14px 24px",
                      borderTop: i > 0 ? "1px solid rgba(201,169,122,0.06)" : "none",
                      display: "flex", alignItems: "center", gap: 14,
                      transition: "background 0.2s",
                      cursor: "pointer",
                    }}
                    className="admin-row-hover">
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                        background: "radial-gradient(circle at 30% 30%, var(--gold-bright), var(--gold) 50%, var(--gold-deep))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 12,
                        color: "var(--navy-darkest)",
                        boxShadow: "0 0 12px rgba(201,169,122,0.30)",
                      }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{s.name}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.email}</p>
                      </div>
                      {s.church && (
                        <span style={{
                          fontSize: 10, fontWeight: 600, letterSpacing: 1,
                          background: "rgba(201,169,122,0.08)", border: "1px solid var(--gold-20)",
                          color: "var(--gold)", padding: "3px 10px", borderRadius: 999, flexShrink: 0,
                        }}>
                          {s.church}
                        </span>
                      )}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--gold-light)", fontFamily: "'Cinzel',serif" }}>
                          {s.enrollments.length} curso{s.enrollments.length !== 1 ? "s" : ""}
                        </p>
                        <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                          {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
