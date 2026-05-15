import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ courses: [], lessons: [], students: [] });

  const isAdmin = session.user.role === "ADMIN";
  const userId = session.user.id;

  const [courses, lessons, students] = await Promise.all([
    // Courses
    prisma.course.findMany({
      where: {
        ...(isAdmin ? {} : {
          OR: [
            { enrollments: { some: { userId } } },
            { teachers: { some: { teacherId: userId } } },
          ],
        }),
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true, title: true, thumbnail: true,
        _count: { select: { modules: true } },
      },
      take: 8,
    }),

    // Lessons
    prisma.lesson.findMany({
      where: {
        ...(isAdmin ? {} : {
          module: {
            course: {
              OR: [
                { enrollments: { some: { userId } } },
                { teachers: { some: { teacherId: userId } } },
              ],
            },
          },
        }),
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true, title: true, description: true, moduleId: true,
        module: { select: { id: true, title: true, courseId: true, course: { select: { id: true, title: true } } } },
      },
      take: 10,
    }),

    // Students (admin only)
    isAdmin ? prisma.user.findMany({
      where: {
        role: "STUDENT",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, email: true, active: true, createdAt: true },
      take: 6,
    }) : Promise.resolve([]),
  ]);

  return NextResponse.json({ courses, lessons, students });
}
