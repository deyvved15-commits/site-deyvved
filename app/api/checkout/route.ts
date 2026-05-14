import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mpPreference } from "@/lib/mercadopago";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, walletAmount: rawWalletAmount } = await req.json();
  if (!courseId) return NextResponse.json({ error: "courseId obrigatório" }, { status: 400 });

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.published) return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 });
  if (!course.price || course.price <= 0) return NextResponse.json({ error: "Curso sem preço definido" }, { status: 400 });

  // Verifica matrícula existente
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (existing) {
    const isActive = !existing.expiresAt || existing.expiresAt > new Date();
    if (isActive) return NextResponse.json({ error: "Já matriculado" }, { status: 400 });
  }

  // Ler cookie de afiliado
  const cookieStore = await cookies();
  const refCode = cookieStore.get("kadima_ref")?.value ?? null;

  // Validar afiliado (não pode ser auto-indicação)
  let affiliateId: string | null = null;
  if (refCode) {
    const affiliate = await prisma.user.findUnique({
      where: { affiliateCode: refCode },
      select: { id: true },
    });
    if (affiliate && affiliate.id !== session.user.id) {
      affiliateId = affiliate.id;
    }
  }

  // Calcula uso da carteira
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { walletBalance: true },
  });
  const availableBalance = user?.walletBalance ?? 0;
  const walletAmount = Math.min(
    Math.max(0, Number(rawWalletAmount) || 0),
    availableBalance,
    course.price
  );
  const amountToPay = Math.max(0, course.price - walletAmount);

  // Se o saldo cobre 100% do curso
  if (amountToPay <= 0) {
    // Debita carteira
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { walletBalance: { decrement: walletAmount } },
      }),
      prisma.walletTransaction.create({
        data: {
          userId: session.user.id,
          amount: -walletAmount,
          type: "course_purchase",
          description: `Compra do curso: ${course.title}`,
        },
      }),
      prisma.payment.create({
        data: {
          userId: session.user.id,
          courseId,
          amount: course.price,
          status: "approved",
          commissionAmount: null,
        },
      }),
      prisma.enrollment.upsert({
        where: { userId_courseId: { userId: session.user.id, courseId } },
        create: {
          userId: session.user.id,
          courseId,
          expiresAt: course.paymentType === "MONTHLY"
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : null,
        },
        update: {
          expiresAt: course.paymentType === "MONTHLY"
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : null,
        },
      }),
    ]);

    // Credita afiliado se houver
    if (affiliateId && course.affiliatePercentage > 0) {
      const commission = (course.price * course.affiliatePercentage) / 100;
      await prisma.$transaction([
        prisma.referral.upsert({
          where: { buyerId_courseId: { buyerId: session.user.id, courseId } },
          create: {
            referrerId: affiliateId,
            buyerId: session.user.id,
            courseId,
            amount: commission,
            status: "credited",
          },
          update: {
            amount: commission,
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

    return NextResponse.json({ paid: true, redirectUrl: `/checkout/sucesso?courseId=${courseId}` });
  }

  // Pagamento via Mercado Pago (valor restante)
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

  const preference = await mpPreference.create({
    body: {
      items: [{
        id: course.id,
        title: course.title,
        quantity: 1,
        unit_price: amountToPay,
        currency_id: "BRL",
      }],
      payer: {
        email: session.user.email ?? undefined,
        name: session.user.name ?? undefined,
      },
      back_urls: {
        success: `${baseUrl}/checkout/sucesso?courseId=${courseId}`,
        failure: `${baseUrl}/checkout/falha?courseId=${courseId}`,
        pending: `${baseUrl}/checkout/pendente?courseId=${courseId}`,
      },
      auto_return: "approved",
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      payment_methods: {
        installments: 12,
        default_installments: 1,
      },
      external_reference: `${session.user.id}:${courseId}:${affiliateId ?? "none"}:${walletAmount}`,
      statement_descriptor: "KADIMA ACADEMY",
    },
  });

  // Salva pagamento como pending
  await prisma.payment.create({
    data: {
      userId: session.user.id,
      courseId,
      amount: amountToPay,
      status: "pending",
      mpPreferenceId: preference.id ?? null,
    },
  });

  // Debita carteira se usou saldo parcial
  if (walletAmount > 0) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { walletBalance: { decrement: walletAmount } },
      }),
      prisma.walletTransaction.create({
        data: {
          userId: session.user.id,
          amount: -walletAmount,
          type: "course_purchase",
          description: `Desconto no curso: ${course.title}`,
        },
      }),
    ]);
  }

  return NextResponse.json({ checkoutUrl: preference.init_point });
}
