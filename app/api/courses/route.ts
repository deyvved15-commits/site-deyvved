import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  price: z.number().positive().optional(),
  paymentType: z.enum(["ONE_TIME", "MONTHLY"]).optional(),
  teachers: z.array(z.object({
    teacherId: z.string(),
    commissionPercentage: z.number().min(0).max(100)
  })).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const courses = await prisma.course.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { modules: true, enrollments: true } },
      modules: { include: { _count: { select: { lessons: true } } } },
      teachers: { include: { teacher: { select: { id: true, name: true } } } },
    },
  });

  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { title, description, thumbnail, price, paymentType, teachers } = parsed.data;
  const slug = slugify(title);

  const course = await prisma.course.create({
    data: { 
      title, 
      slug, 
      description, 
      thumbnail: thumbnail || null, 
      price: price ?? null, 
      paymentType: paymentType ?? "ONE_TIME",
      teachers: teachers ? {
        create: teachers.map(t => ({
          teacherId: t.teacherId,
          commissionPercentage: t.commissionPercentage
        }))
      } : undefined,
    },
  });

  return NextResponse.json(course, { status: 201 });
}
