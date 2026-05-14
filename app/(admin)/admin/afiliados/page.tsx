import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, Wallet, TrendingUp } from "lucide-react";

export default async function AdminAfiliadosPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const affiliates = await prisma.user.findMany({
    where: { affiliateCode: { not: null } },
    select: {
      id: true,
      name: true,
      email: true,
      affiliateCode: true,
      walletBalance: true,
      _count: { select: { referralsMade: true } },
    },
    orderBy: { walletBalance: "desc" },
  });

  const totalReferrals = await prisma.referral.count({ where: { status: "credited" } });
  const totalCommissions = await prisma.referral.aggregate({
    where: { status: "credited" },
    _sum: { amount: true },
  });

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Gestão</div>
        <h1 className="ka-page-title">Programa de <span>Afiliados</span></h1>
        <p className="ka-page-subtitle">{affiliates.length} afiliado{affiliates.length !== 1 ? "s" : ""} ativo{affiliates.length !== 1 ? "s" : ""} na plataforma.</p>
      </div>

      <div className="ka-section" style={{ padding: "0 44px 44px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { icon: <Users size={24} />, label: "Afiliados Ativos", value: String(affiliates.length), color: "#60a5fa" },
            { icon: <TrendingUp size={24} />, label: "Indicações Creditadas", value: String(totalReferrals), color: "#C9A97A" },
            { icon: <Wallet size={24} />, label: "Total em Comissões", value: `R$ ${(totalCommissions._sum.amount ?? 0).toFixed(2).replace(".", ",")}`, color: "#6ee7b7" },
          ].map(stat => (
            <div key={stat.label} style={{
              borderRadius: 20, padding: "24px",
              background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
              border: "1px solid rgba(201,169,122,0.12)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.30)",
            }}>
              <div style={{ color: stat.color, marginBottom: 12 }}>{stat.icon}</div>
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>{stat.label}</p>
              <p style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 24, color: "var(--text-primary)" }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 3, height: 16, background: "var(--gold)", borderRadius: 2 }} />
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
            Todos os Afiliados
          </span>
        </div>

        <div style={{
          borderRadius: 20, overflow: "hidden",
          background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
          border: "1px solid rgba(201,169,122,0.12)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        }}>
          {affiliates.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Nenhum afiliado cadastrado ainda.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(201,169,122,0.08)" }}>
                  <th style={{ padding: "16px 24px", textAlign: "left", fontFamily: "'Cinzel',serif", fontSize: 10, color: "var(--gold)", letterSpacing: 2 }}>NOME</th>
                  <th style={{ padding: "16px 24px", textAlign: "left", fontFamily: "'Cinzel',serif", fontSize: 10, color: "var(--gold)", letterSpacing: 2 }}>CÓDIGO</th>
                  <th style={{ padding: "16px 24px", textAlign: "center", fontFamily: "'Cinzel',serif", fontSize: 10, color: "var(--gold)", letterSpacing: 2 }}>INDICAÇÕES</th>
                  <th style={{ padding: "16px 24px", textAlign: "right", fontFamily: "'Cinzel',serif", fontSize: 10, color: "var(--gold)", letterSpacing: 2 }}>SALDO</th>
                </tr>
              </thead>
              <tbody>
                {affiliates.map((a, i) => (
                  <tr key={a.id} style={{ borderBottom: i < affiliates.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <td style={{ padding: "16px 24px" }}>
                      <p style={{ fontWeight: 500, color: "white", marginBottom: 2 }}>{a.name}</p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{a.email}</p>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <code style={{
                        padding: "4px 10px", borderRadius: 8,
                        background: "rgba(201,169,122,0.08)", border: "1px solid rgba(201,169,122,0.18)",
                        color: "var(--gold)", fontSize: 12, fontWeight: 600,
                      }}>
                        {a.affiliateCode}
                      </code>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "center", color: "var(--text-secondary)", fontWeight: 600 }}>
                      {a._count.referralsMade}
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right", fontWeight: 700, color: a.walletBalance > 0 ? "#6ee7b7" : "var(--text-muted)" }}>
                      R$ {a.walletBalance.toFixed(2).replace(".", ",")}
                    </td>
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
