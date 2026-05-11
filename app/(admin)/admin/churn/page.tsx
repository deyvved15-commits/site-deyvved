import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TrendingDown, Users, Calendar, AlertTriangle } from "lucide-react";

export default async function ChurnReportPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  // Churn logic: Users with MONTHLY enrollment whose expiresAt is in the past and status is not approved in recent payments
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const expiredEnrollments = await prisma.enrollment.findMany({
    where: {
      course: { paymentType: "MONTHLY" },
      expiresAt: { lt: now }
    },
    include: {
      user: true,
      course: true
    }
  });

  const totalMonthlyEnrollments = await prisma.enrollment.count({
    where: { course: { paymentType: "MONTHLY" } }
  });

  const churnCount = expiredEnrollments.length;
  const churnRate = totalMonthlyEnrollments > 0 ? (churnCount / totalMonthlyEnrollments) * 100 : 0;

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 24, fontWeight: 700, color: "var(--gold)" }}>Relatório de Churn (Evasão)</h1>
        <p style={{ color: "var(--text-muted)" }}>Análise de alunos que não renovaram a assinatura mensal.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 40 }}>
        <div style={{ background: "rgba(15,26,61,0.6)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 20, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>Taxa de Evasão</p>
              <h2 style={{ fontSize: 32, fontWeight: 700, color: "#ef4444", margin: "8px 0" }}>{churnRate.toFixed(1)}%</h2>
            </div>
            <TrendingDown color="#ef4444" size={24} />
          </div>
        </div>

        <div style={{ background: "rgba(15,26,61,0.6)", border: "1px solid rgba(201,169,122,0.12)", borderRadius: 20, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>Total Expirados</p>
              <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", margin: "8px 0" }}>{churnCount}</h2>
            </div>
            <Users color="var(--gold)" size={24} />
          </div>
        </div>
      </div>

      <div style={{ background: "rgba(15,26,61,0.6)", border: "1px solid rgba(201,169,122,0.12)", borderRadius: 24, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 11, color: "var(--gold)", textTransform: "uppercase" }}>Aluno</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 11, color: "var(--gold)", textTransform: "uppercase" }}>Curso</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 11, color: "var(--gold)", textTransform: "uppercase" }}>Expirou em</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 11, color: "var(--gold)", textTransform: "uppercase" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {expiredEnrollments.map(en => (
              <tr key={en.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <td style={{ padding: "16px 24px" }}>
                  <p style={{ fontWeight: 600, margin: 0 }}>{en.user.name}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>{en.user.email}</p>
                </td>
                <td style={{ padding: "16px 24px", fontSize: 14 }}>{en.course.title}</td>
                <td style={{ padding: "16px 24px", fontSize: 14 }}>{en.expiresAt?.toLocaleDateString()}</td>
                <td style={{ padding: "16px 24px" }}>
                   <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: 11, fontWeight: 700 }}>EXPIRADO</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
