import { auth } from "@/lib/auth";

export default async function ProfessorComentariosPage() {
  const session = await auth();

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Interações</div>
        <h1 className="ka-page-title">Comentários dos <span>Alunos</span></h1>
        <p className="ka-page-subtitle">Em breve você poderá responder dúvidas diretamente por aqui.</p>
      </div>

      <div style={{ padding: "0 44px 48px" }}>
        <div style={{ 
          padding: 40, 
          textAlign: "center", 
          background: "rgba(255,255,255,0.02)", 
          borderRadius: 20, 
          border: "1px dashed rgba(201,169,122,0.2)" 
        }}>
          <p style={{ color: "var(--text-muted)" }}>Funcionalidade em desenvolvimento.</p>
        </div>
      </div>
    </div>
  );
}
