import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { mpPayment } from "@/lib/mercadopago";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { emailConfirmacaoPagamento } from "@/lib/email-templates";

function verifySignature(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return false;

  const xSignature = req.headers.get("x-signature") ?? "";
  const xRequestId = req.headers.get("x-request-id") ?? "";

  // Extrai ts e v1 do header x-signature
  const parts = Object.fromEntries(xSignature.split(",").map((p) => p.split("=")));
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

    // Formato: userId:courseId:affiliateId:walletAmount:couponId
    const parts = externalRef.split(":");
    const userId = parts[0];
    const courseId = parts[1];
    const affiliateId = parts[2] && parts[2] !== "none" ? parts[2] : null;
    const walletAmountUsed = parts[3] ? parseFloat(parts[3]) : 0;
    const couponId = parts[4] && parts[4] !== "none" ? parts[4] : null;

    if (!userId || !courseId) return NextResponse.json({ ok: true });

    const course = await prisma.course.findUnique({ 
      where: { id: courseId }, 
      include: { 
        teachers: { select: { teacherId: true, commissionPercentage: true } } 
      } 
    });

    const amount = mpData.transaction_amount ?? course?.price ?? 0;
    const fullAmount = amount + walletAmountUsed; // Valor real do curso
    
    // Calculate total commission sum
    const totalCommissionPercentage = course?.teachers.reduce((acc, t) => acc + t.commissionPercentage, 0) || 0;
    const totalCommissionAmount = (status === "approved" && totalCommissionPercentage > 0)
      ? (fullAmount * totalCommissionPercentage) / 100
      : null;

    await prisma.payment.updateMany({
      where: {
        userId,
        courseId,
        ...(preferenceId ? { mpPreferenceId: preferenceId } : { status: "pending" }),
      },
      data: {
        status: status ?? "pending",
        mpPaymentId: paymentId,
        commissionAmount: totalCommissionAmount,
      },
    });

    // If approved, handle teacher individual earnings
    if (status === "approved" && course) {
      // Find the payment record(s) we just updated to get the IDs
      const updatedPayments = await prisma.payment.findMany({
        where: { mpPaymentId: paymentId, status: "approved" },
        select: { id: true }
      });

      for (const p of updatedPayments) {
        // Create individual earnings for each teacher
        await prisma.teacherEarning.createMany({
          data: course.teachers.filter(t => t.commissionPercentage > 0).map(t => ({
            teacherId: t.teacherId,
            paymentId: p.id,
            amount: (fullAmount * t.commissionPercentage) / 100
          }))
        });
      }

      // ── Afiliado: creditar comissão ──
      if (affiliateId && course.affiliatePercentage > 0) {
        const commission = (fullAmount * course.affiliatePercentage) / 100;
        
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
            update: {
              amount: { increment: commission },
              status: "credited",
            },
          }),
          prisma.user.update({
            where: { id: affiliateId },
            data: { walletBalance: { increment: commission } },
          }),
          prisma.walletTransaction.create({
            data: {
              userId: affiliateId,
              amount: commission,
              type: "affiliate_commission",
              description: `Comissão: ${course.title}`,
            },
          }),
        ]);
      }
    }

    if (status === "approved") {
      // ── Cupom: incrementar uso ──
      if (couponId) {
        await prisma.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } }
        }).catch(err => console.error("[webhook/coupon]", err));
      }
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });

      const expiresAt = course?.paymentType === "MONTHLY"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : null;

      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId, courseId } },
        create: { userId, courseId, expiresAt },
        update: { expiresAt },
      });

      // Email de confirmação de pagamento
      if (user?.email && course) {
        getResend().emails.send({
          from: FROM_EMAIL,
          to: user.email,
          subject: `Pagamento confirmado — ${course.title}`,
          html: emailConfirmacaoPagamento({
            name: user.name ?? "Aluno",
            courseName: course.title,
            amount: mpData.transaction_amount ?? course.price ?? 0,
            isMonthly: course.paymentType === "MONTHLY",
          }),
        }).catch(err => console.error("[email/pagamento]", err));
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook/mp]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
