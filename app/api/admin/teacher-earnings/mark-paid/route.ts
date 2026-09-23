import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Marca comissões pendentes de um professor como pagas (repasse manual). */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { teacherId, earningIds } = await req.json();

  if (!teacherId && !Array.isArray(earningIds)) {
    return NextResponse.json({ error: "Informe teacherId ou earningIds" }, { status: 400 });
  }

  const where = Array.isArray(earningIds) && earningIds.length > 0
    ? { id: { in: earningIds as string[] }, paidAt: null }
    : { teacherId: teacherId as string, paidAt: null };

  const result = await prisma.teacherEarning.updateMany({
    where,
    data: { paidAt: new Date(), paidBy: session.user.id },
  });

  return NextResponse.json({ updated: result.count });
}

/** Desfaz uma marcação de pago (por engano). */
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { earningIds } = await req.json();
  if (!Array.isArray(earningIds) || earningIds.length === 0) {
    return NextResponse.json({ error: "Informe earningIds" }, { status: 400 });
  }

  const result = await prisma.teacherEarning.updateMany({
    where: { id: { in: earningIds as string[] } },
    data: { paidAt: null, paidBy: null },
  });

  return NextResponse.json({ updated: result.count });
}
