import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  church: z.string().optional().nullable(),
  password: z.string().min(6).optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { teacherId } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, phone, church, password } = parsed.data;

  // Check if email is already used by another user
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser && existingUser.id !== teacherId) {
    return NextResponse.json({ error: "E-mail já está em uso por outro usuário." }, { status: 409 });
  }

  const data: any = {
    name,
    email,
    phone,
    church,
  };

  if (password && password.trim() !== "") {
    data.password = await bcrypt.hash(password, 12);
  }

  try {
    const updated = await prisma.user.update({
      where: { id: teacherId },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar professor." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { teacherId } = await params;

  try {
    const user = await prisma.user.findUnique({ where: { id: teacherId } });
    if (!user) return NextResponse.json({ error: "Professor não encontrado" }, { status: 404 });
    
    // Safety check: don't delete if they are not a teacher or if they are the current user
    if (user.role !== "TEACHER") return NextResponse.json({ error: "Este usuário não é um professor" }, { status: 400 });
    if (user.id === session.user.id) return NextResponse.json({ error: "Você não pode excluir a si mesmo" }, { status: 400 });

    await prisma.user.delete({ where: { id: teacherId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir professor. Verifique se ele está vinculado a cursos." }, { status: 500 });
  }
}
