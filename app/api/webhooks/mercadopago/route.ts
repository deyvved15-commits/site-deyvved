import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { mpPayment } from "@/lib/mercadopago";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { emailConfirmacaoPagamento } from "@/lib/email-templates";

function verifySignature(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[MP Webhook] MP_WEBHOOK_SECRET is not set. Skipping signature verification.");
    return false;
  }

  const xSignature = req.headers.get("x-signature") ?? "";
  const xRequestId = req.headers.get("x-request-id") ?? "";

  // Safe parsing of x-signature header (ts=...,v1=...)
  const parts: Record<string, string> = {};
  xSignature.split(",").forEach(item => {
    const [key, val] = item.split("=");
    if (key && val) parts[key.trim()] = val.trim();
  });

  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  // Monta o manifest conforme documentação MP
  let dataId = "";
  try {
    const parsed = JSON.parse(rawBody);
    dataId = parsed?.data?.id ? String(parsed.data.id) : "";
  } catch {
    return false;
  }

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  return expected === v1;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    if (!verifySignature(req, rawBody)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    if (body.type !== "payment" || !body.data?.id) {
      return NextResponse.json({ ok: true });
    }

    const paymentId = String(body.data.id);
    let mpData;
    try {
      mpData = await mpPayment.get({ id: paymentId });
    } catch {
      return NextResponse.json({ ok: true });
    }

    if (!mpData) return NextResponse.json({ ok: true });

    const status = mpData.status;
    const externalRef = mpData.external_reference;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const preferenceId = (mpData as any).preference_id ? String((mpData as any).preference_id) : null;

    if (!externalRef) return NextResponse.json({ ok: true });

    // Formato: userId:courseId:affiliateId:walletAmount:couponId:productId
    const parts = externalRef.split(":");
    const userId = parts[0];
    const courseId = parts[1] !== "none" ? parts[1] : null;
    const affiliateId = parts[2] && parts[2] !== "none" ? parts[2] : null;
    const walletAmountUsed = parts[3] ? parseFloat(parts[3]) : 0;
    const couponId = parts[4] && parts[4] !== "none" ? parts[4] : null;
    const productId = parts[5] && parts[5] !== "none" ? parts[5] : null;

    if (!userId || (!courseId && !productId)) return NextResponse.json({ ok: true });

    let itemTitle = "";
    let itemPrice = 0;
    let teachers: any[] = [];
    let affiliatePercentage = 0;
    let paymentType = "ONE_TIME";

    if (courseId) {
      const course = await prisma.course.findUnique({ 
        where: { id: courseId }, 
        include: { teachers: { select: { teacherId: true, commissionPercentage: true } } } 
      });
      if (course) {
        itemTitle = course.title;
        itemPrice = course.price ?? 0;
        teachers = course.teachers;
        affiliatePercentage = course.affiliatePercentage;
        paymentType = course.paymentType;
      }
    } else if (productId) {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (product) {
        itemTitle = product.title;
        itemPrice = product.price;
      }
    }

    const amount = mpData.transaction_amount ?? itemPrice;
    const fullAmount = amount + walletAmountUsed;
    
    // Calculate total commission sum
    const totalCommissionPercentage = teachers.reduce((acc, t) => acc + t.commissionPercentage, 0) || 0;
    const totalCommissionAmount = (status === "approved" && totalCommissionPercentage > 0)
      ? (fullAmount * totalCommissionPercentage) / 100
      : null;

    await prisma.payment.updateMany({
      where: {
        userId,
        ...(courseId ? { courseId } : { productId }),
        ...(preferenceId ? { externalReference: preferenceId } : { status: "pending" }),
      },
      data: {
        status: status ?? "pending",
        mpPaymentId: paymentId,
        commissionAmount: totalCommissionAmount,
      },
    });

    // If approved, handle earnings and enrollments
    if (status === "approved") {
      const updatedPayments = await prisma.payment.findMany({
        where: { mpPaymentId: paymentId, status: "approved" },
        select: { id: true }
      });

      // Earnings for teachers (only for courses)
      if (courseId && teachers.length > 0) {
        for (const p of updatedPayments) {
          await prisma.teacherEarning.createMany({
            data: teachers.filter(t => t.commissionPercentage > 0).map(t => ({
              teacherId: t.teacherId,
              paymentId: p.id,
              amount: (fullAmount * t.commissionPercentage) / 100
            }))
          });
        }
      }

      // ── Afiliado: creditar comissão (se for curso) ──
      if (courseId && affiliateId && affiliatePercentage > 0) {
        const commission = (fullAmount * affiliatePercentage) / 100;
        await prisma.$transaction([
          prisma.referral.upsert({
            where: { buyerId_courseId: { buyerId: userId, courseId } },
            create: {
              referrerId: affiliateId,
              buyerId: userId,
              courseId,
              paymentId: updatedPayments[0]?.id,
              amount: commission,
              status: "credited",
            },
            update: { amount: { increment: commission }, status: "credited" },
          }),
          prisma.user.update({
            where: { id: affiliateId },
            data: { walletBalance: { increment: commission } },
          }),
          prisma.walletTransaction.create({
            data: {
              userId: affiliateId,
              amount: commission,
              type: "COMMISSION",
              description: `Comissão: ${itemTitle}`,
            },
          }),
        ]);
      }

      // ── Cupom: incrementar uso ──
      if (couponId) {
        await prisma.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } }
        }).catch(() => {});
      }

      // ── Liberação de Acesso ──
      if (courseId) {
        const expiresAt = paymentType === "MONTHLY"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : null;

        await prisma.enrollment.upsert({
          where: { userId_courseId: { userId, courseId } },
          create: { userId, courseId, expiresAt },
          update: { expiresAt },
        });
      } else if (productId) {
        await prisma.productPurchase.upsert({
          where: { userId_productId: { userId, productId } },
          create: { userId, productId, amount: fullAmount },
          update: { amount: fullAmount }
        });
      }

      // Email de confirmação
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
      if (user?.email && itemTitle) {
        getResend().emails.send({
          from: FROM_EMAIL,
          to: user.email,
          subject: `Pagamento confirmado — ${itemTitle}`,
          html: emailConfirmacaoPagamento({
            name: user.name ?? "Aluno",
            courseName: itemTitle,
            amount: amount,
            isMonthly: paymentType === "MONTHLY",
          }),
        }).catch(() => {});
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook/mp]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
