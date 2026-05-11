import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, DollarSign, Users, MessageSquare } from "lucide-react";

export default async function ProfessorDashboard() {
  const session = await auth();
  const userId = session?.user.id;

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

  const cardStyle = {
    borderRadius: 18,
    padding: "22px 24px",
    background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
    border: "1px solid rgba(201,169,122,0.12)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
  };

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Painel do Professor</div>
        <h1 className="ka-page-title">Bem-vindo, <span>{session?.user.name}</span></h1>
        <p className="ka-page-subtitle">Gerencie seus cursos e acompanhe seus resultados.</p>
      </div>

      <div style={{ padding: "0 44px 48px" }}>
        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          <div style={cardStyle}>
            <div style={{ color: "var(--gold)", marginBottom: 12 }}><BookOpen size={24} /></div>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>Cursos</p>
            <p style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 32, color: "var(--text-primary)" }}>{courses.length}</p>
          </div>
          <div style={cardStyle}>
            <div style={{ color: "#6ee7b7", marginBottom: 12 }}><Users size={24} /></div>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>Total Alunos</p>
            <p style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 32, color: "var(--text-primary)" }}>{totalStudents}</p>
          </div>
          <div style={cardStyle}>
            <div style={{ color: "#63B3ED", marginBottom: 12 }}><DollarSign size={24} /></div>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>Minhas Comissões</p>
            <p style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 32, color: "var(--text-primary)" }}>
              R$ {totalCommission.toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>

        {/* Recent Courses Section */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 3, height: 18, background: "var(--gold-gradient)", borderRadius: 2 }} />
          <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>Meus Cursos</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {courses.map(course => (
            <Link key={course.id} href={`/professor/cursos/${course.id}`} style={{ textDecoration: "none" }}>
              <div style={{ ...cardStyle, transition: "transform 0.2s, border-color 0.2s" }} className="admin-row-hover">
                <div style={{ display: "flex", gap: 16 }}>
                  {course.thumbnail && (
                    <img src={course.thumbnail} alt={course.title} style={{ width: 80, height: 45, borderRadius: 8, objectFit: "cover" }} />
                  )}
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{course.title}</h3>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{course._count.enrollments} alunos matriculados</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {courses.length === 0 && (
            <div style={{ ...cardStyle, textAlign: "center", gridColumn: "1 / -1", padding: "48px" }}>
              <p style={{ color: "var(--text-muted)" }}>Você ainda não possui cursos associados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
