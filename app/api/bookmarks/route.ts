import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bookmarks = await prisma.lessonBookmark.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          duration: true,
          module: {
            select: {
              id: true,
              title: true,
              course: { select: { id: true, title: true, slug: true, thumbnail: true } },
            },
          },
        },
      },
    },
  });

  return NextResponse.json(bookmarks);
}
