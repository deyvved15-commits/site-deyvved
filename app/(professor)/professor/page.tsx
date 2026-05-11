import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, DollarSign, Users } from "lucide-react";
import { getGoogleDriveImageUrl } from "@/lib/utils";

export default async function ProfessorDashboard() {
  const session = await auth();
  const userId = session?.user.id;
  const userName = session?.user.name?.toUpperCase() || "";

  const [courses, payments, topLessons] = await Promise.all([
    prisma.course.findMany({
      where: { teacherId: userId },
      include: {
        _count: {
          select: { enrollments: true }
        }
      }
    }),
    prisma.payment.findMany({
      where: {
        course: { teacherId: userId },
        status: "approved"
      },
      select: { commissionAmount: true }
    }),
    prisma.lesson.findMany({
      where: { module: { course: { teacherId: userId } } },
      include: {
        _count: { select: { progress: { where: { completed: true } } } },
        module: { select: { course: { select: { title: true } } } }
      },
      orderBy: { progress: { _count: "desc" } },
      take: 5
    })
  ]);

  const totalCommission = payments.reduce((sum, p) => sum + (p.commissionAmount ?? 0), 0);
  const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);

  const stats = [
    {
      label: "Cursos", value: courses.length, icon: <BookOpen size={18} />, color: "var(--gold)", href: "/professor/cursos"
    },
    {
      label: "Total Alunos", value: totalStudents, icon: <Users size={18} />, color: "#6ee7b7", href: "#"
    },
    {
      label: "Minhas Comissões", 
      value: `R$ ${totalCommission.toFixed(2).replace(".", ",")}`, 
      icon: <DollarSign size={18} />, 
      color: "#63B3ED",
      isCurrency: true,
      href: "/professor/financeiro"
    },
  ];

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      
      {/* Header */}
      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Painel do Professor</div>
        <h1 className="ka-page-title">Bem-vindo, <span>{userName}</span></h1>
        <p className="ka-page-subtitle">Gerencie seus cursos e acompanhe seus resultados.</p>
      </div>

      <div className="ka-section">
        
        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 32 }}>
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href} style={{ textDecoration: "none" }}>
              <div style={{
                borderRadius: 18, padding: "24px 24px 20px",
                background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
                border: "1px solid rgba(201,169,122,0.12)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                cursor: "pointer",
                height: "100%"
              }} className="admin-stat-card">
                <div style={{
                  width: 40, height: 40, borderRadius: 12, marginBottom: 18,
                  background: "linear-gradient(135deg, rgba(201,169,122,0.18), rgba(201,169,122,0.06))",
                  border: "1px solid var(--gold-20)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: stat.color,
                  boxShadow: "0 0 14px rgba(201,169,122,0.12)",
                }}>
                  {stat.icon}
                </div>
                <p style={{
                  fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: stat.isCurrency ? 28 : 38,
                  color: "white", lineHeight: 1, marginBottom: 6,
                  letterSpacing: 1,
                }}>
                  {stat.value}
                </p>
                <p style={{
                  fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600,
                  letterSpacing: 4, textTransform: "uppercase", color: "var(--gold)",
                }}>
                  {stat.label}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {/* Column 1: Courses */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 3, height: 16, background: "var(--gold)", borderRadius: 2 }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
                Meus Cursos
              </span>
            </div>

            <div style={{ 
              borderRadius: 20, overflow: "hidden", 
              background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
              border: "1px solid rgba(201,169,122,0.12)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            }}>
              {courses.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Você ainda não possui cursos associados.</p>
                </div>
              ) : (
                <div>
                  {courses.map((course, i) => (
                    <Link key={course.id} href={`/professor/cursos/${course.id}`} style={{ textDecoration: "none" }}>
                      <div style={{
                        padding: "20px 24px",
                        borderTop: i > 0 ? "1px solid rgba(201,169,122,0.06)" : "none",
                        display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16,
                        transition: "background 0.2s",
                        cursor: "pointer",
                      }} className="admin-row-hover">
                        <div style={{ 
                          width: 48, height: 48, borderRadius: 12, overflow: "hidden", flexShrink: 0,
                          background: "rgba(201,169,122,0.05)", border: "1px solid rgba(201,169,122,0.15)",
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                          {course.thumbnail ? (
                            <img src={getGoogleDriveImageUrl(course.thumbnail)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <BookOpen size={20} color="var(--gold-light)" />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: "180px" }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{course.title}</p>
                          <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{course._count.enrollments} alunos matriculados</p>
                        </div>
                        <div style={{ textAlign: "right", minWidth: 80 }} className="md:w-auto w-full">
                          <span style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
                            color: "var(--gold)", fontFamily: "'Cinzel',serif",
                            padding: "6px 14px", borderRadius: 8, background: "rgba(201,169,122,0.10)",
                            border: "1px solid rgba(201,169,122,0.20)", display: "inline-flex", width: "100%", justifyContent: "center"
                          }}>
                            Editar
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Metrics */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 3, height: 16, background: "#6ee7b7", borderRadius: 2 }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
                Engajamento (Top Aulas)
              </span>
            </div>

            <div style={{ 
              borderRadius: 20, padding: "16px 20px",
              background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
              border: "1px solid rgba(201,169,122,0.12)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            }}>
              {topLessons.length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--text-muted)", padding: "20px 0", textAlign: "center" }}>Nenhuma aula assistida ainda.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {topLessons.map((l, i) => (
                    <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.15)", fontFamily: "'Cinzel',serif", width: 14 }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 1 }}>{l.title}</p>
                        <p style={{ fontSize: 10, color: "rgba(201,169,122,0.6)", textTransform: "uppercase", letterSpacing: 1 }}>{l.module.course.title}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#6ee7b7" }}>{l._count.progress}</p>
                        <p style={{ fontSize: 8, color: "var(--text-muted)", textTransform: "uppercase" }}>conclusões</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
