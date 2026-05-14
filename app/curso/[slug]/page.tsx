import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { getGoogleDriveImageUrl } from "@/lib/utils";

export default async function CursoPublicoPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ ref?: string }> }) {
  const { slug } = await params;
  const session = await auth().catch(() => null);

  const course = await prisma.course.findUnique({
    where: { slug, published: true },
    include: {
      teachers: { include: { teacher: { select: { name: true } } } },
      modules: {
        orderBy: { order: "asc" },
        include: { _count: { select: { lessons: true } } },
      },
      _count: { select: { enrollments: true } },
    },
  });
  if (!course) notFound();

  const totalLessons = course.modules.reduce((a, m) => a + m._count.lessons, 0);
  const thumbUrl = course.thumbnail?.includes("drive.google.com")
    ? getGoogleDriveImageUrl(course.thumbnail)
    : course.thumbnail;

  const enrollment = session
    ? await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
      })
    : null;

  const ctaHref = enrollment
    ? `/cursos/${slug}`
    : `/checkout/${course.id}`;

  const ctaLabel = enrollment ? "Acessar Curso" : "Matricular-se";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Poppins:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060D1F; color: #fff; font-family: 'Poppins', sans-serif; }
        a { text-decoration: none; color: inherit; }
      `}</style>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(6,13,31,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(201,169,122,0.12)", padding: "14px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 16, letterSpacing: 4, color: "#C9A97A" }}>
          KADIMA <span style={{ fontSize: 10, letterSpacing: 6, color: "#E8D5A8" }}>ACADEMY</span>
        </Link>
        <div style={{ display: "flex", gap: 12 }}>
          {session ? (
            <Link href="/dashboard" style={{ padding: "8px 20px", borderRadius: 10, background: "rgba(201,169,122,0.10)", border: "1px solid rgba(201,169,122,0.25)", color: "#C9A97A", fontSize: 12, fontWeight: 600 }}>
              Minha Área
            </Link>
          ) : (
            <>
              <Link href="/login" style={{ padding: "8px 20px", borderRadius: 10, color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 500 }}>
                Entrar
              </Link>
              <Link href="/cadastro" style={{ padding: "8px 20px", borderRadius: 10, background: "linear-gradient(135deg, #C9A97A, #A07840)", color: "#060D1F", fontSize: 12, fontWeight: 700 }}>
                Cadastrar
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        background: "linear-gradient(140deg, #060D1F 0%, #0F1A3D 50%, #060D1F 100%)",
        borderBottom: "1px solid rgba(201,169,122,0.12)",
        padding: "64px 40px",
        display: "grid", gridTemplateColumns: "1fr auto", gap: 48, alignItems: "start",
        maxWidth: 1100, margin: "0 auto",
      }}>
        <div>
          {course.category && (
            <span style={{ fontSize: 10, fontFamily: "'Cinzel',serif", letterSpacing: 4, color: "#C9A97A", textTransform: "uppercase", fontWeight: 600 }}>
              {course.category}
            </span>
          )}
          <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 38, letterSpacing: 2, color: "#fff", margin: "12px 0 20px", lineHeight: 1.2 }}>
            {course.title}
          </h1>
          {course.description && (
            <p style={{ fontSize: 15, fontWeight: 300, color: "rgba(255,255,255,0.65)", lineHeight: 1.8, maxWidth: 600, marginBottom: 28 }}>
              {course.description}
            </p>
          )}

          {/* Stats */}
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 32 }}>
            {[
              { icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", label: `${course._count.enrollments} alunos` },
              { icon: "M19 3H5c-1.1 0-2 .9-2 2v14l4-4h12c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z", label: `${course.modules.length} módulos` },
              { icon: "M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5a2.5 2.5 0 0 0 0 5H20", label: `${totalLessons} aulas` },
              ...(course.hasCertificate ? [{ icon: "M12 15l-2 5L9 18l-6 2 2-6-5-2 5-2-2-6 6 2 1-6 2 5 5-2-2 6z", label: "Certificado" }] : []),
            ].map(({ icon, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icon}/>
                </svg>
                {label}
              </div>
            ))}
          </div>

          {course.teachers.length > 0 && (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", marginBottom: 32 }}>
              {course.teachers.length === 1 ? "Professor" : "Professores"}: <span style={{ color: "#C9A97A", fontWeight: 600 }}>{course.teachers.map(ct => ct.teacher.name).join(", ")}</span>
            </p>
          )}

          {/* CTA */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Link href={ctaHref} style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", borderRadius: 14,
              background: "linear-gradient(135deg, #C9A97A, #A07840)", color: "#060D1F",
              fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 12, letterSpacing: 2,
              textTransform: "uppercase", boxShadow: "0 6px 24px rgba(201,169,122,0.40)",
              transition: "all 0.2s",
            }}>
              {ctaLabel}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            {course.price && !enrollment && (
              <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 22, color: "#E8D5A8" }}>
                R$ {course.price.toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>
        </div>

        {/* Thumbnail */}
        {thumbUrl && (
          <div style={{ width: 200, height: 250, borderRadius: 20, overflow: "hidden", border: "1px solid rgba(201,169,122,0.20)", boxShadow: "0 24px 60px rgba(0,0,0,0.5)", flexShrink: 0 }}>
            <img src={thumbUrl} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "contain", background: "#0A1129" }} />
          </div>
        )}
      </section>

      {/* MÓDULOS */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 40px" }}>
        <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 22, letterSpacing: 3, color: "#fff", marginBottom: 28, textTransform: "uppercase" }}>
          Conteúdo do <span style={{ color: "#C9A97A" }}>Curso</span>
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {course.modules.map((mod, i) => (
            <div key={mod.id} style={{
              padding: "18px 24px", borderRadius: 16,
              background: "linear-gradient(160deg, rgba(15,26,61,0.80) 0%, rgba(10,17,41,0.80) 100%)",
              border: "1px solid rgba(201,169,122,0.10)",
              display: "flex", alignItems: "center", gap: 16,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: "rgba(201,169,122,0.08)", border: "1px solid rgba(201,169,122,0.20)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 13, color: "#C9A97A",
              }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 14, color: "#fff", marginBottom: 4 }}>
                  {mod.title}
                </p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.40)" }}>
                  {mod._count.lessons} aula{mod._count.lessons !== 1 ? "s" : ""}
                </p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgba(201,169,122,0.30)" }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
          ))}
        </div>

        {/* CTA final */}
        {!enrollment && (
          <div style={{ marginTop: 48, textAlign: "center", padding: "40px", borderRadius: 24, background: "linear-gradient(135deg, rgba(201,169,122,0.06) 0%, rgba(201,169,122,0.02) 100%)", border: "1px solid rgba(201,169,122,0.15)" }}>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
              Pronto para começar?
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", marginBottom: 24 }}>
              Junte-se a {course._count.enrollments} aluno{course._count.enrollments !== 1 ? "s" : ""} neste curso
            </p>
            <Link href={ctaHref} style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 40px", borderRadius: 14,
              background: "linear-gradient(135deg, #C9A97A, #A07840)", color: "#060D1F",
              fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: "uppercase",
              boxShadow: "0 6px 24px rgba(201,169,122,0.40)",
            }}>
              {ctaLabel}
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
