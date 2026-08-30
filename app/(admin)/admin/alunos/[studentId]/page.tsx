import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EnrollButton from "@/components/admin/enroll-button";
import UnenrollButton from "@/components/admin/unenroll-button";
import DeleteStudentButton from "@/components/admin/delete-student-button";
import PromoteStudentButton from "@/components/admin/promote-student-button";
import ResetPasswordButton from "@/components/admin/reset-password-button";
import AffiliatePercentageEditor from "@/components/admin/affiliate-percentage-editor";
import RenewEnrollmentButton from "@/components/admin/renew-enrollment-button";

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2, boxShadow: "0 0 8px var(--gold)" }} />
      <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
        {title}
      </h2>
    </div>
  );
}

function InfoCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{
      borderRadius: 14, padding: "16px 20px",
      background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
      border: highlight ? "1px solid rgba(201,169,122,0.25)" : "1px solid rgba(201,169,122,0.10)",
    }}>
      <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>
        {label}
      </p>
      <p style={{ fontSize: 13, fontWeight: 500, color: highlight ? "var(--gold-light)" : "var(--text-primary)" }}>{value}</p>
    </div>
  );
}

const ROLE_LABEL: Record<string, string> = { STUDENT: "Aluno", TEACHER: "Professor", ADMIN: "Administrador" };
const ROLE_COLOR: Record<string, string> = { STUDENT: "#60a5fa", TEACHER: "#a78bfa", ADMIN: "#C9A97A" };

const PAYMENT_STATUS_LABEL: Record<string, string> = { approved: "Pago", paid: "Pago", pending: "Pendente", rejected: "Recusado", refunded: "Reembolsado", PAID: "Pago", PENDING: "Pendente", FAILED: "Recusado", REFUNDED: "Reembolsado" };
const PAYMENT_STATUS_COLOR: Record<string, string> = { approved: "#6ee7b7", paid: "#6ee7b7", pending: "#fbbf24", rejected: "#f87171", refunded: "#94a3b8", PAID: "#6ee7b7", PENDING: "#fbbf24", FAILED: "#f87171", REFUNDED: "#94a3b8" };

const TICKET_STATUS_LABEL: Record<string, string> = { open: "Aberto", in_progress: "Em atendimento", closed: "Fechado", OPEN: "Aberto", IN_PROGRESS: "Em atendimento", CLOSED: "Fechado" };
const TICKET_STATUS_COLOR: Record<string, string> = { open: "#60a5fa", in_progress: "#fbbf24", closed: "#6ee7b7", OPEN: "#60a5fa", IN_PROGRESS: "#fbbf24", CLOSED: "#6ee7b7" };

export default async function StudentProfilePage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;

  const [student, allCourses, activityLogs, payments, tickets, certificates] = await Promise.all([
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
    prisma.course.findMany({ select: { id: true, title: true, paymentType: true }, orderBy: { title: "asc" } }),
    prisma.activityLog.findMany({
      where: { userId: studentId },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.payment.findMany({
      where: { userId: studentId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { course: { select: { title: true } } },
    }),
    prisma.ticket.findMany({
      where: { userId: studentId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.certificate.findMany({
      where: { userId: studentId },
      include: { course: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!student) notFound();

  const enrolledIds = student.enrollments.map(e => e.courseId);
  const notEnrolled = allCourses.filter(c => !enrolledIds.includes(c.id));
  const initials = student.name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";
  const avatarSrc = student.avatar || (student as any).image || null;

  const totalPaid = payments.filter(p => ["approved", "paid", "PAID"].includes(p.status)).reduce((s, p) => s + (p.amount ?? 0), 0);

  const hasAddress = student.shippingAddress || student.shippingCity;

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      {/* Back */}
      <Link href="/admin/alunos" className="ka-back-link">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Alunos
      </Link>

      {/* ── Hero ── */}
      <div style={{ margin: "16px 20px 0" }}>
        <div style={{
          borderRadius: 20, padding: "28px",
          background: "linear-gradient(135deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
          border: "1px solid rgba(201,169,122,0.14)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.40)",
          display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 22,
        }}>
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: "50%", flexShrink: 0,
            background: avatarSrc ? "transparent" : "radial-gradient(circle at 30% 30%, var(--gold-bright), var(--gold) 50%, var(--gold-deep))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 26,
            color: "var(--navy-darkest)",
            boxShadow: "0 0 30px rgba(201,169,122,0.40), 0 0 60px rgba(201,169,122,0.15)",
            border: "2px solid var(--gold-light)",
            overflow: "hidden",
          }}>
            {avatarSrc
              ? <img src={avatarSrc} alt={student.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : initials}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="ka-page-eyebrow" style={{ marginBottom: 4 }}>Perfil do Aluno</div>
            <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 22, letterSpacing: 2, color: "var(--text-primary)", marginBottom: 4 }}>
              {student.name}
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>{student.email}</p>

            {/* Role badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{
                fontSize: 10, padding: "3px 10px", borderRadius: 999,
                background: `${ROLE_COLOR[student.role] ?? "#fff"}18`,
                border: `1px solid ${ROLE_COLOR[student.role] ?? "#fff"}40`,
                color: ROLE_COLOR[student.role] ?? "#fff",
                fontFamily: "'Cinzel',serif", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase",
              }}>
                {ROLE_LABEL[student.role] ?? student.role}
              </span>
              {!student.active && (
                <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 999, background: "rgba(230,57,70,0.10)", border: "1px solid rgba(230,57,70,0.25)", color: "#f87171", fontFamily: "'Cinzel',serif", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>
                  Inativo
                </span>
              )}
              {student.walletBalance > 0 && (
                <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 999, background: "rgba(110,231,183,0.08)", border: "1px solid rgba(110,231,183,0.25)", color: "#6ee7b7", fontFamily: "'Poppins',sans-serif", fontWeight: 600 }}>
                  Carteira: R$ {student.walletBalance.toFixed(2).replace(".", ",")}
                </span>
              )}
            </div>

            {student.bio && (
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginTop: 10, fontStyle: "italic", maxWidth: 480 }}>
                &ldquo;{student.bio}&rdquo;
              </p>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginLeft: "auto", justifyContent: "flex-end", flexWrap: "wrap" }} className="w-full md:w-auto">
            <EnrollButton studentId={studentId} courses={notEnrolled} />
            <ResetPasswordButton studentId={studentId} />
            <PromoteStudentButton studentId={studentId} studentName={student.name} currentRole={student.role} />
            <DeleteStudentButton studentId={studentId} studentName={student.name} />
          </div>
        </div>
      </div>

      <div className="ka-section">

        {/* ── Grid de dados rápidos ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 28 }}>
          <InfoCard label="Telefone" value={student.phone ?? "—"} />
          <InfoCard label="Igreja / Org." value={student.church ?? "—"} />
          <InfoCard label="Cadastrado em" value={new Date(student.createdAt).toLocaleDateString("pt-BR")} />
          <InfoCard label="Último acesso" value={student.lastLoginAt ? new Date(student.lastLoginAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—"} />
          <InfoCard label="Cursos ativos" value={String(student.enrollments.filter(e => !e.expiresAt || new Date(e.expiresAt) > new Date()).length)} />
          <InfoCard label="Total investido" value={totalPaid > 0 ? `R$ ${totalPaid.toFixed(2).replace(".", ",")}` : "—"} highlight={totalPaid > 0} />
          {certificates.length > 0 && (
            <InfoCard label="Certificados" value={String(certificates.length)} highlight />
          )}
          {student.walletBalance > 0 && (
            <InfoCard label="Saldo carteira" value={`R$ ${student.walletBalance.toFixed(2).replace(".", ",")}`} highlight />
          )}
        </div>

        {/* ── Endereço ── */}
        {hasAddress && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader title="Endereço de Entrega" />
            <div style={{
              borderRadius: 16, padding: "18px 22px",
              background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
              border: "1px solid rgba(201,169,122,0.10)",
              display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.6 }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <div>
                {student.shippingAddress && (
                  <p style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>
                    {student.shippingAddress}{student.shippingNumber ? `, ${student.shippingNumber}` : ""}
                  </p>
                )}
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  {[student.shippingCity, student.shippingState].filter(Boolean).join(" / ")}
                  {student.shippingCep ? ` · CEP ${student.shippingCep}` : ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Certificados ── */}
        {certificates.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader title="Certificados Emitidos" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {certificates.map(cert => (
                <div key={cert.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                  padding: "14px 20px", borderRadius: 14,
                  background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
                  border: "1px solid rgba(110,231,183,0.15)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(110,231,183,0.10)", border: "1px solid rgba(110,231,183,0.25)", flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'Cinzel',serif", letterSpacing: 1 }}>
                        {cert.course.title}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        Emitido em {new Date(cert.issuedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <Link href={`/certificado/${cert.courseId}`} target="_blank" style={{ fontSize: 11, color: "var(--gold)", textDecoration: "none", fontFamily: "'Cinzel',serif", letterSpacing: 1.5, textTransform: "uppercase" }}>
                    Ver →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Progresso nos cursos ── */}
        <div style={{ marginBottom: 28 }}>
          <SectionHeader title="Progresso nos Cursos" />

          {student.enrollments.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "24px 0" }}>Nenhum curso matriculado.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {student.enrollments.map((enrollment) => {
                const { course } = enrollment;
                const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);
                const doneLessons = course.modules.reduce((a, m) => a + m.lessons.filter(l => l.progress[0]?.completed).length, 0);
                const pct = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;
                const expired = enrollment.expiresAt ? new Date(enrollment.expiresAt) < new Date() : false;

                return (
                  <div key={course.id} style={{
                    borderRadius: 16, overflow: "hidden",
                    background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
                    border: expired ? "1px solid rgba(230,57,70,0.18)" : "1px solid rgba(201,169,122,0.10)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                  }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(201,169,122,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 13, letterSpacing: 1.5, color: "var(--text-primary)", marginBottom: 3 }}>
                          {course.title}
                        </h3>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{doneLessons}/{totalLessons} aulas concluídas</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 22, color: pct === 100 ? "#6ee7b7" : "var(--gold-light)" }}>
                          {pct}%
                        </span>
                        {enrollment.expiresAt ? (
                          <span style={{
                            fontSize: 10, padding: "3px 9px", borderRadius: 999,
                            fontFamily: "'Poppins',sans-serif",
                            background: expired ? "rgba(230,57,70,0.12)" : "rgba(110,231,183,0.10)",
                            border: `1px solid ${expired ? "rgba(230,57,70,0.25)" : "rgba(110,231,183,0.25)"}`,
                            color: expired ? "#FF8088" : "#6ee7b7",
                          }}>
                            {expired ? "⚠ Expirado" : `até ${new Date(enrollment.expiresAt).toLocaleDateString("pt-BR")}`}
                          </span>
                        ) : course.paymentType === "MONTHLY" ? (
                          <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 999, fontFamily: "'Poppins',sans-serif", background: "rgba(251,191,36,0.10)", border: "1px solid rgba(251,191,36,0.30)", color: "#fbbf24" }}>
                            ⚠ Mensal sem prazo
                          </span>
                        ) : null}
                        <RenewEnrollmentButton enrollmentId={enrollment.id} courseName={course.title} currentExpiresAt={enrollment.expiresAt ? enrollment.expiresAt.toISOString() : null} />
                        <UnenrollButton enrollmentId={enrollment.id} courseName={course.title} />
                      </div>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.05)" }}>
                      <div className="ka-progress-fill" style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "linear-gradient(90deg, #6ee7b7, #34d399)" : undefined }} />
                    </div>
                    {course.modules.map(mod => (
                      <div key={mod.id} style={{ padding: "12px 20px", borderTop: "1px solid rgba(201,169,122,0.05)" }}>
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>
                          {mod.title}
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 4 }}>
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

        {/* ── Pagamentos ── */}
        {payments.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader title="Histórico de Pagamentos" />
            <div style={{ borderRadius: 16, overflow: "hidden", background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)", border: "1px solid rgba(201,169,122,0.10)" }}>
              {payments.map((p, i) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 20px", borderBottom: i < payments.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${PAYMENT_STATUS_COLOR[p.status] ?? "#fff"}14`, border: `1px solid ${PAYMENT_STATUS_COLOR[p.status] ?? "#fff"}30` }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PAYMENT_STATUS_COLOR[p.status] ?? "#fff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {(p as any).course?.title ?? "Produto"}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: `${PAYMENT_STATUS_COLOR[p.status] ?? "#fff"}14`, border: `1px solid ${PAYMENT_STATUS_COLOR[p.status] ?? "#fff"}30`, color: PAYMENT_STATUS_COLOR[p.status] ?? "#fff", fontFamily: "'Cinzel',serif", letterSpacing: 1, fontWeight: 600, textTransform: "uppercase" }}>
                        {PAYMENT_STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: ["approved","paid","PAID"].includes(p.status) ? "#6ee7b7" : "var(--text-muted)", fontFamily: "'Cinzel',serif" }}>
                      R$ {(p.amount ?? 0).toFixed(2).replace(".", ",")}
                    </p>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
                      {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tickets de suporte ── */}
        {tickets.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader title="Chamados de Suporte" />
            <div style={{ borderRadius: 16, overflow: "hidden", background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)", border: "1px solid rgba(201,169,122,0.10)" }}>
              {tickets.map((t, i) => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 20px", borderBottom: i < tickets.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${TICKET_STATUS_COLOR[t.status] ?? "#fff"}14`, border: `1px solid ${TICKET_STATUS_COLOR[t.status] ?? "#fff"}30` }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TICKET_STATUS_COLOR[t.status] ?? "#fff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.subject}
                    </p>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: `${TICKET_STATUS_COLOR[t.status] ?? "#fff"}14`, border: `1px solid ${TICKET_STATUS_COLOR[t.status] ?? "#fff"}30`, color: TICKET_STATUS_COLOR[t.status] ?? "#fff", fontFamily: "'Cinzel',serif", letterSpacing: 1, fontWeight: 600, textTransform: "uppercase", display: "inline-block", marginTop: 4 }}>
                      {TICKET_STATUS_LABEL[t.status] ?? t.status}
                    </span>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                    <Link href={`/admin/suporte/${t.id}`} style={{ fontSize: 10, color: "var(--gold)", textDecoration: "none", fontFamily: "'Cinzel',serif", letterSpacing: 1.5, textTransform: "uppercase" }}>
                      Ver →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Histórico de Atividade ── */}
        <div style={{ marginBottom: 28 }}>
          <SectionHeader title="Histórico de Atividade" />

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

        {/* ── Afiliado ── */}
        <div>
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
