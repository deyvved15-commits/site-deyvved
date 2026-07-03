import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { orderId } = await params;
  const data = await req.json();

  const allowed: Record<string, unknown> = {};
  if ("trackingCode"    in data) allowed.trackingCode    = data.trackingCode;
  if ("shippingStatus"  in data) allowed.shippingStatus  = data.shippingStatus;

  const updated = await prisma.productPurchase.update({
    where: { id: orderId },
    data: allowed,
  });

  return NextResponse.json(updated);
}
