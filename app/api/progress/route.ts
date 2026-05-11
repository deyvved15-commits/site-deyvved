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

    return NextResponse.json({ ...progress, streak });
  }

  return NextResponse.json(progress);
}
