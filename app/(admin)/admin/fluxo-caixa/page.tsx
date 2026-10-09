import { prisma } from "@/lib/prisma";
import ExpensesPanel from "@/components/admin/expenses-panel";
import RevenueChart from "@/components/admin/revenue-chart";

function fmt(v: number) {
  return "R$ " + v.toFixed(2).replace(".", ",");
}

export default async function FluxoCaixaPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [monthIncome, monthExpensesPaid, pendingExpenses, expenses, monthsRevenue, monthsExpense] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "approved", createdAt: { gte: startOfMonth, lt: startOfNextMonth } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { status: "PAGO", paidAt: { gte: startOfMonth, lt: startOfNextMonth } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { status: "PENDENTE" },
      _sum: { amount: true },
    }),
    prisma.expense.findMany({ orderBy: { dueDate: "desc" } }),
    Promise.all(
      Array.from({ length: 6 }).map(async (_, i) => {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1);
        const sum = await prisma.payment.aggregate({
          where: { status: "approved", createdAt: { gte: monthStart, lt: monthEnd } },
          _sum: { amount: true },
        });
        return { label: monthStart.toLocaleDateString("pt-BR", { month: "short" }), total: sum._sum.amount ?? 0 };
      })
    ),
    Promise.all(
      Array.from({ length: 6 }).map(async (_, i) => {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1);
        const sum = await prisma.expense.aggregate({
          where: { status: "PAGO", paidAt: { gte: monthStart, lt: monthEnd } },
          _sum: { amount: true },
        });
        return { label: monthStart.toLocaleDateString("pt-BR", { month: "short" }), total: sum._sum.amount ?? 0 };
      })
    ),
  ]);

  const income = monthIncome._sum.amount ?? 0;
  const expensesPaid = monthExpensesPaid._sum.amount ?? 0;
  const pending = pendingExpenses._sum.amount ?? 0;
  const balance = income - expensesPaid;

  const expensesSerialized = expenses.map(e => ({
    id: e.id,
    title: e.title,
    amount: e.amount,
    category: e.category,
    dueDate: e.dueDate.toISOString(),
    status: e.status,
    paidAt: e.paidAt ? e.paidAt.toISOString() : null,
    recurring: e.recurring,
    description: e.description,
  }));

  const cardStyle = {
    borderRadius: 18, padding: "22px 24px",
    background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
    border: "1px solid rgba(201,169,122,0.12)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
  };

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Admin</div>
        <h1 className="ka-page-title">Fluxo de <span>Caixa</span></h1>
        <p className="ka-page-subtitle">Entradas, despesas e saldo da plataforma</p>
      </div>

      <div style={{ padding: "0 44px 48px" }}>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
          <div style={cardStyle}>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "#6ee7b7", marginBottom: 10 }}>Entradas do Mês</p>
            <p style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 26, color: "var(--text-primary)" }}>{fmt(income)}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>vendas + renovações manuais</p>
          </div>
          <div style={cardStyle}>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "#FF8088", marginBottom: 10 }}>Despesas Pagas no Mês</p>
            <p style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 26, color: "var(--text-primary)" }}>{fmt(expensesPaid)}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{fmt(pending)} pendente{pending !== 1 ? "s" : ""} no total</p>
          </div>
          <div style={{ ...cardStyle, border: `1px solid ${balance >= 0 ? "rgba(110,231,183,0.25)" : "rgba(230,57,70,0.25)"}` }}>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: balance >= 0 ? "#6ee7b7" : "#FF8088", marginBottom: 10 }}>Saldo do Mês</p>
            <p style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 26, color: balance >= 0 ? "#6ee7b7" : "#FF8088" }}>{fmt(balance)}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>entradas − despesas pagas</p>
          </div>
        </div>

        {/* Gráficos lado a lado */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }} className="fc-charts-grid">
          <div style={{ ...cardStyle, padding: "22px 24px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, #6ee7b7, #34d399)", borderRadius: 2, boxShadow: "0 0 8px #6ee7b7" }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
                Entradas — 6 Meses
              </span>
            </div>
            <RevenueChart months={monthsRevenue} />
          </div>
          <div style={{ ...cardStyle, padding: "22px 24px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, #FF8088, #E63946)", borderRadius: 2, boxShadow: "0 0 8px rgba(230,57,70,0.5)" }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
                Despesas Pagas — 6 Meses
              </span>
            </div>
            <RevenueChart months={monthsExpense} />
          </div>
        </div>

        <ExpensesPanel expenses={expensesSerialized} />

        <style>{`
          @media (max-width: 900px) {
            .fc-charts-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
