import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(2),
  youtubeUrl: z.string().min(5),
  description: z.string().optional(),
  content: z.string().optional(),
  duration: z.string().optional(),
  releaseAfterDays: z.number().int().min(0).default(0),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string; moduleId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { moduleId } = await params;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const count = await prisma.lesson.count({ where: { moduleId } });
  const lesson = await prisma.lesson.create({
    data: { ...parsed.data, moduleId, order: count },
  });
  return NextResponse.json(lesson, { status: 201 });
}
