import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EnrollButton from "@/components/admin/enroll-button";
import UnenrollButton from "@/components/admin/unenroll-button";
import DeleteStudentButton from "@/components/admin/delete-student-button";

export default async function StudentProfilePage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;

  const [student, allCourses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                modules: {
                  orderBy: { order: "asc" },
                  include: {
                    lessons: {
                      orderBy: { order: "asc" },
                      include: { progress: { where: { userId: studentId } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.course.findMany({ where: { published: true }, select: { id: true, title: true } }),
  ]);

  if (!student) notFound();

  const enrolledIds = student.enrollments.map(e => e.courseId);
  const notEnrolled = allCourses.filter(c => !enrolledIds.includes(c.id));
  const initials = student.name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      {/* Back */}
      <Link href="/admin/alunos" className="ka-back-link">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Alunos
      </Link>

      {/* Profile hero */}
      <div style={{ margin: "16px 20px 0" }}>
        <div style={{
          borderRadius: 20, padding: "24px",
          background: "linear-gradient(135deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
          border: "1px solid rgba(201,169,122,0.14)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.40)",
          display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
            background: "radial-gradient(circle at 30% 30%, var(--gold-bright), var(--gold) 50%, var(--gold-deep))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 22,
            color: "var(--navy-darkest)",
            boxShadow: "0 0 30px rgba(201,169,122,0.40), 0 0 60px rgba(201,169,122,0.15)",
            border: "2px solid var(--gold-light)",
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div className="ka-page-eyebrow" style={{ marginBottom: 4 }}>Perfil do Aluno</div>
            <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 22, letterSpacing: 2, color: "var(--text-primary)", marginBottom: 4 }}>
              {student.name}
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{student.email}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, width: "100%" }} className="md:w-auto">
            {notEnrolled.length > 0 && (
              <EnrollButton studentId={studentId} courses={notEnrolled} />
            )}
            <DeleteStudentButton studentId={studentId} studentName={student.name} />
          </div>
        </div>
      </div>

      <div className="ka-section">

        {/* Info cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Telefone", value: student.phone ?? "—" },
            { label: "Igreja / Org.", value: student.church ?? "—" },
            { label: "Cadastrado em", value: new Date(student.createdAt).toLocaleDateString("pt-BR") },
          ].map(({ label, value }) => (
            <div key={label} style={{
              borderRadius: 14, padding: "16px 20px",
              background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
              border: "1px solid rgba(201,169,122,0.10)",
            }}>
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>
                {label}
              </p>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Course progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2, boxShadow: "0 0 8px var(--gold)" }} />
          <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
            Progresso nos Cursos
          </h2>
        </div>

        {student.enrollments.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "24px 0" }}>Nenhum curso matriculado.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {student.enrollments.map((enrollment) => {
              const { course } = enrollment;
              const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);
              const doneLessons = course.modules.reduce((a, m) => a + m.lessons.filter(l => l.progress[0]?.completed).length, 0);
              const pct = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;

              return (
                <div key={course.id} style={{
                  borderRadius: 16, overflow: "hidden",
                  background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
                  border: "1px solid rgba(201,169,122,0.10)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(201,169,122,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 13, letterSpacing: 1.5, color: "var(--text-primary)", marginBottom: 3 }}>
                        {course.title}
                      </h3>
                      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{doneLessons}/{totalLessons} aulas concluídas</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 22, color: "var(--gold-light)" }}>
                        {pct}%
                      </span>
                      <UnenrollButton enrollmentId={enrollment.id} courseName={course.title} />
                    </div>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.05)" }}>
                    <div className="ka-progress-fill" style={{ width: `${pct}%`, height: "100%" }} />
                  </div>
                  {course.modules.map(mod => (
                    <div key={mod.id} style={{ padding: "12px 20px", borderTop: "1px solid rgba(201,169,122,0.05)" }}>
                      <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>
                        {mod.title}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {mod.lessons.map(lesson => {
                          const done = lesson.progress[0]?.completed;
                          return (
                            <div key={lesson.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {done ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                              ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                  <circle cx="12" cy="12" r="10"/>
                                </svg>
                              )}
                              <span style={{ fontSize: 12, color: done ? "var(--text-secondary)" : "var(--text-muted)" }}>
                                {lesson.title}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
