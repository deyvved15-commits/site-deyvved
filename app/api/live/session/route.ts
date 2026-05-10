import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — qualquer aluno autenticado verifica se há sessão ativa
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const live = await prisma.liveSession.findFirst({ where: { active: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(live ?? null);
}

// POST — admin cria/abre uma nova sessão
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, roomName } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Título obrigatório" }, { status: 400 });

  // Encerra qualquer sessão ativa anterior
  await prisma.liveSession.updateMany({ where: { active: true }, data: { active: false, endedAt: new Date() } });

  const room = roomName?.trim() || `kadima-${Date.now()}`;
  const live = await prisma.liveSession.create({ data: { title: title.trim(), roomName: room, active: true } });

  return NextResponse.json(live, { status: 201 });
}

// DELETE — admin encerra a sessão ativa
export async function DELETE() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.liveSession.updateMany({ where: { active: true }, data: { active: false, endedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
