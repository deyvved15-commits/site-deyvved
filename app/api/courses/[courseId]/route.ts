import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  price: z.number().positive().nullable().optional(),
  paymentType: z.enum(["ONE_TIME", "MONTHLY"]).optional(),
  published: z.boolean().optional(),
  teacherId: z.string().nullable().optional(),
  commissionPercentage: z.number().min(0).max(100).optional(),
});

export async function GET(_: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(course);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { courseId } = await params;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const course = await prisma.course.update({ where: { id: courseId }, data: parsed.data });
  return NextResponse.json(course);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { courseId } = await params;

  await prisma.course.delete({ where: { id: courseId } });
  return NextResponse.json({ ok: true });
}
