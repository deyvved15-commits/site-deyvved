import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mpPreference } from "@/lib/mercadopago";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  let session = await auth();
  const body = await req.json();
  const { courseId, productId, walletAmount: rawWalletAmount, userData, couponId } = body;

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

  if (!courseId && !productId) return NextResponse.json({ error: "courseId ou productId obrigatório" }, { status: 400 });

  let itemTitle = "";
  let itemPrice = 0;
  let itemId = "";
  let itemType: "COURSE" | "PRODUCT" = "COURSE";

  if (courseId) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || !course.published) return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 });
    if (!course.price || course.price <= 0) return NextResponse.json({ error: "Curso sem preço definido" }, { status: 400 });
    itemTitle = course.title;
    itemPrice = course.price;
    itemId = course.id;
    itemType = "COURSE";

    // Verifica matrícula existente
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session!.user.id, courseId } },
    });
    if (existing) {
      const isActive = !existing.expiresAt || existing.expiresAt > new Date();
      if (isActive) return NextResponse.json({ error: "Já matriculado" }, { status: 400 });
    }
  } else if (productId) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.published) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    itemTitle = product.title;
    itemPrice = product.price;
    itemId = product.id;
    itemType = "PRODUCT";

    // Verifica se já comprou
    const existing = await prisma.productPurchase.findUnique({
      where: { userId_productId: { userId: session!.user.id, productId } },
    });
    if (existing) return NextResponse.json({ error: "Você já adquiriu este produto" }, { status: 400 });
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
          ? (itemPrice * coupon.discountValue) / 100
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
  const priceAfterCoupon = Math.max(0, itemPrice - couponDiscount);

  const walletAmount = Math.min(
    Math.max(0, Number(rawWalletAmount) || 0),
    availableBalance,
    priceAfterCoupon
  );
  
  const amountToPay = Math.max(0, priceAfterCoupon - walletAmount);

  // Se o saldo + cupom cobre 100% do item
  if (amountToPay <= 0) {
    // Se usou cupom, incrementa uso
    if (validCouponId) {
      await prisma.coupon.update({
        where: { id: validCouponId },
        data: { usedCount: { increment: 1 } }
      });
    }

    // Debita carteira e registra acesso/compra
    await prisma.$transaction(async (tx) => {
      if (walletAmount > 0) {
        await tx.user.update({
          where: { id: session!.user.id },
          data: { walletBalance: { decrement: walletAmount } },
        });

        await tx.walletTransaction.create({
          data: {
            userId: session!.user.id,
            amount: -walletAmount,
            type: "PURCHASE",
            description: `Compra: ${itemTitle}`,
          },
        });
      }

      await tx.payment.create({
        data: {
          userId: session!.user.id,
          courseId: courseId || null,
          productId: productId || null,
          couponId: validCouponId,
          amount: itemPrice,
          walletUsed: walletAmount,
          method: "WALLET",
          status: "approved",
          externalReference: `wallet_${Date.now()}`,
        },
      });

      if (itemType === "COURSE" && courseId) {
        const course = await tx.course.findUnique({ where: { id: courseId } });
        await tx.enrollment.upsert({
          where: { userId_courseId: { userId: session!.user.id, courseId } },
          create: {
            userId: session!.user.id,
            courseId,
            expiresAt: course?.paymentType === "MONTHLY"
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              : null,
          },
          update: {
            expiresAt: course?.paymentType === "MONTHLY"
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              : null,
          },
        });

        // Credita afiliado se houver curso
        if (affiliateId && course && course.affiliatePercentage > 0) {
          const commission = (course.price! * course.affiliatePercentage) / 100;
          await tx.referral.upsert({
            where: { buyerId_courseId: { buyerId: session!.user.id, courseId } },
            create: {
              referrerId: affiliateId,
              buyerId: session!.user.id,
              courseId,
              amount: commission,
              status: "credited",
            },
            update: { amount: commission, status: "credited" },
          });
          await tx.user.update({
            where: { id: affiliateId },
            data: { walletBalance: { increment: commission } },
          });
          await tx.walletTransaction.create({
            data: {
              userId: affiliateId,
              amount: commission,
              type: "COMMISSION",
              description: `Comissão: ${course.title}`,
            },
          });
        }
      } else if (itemType === "PRODUCT" && productId) {
        await tx.productPurchase.create({
          data: {
            userId: session!.user.id,
            productId,
            amount: 0,
          }
        });
      }
    });

    return NextResponse.json({ 
      paid: true, 
      redirectUrl: itemType === "COURSE" ? `/checkout/sucesso?courseId=${courseId}` : "/loja" 
    });
  }

  // Pagamento via Mercado Pago (valor restante)
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

  const preference = await mpPreference.create({
    body: {
      items: [{
        id: itemId,
        title: itemTitle,
        quantity: 1,
        unit_price: amountToPay,
        currency_id: "BRL",
      }],
      payer: {
        email: session!.user.email ?? undefined,
        name: session!.user.name ?? undefined,
      },
      back_urls: {
        success: `${baseUrl}/checkout/sucesso?${itemType === 'COURSE' ? 'courseId='+courseId : 'productId='+productId}`,
        failure: `${baseUrl}/checkout/falha?${itemType === 'COURSE' ? 'courseId='+courseId : 'productId='+productId}`,
        pending: `${baseUrl}/checkout/pendente?${itemType === 'COURSE' ? 'courseId='+courseId : 'productId='+productId}`,
      },
      auto_return: "approved",
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      external_reference: `${session!.user.id}:${courseId ?? "none"}:${affiliateId ?? "none"}:${walletAmount}:${validCouponId ?? "none"}:${productId ?? "none"}`,
      statement_descriptor: "KADIMA ACADEMY",
    },
  });

  // Salva pagamento como pending
  await prisma.payment.create({
    data: {
      userId: session!.user.id,
      courseId: courseId || null,
      productId: productId || null,
      couponId: validCouponId,
      amount: amountToPay,
      walletUsed: walletAmount,
      status: "pending",
      externalReference: preference.id,
    },
  });

  // Se usou saldo parcial, debita agora para "reservar" o valor
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
          type: "PURCHASE",
          description: `Pagamento parcial: ${itemTitle}`,
        },
      }),
    ]);
  }

  return NextResponse.json({ checkoutUrl: preference.init_point });
}
