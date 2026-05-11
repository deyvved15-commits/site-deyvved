import { auth } from "@/lib/auth";

export default async function ProfessorComentariosPage() {
  const session = await auth();

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      
      {/* Header */}
      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Interações</div>
        <h1 className="ka-page-title">Comentários dos <span>Alunos</span></h1>
        <p className="ka-page-subtitle">Em breve você poderá responder dúvidas diretamente por aqui.</p>
      </div>

      <div className="ka-section" style={{ padding: "32px 44px 44px" }}>
        <div style={{ 
          padding: "80px 40px", 
          textAlign: "center", 
          background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
          borderRadius: 24, 
          border: "1px dashed rgba(201,169,122,0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16
        }}>
          <div style={{ 
            width: 60, height: 60, borderRadius: "50%", background: "rgba(201,169,122,0.05)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)"
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, letterSpacing: 1 }}>
              Área em Construção
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 300, margin: "0 auto" }}>
              Estamos preparando um sistema completo para você gerenciar as dúvidas de seus alunos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
