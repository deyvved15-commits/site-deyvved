import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EnrollButton from "@/components/admin/enroll-button";
import UnenrollButton from "@/components/admin/unenroll-button";
import DeleteStudentButton from "@/components/admin/delete-student-button";
import PromoteStudentButton from "@/components/admin/promote-student-button";
import ResetPasswordButton from "@/components/admin/reset-password-button";
import AffiliatePercentageEditor from "@/components/admin/affiliate-percentage-editor";

export default async function StudentProfilePage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;

  const [student, allCourses, activityLogs] = await Promise.all([
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
    prisma.course.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
    prisma.activityLog.findMany({
      where: { userId: studentId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
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
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginLeft: "auto", justifyContent: "flex-end", flexWrap: "wrap" }} className="w-full md:w-auto">
            <EnrollButton studentId={studentId} courses={notEnrolled} />
            <ResetPasswordButton studentId={studentId} />
            <PromoteStudentButton studentId={studentId} studentName={student.name} currentRole={student.role} />
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

        {/* Histórico de Atividade */}
        <div style={{ marginTop: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2, boxShadow: "0 0 8px var(--gold)" }} />
            <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
              Histórico de Atividade
            </h2>
          </div>

          {activityLogs.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "16px 0" }}>Nenhuma atividade registrada ainda.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0, borderRadius: 16, overflow: "hidden", background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)", border: "1px solid rgba(201,169,122,0.10)" }}>
              {activityLogs.map((log, i) => {
                const meta = (() => { try { return log.metadata ? JSON.parse(log.metadata) : null; } catch { return null; } })();
                const config: Record<string, { label: string; icon: string; color: string }> = {
                  LOGIN:          { label: "Login na plataforma",     icon: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3", color: "#60a5fa" },
                  WEEKLY_LESSON:  { label: "Assistiu Aula da Semana", icon: "M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.6C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z M9.75 15.02l5.75-3.02-5.75-3.02v6.04z", color: "#a78bfa" },
                  LIVE_VIEW:      { label: `Acessou Live${meta?.title ? `: ${meta.title}` : ""}`, icon: "M2 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z M22 8l-6 4 6 4V8z", color: "#34d399" },
                  LESSON_VIEW:    { label: `Abriu aula${meta?.lesson ? `: ${meta.lesson}` : ""}`, icon: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z", color: "#f59e0b" },
                  LESSON_COMPLETE:{ label: `Concluiu aula${meta?.lesson ? `: ${meta.lesson}` : ""}`, icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01 9 11.01", color: "#6ee7b7" },
                  PURCHASE:       { label: `Compra realizada${meta?.item ? `: ${meta.item}` : ""}`, icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z", color: "#C9A97A" },
                  PAYMENT_FAILED: { label: `Pagamento recusado${meta?.item ? `: ${meta.item}` : ""}${meta?.reason ? ` · ${meta.reason}` : ""}`, icon: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01", color: "#f87171" },
                };
                const c = config[log.type] ?? { label: log.type, icon: "M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z", color: "rgba(255,255,255,0.40)" };

                return (
                  <div key={log.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: i < activityLogs.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${c.color}14`, border: `1px solid ${c.color}30` }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={c.icon}/>
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{c.label}</p>
                      {meta?.title && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{meta.title}</p>}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {new Date(log.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.20)" }}>
                        {new Date(log.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Afiliado */}
        <div style={{ marginTop: 28 }}>
          <AffiliatePercentageEditor
            studentId={studentId}
            affiliateCode={student.affiliateCode ?? null}
            currentPercentage={student.affiliatePercentage ?? null}
          />
        </div>

      </div>
    </div>
  );
}
