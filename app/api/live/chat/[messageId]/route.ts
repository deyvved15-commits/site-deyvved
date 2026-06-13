import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ messageId: string }> };

// DELETE — apaga mensagem (admin/teacher apaga qualquer uma; aluno apaga só a própria)
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId } = await params;
  const msg = await prisma.liveMessage.findUnique({ where: { id: messageId } });
  if (!msg) return NextResponse.json({ error: "Mensagem não encontrada" }, { status: 404 });

  const isPrivileged = session.user.role === "ADMIN" || session.user.role === "TEACHER";
  if (!isPrivileged && msg.userId !== session.user.id) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  await prisma.liveMessage.update({ where: { id: messageId }, data: { deleted: true } });
  return NextResponse.json({ ok: true });
}

// PATCH — fixar/desfixar mensagem (admin/teacher)
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { messageId } = await params;
  const { pinned } = await req.json();

  // Desfixa qualquer outra mensagem fixada antes
  if (pinned) {
    const msg = await prisma.liveMessage.findUnique({ where: { id: messageId } });
    if (msg) {
      await prisma.liveMessage.updateMany({
        where: { sessionId: msg.sessionId, pinned: true },
        data: { pinned: false },
      });
    }
  }

  const updated = await prisma.liveMessage.update({
    where: { id: messageId },
    data: { pinned: !!pinned },
  });

  return NextResponse.json(updated);
}
