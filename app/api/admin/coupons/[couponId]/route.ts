import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ couponId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { couponId } = await params;

  try {
    await prisma.coupon.delete({
      where: { id: couponId },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir cupom" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ couponId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { couponId } = await params;
  const { active } = await req.json();

  try {
    const coupon = await prisma.coupon.update({
      where: { id: couponId },
      data: { active },
    });
    return NextResponse.json(coupon);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar cupom" }, { status: 500 });
  }
}
