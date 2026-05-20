import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProfessoresPage() {
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    orderBy: { createdAt: "desc" },
    include: { taughtCourses: { include: { course: { select: { title: true } } } } },
  });

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      {/* Header */}
      <div className="ka-page-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div className="ka-page-eyebrow">Gestão</div>
          <h1 className="ka-page-title">Nossos <span>Professores</span></h1>
          <p className="ka-page-subtitle">{teachers.length} professor{teachers.length !== 1 ? "es" : ""} cadastrado{teachers.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/professores/novo" style={{
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
          Novo Professor
        </Link>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .prof-table-head { display: none !important; }
          .prof-table-row {
            display: flex !important;
            flex-direction: column !important;
            padding: 14px 16px !important;
            gap: 6px !important;
          }
          .prof-row-main { justify-content: space-between !important; }
          .prof-col-email-desktop { display: none !important; }
          .prof-col-date { display: none !important; }
          .prof-col-action-desktop { display: none !important; }
          .prof-row-email { display: block !important; }
          .prof-row-action { display: inline-block !important; }
          .prof-row-meta { padding-left: 0 !important; }
        }
      `}</style>

      <div className="ka-section" style={{ padding: "32px 44px 44px" }}>
        {teachers.length === 0 ? (
          <div style={{
            borderRadius: 20, padding: "56px 32px", textAlign: "center", maxWidth: 380,
            background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
            border: "1px solid rgba(201,169,122,0.12)",
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ color: "rgba(201,169,122,0.25)", margin: "0 auto 16px", display: "block" }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Nenhum professor cadastrado</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>Cadastre o primeiro professor para vincular aos cursos.</p>
          </div>
        ) : (
          <div style={{
            borderRadius: 20, overflow: "hidden",
            background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
            border: "1px solid rgba(201,169,122,0.12)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}>
            {/* Table head */}
            <div className="prof-table-head" style={{
              display: "grid", gridTemplateColumns: "2fr 2fr 2fr 1fr 80px",
              padding: "12px 24px",
              borderBottom: "1px solid rgba(201,169,122,0.10)",
              background: "rgba(201,169,122,0.03)",
            }}>
              {["Professor", "E-mail", "Cursos Vinculados", "Cadastro", ""].map(h => (
                <span key={h} style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)" }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {teachers.map((t, i) => {
              const initials = t.name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";
              return (
                <div key={t.id}
                  className="admin-row-hover prof-table-row"
                  style={{
                    display: "grid", gridTemplateColumns: "2fr 2fr 2fr 1fr 80px",
                    alignItems: "center", padding: "14px 24px",
                    borderTop: i > 0 ? "1px solid rgba(201,169,122,0.06)" : "none",
                    transition: "background 0.2s",
                  }}>
                  {/* Col 1: Avatar + Name */}
                  <div className="prof-row-main" style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.name}
                      </span>
                      <span className="prof-row-email" style={{ display: "none", fontSize: 11, color: "var(--text-muted)" }}>
                        {t.email}
                      </span>
                    </div>
                    <Link href={`/admin/professores/${t.id}`} className="prof-row-action" style={{
                      display: "none", padding: "6px 14px", borderRadius: 8,
                      background: "rgba(201,169,122,0.08)", border: "1px solid var(--gold-20)",
                      color: "var(--gold-light)", fontSize: 11, fontWeight: 600,
                      letterSpacing: 1, textDecoration: "none", flexShrink: 0,
                    }}>
                      Editar
                    </Link>
                  </div>
                  {/* Col 2: Email (desktop) */}
                  <span className="prof-col-email-desktop" style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
                    {t.email}
                  </span>
                  {/* Col 3: Courses */}
                  <div className="prof-row-meta" style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {t.taughtCourses.length === 0
                      ? <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Nenhum curso</span>
                      : t.taughtCourses.map(ct => (
                          <span key={ct.course.title} style={{
                            fontSize: 10, fontWeight: 600,
                            background: "rgba(201,169,122,0.08)", border: "1px solid var(--gold-20)",
                            color: "var(--gold)", padding: "2px 8px", borderRadius: 999,
                          }}>
                            {ct.course.title}
                          </span>
                        ))}
                  </div>
                  {/* Col 4: Date (desktop) */}
                  <span className="prof-col-date" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                  {/* Col 5: Edit button (desktop) */}
                  <Link href={`/admin/professores/${t.id}`} className="prof-col-action-desktop" style={{
                    padding: "6px 14px", borderRadius: 8,
                    background: "rgba(201,169,122,0.08)", border: "1px solid var(--gold-20)",
                    color: "var(--gold-light)", fontSize: 11, fontWeight: 600,
                    letterSpacing: 1, textDecoration: "none",
                    display: "inline-block", textAlign: "center",
                  }}>
                    Editar
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
