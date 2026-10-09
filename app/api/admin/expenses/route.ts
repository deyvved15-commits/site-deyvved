import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  category: z.string().min(1),
  dueDate: z.string(),
  status: z.enum(["PENDENTE", "PAGO", "CANCELADO"]).optional(),
  recurring: z.boolean().optional(),
  description: z.string().nullable().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 401 });

  const expenses = await prisma.expense.findMany({ orderBy: { dueDate: "desc" } });
  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { title, amount, category, dueDate, status, recurring, description } = parsed.data;

  const expense = await prisma.expense.create({
    data: {
      title, amount, category,
      dueDate: new Date(dueDate),
      status: status ?? "PENDENTE",
      paidAt: status === "PAGO" ? new Date() : null,
      recurring: recurring ?? false,
      description: description ?? null,
    },
  });

  return NextResponse.json(expense);
}
