import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getGoogleDriveImageUrl } from "@/lib/utils";

export default async function ProfessorCursosPage() {
  const session = await auth();
  const userId = session?.user.id;

  const courses = await prisma.course.findMany({
    where: { teacherId: userId },
    include: {
      _count: {
        select: { enrollments: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      
      {/* Header */}
      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Gerenciamento</div>
        <h1 className="ka-page-title">Meus <span>Cursos</span></h1>
        <p className="ka-page-subtitle">Você possui {courses.length} curso{courses.length !== 1 ? "s" : ""} sob sua responsabilidade.</p>
      </div>

      <div className="ka-section">
        
        <div style={{ 
          borderRadius: 20, overflow: "hidden", 
          background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
          border: "1px solid rgba(201,169,122,0.12)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        }}>
          {courses.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Nenhum curso associado encontrado.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {courses.map((course, i) => (
                <Link key={course.id} href={`/professor/cursos/${course.id}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "24px",
                    borderTop: i > 0 ? "1px solid rgba(201,169,122,0.06)" : "none",
                    display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20,
                    transition: "background 0.2s",
                    cursor: "pointer",
                  }} className="admin-row-hover">
                    <div style={{ 
                      width: 70, height: 70, borderRadius: 16, overflow: "hidden", flexShrink: 0,
                      background: "rgba(201,169,122,0.05)", border: "1px solid rgba(201,169,122,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {course.thumbnail ? (
                        <img src={getGoogleDriveImageUrl(course.thumbnail)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <BookOpen size={28} color="var(--gold-light)" />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: "220px" }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, fontFamily: "'Cinzel',serif" }}>{course.title}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Users size={12} color="var(--gold)" />
                          <p style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{course._count.enrollments} alunos</p>
                        </div>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} className="hidden sm:block" />
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Clock size={12} color="var(--text-muted)" />
                          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(course.createdAt).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                    </div>
                    <div style={{ width: "100%", display: "block" }} className="md:w-auto">
                      <span style={{
                        width: "100%", display: "inline-flex", justifyContent: "center",
                        fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase",
                        color: "var(--gold)", fontFamily: "'Cinzel',serif",
                        padding: "12px 20px", borderRadius: 12, background: "rgba(201,169,122,0.10)",
                        border: "1px solid rgba(201,169,122,0.25)", transition: "all 0.2s"
                      }} className="btn-gold-hover">
                        Gerenciar Conteúdo
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
