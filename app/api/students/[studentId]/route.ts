import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { studentId } = await params;
  const body = await req.json();
  const { role, password } = body;

  const data: any = {};
  if (role) {
    if (!["STUDENT", "TEACHER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Role inválida" }, { status: 400 });
    }
    data.role = role;
  }

  if (password) {
    if (password.length < 6) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 });
    }
    const bcrypt = await import("bcryptjs");
    data.password = await bcrypt.hash(password, 12);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nenhum dado para atualizar" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: studentId },
    data,
  });

  return NextResponse.json(user);
}

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
