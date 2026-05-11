import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { lessonId } = await params;

  const { rating, feedback } = await req.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  const upsert = await prisma.lessonRating.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    update: { rating, feedback },
    create: { userId: session.user.id, lessonId, rating, feedback }
  });

  return NextResponse.json(upsert);
}
