import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, MessageSquare, Clock, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";

export default async function SupportPage() {
  const session = await auth();
  if (!session) return null;

  const tickets = await prisma.ticket.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { messages: true } } }
  });

  const statusMap: any = {
    open: { label: "Aberto", color: "#6ee7b7", icon: <Clock size={14} /> },
    in_progress: { label: "Em Atendimento", color: "#fcd34d", icon: <AlertCircle size={14} /> },
    resolved: { label: "Respondido", color: "#60a5fa", icon: <MessageSquare size={14} /> },
    closed: { label: "Fechado", color: "rgba(255,255,255,0.3)", icon: <CheckCircle2 size={14} /> },
  };

  return (
    <div style={{ minHeight: "100%", padding: "44px", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 24, fontWeight: 700, letterSpacing: 2, color: "var(--text-primary)", margin: 0 }}>
              Central de <span style={{ color: "var(--gold)" }}>Suporte</span>
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>Como podemos te ajudar hoje?</p>
          </div>
          <Link href="/suporte/novo" style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px",
            background: "var(--gold)", color: "#060D1F", borderRadius: 12,
            fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 12, textDecoration: "none",
            boxShadow: "0 8px 24px rgba(201,169,122,0.25)"
          }}>
            <Plus size={16} /> Abrir Novo Chamado
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div style={{ 
            textAlign: "center", padding: "80px 40px", background: "rgba(255,255,255,0.02)", 
            borderRadius: 24, border: "1px solid rgba(201,169,122,0.1)" 
          }}>
            <MessageSquare size={48} color="rgba(201,169,122,0.2)" style={{ marginBottom: 16 }} />
            <p style={{ color: "var(--text-muted)", fontSize: 16 }}>Você não possui nenhum chamado aberto.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {tickets.map(ticket => {
              const status = statusMap[ticket.status] || statusMap.open;
              return (
                <Link key={ticket.id} href={`/suporte/${ticket.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ 
                    background: "rgba(15,26,61,0.6)", border: "1px solid rgba(201,169,122,0.12)", 
                    borderRadius: 20, padding: "20px 24px", display: "flex", alignItems: "center", 
                    justifyContent: "space-between", transition: "all 0.2s", cursor: "pointer"
                  }} className="ka-ticket-card">
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: "0 0 6px" }}>{ticket.subject}</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: status.color }}>
                          {status.icon}
                          {status.label}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                          Atualizado em {new Date(ticket.updatedAt).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: 4 }}>
                          <MessageSquare size={10} /> {ticket._count.messages} mensagen(s)
                        </div>
                      </div>
                    </div>
                    <div style={{ color: "var(--gold)", opacity: 0.5 }}>
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      
      <style>{`
        .ka-ticket-card:hover {
          background: rgba(201,169,122,0.08) !important;
          border-color: rgba(201,169,122,0.3) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
