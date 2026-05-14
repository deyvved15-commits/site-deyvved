import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DollarSign, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ProfessorFinanceiro() {
  const session = await auth();
  const userId = session?.user.id;

  const payments = await prisma.payment.findMany({
    where: {
      course: { teachers: { some: { id: userId } } },
      status: "approved"
    },
    include: {
      course: true,
      user: true
    },
    orderBy: { createdAt: "desc" }
  });

  const totalCommission = payments.reduce((sum, p) => sum + (p.commissionAmount ?? 0), 0);

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      
      <div className="ka-page-header">
        <div style={{ marginBottom: 16 }}>
          <Link href="/professor" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--gold)", textDecoration: "none", fontSize: 11, fontFamily: "'Cinzel',serif", letterSpacing: 2, textTransform: "uppercase" }}>
            <ArrowLeft size={14} /> Voltar ao Início
          </Link>
        </div>
        <div className="ka-page-eyebrow">Relatório Financeiro</div>
        <h1 className="ka-page-title">Minhas <span>Comissões</span></h1>
        <p className="ka-page-subtitle">Acompanhe detalhadamente seus ganhos por venda.</p>
      </div>

      <div className="ka-section" style={{ padding: "0 44px 44px" }}>
        
        {/* Summary Card */}
        <div style={{
          borderRadius: 20, padding: "32px",
          background: "linear-gradient(135deg, rgba(201,169,122,0.15) 0%, rgba(201,169,122,0.05) 100%)",
          border: "1px solid rgba(201,169,122,0.3)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          display: "flex", alignItems: "center", gap: 24,
          marginBottom: 32
        }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--navy-darkest)", boxShadow: "0 0 20px rgba(201,169,122,0.4)" }}>
            <DollarSign size={32} strokeWidth={2.5} />
          </div>
          <div>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>Saldo Acumulado</p>
            <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 36, fontWeight: 800, color: "white", lineHeight: 1 }}>
              R$ {totalCommission.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        {/* Table Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 3, height: 16, background: "var(--gold)", borderRadius: 2 }} />
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
            Extrato de Vendas
          </span>
        </div>

        {/* Sales List */}
        <div style={{ 
          borderRadius: 20, overflow: "hidden", 
          background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
          border: "1px solid rgba(201,169,122,0.12)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        }}>
          {payments.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Nenhuma venda registrada ainda.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(201,169,122,0.08)" }}>
                  <th style={{ padding: "16px 24px", textAlign: "left", fontFamily: "'Cinzel',serif", fontSize: 10, color: "var(--gold)", letterSpacing: 2 }}>DATA</th>
                  <th style={{ padding: "16px 24px", textAlign: "left", fontFamily: "'Cinzel',serif", fontSize: 10, color: "var(--gold)", letterSpacing: 2 }}>ALUNO</th>
                  <th style={{ padding: "16px 24px", textAlign: "left", fontFamily: "'Cinzel',serif", fontSize: 10, color: "var(--gold)", letterSpacing: 2 }}>CURSO</th>
                  <th style={{ padding: "16px 24px", textAlign: "right", fontFamily: "'Cinzel',serif", fontSize: 10, color: "var(--gold)", letterSpacing: 2 }}>VALOR</th>
                  <th style={{ padding: "16px 24px", textAlign: "right", fontFamily: "'Cinzel',serif", fontSize: 10, color: "var(--gold)", letterSpacing: 2 }}>COMISSÃO</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i < payments.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <td style={{ padding: "16px 24px", color: "var(--text-muted)" }}>{new Date(p.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td style={{ padding: "16px 24px", fontWeight: 500, color: "white" }}>{p.user.name}</td>
                    <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>{p.course.title}</td>
                    <td style={{ padding: "16px 24px", textAlign: "right", color: "var(--text-muted)" }}>R$ {p.amount.toFixed(2)}</td>
                    <td style={{ padding: "16px 24px", textAlign: "right", fontWeight: 700, color: "#6ee7b7" }}>+ R$ {p.commissionAmount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
