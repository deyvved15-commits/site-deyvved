import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare, ChevronLeft, ShieldCheck, User } from "lucide-react";
import TicketResponseForm from "@/components/admin/ticket-response-form";

export default async function StudentTicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");
  const { ticketId } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true, role: true } } }
      }
    }
  });

  if (!ticket) notFound();
  if (ticket.userId !== session.user.id && session.user.role === "STUDENT") {
    redirect("/suporte");
  }

  return (
    <div className="ka-section" style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        
        <Link href="/suporte" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--gold)", textDecoration: "none", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, marginBottom: 32 }}>
          <ChevronLeft size={16} /> Meus Chamados
        </Link>

        <div style={{ 
          background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)", 
          border: "1px solid rgba(201,169,122,0.15)", borderRadius: 24, overflow: "hidden" 
        }}>
          {/* Ticket Header */}
          <div style={{ padding: "24px 32px", borderBottom: "1px solid rgba(201,169,122,0.1)", background: "rgba(201,169,122,0.03)" }}>
             <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>{ticket.subject}</h1>
             <div style={{ 
               display: "inline-block", padding: "4px 12px", borderRadius: 6, fontSize: 10, fontWeight: 700, 
               textTransform: "uppercase", background: "rgba(201,169,122,0.1)", color: "var(--gold)", border: "1px solid rgba(201,169,122,0.2)"
             }}>
               Status: {ticket.status.toUpperCase()}
             </div>
          </div>

          {/* Chat area */}
          <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: 24, maxHeight: 600, overflowY: "auto" }}>
            {ticket.messages.map(msg => {
              const isFromSupport = msg.isAdmin;
              return (
                <div key={msg.id} style={{ 
                  display: "flex", flexDirection: "column", 
                  alignItems: isFromSupport ? "flex-start" : "flex-end" 
                }}>
                  <div style={{ 
                    maxWidth: "85%", padding: "16px 20px", borderRadius: 20,
                    background: isFromSupport ? "rgba(201,169,122,0.1)" : "rgba(255,255,255,0.03)",
                    border: isFromSupport ? "1px solid rgba(201,169,122,0.2)" : "1px solid rgba(255,255,255,0.08)",
                    color: "#fff"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: isFromSupport ? "var(--gold)" : "var(--text-muted)" }}>
                        {isFromSupport ? "SUPORTE KADIMA" : "VOCÊ"}
                      </span>
                      {isFromSupport && <ShieldCheck size={12} color="var(--gold)" />}
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

          {/* Reply Area */}
          <div style={{ padding: "24px 32px", borderTop: "1px solid rgba(201,169,122,0.1)", background: "rgba(6,13,31,0.5)" }}>
            <TicketResponseForm ticketId={ticket.id} isAdmin={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
