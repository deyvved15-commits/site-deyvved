import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { calcStreak, STREAK_ACHIEVEMENTS } from "@/lib/streak";

const schema = z.object({ lessonId: z.string(), completed: z.boolean() });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { lessonId, completed } = parsed.data;

  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    update: { completed, completedAt: completed ? new Date() : null },
    create: { userId: session.user.id, lessonId, completed, completedAt: completed ? new Date() : null },
  });

  if (completed) {
    const allProgress = await prisma.lessonProgress.findMany({
      where: { userId: session.user.id, completed: true },
      select: { completedAt: true },
    });

    const streak = calcStreak(allProgress.map(p => p.completedAt));

    for (const milestone of STREAK_ACHIEVEMENTS) {
      if (streak >= milestone.days) {
        const achievement = await prisma.achievement.upsert({
          where: { id: `streak-${milestone.days}` },
          update: {},
          create: {
            id: `streak-${milestone.days}`,
            title: milestone.title,
            description: milestone.description,
            icon: milestone.icon,
            type: "streak",
          },
        });

        await prisma.userAchievement.upsert({
          where: { userId_achievementId: { userId: session.user.id, achievementId: achievement.id } },
          update: {},
          create: { userId: session.user.id, achievementId: achievement.id },
        });
      }
    }

    // Check if this module is now complete → notify about unlocked dependent modules
    const lessonWithModule = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        module: {
          select: {
            id: true,
            lessons: { select: { id: true } },
            course: { select: { slug: true } },
            dependentModules: { select: { id: true, title: true } },
          },
        },
      },
    });

    if (lessonWithModule?.module) {
      const mod = lessonWithModule.module;
      const allLessonIds = mod.lessons.map(l => l.id);
      const completedCount = await prisma.lessonProgress.count({
        where: { userId: session.user.id, lessonId: { in: allLessonIds }, completed: true },
      });

      if (completedCount === allLessonIds.length && mod.dependentModules.length > 0) {
        await prisma.notification.createMany({
          data: mod.dependentModules.map(dep => ({
            userId: session.user.id,
            title: "Novo módulo liberado!",
            message: `O módulo "${dep.title}" agora está disponível para você.`,
            type: "MODULE_UNLOCK",
            link: `/cursos/${mod.course.slug}`,
          })),
          skipDuplicates: true,
        });
      }
    }

    return NextResponse.json({ ...progress, streak });
  }

  return NextResponse.json(progress);
}
