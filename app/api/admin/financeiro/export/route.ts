import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function csvEscape(value: string | number): string {
  const s = String(value ?? "");
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const q = searchParams.get("q") || undefined;
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (q) {
    where.user = {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    };
  }
  if (from || to) {
    const range: Record<string, Date> = {};
    if (from) range.gte = new Date(`${from}T00:00:00`);
    if (to) range.lte = new Date(`${to}T23:59:59`);
    where.createdAt = range;
  }

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 5000,
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
      product: { select: { title: true } },
    },
  });

  const header = ["Data", "Aluno", "E-mail", "Item", "Tipo", "Valor", "Usado da Carteira", "Método", "Status"];
  const rows = payments.map(p => [
    new Date(p.createdAt).toLocaleString("pt-BR"),
    p.user.name,
    p.user.email,
    p.course?.title || p.product?.title || "Item removido",
    p.courseId ? "Curso" : "Produto",
    p.amount.toFixed(2).replace(".", ","),
    (p.walletUsed ?? 0).toFixed(2).replace(".", ","),
    p.method,
    p.status,
  ]);

  const csv = "﻿" + [header, ...rows].map(r => r.map(csvEscape).join(";")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="financeiro-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
