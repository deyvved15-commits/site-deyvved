import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST — silencia um aluno por X minutos (admin/teacher)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, sessionId, minutes = 10 } = await req.json();
  if (!userId || !sessionId) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const mutedUntil = new Date(Date.now() + minutes * 60 * 1000);

  const mute = await prisma.liveMute.upsert({
    where: { userId_sessionId: { userId, sessionId } },
    update: { mutedUntil },
    create: { userId, sessionId, mutedUntil },
  });

  return NextResponse.json(mute);
}

// DELETE — remove silêncio de um aluno (admin/teacher)
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, sessionId } = await req.json();
  await prisma.liveMute.deleteMany({ where: { userId, sessionId } });
  return NextResponse.json({ ok: true });
}
