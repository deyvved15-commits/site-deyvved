import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mpPreference } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await req.json();
  if (!courseId) return NextResponse.json({ error: "courseId obrigatório" }, { status: 400 });

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.published) return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 });
  if (!course.price || course.price <= 0) return NextResponse.json({ error: "Curso sem preço definido" }, { status: 400 });

  // Verifica matrícula existente
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  // Bloqueia se já matriculado e acesso ainda válido
  if (existing) {
    const isActive = !existing.expiresAt || existing.expiresAt > new Date();
    if (isActive) return NextResponse.json({ error: "Já matriculado" }, { status: 400 });
  }

  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

  const preference = await mpPreference.create({
    body: {
      items: [{
        id: course.id,
        title: course.title,
        quantity: 1,
        unit_price: course.price,
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
      external_reference: `${session.user.id}:${courseId}`,
      statement_descriptor: "KADIMA ACADEMY",
    },
  });

  // Salva o pagamento como pending
  await prisma.payment.create({
    data: {
      userId: session.user.id,
      courseId,
      amount: course.price,
      status: "pending",
      mpPreferenceId: preference.id ?? null,
    },
  });

  return NextResponse.json({ checkoutUrl: preference.init_point });
}
