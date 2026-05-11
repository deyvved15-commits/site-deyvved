import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProfessorCursosPage() {
  const session = await auth();
  const userId = session?.user.id;

  const courses = await prisma.course.findMany({
    where: { teacherId: userId },
    include: {
      _count: {
        select: { enrollments: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const cardStyle = {
    borderRadius: 18,
    padding: "22px 24px",
    background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
    border: "1px solid rgba(201,169,122,0.12)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
  };

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Gerenciamento</div>
        <h1 className="ka-page-title">Meus <span>Cursos</span></h1>
        <p className="ka-page-subtitle">Você possui {courses.length} curso{courses.length !== 1 ? "s" : ""} sob sua responsabilidade.</p>
      </div>

      <div style={{ padding: "0 44px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {courses.map(course => (
            <Link key={course.id} href={`/professor/cursos/${course.id}`} style={{ textDecoration: "none" }}>
              <div style={{ ...cardStyle, transition: "transform 0.2s, border-color 0.2s" }} className="admin-row-hover">
                <div style={{ display: "flex", gap: 16 }}>
                  {course.thumbnail && (
                    <img src={course.thumbnail} alt={course.title} style={{ width: 80, height: 45, borderRadius: 8, objectFit: "cover" }} />
                  )}
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{course.title}</h3>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{course._count.enrollments} alunos matriculados</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
