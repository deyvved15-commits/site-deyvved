import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import CourseEditor from "@/components/admin/course-editor";

export default async function EditCursoPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  const [course, teachers] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId },
      include: {
        teachers: {
          include: {
            teacher: { select: { id: true, name: true } }
          }
        },
        modules: {
          orderBy: { order: "asc" },
          include: { lessons: { orderBy: { order: "asc" } } },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ["TEACHER", "ADMIN"] } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!course) notFound();

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      <Link href="/admin/cursos" className="ka-back-link">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Cursos
      </Link>
      <div className="ka-section ka-course-editor-section" style={{ padding: "16px 44px 44px" }}>
        <CourseEditor course={course as any} teachers={teachers} />
      </div>
    </div>
  );
}
