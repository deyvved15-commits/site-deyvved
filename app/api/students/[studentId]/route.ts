import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { studentId } = await params;

  const user = await prisma.user.findUnique({ where: { id: studentId } });
  if (!user) return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
  if (user.role === "ADMIN") return NextResponse.json({ error: "Não é possível excluir um administrador" }, { status: 400 });

  await prisma.user.delete({ where: { id: studentId } });

  return NextResponse.json({ ok: true });
}
