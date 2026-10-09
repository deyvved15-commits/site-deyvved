import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  dueDate: z.string().optional(),
  status: z.enum(["PENDENTE", "PAGO", "CANCELADO"]).optional(),
  recurring: z.boolean().optional(),
  description: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const current = await prisma.expense.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "Despesa não encontrada" }, { status: 404 });

  const data: Record<string, unknown> = { ...parsed.data };
  if (data.dueDate) data.dueDate = new Date(data.dueDate as string);

  if (parsed.data.status && parsed.data.status !== current.status) {
    data.paidAt = parsed.data.status === "PAGO" ? new Date() : null;
  }

  const expense = await prisma.expense.update({ where: { id }, data });
  return NextResponse.json(expense);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 401 });

  const { id } = await params;
  await prisma.expense.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
