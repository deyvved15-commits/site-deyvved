import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") ?? "alunos";
    const courseId = searchParams.get("courseId") || undefined;
    const userId   = searchParams.get("userId")   || undefined;
    const fromStr  = searchParams.get("from");
    const toStr    = searchParams.get("to");
    const from     = fromStr ? new Date(fromStr) : undefined;
    const to       = toStr   ? new Date(toStr + "T23:59:59") : undefined;

    function dateRange(field: string) {
      if (!from && !to) return {};
      const range: Record<string, Date> = {};
      if (from) range.gte = from;
      if (to)   range.lte = to;
      return { [field]: range };
    }

    // ── ALUNOS ────────────────────────────────────────────────────────────────
    if (type === "alunos") {
      const where: Record<string, unknown> = {};
      if (courseId) where.courseId = courseId;
      if (userId)   where.userId   = userId;
      Object.assign(where, dateRange("createdAt"));

      const enrollments = await prisma.enrollment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, church: true } },
          course: { select: { id: true, title: true, paymentType: true } },
        },
      });
      return NextResponse.json({ data: enrollments });
    }

    // ── FINANCEIRO ────────────────────────────────────────────────────────────
    if (type === "financeiro") {
      const where: Record<string, unknown> = { status: "approved" };
      if (courseId) where.courseId = courseId;
      Object.assign(where, dateRange("createdAt"));

      const payments = await prisma.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 1000,
        include: {
          user:    { select: { id: true, name: true, email: true } },
          course:  { select: { id: true, title: true } },
          product: { select: { id: true, title: true } },
        },
      });
      const total     = payments.reduce((s, p) => s + (p.amount    ?? 0), 0);
      const walletSum = payments.reduce((s, p) => s + (p.walletUsed ?? 0), 0);
      return NextResponse.json({ data: payments, total, walletSum });
    }

    // ── FORMADOS ──────────────────────────────────────────────────────────────
    if (type === "formados") {
      const where: Record<string, unknown> = {};
      if (courseId) where.courseId = courseId;
      if (userId)   where.userId   = userId;
      Object.assign(where, dateRange("issuedAt"));

      const certificates = await prisma.certificate.findMany({
        where,
        orderBy: { issuedAt: "desc" },
        include: {
          user:   { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true } },
        },
      });
      return NextResponse.json({ data: certificates });
    }

    // ── PROGRESSO ─────────────────────────────────────────────────────────────
    if (type === "progresso") {
      const where: Record<string, unknown> = { published: true };
      if (courseId) where.id = courseId;

      const courses = await prisma.course.findMany({
        where,
        select: {
          id: true, title: true,
          enrollments: { select: { userId: true } },
          modules: {
            where: { isBonus: false },
            select: {
              lessons: {
                select: {
                  id: true,
                  progress: { where: { completed: true }, select: { userId: true } },
                },
              },
            },
          },
        },
        orderBy: { title: "asc" },
      });

      const data = courses.map(c => {
        const totalStudents = c.enrollments.length;
        const allLessons = c.modules.flatMap(m => m.lessons);
        const totalLessons = allLessons.length;
        const byUser = allLessons.reduce<Record<string, number>>((acc, l) => {
          for (const p of l.progress) acc[p.userId] = (acc[p.userId] ?? 0) + 1;
          return acc;
        }, {});
        const graduated = Object.values(byUser).filter(n => totalLessons > 0 && n >= totalLessons).length;
        const avgPct = totalStudents > 0 && totalLessons > 0
          ? Math.round(Object.values(byUser).reduce((s, n) => s + Math.min(n / totalLessons, 1), 0) / totalStudents * 100)
          : 0;
        return { id: c.id, title: c.title, totalStudents, totalLessons, graduated, avgPct };
      });

      return NextResponse.json({ data });
    }

    // ── LOG DOS ALUNOS ────────────────────────────────────────────────────────
    if (type === "log") {
      const where: Record<string, unknown> = { completed: true };
      if (userId) where.userId = userId;
      if (courseId) where.lesson = { module: { courseId } };

      // Filtra por data de conclusão ou criação
      if (from || to) {
        const range: Record<string, Date> = {};
        if (from) range.gte = from;
        if (to)   range.lte = to;
        where.createdAt = range;
      }

      const progress = await prisma.lessonProgress.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 500,
        include: {
          user: { select: { id: true, name: true, email: true, createdAt: true, lastLoginAt: true } },
          lesson: {
            select: {
              id: true, title: true,
              module: {
                select: {
                  title: true,
                  course: { select: { id: true, title: true } },
                },
              },
            },
          },
        },
      });

      // Busca data de matrícula para cada par userId+courseId presente no resultado
      const pairs = [...new Set(
        progress.map(p => `${p.userId}|${p.lesson.module.course.id}`)
      )].map(key => {
        const [uid, cid] = key.split("|");
        return { userId: uid, courseId: cid };
      });

      const enrollments = pairs.length > 0
        ? await prisma.enrollment.findMany({
            where: { OR: pairs },
            select: { userId: true, courseId: true, createdAt: true },
          })
        : [];

      const enrollMap = new Map(
        enrollments.map(e => [`${e.userId}|${e.courseId}`, e.createdAt])
      );

      const data = progress.map(p => ({
        ...p,
        enrolledAt: enrollMap.get(`${p.userId}|${p.lesson.module.course.id}`) ?? null,
      }));

      return NextResponse.json({ data });
    }

    // ── ATIVIDADES ────────────────────────────────────────────────────────────
    if (type === "atividades") {
      const activityType = searchParams.get("activityType") || undefined;
      const where: Record<string, unknown> = {};
      if (userId)       where.userId = userId;
      if (activityType) where.type   = activityType;
      if (from || to) {
        const range: Record<string, Date> = {};
        if (from) range.gte = from;
        if (to)   range.lte = to;
        where.createdAt = range;
      }

      const logs = await prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 500,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });

      return NextResponse.json({ data: logs });
    }

    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  } catch (err) {
    console.error("[reports]", err);
    return NextResponse.json({ error: "Erro interno ao gerar relatório" }, { status: 500 });
  }
}
