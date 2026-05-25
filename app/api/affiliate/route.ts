import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateCode(name: string): string {
  const base = name
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 6);
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${base}${suffix}`;
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      affiliateCode: true,
      walletBalance: true,
      referralsMade: {
        select: { id: true, amount: true, status: true, createdAt: true, course: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { referralsMade: true, affiliateClicks: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const totalEarned = await prisma.referral.aggregate({
    where: { referrerId: session.user.id, status: "credited" },
    _sum: { amount: true },
  });

  const courses = await prisma.course.findMany({
    where: { published: true },
    select: { id: true, title: true, slug: true, price: true, affiliatePercentage: true },
    orderBy: { order: "asc" },
  });

  // Ranking dos top 10 afiliados por total ganho
  const ranking = await prisma.referral.groupBy({
    by: ["referrerId"],
    where: { status: "credited" },
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 10,
  });

  const rankingIds = ranking.map(r => r.referrerId);
  const rankingUsers = await prisma.user.findMany({
    where: { id: { in: rankingIds } },
    select: { id: true, name: true, affiliateCode: true },
  });

  const rankingData = ranking.map((r, i) => {
    const u = rankingUsers.find(u => u.id === r.referrerId);
    return {
      position: i + 1,
      name: u?.name ?? "—",
      affiliateCode: u?.affiliateCode ?? "—",
      totalEarned: r._sum.amount ?? 0,
      totalSales: r._count.id,
      isMe: r.referrerId === session.user.id,
    };
  });

  return NextResponse.json({
    affiliateCode: user.affiliateCode,
    walletBalance: user.walletBalance,
    totalReferrals: user._count.referralsMade,
    totalClicks: user._count.affiliateClicks,
    totalEarned: totalEarned._sum.amount ?? 0,
    recentReferrals: user.referralsMade,
    courses,
    ranking: rankingData,
  });
}

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { affiliateCode: true, name: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.affiliateCode) {
    return NextResponse.json({ affiliateCode: user.affiliateCode, message: "Código já existe." });
  }

  let code = generateCode(user.name ?? "USER");
  let attempts = 0;
  while (attempts < 10) {
    const existing = await prisma.user.findUnique({ where: { affiliateCode: code } });
    if (!existing) break;
    code = generateCode(user.name ?? "USER");
    attempts++;
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { affiliateCode: code },
    select: { affiliateCode: true },
  });

  return NextResponse.json({ affiliateCode: updated.affiliateCode }, { status: 201 });
}
