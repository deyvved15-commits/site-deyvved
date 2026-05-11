import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  church: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    orderBy: { createdAt: "desc" },
    include: { taughtCourses: { select: { title: true, id: true } } },
  });
  return NextResponse.json(teachers);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { name, email, password, phone, church } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  const teacher = await prisma.user.create({
    data: {
      name, email, password: hashed, phone, church, role: "TEACHER",
    },
  });

  return NextResponse.json({ id: teacher.id, name: teacher.name, email: teacher.email }, { status: 201 });
}
