import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { emailCampanha } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { subject, body, ctaUrl, ctaLabel, audience, courseId } = await req.json();

  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Assunto e mensagem são obrigatórios." }, { status: 400 });
  }

  // Monta lista de destinatários
  let users: { id: string; name: string; email: string }[] = [];

  if (audience === "course" && courseId) {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: { user: { select: { id: true, name: true, email: true, active: true } } },
    });
    users = enrollments
      .map(e => e.user)
      .filter(u => u.active && u.email);
  } else if (audience === "active") {
    const enrollments = await prisma.enrollment.findMany({
      where: { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      include: { user: { select: { id: true, name: true, email: true, active: true } } },
      distinct: ["userId"],
    });
    users = enrollments
      .map(e => e.user)
      .filter(u => u.active && u.email);
  } else {
    // todos os alunos ativos
    users = await prisma.user.findMany({
      where: { active: true, role: "STUDENT" },
      select: { id: true, name: true, email: true },
    });
  }

  // Remove duplicatas por email
  const seen = new Set<string>();
  users = users.filter(u => {
    if (seen.has(u.email)) return false;
    seen.add(u.email);
    return true;
  });

  if (users.length === 0) {
    return NextResponse.json({ error: "Nenhum destinatário encontrado." }, { status: 400 });
  }

  const resend = getResend();
  let sent = 0;
  let failed = 0;

  // Envia em lotes de 50 (limite seguro do Resend)
  const BATCH = 50;
  for (let i = 0; i < users.length; i += BATCH) {
    const batch = users.slice(i, i + BATCH);
    await Promise.allSettled(
      batch.map(async (u) => {
        try {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: u.email,
            subject,
            html: emailCampanha({
              name: u.name ?? "Aluno",
              subject,
              body,
              ctaUrl: ctaUrl || undefined,
              ctaLabel: ctaLabel || undefined,
            }),
          });
          sent++;
        } catch {
          failed++;
        }
      })
    );
  }

  return NextResponse.json({ ok: true, sent, failed, total: users.length });
}
