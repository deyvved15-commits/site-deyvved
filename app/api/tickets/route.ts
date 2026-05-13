import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tickets = await prisma.ticket.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tickets);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, message, priority, courseId } = await req.json();
  if (!subject || !message) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const ticket = await prisma.ticket.create({
    data: {
      userId: session.user.id,
      courseId: courseId || null,
      subject,
      priority: priority || "medium",
      messages: {
        create: {
          userId: session.user.id,
          body: message,
          isAdmin: false,
        }
      }
    }
  });

  return NextResponse.json(ticket);
}
