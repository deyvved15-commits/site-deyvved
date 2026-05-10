import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const data = await prisma.weeklyLesson.findUnique({ where: { id: "weekly" } });
  return NextResponse.json(data ?? { youtubeUrl: "", content: null });
}

const schema = z.object({
  youtubeUrl: z.string().default(""),
  content: z.string().optional().nullable(),
});

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = await prisma.weeklyLesson.upsert({
    where: { id: "weekly" },
    update: parsed.data,
    create: { id: "weekly", ...parsed.data },
  });

  return NextResponse.json(data);
}
