import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Download, Award, User, BookOpen } from "lucide-react";
import { redirect } from "next/navigation";

export default async function TeacherFormadosPage() {
  const session = await auth();
  if (!session || session.user.role !== "TEACHER") redirect("/login");

  const graduates = await prisma.certificate.findMany({
    where: {
      course: { teacherId: session.user.id }
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true } }
    },
    orderBy: { issuedAt: "desc" }
  });

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      {/* Header */}
      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Meu Painel</div>
        <h1 className="ka-page-title">Alunos <span>Formados</span></h1>
        <p className="ka-page-subtitle">Visualize os alunos que concluíram seus cursos e emita segundas vias se necessário.</p>
      </div>

      <div className="ka-section">
        {graduates.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 40px", background: "rgba(15,26,61,0.5)", borderRadius: 24, border: "1px solid rgba(201,169,122,0.1)" }}>
             <Award size={64} color="rgba(201,169,122,0.15)" style={{ marginBottom: 20 }} />
             <p style={{ color: "var(--text-muted)", fontSize: 16 }}>Nenhum aluno se formou em seus cursos ainda.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {graduates.map(g => (
              <div key={g.id} style={{ 
                background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)", 
                border: "1px solid rgba(201,169,122,0.15)", borderRadius: 20, padding: "20px 24px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                  <div style={{ 
                    width: 48, height: 48, borderRadius: "50%", background: "rgba(201,169,122,0.1)", 
                    display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)" 
                  }}>
                    <User size={24} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.user.name}</h3>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.user.email}</p>
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <BookOpen size={14} color="var(--gold)" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gold-light)" }}>{g.course.title}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Formado em {new Date(g.issuedAt).toLocaleDateString("pt-BR")}</p>
                </div>

                <Link href={`/certificado/${g.courseId}?userId=${g.userId}`} target="_blank" style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
                  background: "rgba(201,169,122,0.1)", border: "1px solid var(--gold)",
                  color: "var(--gold)", borderRadius: 12, textDecoration: "none",
                  fontSize: 12, fontWeight: 700, fontFamily: "'Cinzel',serif", transition: "all 0.2s"
                }} className="btn-gold-hover">
                  <Download size={16} /> Segunda Via
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .btn-gold-hover:hover {
          background: var(--gold) !important;
          color: var(--navy-darkest) !important;
          box-shadow: 0 0 20px rgba(201,169,122,0.35);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
