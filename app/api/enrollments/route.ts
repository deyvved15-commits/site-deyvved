import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      expiresAt: true,
      createdAt: true,
      course: {
        select: { id: true, title: true, slug: true, price: true, thumbnail: true },
      },
    },
  });

  return NextResponse.json(enrollments);
}
