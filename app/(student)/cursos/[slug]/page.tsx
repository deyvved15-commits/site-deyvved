import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getGoogleDriveImageUrl } from "@/lib/utils";
import CourseThumbnail from "@/components/student/course-thumbnail";
import ModuleCarousel from "@/components/student/module-carousel";

export default async function CursoPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session) return null;
  const { slug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug },
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
  });
  if (!course) notFound();

  const isTeacherOfCourse = course.teacherId === session.user.id;
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
  });
  
  if (!enrollment && !isTeacherOfCourse && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const modules = course.modules || [];
  const mainModules = modules.filter(m => !m.isBonus);
  const allLessons = mainModules.flatMap(m => m.lessons || []);
  const totalDone = allLessons.filter(l => l.progress?.[0]?.completed).length;
  const total = allLessons.length;
  const coursePct = total > 0 ? Math.round((totalDone / total) * 100) : 0;
  const isConcluded = total > 0 && totalDone === total && course.paymentType === "ONE_TIME" && course.hasCertificate;

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      {/* Back */}
      <Link href="/cursos" className="ka-back-link">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Meus Cursos
      </Link>

      {/* Course header strip */}
      <div style={{ margin: "16px 44px 0", borderRadius: 20, overflow: "hidden", position: "relative" }}>
        <div style={{
          height: 120, position: "relative",
          background: "linear-gradient(135deg, #060D1F, #0F1A3D 50%, #060D1F)",
          border: "1px solid rgba(201,169,122,0.14)",
          borderRadius: 20, overflow: "hidden",
          display: "flex", alignItems: "center", padding: "0 32px",
          gap: 24,
        }}>
          {/* Bokeh */}
          <div style={{ position: "absolute", top: -20, right: "20%", width: 160, height: 160, borderRadius: "50%", background: "rgba(201,169,122,0.08)", filter: "blur(40px)", pointerEvents: "none" }} />

          {/* Course thumbnail mini */}
          {course.thumbnail && (
            <div style={{ width: 60, height: 74, borderRadius: 10, overflow: "hidden", flexShrink: 0, position: "relative", border: "1px solid rgba(201,169,122,0.20)" }}>
              <CourseThumbnail src={course.thumbnail.includes("drive.google.com") ? getGoogleDriveImageUrl(course.thumbnail) : course.thumbnail} alt={course.title} />
            </div>
          )}

          <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
            <div className="ka-page-eyebrow" style={{ marginBottom: 4 }}>Curso</div>
            <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 20, letterSpacing: 2, color: "var(--text-primary)", marginBottom: 10, lineHeight: 1.2 }}>
              {course.title}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, maxWidth: 200 }}>
                <div className="ka-progress-bar">
                  <div className="ka-progress-fill" style={{ width: `${coursePct}%` }} />
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold-light)", fontFamily: "'Cinzel',serif" }}>{coursePct}%</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{totalDone}/{total} aulas</span>
            </div>
            {isConcluded && (
              <Link href={`/certificado/${course.id}`} style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "8px 16px", borderRadius: 10,
                background: "linear-gradient(135deg, rgba(110,231,183,0.15), rgba(16,185,129,0.08))",
                border: "1px solid rgba(110,231,183,0.30)",
                color: "#6ee7b7", textDecoration: "none",
                fontSize: 10, fontFamily: "'Cinzel',serif", fontWeight: 700,
                letterSpacing: 2, textTransform: "uppercase",
                marginTop: 10,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Ver Certificado
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Modules grid */}
      <section className="ka-section" style={{ padding: "32px 44px 44px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, rgba(201,169,122,0.20), rgba(201,169,122,0.05))",
            border: "1px solid var(--gold-35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--gold-light)", boxShadow: "0 0 14px rgba(201,169,122,0.18)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 18, letterSpacing: 3, color: "var(--text-primary)", textTransform: "uppercase" }}>
            Módulos do <span style={{ color: "var(--gold-light)" }}>Curso</span>
          </h2>
        </div>

        {course.modules.length === 0 ? (
          <div style={{
            borderRadius: 20, padding: "56px 32px", textAlign: "center", maxWidth: 380,
            background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
            border: "1px solid rgba(201,169,122,0.12)",
          }}>
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Nenhum módulo disponível ainda.</p>
          </div>
        ) : (
          <ModuleCarousel modules={course.modules} slug={slug} />
        )}
      </section>
    </div>
  );
}
