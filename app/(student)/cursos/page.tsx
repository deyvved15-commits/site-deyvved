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

  const [enrollments, taughtCourses] = await Promise.all([
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
      where: { teachers: { some: { id: session.user.id } } },
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
  ]);

  const combinedCourses = [
    ...enrollments.map(e => e.course),
    ...taughtCourses.filter(tc => !enrollments.some(e => e.courseId === tc.id))
  ].filter(Boolean);

  const allCategories = Array.from(new Set(combinedCourses.map(c => (c as any).category).filter(Boolean))) as string[];
  const filteredCourses = categoria 
    ? combinedCourses.filter(c => (c as any).category === categoria)
    : combinedCourses;

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      {/* Header */}
      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Minha Jornada</div>
        <h1 className="ka-page-title">Meus <span>Cursos</span></h1>
        <p className="ka-page-subtitle">
          {combinedCourses.length === 0
            ? "Nenhum curso matriculado ainda"
            : `${filteredCourses.length} curso${filteredCourses.length > 1 ? "s" : ""} encontrado${filteredCourses.length > 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="ka-section" style={{ padding: "0 44px 44px" }}>
        {allCategories.length > 0 && <CategoryFilter categories={allCategories} />}
        {combinedCourses.length === 0 ? (
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 32 }}>
            {filteredCourses.map((course: any) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                isEnrolled={true} 
                expiresAt={enrollments.find(e => e.courseId === course.id)?.expiresAt}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
