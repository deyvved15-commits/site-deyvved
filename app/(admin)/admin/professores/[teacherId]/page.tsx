import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function TeacherProfilePage({ params }: { params: Promise<{ teacherId: string }> }) {
  const { teacherId } = await params;

  const teacher = await prisma.user.findUnique({
    where: { id: teacherId },
    include: {
      taughtCourses: {
        select: {
          id: true,
          title: true,
          commissionPercentage: true,
          _count: { select: { enrollments: true } }
        }
      }
    }
  });

  if (!teacher || teacher.role !== "TEACHER") notFound();

  const initials = teacher.name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      {/* Back */}
      <Link href="/admin/professores" className="ka-back-link">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Professores
      </Link>

      {/* Profile hero */}
      <div style={{ margin: "16px 44px 0" }}>
        <div style={{
          borderRadius: 20, padding: "28px 32px",
          background: "linear-gradient(135deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
          border: "1px solid rgba(201,169,122,0.14)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.40)",
          display: "flex", alignItems: "center", gap: 20,
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
          <div style={{ flex: 1 }}>
            <div className="ka-page-eyebrow" style={{ marginBottom: 4 }}>Perfil do Professor</div>
            <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 22, letterSpacing: 2, color: "var(--text-primary)", marginBottom: 4 }}>
              {teacher.name}
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{teacher.email}</p>
          </div>
        </div>
      </div>

      <div className="ka-section" style={{ padding: "24px 44px 44px" }}>

        {/* Info cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Telefone", value: teacher.phone ?? "—" },
            { label: "Igreja / Org.", value: teacher.church ?? "—" },
            { label: "Cadastrado em", value: new Date(teacher.createdAt).toLocaleDateString("pt-BR") },
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

        {/* Cursos vinculados */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2, boxShadow: "0 0 8px var(--gold)" }} />
          <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
            Cursos Vinculados
          </h2>
        </div>

        {teacher.taughtCourses.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "24px 0" }}>Este professor ainda não está vinculado a nenhum curso.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {teacher.taughtCourses.map((course) => (
              <div key={course.id} style={{
                borderRadius: 16, padding: "20px",
                background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
                border: "1px solid rgba(201,169,122,0.10)",
                display: "flex", alignItems: "center", justifyContent: "space-between"
              }}>
                <div>
                  <h3 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 4 }}>
                    {course.title}
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {course._count.enrollments} alunos matriculados
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, color: "var(--gold)", marginBottom: 2 }}>Comissão</p>
                  <p style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 18, color: "var(--gold-light)" }}>
                    {course.commissionPercentage}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
