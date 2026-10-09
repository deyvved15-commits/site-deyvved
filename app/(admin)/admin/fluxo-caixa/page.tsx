import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ExpensesPanel from "@/components/admin/expenses-panel";
import RevenueChart from "@/components/admin/revenue-chart";
import { getMonthlyRevenueAndExpense } from "@/lib/monthly-finance";

function fmt(v: number) {
  return "R$ " + v.toFixed(2).replace(".", ",");
}

const CATEGORIES = [
  { value: "FERRAMENTAS", label: "Ferramentas" },
  { value: "TRAFEGO", label: "Tráfego" },
  { value: "SALARIO", label: "Salário" },
  { value: "FREELANCER", label: "Freelancer" },
  { value: "INFRAESTRUTURA", label: "Infraestrutura" },
  { value: "IMPOSTOS", label: "Impostos" },
  { value: "MARKETING", label: "Marketing" },
  { value: "OUTROS", label: "Outros" },
];

const STATUSES = [
  { value: "PENDENTE", label: "Pendente" },
  { value: "PAGO", label: "Pago" },
  { value: "CANCELADO", label: "Cancelado" },
];

export default async function FluxoCaixaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string; from?: string; to?: string }>;
}) {
  const { q, category, status, from, to } = await searchParams;
  const filterQ = q?.trim() || undefined;
  const filterCategory = category && CATEGORIES.some(c => c.value === category) ? category : undefined;
  const filterStatus = status && STATUSES.some(s => s.value === status) ? status : undefined;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const expenseWhere: Record<string, unknown> = {};
  if (filterQ) expenseWhere.title = { contains: filterQ, mode: "insensitive" };
  if (filterCategory) expenseWhere.category = filterCategory;
  if (filterStatus) expenseWhere.status = filterStatus;
  if (from || to) {
    const range: Record<string, Date> = {};
    if (from) range.gte = new Date(`${from}T00:00:00`);
    if (to) range.lte = new Date(`${to}T23:59:59`);
    expenseWhere.dueDate = range;
  }

  const [monthIncome, monthExpensesPaid, pendingExpenses, expenses, monthlyData] = await Promise.all([
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
    prisma.expense.findMany({ where: expenseWhere, orderBy: { dueDate: "desc" } }),
    getMonthlyRevenueAndExpense(6),
  ]);

  const income = monthIncome._sum.amount ?? 0;
  const expensesPaid = monthExpensesPaid._sum.amount ?? 0;
  const pending = pendingExpenses._sum.amount ?? 0;
  const balance = income - expensesPaid;
  const hasFilters = !!(filterQ || filterCategory || filterStatus || from || to);

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

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,122,0.18)",
    borderRadius: 10, padding: "9px 12px", fontSize: 12, color: "#fff",
    fontFamily: "'Poppins',sans-serif", outline: "none",
  };

  const filterBtnBase: React.CSSProperties = {
    padding: "7px 18px", borderRadius: 10, fontSize: 11,
    fontFamily: "'Cinzel',serif", fontWeight: 600, letterSpacing: 1.5,
    textTransform: "uppercase", textDecoration: "none", cursor: "pointer",
    border: "1px solid rgba(201,169,122,0.20)",
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

        {/* Gráfico combinado */}
        <div style={{ ...cardStyle, marginBottom: 28, padding: "22px 24px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2, boxShadow: "0 0 8px var(--gold)" }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
              Receita x Despesa — Últimos 6 Meses
            </span>
          </div>
          <RevenueChart months={monthlyData} />
        </div>

        {/* Filtros de despesas */}
        <form method="GET" style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 10, marginBottom: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: "1 1 200px" }}>
            <label style={{ fontSize: 9, fontFamily: "'Cinzel',serif", letterSpacing: 2, color: "var(--text-muted)", textTransform: "uppercase" }}>Buscar despesa</label>
            <input type="text" name="q" defaultValue={filterQ ?? ""} placeholder="Título..." style={inputStyle} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 9, fontFamily: "'Cinzel',serif", letterSpacing: 2, color: "var(--text-muted)", textTransform: "uppercase" }}>Categoria</label>
            <select name="category" defaultValue={filterCategory ?? ""} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">Todas</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 9, fontFamily: "'Cinzel',serif", letterSpacing: 2, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</label>
            <select name="status" defaultValue={filterStatus ?? ""} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">Todos</option>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 9, fontFamily: "'Cinzel',serif", letterSpacing: 2, color: "var(--text-muted)", textTransform: "uppercase" }}>De</label>
            <input type="date" name="from" defaultValue={from ?? ""} style={inputStyle} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 9, fontFamily: "'Cinzel',serif", letterSpacing: 2, color: "var(--text-muted)", textTransform: "uppercase" }}>Até</label>
            <input type="date" name="to" defaultValue={to ?? ""} style={inputStyle} />
          </div>
          <button type="submit" style={{ ...filterBtnBase, background: "linear-gradient(135deg, rgba(201,169,122,0.25), rgba(201,169,122,0.10))", color: "var(--gold-light)", borderColor: "rgba(201,169,122,0.40)" }}>
            Filtrar
          </button>
          {hasFilters && (
            <Link href="/admin/fluxo-caixa" style={{ ...filterBtnBase, background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.4)" }}>
              Limpar
            </Link>
          )}
        </form>
        {hasFilters && (
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 16 }}>
            {expenses.length} resultado{expenses.length !== 1 ? "s" : ""}
          </p>
        )}

        <ExpensesPanel expenses={expensesSerialized} />
      </div>
    </div>
  );
}
