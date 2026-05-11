import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Send, User, ShieldCheck, ChevronLeft } from "lucide-react";
import TicketResponseForm from "@/components/admin/ticket-response-form";

export default async function AdminTicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");
  const { ticketId } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true, role: true } } }
      }
    }
  });

  if (!ticket) notFound();

  return (
    <div style={{ minHeight: "100%", padding: "44px", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        
        <Link href="/admin/suporte" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--gold)", textDecoration: "none", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, marginBottom: 32 }}>
          <ChevronLeft size={16} /> Voltar para Chamados
        </Link>

        <div style={{ 
          background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)", 
          border: "1px solid rgba(201,169,122,0.15)", borderRadius: 24, overflow: "hidden" 
        }}>
          {/* Ticket Info */}
          <div style={{ padding: "24px 32px", borderBottom: "1px solid rgba(201,169,122,0.1)", background: "rgba(201,169,122,0.03)" }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
               <div>
                 <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>{ticket.subject}</h1>
                 <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
                      <User size={14} /> {ticket.user.name} ({ticket.user.email})
                    </div>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Aberto em {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}</span>
                 </div>
               </div>
               <div style={{ 
                 padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: "uppercase", 
                 background: "rgba(201,169,122,0.1)", color: "var(--gold)", border: "1px solid rgba(201,169,122,0.2)"
               }}>
                 Status: {ticket.status.toUpperCase()}
               </div>
             </div>
          </div>

          {/* Messages */}
          <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: 24, maxHeight: 600, overflowY: "auto" }}>
            {ticket.messages.map(msg => {
              const isFromAdmin = msg.isAdmin;
              return (
                <div key={msg.id} style={{ 
                  display: "flex", flexDirection: "column", 
                  alignItems: isFromAdmin ? "flex-end" : "flex-start" 
                }}>
                  <div style={{ 
                    maxWidth: "85%", padding: "16px 20px", borderRadius: 20,
                    background: isFromAdmin ? "rgba(201,169,122,0.15)" : "rgba(255,255,255,0.03)",
                    border: isFromAdmin ? "1px solid rgba(201,169,122,0.3)" : "1px solid rgba(255,255,255,0.08)",
                    color: "#fff", position: "relative"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: isFromAdmin ? "var(--gold-light)" : "var(--text-muted)" }}>
                        {isFromAdmin ? "EQUIPE KADIMA" : msg.user.name}
                      </span>
                      {isFromAdmin && <ShieldCheck size={12} color="var(--gold)" />}
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>{msg.body}</p>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 8, textAlign: "right" }}>
                      {new Date(msg.createdAt).toLocaleString("pt-BR")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Response Form */}
          <div style={{ padding: "24px 32px", borderTop: "1px solid rgba(201,169,122,0.1)", background: "rgba(6,13,31,0.5)" }}>
            <TicketResponseForm ticketId={ticket.id} isAdmin={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
