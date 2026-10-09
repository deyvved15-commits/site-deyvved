import { prisma } from "@/lib/prisma";

/** Receita (Payment aprovado) e despesa (Expense paga) mês a mês, dos últimos `months` meses até o mês atual. */
export async function getMonthlyRevenueAndExpense(months = 6) {
  const now = new Date();
  return Promise.all(
    Array.from({ length: months }).map(async (_, i) => {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i) + 1, 1);
      const [revenue, expense] = await Promise.all([
        prisma.payment.aggregate({
          where: { status: "approved", createdAt: { gte: monthStart, lt: monthEnd } },
          _sum: { amount: true },
        }),
        prisma.expense.aggregate({
          where: { status: "PAGO", paidAt: { gte: monthStart, lt: monthEnd } },
          _sum: { amount: true },
        }),
      ]);
      return {
        label: monthStart.toLocaleDateString("pt-BR", { month: "short" }),
        total: revenue._sum.amount ?? 0,
        expense: expense._sum.amount ?? 0,
      };
    })
  );
}
