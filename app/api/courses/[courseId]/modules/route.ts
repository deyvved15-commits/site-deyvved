import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ title: z.string().min(2), description: z.string().optional(), thumbnail: z.string().optional(), isBonus: z.boolean().optional() });

export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await params;
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const isAdmin = session.user.role === "ADMIN";
  const isTeacher = course.teacherId === session.user.id;

  if (!isAdmin && !isTeacher) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const count = await prisma.module.count({ where: { courseId } });
  const module = await prisma.module.create({
    data: { ...parsed.data, courseId, order: count },
  });
  return NextResponse.json(module, { status: 201 });
}
