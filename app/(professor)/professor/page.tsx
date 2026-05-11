import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, DollarSign, Users } from "lucide-react";

export default async function ProfessorDashboard() {
  const session = await auth();
  const userId = session?.user.id;
  const userName = session?.user.name?.toUpperCase() || "";

  const [courses, payments] = await Promise.all([
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
    })
  ]);

  const totalCommission = payments.reduce((sum, p) => sum + (p.commissionAmount ?? 0), 0);
  const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);

  const stats = [
    {
      label: "Cursos", value: courses.length, icon: <BookOpen size={18} />, color: "var(--gold)"
    },
    {
      label: "Total Alunos", value: totalStudents, icon: <Users size={18} />, color: "#6ee7b7"
    },
    {
      label: "Minhas Comissões", 
      value: `R$ ${totalCommission.toFixed(2).replace(".", ",")}`, 
      icon: <DollarSign size={18} />, 
      color: "#63B3ED",
      isCurrency: true
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

      <div className="ka-section" style={{ padding: "32px 44px 44px" }}>
        
        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{
              borderRadius: 18, padding: "24px 24px 20px",
              background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
              border: "1px solid rgba(201,169,122,0.12)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
              transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
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
                color: "var(--text-primary)", lineHeight: 1, marginBottom: 6,
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
          ))}
        </div>

        {/* Section Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2, boxShadow: "0 0 8px var(--gold)" }} />
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
            Meus Cursos
          </span>
        </div>

        {/* Courses List */}
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
                    padding: "16px 24px",
                    borderTop: i > 0 ? "1px solid rgba(201,169,122,0.06)" : "none",
                    display: "flex", alignItems: "center", gap: 16,
                    transition: "background 0.2s",
                    cursor: "pointer",
                  }} className="admin-row-hover">
                    <div style={{ 
                      width: 48, height: 48, borderRadius: 12, overflow: "hidden", flexShrink: 0,
                      background: "rgba(201,169,122,0.05)", border: "1px solid rgba(201,169,122,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <BookOpen size={20} color="var(--gold-light)" />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{course.title}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{course._count.enrollments} alunos matriculados</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
                        color: "var(--gold)", fontFamily: "'Cinzel',serif",
                        padding: "4px 12px", borderRadius: 8, background: "rgba(201,169,122,0.10)",
                        border: "1px solid rgba(201,169,122,0.20)"
                      }}>
                        Editar Conteúdo
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
