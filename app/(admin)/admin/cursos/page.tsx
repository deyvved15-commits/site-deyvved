import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteCourseButton from "@/components/admin/delete-course-button";
import { getGoogleDriveImageUrl } from "@/lib/utils";

export default async function CursosPage() {
  const courses = await prisma.course.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { enrollments: true } },
      modules: { include: { _count: { select: { lessons: true } } } },
    },
  });

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      {/* Header */}
      <div className="ka-page-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div className="ka-page-eyebrow">Gestão</div>
          <h1 className="ka-page-title">Meus <span>Cursos</span></h1>
          <p className="ka-page-subtitle">{courses.length} curso{courses.length !== 1 ? "s" : ""} cadastrado{courses.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/cursos/novo" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 20px", borderRadius: 12,
          background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
          color: "var(--navy-darkest)", fontFamily: "'Cinzel',serif",
          fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
          textDecoration: "none", boxShadow: "0 4px 16px rgba(201,169,122,0.35)",
          transition: "all 0.2s",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Novo Curso
        </Link>
      </div>

      <div className="ka-section" style={{ padding: "32px 44px 44px" }}>
        {courses.length === 0 ? (
          <div style={{
            borderRadius: 20, padding: "56px 32px", textAlign: "center", maxWidth: 380,
            background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
            border: "1px solid rgba(201,169,122,0.12)",
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ color: "rgba(201,169,122,0.25)", margin: "0 auto 16px", display: "block" }}>
              <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5a2.5 2.5 0 0 0 0 5H20"/>
            </svg>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Nenhum curso cadastrado</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.6 }}>Crie o primeiro curso da plataforma</p>
            <Link href="/admin/cursos/novo" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "9px 18px", borderRadius: 10,
              background: "rgba(201,169,122,0.12)", border: "1px solid var(--gold-35)",
              color: "var(--gold-light)", fontSize: 12, fontWeight: 600, textDecoration: "none",
            }}>
              + Criar primeiro curso
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {courses.map(course => {
              const totalLessons = course.modules.reduce((a, m) => a + m._count.lessons, 0);
              const thumbUrl = course.thumbnail?.includes("drive.google.com")
                ? getGoogleDriveImageUrl(course.thumbnail)
                : course.thumbnail;
              return (
                <div key={course.id} style={{
                  borderRadius: 16, overflow: "hidden",
                  background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
                  border: "1px solid rgba(201,169,122,0.10)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.30)",
                  display: "flex", alignItems: "center", gap: 18, padding: "16px 20px",
                  transition: "all 0.3s",
                }}
                className="admin-row-hover">
                  {/* Thumbnail */}
                  <div style={{
                    width: 60, height: 74, borderRadius: 10, flexShrink: 0, overflow: "hidden",
                    background: "linear-gradient(140deg, #0A1129, #14215A)",
                    border: "1px solid rgba(201,169,122,0.10)",
                    display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
                  }}>
                    {thumbUrl
                      ? <img src={thumbUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", position: "absolute", inset: 0 }} />
                      : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgba(201,169,122,0.20)" }}>
                          <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5a2.5 2.5 0 0 0 0 5H20"/>
                        </svg>}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'Cinzel',serif", letterSpacing: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {course.title}
                      </h2>
                      <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
                        padding: "2px 8px", borderRadius: 999, flexShrink: 0,
                        background: course.published ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${course.published ? "rgba(52,211,153,0.25)" : "rgba(255,255,255,0.08)"}`,
                        color: course.published ? "#6ee7b7" : "rgba(255,255,255,0.30)",
                      }}>
                        {course.published ? "Publicado" : "Rascunho"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      {[
                        { icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14l4-4V5c0-1.1-.9-2-2-2zM12 17v-6m0 0V7m0 4h4m-4 0H8", label: `${course.modules.length} módulos` },
                        { icon: "M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5a2.5 2.5 0 0 0 0 5H20", label: `${totalLessons} aulas` },
                        { icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", label: `${course._count.enrollments} alunos` },
                      ].map(({ label }) => (
                        <span key={label} style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <Link href={`/admin/cursos/${course.id}`} style={{
                      padding: "7px 16px", borderRadius: 10,
                      background: "rgba(201,169,122,0.10)", border: "1px solid var(--gold-20)",
                      color: "var(--gold-light)", fontSize: 12, fontWeight: 600,
                      letterSpacing: 1, textDecoration: "none", transition: "all 0.2s",
                    }}>
                      Editar
                    </Link>
                    <DeleteCourseButton id={course.id} title={course.title} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
