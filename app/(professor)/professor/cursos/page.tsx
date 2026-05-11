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

      <div className="ka-section" style={{ padding: "32px 44px 44px" }}>
        
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
            <div>
              {courses.map((course, i) => (
                <Link key={course.id} href={`/professor/cursos/${course.id}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "18px 24px",
                    borderTop: i > 0 ? "1px solid rgba(201,169,122,0.06)" : "none",
                    display: "flex", alignItems: "center", gap: 20,
                    transition: "background 0.2s",
                    cursor: "pointer",
                  }} className="admin-row-hover">
                    <div style={{ 
                      width: 60, height: 60, borderRadius: 14, overflow: "hidden", flexShrink: 0,
                      background: "rgba(201,169,122,0.05)", border: "1px solid rgba(201,169,122,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {course.thumbnail ? (
                        <img src={getGoogleDriveImageUrl(course.thumbnail)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <BookOpen size={24} color="var(--gold-light)" />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 17, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{course.title}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{course._count.enrollments} alunos matriculados</p>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Criado em {new Date(course.createdAt).toLocaleDateString("pt-BR")}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
                        color: "var(--gold)", fontFamily: "'Cinzel',serif",
                        padding: "6px 16px", borderRadius: 10, background: "rgba(201,169,122,0.10)",
                        border: "1px solid rgba(201,169,122,0.25)"
                      }}>
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
