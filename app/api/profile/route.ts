import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json(user);
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { name, currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ error: "Senha atual obrigatória" }, { status: 400 });
    if (!user.password) return NextResponse.json({ error: "Conta sem senha definida" }, { status: 400 });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });
  }

  const data: { name?: string; password?: string } = {};
  if (name) data.name = name;
  if (newPassword) data.password = await bcrypt.hash(newPassword, 12);

  if (Object.keys(data).length === 0) return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });

  const updated = await prisma.user.update({ where: { id: session.user.id }, data });

  return NextResponse.json({ id: updated.id, name: updated.name, email: updated.email });
}
