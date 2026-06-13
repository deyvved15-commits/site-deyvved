import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — busca mensagens da sessão ativa (com suporte a polling incremental)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const after = searchParams.get("after"); // ISO timestamp para polling incremental

  if (!sessionId) return NextResponse.json({ error: "sessionId obrigatório" }, { status: 400 });

  const [messages, pinned, mute] = await Promise.all([
    prisma.liveMessage.findMany({
      where: {
        sessionId,
        deleted: false,
        pinned: false,
        ...(after ? { createdAt: { gt: new Date(after) } } : {}),
      },
      orderBy: { createdAt: "asc" },
      take: 200,
      select: {
        id: true, text: true, pinned: true, isAnnouncement: true, createdAt: true,
        user: { select: { id: true, name: true, role: true, avatar: true } },
      },
    }),
    prisma.liveMessage.findFirst({
      where: { sessionId, pinned: true, deleted: false },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, text: true, createdAt: true,
        user: { select: { id: true, name: true } },
      },
    }),
    // verifica se o usuário atual está silenciado
    prisma.liveMute.findUnique({
      where: { userId_sessionId: { userId: session.user.id, sessionId } },
      select: { mutedUntil: true },
    }),
  ]);

  const isMuted = mute ? new Date(mute.mutedUntil) > new Date() : false;

  return NextResponse.json({ messages, pinned, isMuted });
}

// POST — envia mensagem
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId, text, isAnnouncement } = await req.json();
  if (!sessionId || !text?.trim()) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  if (text.trim().length > 500) return NextResponse.json({ error: "Mensagem muito longa" }, { status: 400 });

  // Verifica se está silenciado
  const mute = await prisma.liveMute.findUnique({
    where: { userId_sessionId: { userId: session.user.id, sessionId } },
  });
  if (mute && new Date(mute.mutedUntil) > new Date()) {
    return NextResponse.json({ error: "Você está silenciado" }, { status: 403 });
  }

  // Só admin/teacher pode enviar anúncio
  const canAnnounce = session.user.role === "ADMIN" || session.user.role === "TEACHER";

  const message = await prisma.liveMessage.create({
    data: {
      sessionId,
      userId: session.user.id,
      text: text.trim(),
      isAnnouncement: canAnnounce && !!isAnnouncement,
    },
    select: {
      id: true, text: true, pinned: true, isAnnouncement: true, createdAt: true,
      user: { select: { id: true, name: true, role: true, avatar: true } },
    },
  });

  return NextResponse.json(message, { status: 201 });
}
