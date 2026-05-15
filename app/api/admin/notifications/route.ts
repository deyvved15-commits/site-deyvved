import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendPushToUser } from "@/lib/push";

const schema = z.object({
  target: z.enum(["all", "user", "course"]),
  userId: z.string().optional(),
  courseId: z.string().optional(),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  link: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { target, userId, courseId, title, message, link } = parsed.data;

  let userIds: string[] = [];

  if (target === "all") {
    const users = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true },
    });
    userIds = users.map(u => u.id);
  } else if (target === "user") {
    if (!userId) return NextResponse.json({ error: "userId obrigatório" }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    userIds = [userId];
  } else if (target === "course") {
    if (!courseId) return NextResponse.json({ error: "courseId obrigatório" }, { status: 400 });
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      select: { userId: true },
    });
    userIds = enrollments.map(e => e.userId);
  }

  if (userIds.length === 0) {
    return NextResponse.json({ sent: 0, message: "Nenhum destinatário encontrado" });
  }

  await prisma.notification.createMany({
    data: userIds.map(id => ({
      userId: id,
      title,
      message,
      type: "ADMIN_BROADCAST",
      link: link || null,
    })),
  });

  userIds.forEach(id =>
    sendPushToUser(id, { title, message, url: link })
  );

  return NextResponse.json({ sent: userIds.length });
}

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const notifications = await prisma.notification.findMany({
    where: { type: "ADMIN_BROADCAST" },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      message: true,
      link: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
  });

  // Aggregate: group by (title+message+createdAt minute) to show summary
  const grouped = new Map<string, { title: string; message: string; link: string | null; createdAt: Date; count: number }>();
  for (const n of notifications) {
    const minute = new Date(n.createdAt);
    minute.setSeconds(0, 0);
    const key = `${n.title}__${n.message}__${minute.toISOString()}`;
    if (grouped.has(key)) {
      grouped.get(key)!.count++;
    } else {
      grouped.set(key, { title: n.title, message: n.message, link: n.link, createdAt: n.createdAt, count: 1 });
    }
  }

  return NextResponse.json({ broadcasts: Array.from(grouped.values()) });
}
