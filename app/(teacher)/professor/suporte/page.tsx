import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Clock, CheckCircle2, AlertCircle, ChevronRight, User } from "lucide-react";

export default async function TeacherSupportPage() {
  const session = await auth();
  if (!session || session.user.role !== "TEACHER") redirect("/login");

  const tickets = await prisma.ticket.findMany({
    orderBy: { updatedAt: "desc" },
    include: { 
      user: { select: { name: true, email: true } },
      _count: { select: { messages: true } } 
    }
  });

  const statusMap: any = {
    open: { label: "Aberto", color: "#6ee7b7", icon: <Clock size={14} /> },
    in_progress: { label: "Em Atendimento", color: "#fcd34d", icon: <AlertCircle size={14} /> },
    resolved: { label: "Respondido", color: "#60a5fa", icon: <MessageSquare size={14} /> },
    closed: { label: "Fechado", color: "rgba(255,255,255,0.3)", icon: <CheckCircle2 size={14} /> },
  };

  return (
    <div style={{ minHeight: "100%", padding: "44px", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <MessageSquare size={18} color="var(--gold)" />
            <span style={{ fontSize: 10, fontFamily: "'Cinzel',serif", letterSpacing: 4, textTransform: "uppercase", color: "var(--gold)" }}>Suporte Acadêmico</span>
          </div>
          <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 32, fontWeight: 700, letterSpacing: 2, color: "var(--white)", margin: 0 }}>
            Painel de <span style={{ color: "var(--gold)" }}>Atendimento</span>
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: 8 }}>Gerencie as dúvidas e chamados dos alunos.</p>
        </div>

        {tickets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 40px", background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "1px solid rgba(201,169,122,0.1)" }}>
            <MessageSquare size={48} color="rgba(201,169,122,0.2)" style={{ marginBottom: 16 }} />
            <p style={{ color: "var(--text-muted)", fontSize: 16 }}>Nenhum chamado disponível.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {tickets.map(ticket => {
              const status = statusMap[ticket.status] || statusMap.open;
              return (
                <Link key={ticket.id} href={`/professor/suporte/${ticket.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ 
                    background: "rgba(15,26,61,0.6)", border: "1px solid rgba(201,169,122,0.12)", 
                    borderRadius: 20, padding: "20px 24px", display: "flex", alignItems: "center", 
                    justifyContent: "space-between", transition: "all 0.2s", cursor: "pointer"
                  }} className="ka-ticket-card">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                         <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: 0 }}>{ticket.subject}</h3>
                         <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: status.color, background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 4 }}>
                            {status.icon} {status.label}
                         </div>
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
                          <User size={12} /> {ticket.user.name}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                          {new Date(ticket.updatedAt).toLocaleDateString("pt-BR")}
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
