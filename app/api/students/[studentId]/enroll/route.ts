import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ courseId: z.string() });

export async function POST(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { studentId } = await params;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: studentId, courseId: parsed.data.courseId } },
    update: {},
    create: { userId: studentId, courseId: parsed.data.courseId },
  });
  return NextResponse.json(enrollment, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { studentId } = await params;

  const { courseId } = await req.json();
  await prisma.enrollment.delete({
    where: { userId_courseId: { userId: studentId, courseId } },
  });
  return NextResponse.json({ ok: true });
}
