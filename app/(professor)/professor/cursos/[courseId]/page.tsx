import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import CourseEditor from "@/components/admin/course-editor";
import { auth } from "@/lib/auth";

export default async function ProfessorEditCursoPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const session = await auth();
  const userId = session?.user.id;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!course) notFound();

  // Security check: only the assigned teacher (or admin) can edit
  if (course.teacherId !== userId && session?.user.role !== "ADMIN") {
    redirect("/professor");
  }

  // Teachers don't need the list of all teachers
  const teachers = [{ id: course.teacherId!, name: session?.user.name! }];

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      <Link href="/professor" className="ka-back-link">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Painel
      </Link>
      <div className="ka-section" style={{ padding: "16px 44px 44px" }}>
        <CourseEditor course={course as any} teachers={teachers} isAdmin={false} />
      </div>
    </div>
  );
}
