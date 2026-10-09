import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { enrollmentId } = await params;

  const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment) return NextResponse.json({ error: "Matrícula não encontrada" }, { status: 404 });

  await prisma.enrollment.delete({ where: { id: enrollmentId } });

  return NextResponse.json({ ok: true });
}

// PATCH — admin define/renova expiresAt de uma matrícula
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { enrollmentId } = await params;
  const { expiresAt, amount, paymentMethod } = await req.json(); // null = vitalício, ISO string = data

  const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment) return NextResponse.json({ error: "Matrícula não encontrada" }, { status: 404 });

  const updated = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { expiresAt: expiresAt ? new Date(expiresAt) : null },
  });

  // Registra a movimentação financeira da renovação manual (dinheiro/cartão/pix/grátis)
  if (paymentMethod) {
    await prisma.payment.create({
      data: {
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        amount: paymentMethod === "GRATIS" ? 0 : Number(amount) || 0,
        method: paymentMethod, // DINHEIRO | CARTAO | PIX | GRATIS
        status: "approved",
        statusDetail: "Renovação manual registrada pelo admin",
        externalReference: `manual-${enrollmentId}-${Date.now()}`,
      },
    });
  }

  return NextResponse.json(updated);
}
