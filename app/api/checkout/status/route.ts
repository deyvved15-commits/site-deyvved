import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ status: "unauthenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const productId = searchParams.get("productId");

  if (!courseId && !productId) {
    return NextResponse.json({ status: "unknown" });
  }

  if (courseId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    });
    if (enrollment) {
      const isActive = !enrollment.expiresAt || enrollment.expiresAt > new Date();
      return NextResponse.json({ status: isActive ? "approved" : "expired" });
    }
  }

  if (productId) {
    const purchase = await prisma.productPurchase.findUnique({
      where: { userId_productId: { userId: session.user.id, productId } },
    });
    if (purchase) return NextResponse.json({ status: "approved" });
  }

  // Check if there's a pending payment
  const payment = await prisma.payment.findFirst({
    where: {
      userId: session.user.id,
      ...(courseId ? { courseId } : { productId: productId! }),
      status: "pending",
    },
  });

  return NextResponse.json({ status: payment ? "pending" : "unknown" });
}
