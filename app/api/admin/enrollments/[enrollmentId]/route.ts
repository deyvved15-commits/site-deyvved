import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { enrollmentId } = await params;

  const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment) return NextResponse.json({ error: "Matrícula não encontrada" }, { status: 404 });

  await prisma.enrollment.delete({ where: { id: enrollmentId } });

  return NextResponse.json({ ok: true });
}
