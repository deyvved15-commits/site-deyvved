import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.id) return NextResponse.json({ ok: false }, { status: 401 });

  const { type, metadata } = await req.json();
  const allowed = ["WEEKLY_LESSON", "LESSON_COMPLETE", "PURCHASE"];
  if (!allowed.includes(type)) return NextResponse.json({ ok: false }, { status: 400 });

  await prisma.activityLog.create({
    data: {
      userId: token.id as string,
      type,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });

  return NextResponse.json({ ok: true });
}
