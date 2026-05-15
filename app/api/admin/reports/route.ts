import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "alunos";
  const courseId = searchParams.get("courseId") ?? undefined;
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined;
  const to = searchParams.get("to") ? new Date(searchParams.get("to") + "T23:59:59") : undefined;

  const dateFilter = (field: "createdAt" | "issuedAt" | "completedAt") =>
    from || to
      ? { [field]: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
      : {};

  if (type === "alunos") {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        ...(courseId ? { courseId } : {}),
        ...dateFilter("createdAt"),
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, church: true } },
        course: { select: { id: true, title: true } },
      },
    });
    return NextResponse.json({ data: enrollments });
  }

  if (type === "financeiro") {
    const payments = await prisma.payment.findMany({
      where: {
        status: "approved",
        ...(courseId ? { courseId } : {}),
        ...dateFilter("createdAt"),
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
        product: { select: { id: true, title: true } },
      },
    });
    const total = payments.reduce((s, p) => s + p.amount, 0);
    return NextResponse.json({ data: payments, total });
  }

  if (type === "formados") {
    const certificates = await prisma.certificate.findMany({
      where: {
        ...(courseId ? { courseId } : {}),
        ...dateFilter("issuedAt"),
      },
      orderBy: { issuedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    });
    return NextResponse.json({ data: certificates });
  }

  if (type === "progresso") {
    const courses = await prisma.course.findMany({
      where: {
        published: true,
        ...(courseId ? { id: courseId } : {}),
      },
      select: {
        id: true,
        title: true,
        enrollments: { select: { userId: true } },
        modules: {
          where: { isBonus: false },
          select: {
            lessons: {
              select: {
                id: true,
                progress: {
                  where: { completed: true },
                  select: { userId: true },
                },
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
      const completedLessonsByUser = allLessons.reduce<Record<string, number>>((acc, l) => {
        for (const p of l.progress) {
          acc[p.userId] = (acc[p.userId] ?? 0) + 1;
        }
        return acc;
      }, {});
      const graduated = Object.values(completedLessonsByUser).filter(n => n >= totalLessons && totalLessons > 0).length;
      const avgPct = totalStudents > 0 && totalLessons > 0
        ? Math.round(
            Object.values(completedLessonsByUser).reduce((s, n) => s + Math.min(n / totalLessons, 1), 0)
            / totalStudents * 100
          )
        : 0;
      return { id: c.id, title: c.title, totalStudents, totalLessons, graduated, avgPct };
    });

    return NextResponse.json({ data });
  }

  if (type === "log") {
    const progress = await prisma.lessonProgress.findMany({
      where: {
        completed: true,
        ...(dateFilter("completedAt").completedAt ? dateFilter("completedAt") : dateFilter("createdAt")),
        ...(courseId
          ? { lesson: { module: { courseId } } }
          : {}),
      },
      orderBy: { completedAt: "desc" },
      take: 500,
      include: {
        user: { select: { id: true, name: true, email: true } },
        lesson: {
          select: {
            id: true,
            title: true,
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
    return NextResponse.json({ data: progress });
  }

  return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
}
