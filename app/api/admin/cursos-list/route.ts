import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }
  const courses = await prisma.course.findMany({
    where: { published: true },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
  return NextResponse.json({ courses });
}
