import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ title: z.string().min(2).optional(), description: z.string().optional(), thumbnail: z.string().optional() });

export async function PUT(req: NextRequest, { params }: { params: Promise<{ courseId: string; moduleId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { moduleId } = await params;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const module = await prisma.module.update({ where: { id: moduleId }, data: parsed.data });
  return NextResponse.json(module);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ courseId: string; moduleId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { moduleId } = await params;

  await prisma.module.delete({ where: { id: moduleId } });
  return NextResponse.json({ ok: true });
}
