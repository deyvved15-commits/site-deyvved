import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { lessonId } = await params;

  const bookmark = await prisma.lessonBookmark.findUnique({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
  });

  return NextResponse.json({ bookmarked: !!bookmark, note: bookmark?.note ?? null });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { lessonId } = await params;

  const body = await req.json().catch(() => ({}));
  const note: string | null = typeof body.note === "string" ? body.note.slice(0, 200) : null;

  const existing = await prisma.lessonBookmark.findUnique({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
  });

  if (existing) {
    await prisma.lessonBookmark.delete({ where: { id: existing.id } });
    return NextResponse.json({ bookmarked: false });
  }

  await prisma.lessonBookmark.create({
    data: { userId: session.user.id, lessonId, note },
  });

  return NextResponse.json({ bookmarked: true });
}
