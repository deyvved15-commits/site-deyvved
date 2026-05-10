import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { emailBoasVindas } from "@/lib/email-templates";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  church: z.string().optional(),
  courseIds: z.array(z.string()).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    include: { enrollments: { include: { course: { select: { title: true, id: true } } } } },
  });
  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { name, email, password, phone, church, courseIds } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  const student = await prisma.user.create({
    data: {
      name, email, password: hashed, phone, church, role: "STUDENT",
      enrollments: courseIds?.length
        ? { create: courseIds.map(courseId => ({ courseId })) }
        : undefined,
    },
  });

  // Envia email de boas-vindas (sem bloquear a resposta)
  getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Bem-vindo à Kadima Academy!",
    html: emailBoasVindas({ name, email, password }),
  }).catch(err => console.error("[email/boas-vindas]", err));

  return NextResponse.json({ id: student.id, name: student.name, email: student.email }, { status: 201 });
}
