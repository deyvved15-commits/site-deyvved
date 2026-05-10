import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AlunosPage() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    include: { enrollments: { include: { course: { select: { title: true } } } } },
  });

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      {/* Header */}
      <div className="ka-page-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div className="ka-page-eyebrow">Gestão</div>
          <h1 className="ka-page-title">Meus <span>Alunos</span></h1>
          <p className="ka-page-subtitle">{students.length} aluno{students.length !== 1 ? "s" : ""} cadastrado{students.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/alunos/novo" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 20px", borderRadius: 12,
          background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
          color: "var(--navy-darkest)", fontFamily: "'Cinzel',serif",
          fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
          textDecoration: "none", boxShadow: "0 4px 16px rgba(201,169,122,0.35)",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Cadastrar Aluno
        </Link>
      </div>

      <div className="ka-section" style={{ padding: "32px 44px 44px" }}>
        {students.length === 0 ? (
          <div style={{
            borderRadius: 20, padding: "56px 32px", textAlign: "center", maxWidth: 380,
            background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
            border: "1px solid rgba(201,169,122,0.12)",
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ color: "rgba(201,169,122,0.25)", margin: "0 auto 16px", display: "block" }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Nenhum aluno cadastrado</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>Cadastre o primeiro aluno da plataforma</p>
          </div>
        ) : (
          <div style={{
            borderRadius: 20, overflow: "hidden",
            background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
            border: "1px solid rgba(201,169,122,0.12)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}>
            {/* Table head */}
            <div style={{
              display: "grid", gridTemplateColumns: "2fr 2fr 1fr 2fr 1fr 80px",
              padding: "12px 24px",
              borderBottom: "1px solid rgba(201,169,122,0.10)",
              background: "rgba(201,169,122,0.03)",
            }}>
              {["Aluno", "E-mail", "Igreja", "Cursos", "Cadastro", ""].map(h => (
                <span key={h} style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)" }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {students.map((s, i) => {
              const initials = s.name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";
              return (
                <div key={s.id} style={{
                  display: "grid", gridTemplateColumns: "2fr 2fr 1fr 2fr 1fr 80px",
                  alignItems: "center", padding: "14px 24px",
                  borderTop: i > 0 ? "1px solid rgba(201,169,122,0.06)" : "none",
                  transition: "background 0.2s",
                }}
                className="admin-row-hover">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                      background: "radial-gradient(circle at 30% 30%, var(--gold-bright), var(--gold) 50%, var(--gold-deep))",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 11,
                      color: "var(--navy-darkest)",
                      boxShadow: "0 0 10px rgba(201,169,122,0.25)",
                    }}>
                      {initials}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.name}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
                    {s.email}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.church ?? "—"}</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {s.enrollments.length === 0
                      ? <span style={{ fontSize: 11, color: "var(--text-muted)" }}>—</span>
                      : s.enrollments.map(e => (
                          <span key={e.course.title} style={{
                            fontSize: 10, fontWeight: 600,
                            background: "rgba(201,169,122,0.08)", border: "1px solid var(--gold-20)",
                            color: "var(--gold)", padding: "2px 8px", borderRadius: 999,
                          }}>
                            {e.course.title}
                          </span>
                        ))}
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                  <Link href={`/admin/alunos/${s.id}`} style={{
                    padding: "6px 14px", borderRadius: 8,
                    background: "rgba(201,169,122,0.08)", border: "1px solid var(--gold-20)",
                    color: "var(--gold-light)", fontSize: 11, fontWeight: 600,
                    letterSpacing: 1, textDecoration: "none",
                    display: "inline-block", textAlign: "center",
                  }}>
                    Ver
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
