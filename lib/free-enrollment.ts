import { prisma } from "@/lib/prisma";

/** Matricula o aluno em todos os cursos publicados marcados como gratuitos (isFree) em que ainda não está. */
export async function ensureFreeEnrollments(userId: string): Promise<void> {
  const freeCourses = await prisma.course.findMany({
    where: {
      published: true,
      isFree: true,
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
