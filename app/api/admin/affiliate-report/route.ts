import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function startOfDay(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function fmtKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const days        = Math.min(Math.max(Number(searchParams.get("days") ?? "30"), 7), 90);
  const affiliateId = searchParams.get("affiliateId") || undefined;

  const since = startOfDay(addDays(new Date(), -days + 1));

  // ── Cliques ──────────────────────────────────────────────────────────────
  const clicks = await prisma.affiliateClick.findMany({
    where: {
      createdAt: { gte: since },
      ...(affiliateId ? { referrerId: affiliateId } : {}),
    },
    select: { createdAt: true, referrerId: true },
  });

  // ── Vendas (referrals creditados) ──────────────────────────────────────
  const referrals = await prisma.referral.findMany({
    where: {
      status: "credited",
      createdAt: { gte: since },
      ...(affiliateId ? { referrerId: affiliateId } : {}),
    },
    select: { createdAt: true, referrerId: true, amount: true },
  });

  // ── Monta série diária ────────────────────────────────────────────────
  const series: { date: string; clicks: number; sales: number; revenue: number }[] = [];
  for (let i = 0; i < days; i++) {
    series.push({ date: fmtKey(addDays(since, i)), clicks: 0, sales: 0, revenue: 0 });
  }
  const idx = new Map(series.map((s, i) => [s.date, i]));

  for (const c of clicks) {
    const key = fmtKey(c.createdAt);
    const i = idx.get(key);
    if (i !== undefined) series[i].clicks++;
  }
  for (const r of referrals) {
    const key = fmtKey(r.createdAt);
    const i = idx.get(key);
    if (i !== undefined) { series[i].sales++; series[i].revenue += r.amount; }
  }

  // ── Top afiliados no período ──────────────────────────────────────────
  const affMap = new Map<string, { clicks: number; sales: number; revenue: number }>();
  for (const c of clicks) {
    const e = affMap.get(c.referrerId) ?? { clicks: 0, sales: 0, revenue: 0 };
    e.clicks++;
    affMap.set(c.referrerId, e);
  }
  for (const r of referrals) {
    const e = affMap.get(r.referrerId) ?? { clicks: 0, sales: 0, revenue: 0 };
    e.sales++;
    e.revenue += r.amount;
    affMap.set(r.referrerId, e);
  }

  const affIds = [...affMap.keys()];
  const affUsers = affIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: affIds } },
        select: { id: true, name: true, affiliateCode: true },
      })
    : [];

  const topAffiliates = affUsers
    .map(u => ({ ...u, ...(affMap.get(u.id) ?? { clicks: 0, sales: 0, revenue: 0 }) }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // ── Totais ────────────────────────────────────────────────────────────
  const totalClicks  = clicks.length;
  const totalSales   = referrals.length;
  const totalRevenue = referrals.reduce((s, r) => s + r.amount, 0);
  const convRate     = totalClicks > 0 ? ((totalSales / totalClicks) * 100).toFixed(1) : "0.0";

  return NextResponse.json({ series, topAffiliates, totalClicks, totalSales, totalRevenue, convRate });
}
