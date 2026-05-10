import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { emailAvisoRenovacao } from "@/lib/email-templates";

export async function GET(req: NextRequest) {
  // Vercel cron envia o header Authorization com o CRON_SECRET
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Matrículas que expiram entre hoje e 7 dias — ainda não expiradas
  const expiring = await prisma.enrollment.findMany({
    where: {
      expiresAt: { gte: now, lte: in7Days },
    },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { id: true, title: true } },
    },
  });

  let sent = 0;
  for (const enrollment of expiring) {
    if (!enrollment.user.email || !enrollment.expiresAt) continue;

    const daysLeft = Math.ceil(
      (enrollment.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Envia apenas nos marcos: 7, 3, 1 dia
    if (![7, 3, 1].includes(daysLeft)) continue;

    try {
      await getResend().emails.send({
        from: FROM_EMAIL,
        to: enrollment.user.email,
        subject: `Seu acesso expira em ${daysLeft} dia${daysLeft !== 1 ? "s" : ""} — ${enrollment.course.title}`,
        html: emailAvisoRenovacao({
          name: enrollment.user.name ?? "Aluno",
          courseName: enrollment.course.title,
          daysLeft,
          courseId: enrollment.course.id,
        }),
      });
      sent++;
    } catch (err) {
      console.error("[cron/renewal-reminder]", err);
    }
  }

  return NextResponse.json({ ok: true, sent, total: expiring.length });
}
