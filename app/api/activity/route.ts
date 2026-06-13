import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });

  const { type, metadata } = await req.json();
  const allowed = ["WEEKLY_LESSON", "LIVE_VIEW", "LESSON_VIEW", "LESSON_COMPLETE", "PURCHASE"];
  if (!allowed.includes(type)) return NextResponse.json({ ok: false }, { status: 400 });

  // Deduplicação por dia para LESSON_VIEW e WEEKLY_LESSON
  if (type === "LESSON_VIEW" || type === "WEEKLY_LESSON") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lessonId = metadata?.lessonId as string | undefined;
    const existing = await prisma.activityLog.findFirst({
      where: {
        userId: session.user.id,
        type,
        createdAt: { gte: today, lt: tomorrow },
        ...(lessonId ? { metadata: { contains: lessonId } } : {}),
      },
    });
    if (existing) return NextResponse.json({ ok: true, deduplicated: true });
  }

  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      type,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });

  return NextResponse.json({ ok: true });
}
