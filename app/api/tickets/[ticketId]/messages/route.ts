import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { ticketId } = await params;

  const { body } = await req.json();
  if (!body) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "TEACHER";
  const isOwner = ticket.userId === session.user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const msg = await prisma.ticketMessage.create({
    data: {
      ticketId,
      userId: session.user.id,
      body,
      isAdmin,
    }
  });

  // Update ticket status if admin replies
  if (isAdmin) {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: "resolved" } // Or keep as in_progress
    });

    // Notificar o aluno
    if (ticket.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: ticket.userId,
          title: "Novo retorno no suporte",
          message: `Você recebeu uma resposta no seu ticket: "${ticket.subject}"`,
          type: "SUPPORT_REPLY",
          link: `/suporte/${ticketId}`
        }
      });
    }
  } else {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: "open" }
    });
  }

  return NextResponse.json(msg);
}
