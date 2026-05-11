import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getGoogleDriveImageUrl } from "@/lib/utils";
import CourseThumbnail from "@/components/student/course-thumbnail";
import CategoryFilter from "@/components/student/category-filter";

export default async function CursosPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const session = await auth();
  if (!session) return null;
  const { categoria } = await searchParams;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                orderBy: { order: "asc" },
                include: { progress: { where: { userId: session.user.id } } },
              },
            },
          },
        },
      },
    },
  });

  const allCategories = Array.from(new Set(enrollments.map(e => e.course?.category).filter(Boolean))) as string[];
  const filteredEnrollments = categoria 
    ? enrollments.filter(e => e.course?.category === categoria)
    : enrollments;

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      {/* Header */}
      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Minha Jornada</div>
        <h1 className="ka-page-title">Meus <span>Cursos</span></h1>
        <p className="ka-page-subtitle">
          {enrollments.length === 0
            ? "Nenhum curso matriculado ainda"
            : `${filteredEnrollments.length} curso${filteredEnrollments.length > 1 ? "s" : ""} encontrado${filteredEnrollments.length > 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="ka-section" style={{ padding: "0 44px 44px" }}>
        {allCategories.length > 0 && <CategoryFilter categories={allCategories} />}
        {enrollments.length === 0 ? (
          <div style={{
            borderRadius: 20, padding: "56px 32px", textAlign: "center", maxWidth: 380,
            background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
            border: "1px solid rgba(201,169,122,0.12)",
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ color: "rgba(201,169,122,0.25)", margin: "0 auto 16px", display: "block" }}>
              <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5a2.5 2.5 0 0 0 0 5H20"/>
            </svg>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Nenhum curso ainda</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>Entre em contato com a administração para se matricular.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 280px))", gap: 24 }}>
            {filteredEnrollments.map(({ course }) => {
              if (!course) return null;
              const allLessons = course.modules?.flatMap(m => m.lessons) ?? [];
              const done = allLessons.filter(l => l.progress[0]?.completed).length;
              const total = allLessons.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const nextLesson = allLessons.find(l => !l.progress[0]?.completed) ?? allLessons[0];
              const thumbnailUrl = course.thumbnail?.includes("drive.google.com")
                ? getGoogleDriveImageUrl(course.thumbnail)
                : course.thumbnail;
              const label = pct > 0 && pct < 100 ? "Continuar" : pct === 100 ? "Rever" : "Começar";

              return (
                <article key={course.id} className="ka-card">
                  <div className="ka-thumb">
                    {thumbnailUrl && <CourseThumbnail src={thumbnailUrl} alt={course.title} />}
                    <div className="ka-thumb-mark">
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6.5C2 5.67 2.67 5 3.5 5H8c1.66 0 3 1.34 3 3v12c0-1.1-.9-2-2-2H3.5c-.83 0-1.5-.67-1.5-1.5v-10z"/>
                        <path d="M22 6.5C22 5.67 21.33 5 20.5 5H16c-1.66 0-3 1.34-3 3v12c0-1.1.9-2 2-2h5.5c.83 0 1.5-.67 1.5-1.5v-10z"/>
                      </svg>
                    </div>
                    <div className="ka-progress-badge">{pct}%</div>
                    {nextLesson && (
                      <Link href={`/cursos/${course.slug}/aula/${nextLesson.id}`} className="ka-play-overlay">
                        <div className="ka-play-circle">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </Link>
                    )}
                  </div>

                  <div style={{ padding: "20px 22px 22px" }}>
                    <h3 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 16, letterSpacing: 1.5, color: "var(--text-primary)", marginBottom: 6, lineHeight: 1.3 }}>
                      {course.title}
                    </h3>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)", boxShadow: "0 0 4px var(--gold)", flexShrink: 0 }} />
                      {done}/{total} aula{total !== 1 ? "s" : ""} concluída{done !== 1 ? "s" : ""}
                    </div>
                    <div className="ka-progress-bar" style={{ marginBottom: 16 }}>
                      <div className="ka-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    {nextLesson ? (
                      <Link href={`/cursos/${course.slug}/aula/${nextLesson.id}`} className="ka-continue-btn">
                        {label}
                        <span style={{ transition: "transform 0.2s" }}>→</span>
                      </Link>
                    ) : (
                      <Link href={`/cursos/${course.slug}`} className="ka-continue-btn">
                        Ver Curso →
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
