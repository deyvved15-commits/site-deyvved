import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mpPreference } from "@/lib/mercadopago";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  let session = await auth();
  const body = await req.json();
  const { courseId, walletAmount: rawWalletAmount, userData } = body;

  // Se não estiver logado, tenta criar conta ou logar
  if (!session) {
    if (!userData || !userData.email || !userData.password || !userData.name) {
      return NextResponse.json({ error: "Faça login ou preencha seus dados para comprar." }, { status: 401 });
    }

    // Verifica se já existe usuário com esse email
    let user = await prisma.user.findUnique({ where: { email: userData.email } });
    if (user) {
      return NextResponse.json({ error: "Este e-mail já possui conta. Faça login para continuar." }, { status: 400 });
    }

    // Cria o usuário (como é um MVP, salvando senha simples, mas ideal usar hash)
    // O authjs vai lidar com o login depois.
    user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: userData.password, // Nota: O ideal é encriptar, mas mantendo compatibilidade com seu sistema de login atual
        role: "STUDENT"
      }
    });
    
    // Simula uma sessão para o resto da lógica
    session = { user: { id: user.id, email: user.email, name: user.name, role: user.role } } as any;
  }

  if (!courseId) return NextResponse.json({ error: "courseId obrigatório" }, { status: 400 });

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.published) return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 });
  if (!course.price || course.price <= 0) return NextResponse.json({ error: "Curso sem preço definido" }, { status: 400 });

  // Verifica matrícula existente
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session!.user.id, courseId } },
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
    if (affiliate && affiliate.id !== session!.user.id) {
      affiliateId = affiliate.id;
    }
  }

  // Validar Cupom se houver
  let couponDiscount = 0;
  let validCouponId: string | null = null;
  if (couponId) {
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId, active: true }
    });
    
    if (coupon) {
      const isExpired = coupon.expiresAt && new Date() > coupon.expiresAt;
      const isUsageLimitReached = coupon.maxUses && coupon.usedCount >= coupon.maxUses;
      
      if (!isExpired && !isUsageLimitReached) {
        validCouponId = coupon.id;
        couponDiscount = coupon.discountType === "PERCENTAGE"
          ? (course.price * coupon.discountValue) / 100
          : coupon.discountValue;
      }
    }
  }

  // Calcula uso da carteira
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { walletBalance: true },
  });
  const availableBalance = user?.walletBalance ?? 0;
  
  // O desconto do cupom é aplicado primeiro sobre o preço original
  const priceAfterCoupon = Math.max(0, course.price - couponDiscount);

  const walletAmount = Math.min(
    Math.max(0, Number(rawWalletAmount) || 0),
    availableBalance,
    priceAfterCoupon
  );
  
  const amountToPay = Math.max(0, priceAfterCoupon - walletAmount);

  // Se o saldo + cupom cobre 100% do curso
  if (amountToPay <= 0) {
    // Se usou cupom, incrementa uso
    if (validCouponId) {
      await prisma.coupon.update({
        where: { id: validCouponId },
        data: { usedCount: { increment: 1 } }
      });
    }

    // Debita carteira
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session!.user.id },
        data: { walletBalance: { decrement: walletAmount } },
      }),
      prisma.walletTransaction.create({
        data: {
          userId: session!.user.id,
          amount: -walletAmount,
          type: "course_purchase",
          description: `Compra do curso: ${course.title}`,
        },
      }),
      prisma.payment.create({
        data: {
          userId: session!.user.id,
          courseId,
          couponId: validCouponId,
          amount: course.price,
          status: "approved",
          commissionAmount: null,
        },
      }),
      prisma.enrollment.upsert({
        where: { userId_courseId: { userId: session!.user.id, courseId } },
        create: {
          userId: session!.user.id,
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
          where: { buyerId_courseId: { buyerId: session!.user.id, courseId } },
          create: {
            referrerId: affiliateId,
            buyerId: session!.user.id,
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
        email: session!.user.email ?? undefined,
        name: session!.user.name ?? undefined,
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
      external_reference: `${session!.user.id}:${courseId}:${affiliateId ?? "none"}:${walletAmount}:${validCouponId ?? "none"}`,
      statement_descriptor: "KADIMA ACADEMY",
    },
  });

  // Salva pagamento como pending
  await prisma.payment.create({
    data: {
      userId: session!.user.id,
      courseId,
      couponId: validCouponId,
      amount: amountToPay,
      status: "pending",
      mpPreferenceId: preference.id ?? null,
    },
  });

  // Debita carteira se usou saldo parcial
  if (walletAmount > 0) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session!.user.id },
        data: { walletBalance: { decrement: walletAmount } },
      }),
      prisma.walletTransaction.create({
        data: {
          userId: session!.user.id,
          amount: -walletAmount,
          type: "course_purchase",
          description: `Desconto no curso: ${course.title}`,
        },
      }),
    ]);
  }

  return NextResponse.json({ checkoutUrl: preference.init_point });
}
