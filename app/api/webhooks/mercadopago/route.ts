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

    const [userId, courseId] = externalRef.split(":");
    if (!userId || !courseId) return NextResponse.json({ ok: true });

    await prisma.payment.updateMany({
      where: {
        userId,
        courseId,
        ...(preferenceId ? { mpPreferenceId: preferenceId } : { status: "pending" }),
      },
      data: {
        status: status ?? "pending",
        mpPaymentId: paymentId,
      },
    });

    if (status === "approved") {
      const [course, user] = await Promise.all([
        prisma.course.findUnique({ where: { id: courseId }, select: { title: true, paymentType: true, price: true } }),
        prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
      ]);

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
