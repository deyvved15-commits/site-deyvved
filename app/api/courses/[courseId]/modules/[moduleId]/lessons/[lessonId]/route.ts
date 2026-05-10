import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(2).optional(),
  youtubeUrl: z.string().min(5).optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  duration: z.string().optional(),
  releaseAfterDays: z.number().int().min(0).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { lessonId } = await params;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const lesson = await prisma.lesson.update({ where: { id: lessonId }, data: parsed.data });
  return NextResponse.json(lesson);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { lessonId } = await params;

  await prisma.lesson.delete({ where: { id: lessonId } });
  return NextResponse.json({ ok: true });
}
