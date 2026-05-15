import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendPushToUser } from "@/lib/push";

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
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, moduleId } = await params;
  const course = await prisma.course.findUnique({ 
    where: { id: courseId },
    include: { teachers: true }
  });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const isAdmin = session.user.role === "ADMIN";
  const isTeacher = course.teachers.some(t => t.id === session.user.id);

  if (!isAdmin && !isTeacher) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const count = await prisma.lesson.count({ where: { moduleId } });
  const lesson = await prisma.lesson.create({
    data: { ...parsed.data, moduleId, order: count },
  });

  // Notificar alunos matriculados (se o curso estiver publicado)
  if (course.published) {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: course.id },
      select: { userId: true }
    });

    if (enrollments.length > 0) {
      await prisma.notification.createMany({
        data: enrollments.map(e => ({
          userId: e.userId,
          title: "Nova aula disponível!",
          message: `Uma nova aula "${lesson.title}" foi adicionada ao curso ${course.title}.`,
          type: "NEW_LESSON",
          link: `/cursos/${course.slug}`
        }))
      });
      // Fire push notifications without blocking the response
      enrollments.forEach(e =>
        sendPushToUser(e.userId, {
          title: "Nova aula disponível!",
          message: `"${lesson.title}" — ${course.title}`,
          url: `/cursos/${course.slug}`,
        })
      );
    }
  }

  return NextResponse.json(lesson, { status: 201 });
}
