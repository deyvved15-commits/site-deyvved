import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const date = new Date().toISOString().slice(0, 10);
  const body = await req.json().catch(() => ({}));
  const title: string | undefined = body?.title;

  const [attendance] = await prisma.$transaction([
    prisma.liveAttendance.upsert({
      where: { userId_date: { userId: session.user.id, date } },
      update: {},
      create: { userId: session.user.id, date },
    }),
    prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: "LIVE_VIEW",
        metadata: title ? JSON.stringify({ title }) : null,
      },
    }),
  ]);

  return NextResponse.json(attendance);
}

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const records = await prisma.liveAttendance.findMany({
    orderBy: [{ date: "desc" }, { joinedAt: "asc" }],
    include: { user: { select: { id: true, name: true, email: true, church: true } } },
  });

  return NextResponse.json(records);
}
