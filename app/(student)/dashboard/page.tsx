import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import HeroSection from "@/components/student/hero-section";
import SectionHeader from "@/components/student/section-header";
import CourseCard from "@/components/student/course-card";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;

  const [enrollments, otherCourses] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: { include: { progress: { where: { userId: session.user.id } } } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.course.findMany({
      where: {
        published: true,
        enrollments: { none: { userId: session.user.id } },
      },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        price: true,
        slug: true,
        _count: { select: { modules: true, enrollments: true } },
        modules: { include: { _count: { select: { lessons: true } } } },
      },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      
      <HeroSection userName={session.user.name ?? "Aluno"} />

      {/* ── Meus Cursos ── */}
      <section className="ka-section" style={{ position: "relative", zIndex: 1, padding: "38px 44px 44px" }}>
        <SectionHeader 
          title="Meus" 
          highlight="Cursos" 
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5a2.5 2.5 0 0 0 0 5H20"/>
              <path d="M8 7h8M8 11h6"/>
            </svg>
          } 
        />

        {enrollments.length === 0 ? (
          <div style={{ 
            borderRadius: 20, padding: "56px 32px", textAlign: "center", maxWidth: 380, 
            background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)", 
            border: "1px solid rgba(201,169,122,0.12)" 
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgba(201,169,122,0.25)", margin: "0 auto 16px", display: "block" }}>
              <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5a2.5 2.5 0 0 0 0 5H20"/>
            </svg>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Nenhum curso ainda</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>Entre em contato com a administração para se matricular.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 280px))", gap: 24 }}>
            {enrollments.map(({ course, expiresAt }) => (
              <CourseCard key={course.id} course={course} isEnrolled={true} expiresAt={expiresAt} />
            ))}
          </div>
        )}
      </section>

      {/* ── Vitrine de Cursos ── */}
      {otherCourses.length > 0 && (
        <section className="ka-section" style={{ padding: "0 44px 56px" }}>
          {/* Divider */}
          <div style={{ height: 1, marginBottom: 36, background: "linear-gradient(90deg, transparent 0%, rgba(201,169,122,0.18) 30%, rgba(201,169,122,0.18) 70%, transparent 100%)", position: "relative" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "var(--navy-mid)", padding: "0 16px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)", boxShadow: "0 0 6px var(--gold)" }} />
              </span>
            </div>
          </div>

          <SectionHeader 
            title="Cursos que você pode" 
            highlight="gostar" 
            subtitle="Entre em contato com a administração para se matricular"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            } 
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 280px))", gap: 24 }}>
            {otherCourses.map(course => (
              <CourseCard key={course.id} course={course} isEnrolled={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
