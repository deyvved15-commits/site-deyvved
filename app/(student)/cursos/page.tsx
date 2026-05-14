import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getGoogleDriveImageUrl } from "@/lib/utils";
import CourseThumbnail from "@/components/student/course-thumbnail";
import CategoryFilter from "@/components/student/category-filter";
import CourseCard from "@/components/student/course-card";

export default async function CursosPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const session = await auth();
  if (!session) return null;
  const { categoria } = await searchParams;

  const [enrollments, taughtCourses, otherCourses] = await Promise.all([
    prisma.enrollment.findMany({
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
    }),
    prisma.course.findMany({
      where: { teachers: { some: { teacherId: session.user.id } } },
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
    }),
    prisma.course.findMany({
      where: {
        published: true,
        enrollments: { none: { userId: session.user.id } },
        teachers: { none: { teacherId: session.user.id } },
      },
      select: {
        id: true, title: true, thumbnail: true, price: true, slug: true, category: true,
        _count: { select: { modules: true, enrollments: true } },
        modules: { include: { _count: { select: { lessons: true } } } },
      },
      orderBy: { order: "asc" },
    }),
  ]);

  const combinedCourses = [
    ...enrollments.map(e => e.course),
    ...taughtCourses.filter(tc => !enrollments.some(e => e.courseId === tc.id))
  ].filter(Boolean);

  const allCategories = Array.from(new Set([
    ...combinedCourses.map(c => (c as any).category),
    ...otherCourses.map(c => c.category)
  ].filter(Boolean))) as string[];

  const filteredMyCourses = categoria 
    ? combinedCourses.filter(c => (c as any).category === categoria)
    : combinedCourses;

  const filteredOtherCourses = categoria
    ? otherCourses.filter(c => c.category === categoria)
    : otherCourses;

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      {/* Header */}
      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Minha Jornada</div>
        <h1 className="ka-page-title">Meus <span>Cursos</span></h1>
        <p className="ka-page-subtitle">Acesse seus conteúdos e descubra novas possibilidades.</p>
      </div>

      <div className="ka-section" style={{ padding: "38px 44px 44px" }}>
        {allCategories.length > 0 && <CategoryFilter categories={allCategories} />}

        {/* ── Meus Cursos ── */}
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

        {filteredMyCourses.length === 0 ? (
          <div style={{
            borderRadius: 20, padding: "56px 32px", textAlign: "center", maxWidth: 380,
            background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
            border: "1px solid rgba(201,169,122,0.12)", marginBottom: 48
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 32, marginBottom: 48 }}>
            {filteredMyCourses.map((course: any) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                isEnrolled={true} 
                expiresAt={enrollments.find(e => e.courseId === course.id)?.expiresAt}
              />
            ))}
          </div>
        )}

        {/* ── Divider ── */}
        {(filteredMyCourses.length > 0 || otherCourses.length > 0) && (
          <div style={{ height: 1, margin: "48px 0", background: "linear-gradient(90deg, transparent 0%, rgba(201,169,122,0.18) 30%, rgba(201,169,122,0.18) 70%, transparent 100%)", position: "relative" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "var(--navy-mid)", padding: "0 16px" }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)", boxShadow: "0 0 6px var(--gold)", display: "block" }} />
            </div>
          </div>
        )}

        {/* ── Vitrine de Cursos ── */}
        {filteredOtherCourses.length > 0 && (
          <div>
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 32 }}>
              {filteredOtherCourses.map((course: any) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  isEnrolled={false} 
                />
              ))}
            </div>
          </div>
        )}

        {filteredMyCourses.length === 0 && filteredOtherCourses.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
            Nenhum curso encontrado com os filtros atuais.
          </div>
        )}
      </div>
    </div>
  );
}
