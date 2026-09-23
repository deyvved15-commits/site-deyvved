import { prisma } from "@/lib/prisma";

/** Matricula o aluno em todos os cursos publicados gratuitos (price nulo ou 0) em que ainda não está. */
export async function ensureFreeEnrollments(userId: string): Promise<void> {
  const freeCourses = await prisma.course.findMany({
    where: {
      published: true,
      OR: [{ price: null }, { price: 0 }],
      enrollments: { none: { userId } },
    },
    select: { id: true },
  });

  if (freeCourses.length === 0) return;

  await prisma.enrollment.createMany({
    data: freeCourses.map(c => ({ userId, courseId: c.id })),
    skipDuplicates: true,
  });
}
