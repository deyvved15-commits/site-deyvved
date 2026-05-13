import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Send, MessageSquare } from "lucide-react";
import CreateTicketForm from "./form";

export default async function NewTicketPage() {
  const session = await auth();
  if (!session) return null;

  // Fetch enrolled courses to allow linking the question to a course/teacher
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: { course: { select: { id: true, title: true } } }
  });

  const courses = enrollments.map(e => e.course);

  return (
    <div style={{ minHeight: "100%", padding: "44px", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)", position: "relative", overflow: "hidden" }}>
      {/* Decorative Elements */}
      <div style={{ position: "absolute", width: 600, height: 600, border: "1px solid rgba(201,169,122,0.05)", borderRadius: "50%", top: -200, left: -200, pointerEvents: "none" }} />
      
      <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <Link href="/suporte" style={{
          display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.4)",
          textDecoration: "none", fontSize: 13, marginBottom: 32, transition: "color 0.2s"
        }} className="hover-white">
          <ChevronLeft size={16} /> Voltar para Central de Ajuda
        </Link>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <MessageSquare size={18} color="var(--gold)" />
            <span style={{ fontSize: 10, fontFamily: "'Cinzel',serif", letterSpacing: 4, textTransform: "uppercase", color: "var(--gold)" }}>Novo Atendimento</span>
          </div>
          <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 28, fontWeight: 700, letterSpacing: 2, color: "var(--white)", margin: 0 }}>
            Fazer uma <span style={{ color: "var(--gold)" }}>Pergunta</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 12, fontSize: 15 }}>
            Preencha os dados abaixo e entraremos em contato o mais breve possível.
          </p>
        </div>

        <div style={{ 
          background: "linear-gradient(160deg, rgba(15,26,61,0.6) 0%, rgba(10,18,45,0.6) 100%)",
          border: "1px solid rgba(201,169,122,0.12)", borderRadius: 24, padding: "40px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
        }}>
          <CreateTicketForm courses={courses} />
        </div>
      </div>

      <style>{`
        .hover-white:hover { color: #fff !important; }
      `}</style>
    </div>
  );
}
