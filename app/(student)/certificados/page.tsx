import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Award, Download, Calendar, ExternalLink } from "lucide-react";

export default async function MyCertificatesPage() {
  const session = await auth();
  if (!session) return null;

  const certificates = await prisma.certificate.findMany({
    where: { userId: session.user.id },
    include: { course: true },
    orderBy: { issuedAt: "desc" }
  });

  return (
    <div className="ka-section" style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)", position: "relative", overflow: "hidden" }}>
      {/* Decorative Rings (Branding Book Style) */}
      <div style={{ position: "absolute", width: 600, height: 600, border: "1px solid rgba(201,169,122,0.05)", borderRadius: "50%", top: -200, right: -200, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 400, height: 400, border: "1px solid rgba(201,169,122,0.03)", borderRadius: "50%", bottom: -100, left: -100, pointerEvents: "none" }} />

      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <Award size={24} color="var(--gold)" />
            <span style={{ fontSize: 10, fontFamily: "'Cinzel',serif", letterSpacing: 4, textTransform: "uppercase", color: "var(--gold)" }}>Suas Conquistas Acadêmicas</span>
          </div>
          <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 700, letterSpacing: 2, color: "var(--text-primary)", margin: 0 }}>
            Meus <span style={{ color: "var(--gold)" }}>Certificados</span>
          </h1>
          <div style={{ width: 60, height: 2, background: "linear-gradient(90deg, var(--gold), transparent)", marginTop: 16 }} />
        </div>

        {certificates.length === 0 ? (
          <div style={{ 
            textAlign: "center", padding: "100px 40px", background: "rgba(255,255,255,0.02)", 
            borderRadius: 24, border: "1px solid rgba(201,169,122,0.1)" 
          }}>
            <Award size={64} color="rgba(201,169,122,0.15)" style={{ marginBottom: 20 }} />
            <p style={{ color: "var(--text-muted)", fontSize: 18, fontFamily: "'Cinzel',serif" }}>Você ainda não possui certificados.</p>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 8 }}>Conclua 100% de um curso para desbloquear sua certificação.</p>
            <Link href="/dashboard" style={{
              display: "inline-block", marginTop: 24, padding: "12px 32px",
              background: "rgba(201,169,122,0.1)", border: "1px solid var(--gold)",
              color: "var(--gold)", borderRadius: 12, textDecoration: "none",
              fontSize: 12, fontWeight: 700, fontFamily: "'Cinzel',serif"
            }}>
              Voltar aos Cursos
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))", gap: 24 }}>
            {certificates.map(cert => (
              <div key={cert.id} style={{
                background: "rgba(15,26,61,0.6)", border: "1px solid rgba(201,169,122,0.15)",
                borderRadius: 20, padding: 24, display: "flex", flexDirection: "column",
                transition: "all 0.3s ease", position: "relative", overflow: "hidden"
              }} className="cert-card-hover">
                {/* Certificate Background Pattern */}
                <div style={{ position: "absolute", top: -10, right: -10, opacity: 0.05 }}>
                  <Award size={120} color="var(--gold)" />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
                  <div style={{ padding: 10, background: "rgba(201,169,122,0.1)", borderRadius: 12 }}>
                    <Award size={24} color="var(--gold)" />
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 9, color: "var(--gold)", letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>Emitido em</p>
                    <p style={{ fontSize: 12, color: "#fff", fontWeight: 600, margin: 0 }}>{new Date(cert.issuedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 18, color: "#fff", marginBottom: 12, lineHeight: 1.4 }}>
                  {cert.course.title}
                </h3>

                <div style={{ flex: 1, marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 12 }}>
                    <Calendar size={14} />
                    <span>Concluído com Excelência</span>
                  </div>
                </div>

                <Link href={`/certificado/${cert.courseId}`} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "14px", background: "var(--gold)", color: "#060D1F",
                  borderRadius: 12, textDecoration: "none", fontSize: 13, fontWeight: 800,
                  fontFamily: "'Cinzel',serif", boxShadow: "0 8px 20px rgba(201,169,122,0.2)"
                }}>
                  <Download size={16} /> Ver Certificado
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .cert-card-hover:hover {
          transform: translateY(-5px);
          border-color: var(--gold) !important;
          background: rgba(201,169,122,0.08) !important;
          box-shadow: 0 12px 30px rgba(0,0,0,0.4);
        }
      `}</style>
    </div>
  );
}
