import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { getGoogleDriveImageUrl } from "@/lib/utils";
import CourseThumbnail from "@/components/student/course-thumbnail";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;

  const [enrollments, otherCourses] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: { include: { progress: { where: { userId: session.user.id } } } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.course.findMany({
      where: {
        published: true,
        enrollments: { none: { userId: session.user.id } },
      },
      select: {
        id: true, title: true, thumbnail: true, price: true,
        _count: { select: { modules: true, enrollments: true } },
        modules: { include: { _count: { select: { lessons: true } } } },
      },
      orderBy: { order: "asc" },
    }),
  ]);

  const firstName = session.user.name?.split(" ")[0] ?? "Aluno";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      {/* ── Hero ── */}
      <section className="ka-hero">
        <div className="ka-bokeh" style={{ top: -30, left: "10%", width: 180, height: 180, background: "rgba(201,169,122,0.25)" }} />
        <div className="ka-bokeh" style={{ bottom: -50, right: "15%", width: 220, height: 220, background: "rgba(80,110,200,0.18)" }} />
        <div className="ka-bokeh" style={{ top: "40%", left: "60%", width: 140, height: 140, background: "rgba(232,213,168,0.15)" }} />

        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 20px" }}>
          <div className="ka-hero-logo">
            <Image src="/logo-nova.png" alt="Kadima Academy" width={68} height={68}
              style={{ borderRadius: "50%", objectFit: "contain", position: "relative", zIndex: 1 }} />
          </div>
          <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 36, letterSpacing: 8, color: "var(--text-primary)", marginBottom: 14, textShadow: "0 2px 20px rgba(201,169,122,0.40)" }}>
            KADIMA ACADEMY
          </h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 10 }}>
            <span style={{ width: 60, height: 1, background: "linear-gradient(90deg, transparent, var(--gold) 50%, transparent)" }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 500, fontSize: 11, letterSpacing: 5, color: "var(--gold-light)", textTransform: "uppercase" }}>
              Sua área de membros
            </span>
            <span style={{ width: 60, height: 1, background: "linear-gradient(90deg, var(--gold), transparent 50%, transparent)" }} />
          </div>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 15, fontWeight: 300, color: "var(--text-secondary)", letterSpacing: 1 }}>
            Bem-vindo, <strong style={{ fontWeight: 600, color: "var(--gold-light)" }}>{firstName}</strong>
          </p>
        </div>
      </section>

      {/* ── Meus Cursos ── */}
      <section className="ka-section" style={{ position: "relative", zIndex: 1, padding: "38px 44px 44px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: "linear-gradient(135deg, rgba(201,169,122,0.20), rgba(201,169,122,0.05))",
            border: "1px solid var(--gold-35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--gold-light)", boxShadow: "0 0 14px rgba(201,169,122,0.18)",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5a2.5 2.5 0 0 0 0 5H20"/>
              <path d="M8 7h8M8 11h6"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 22, letterSpacing: 3, color: "var(--text-primary)", textTransform: "uppercase" }}>
            Meus <span style={{ color: "var(--gold-light)" }}>Cursos</span>
          </h2>
        </div>

        {enrollments.length === 0 ? (
          <div style={{ borderRadius: 20, padding: "56px 32px", textAlign: "center", maxWidth: 380, background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)", border: "1px solid rgba(201,169,122,0.12)" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgba(201,169,122,0.25)", margin: "0 auto 16px", display: "block" }}>
              <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5a2.5 2.5 0 0 0 0 5H20"/>
            </svg>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Nenhum curso ainda</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>Entre em contato com a administração para se matricular.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 280px))", gap: 24 }}>
            {enrollments.map(({ course, expiresAt }) => {
              const isExpired = !!expiresAt && expiresAt < new Date();
              const daysLeft = expiresAt && !isExpired
                ? Math.ceil((expiresAt.getTime() - Date.now()) / 86400000)
                : null;

              const allLessons = course.modules.flatMap(m => m.lessons);
              const done = allLessons.filter(l => l.progress[0]?.completed).length;
              const total = allLessons.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const nextLesson = allLessons.find(l => !l.progress[0]?.completed) ?? allLessons[0];
              const thumbnailUrl = course.thumbnail?.includes("drive.google.com")
                ? getGoogleDriveImageUrl(course.thumbnail)
                : course.thumbnail;
              const label = pct > 0 && pct < 100 ? "Continuar" : pct === 100 ? "Rever" : "Começar";

              return (
                <article key={course.id} className="ka-card" style={isExpired ? { opacity: 0.7 } : undefined}>
                  <div className="ka-thumb">
                    {thumbnailUrl && <CourseThumbnail src={thumbnailUrl} alt={course.title} />}
                    <div className="ka-thumb-mark">
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6.5C2 5.67 2.67 5 3.5 5H8c1.66 0 3 1.34 3 3v12c0-1.1-.9-2-2-2H3.5c-.83 0-1.5-.67-1.5-1.5v-10z"/>
                        <path d="M22 6.5C22 5.67 21.33 5 20.5 5H16c-1.66 0-3 1.34-3 3v12c0-1.1.9-2 2-2h5.5c.83 0 1.5-.67 1.5-1.5v-10z"/>
                      </svg>
                    </div>
                    {!isExpired && <div className="ka-progress-badge">{pct}%</div>}
                    {isExpired && (
                      <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(230,57,70,0.85)", backdropFilter: "blur(4px)", borderRadius: 8, padding: "3px 10px", fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: 1, textTransform: "uppercase" }}>
                        Expirado
                      </div>
                    )}
                    {!isExpired && nextLesson && (
                      <Link href={`/cursos/${course.slug}/aula/${nextLesson.id}`} className="ka-play-overlay">
                        <div className="ka-play-circle">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </Link>
                    )}
                  </div>
                  <div style={{ padding: "20px 22px 22px" }}>
                    <h3 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 16, letterSpacing: 1.5, color: "var(--text-primary)", marginBottom: 6, lineHeight: 1.3 }}>
                      {course.title}
                    </h3>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: isExpired ? "#e63946" : "var(--gold)", boxShadow: `0 0 4px ${isExpired ? "#e63946" : "var(--gold)"}`, flexShrink: 0 }} />
                      {isExpired
                        ? "Acesso expirado — renove para continuar"
                        : daysLeft !== null
                          ? `${daysLeft} dia${daysLeft !== 1 ? "s" : ""} restante${daysLeft !== 1 ? "s" : ""}`
                          : `${done}/${total} aula${total !== 1 ? "s" : ""} concluída${done !== 1 ? "s" : ""}`}
                    </div>
                    {!isExpired && (
                      <div className="ka-progress-bar" style={{ marginBottom: 16 }}>
                        <div className="ka-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    )}
                    {isExpired ? (
                      <Link href={`/checkout/${course.id}`} style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none",
                        padding: "11px 16px", borderRadius: 12, width: "100%",
                        background: "linear-gradient(135deg, #e63946, #c1121f)",
                        color: "#fff", fontFamily: "'Cinzel',serif",
                        fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase",
                        boxShadow: "0 4px 16px rgba(230,57,70,0.30)",
                      }}>
                        Renovar Acesso
                      </Link>
                    ) : nextLesson ? (
                      <Link href={`/cursos/${course.slug}/aula/${nextLesson.id}`} className="ka-continue-btn">
                        {label} <span>→</span>
                      </Link>
                    ) : (
                      <Link href={`/cursos/${course.slug}`} className="ka-continue-btn">Ver Curso →</Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Cursos que você pode gostar ── */}
      {otherCourses.length > 0 && (
        <section className="ka-section" style={{ padding: "0 44px 56px" }}>
          {/* Divider */}
          <div style={{ height: 1, marginBottom: 36, background: "linear-gradient(90deg, transparent 0%, rgba(201,169,122,0.18) 30%, rgba(201,169,122,0.18) 70%, transparent 100%)", position: "relative" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "var(--navy-mid)", padding: "0 16px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)", boxShadow: "0 0 6px var(--gold)" }} />
              </span>
            </div>
          </div>

          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-muted)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div>
              <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 18, letterSpacing: 3, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                Cursos que você pode <span style={{ color: "var(--gold)" }}>gostar</span>
              </h2>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3, fontFamily: "'Poppins',sans-serif" }}>
                Entre em contato com a administração para se matricular
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 280px))", gap: 24 }}>
            {otherCourses.map(course => {
              const totalLessons = course.modules.reduce((a, m) => a + m._count.lessons, 0);
              const thumbnailUrl = course.thumbnail?.includes("drive.google.com")
                ? getGoogleDriveImageUrl(course.thumbnail)
                : course.thumbnail;

              return (
                <article key={course.id} style={{
                  background: "linear-gradient(160deg, rgba(17,24,58,0.7) 0%, rgba(22,32,79,0.7) 100%)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 20, overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.30)",
                  transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                  opacity: 0.85,
                }}
                className="ka-other-card">
                  {/* Thumbnail com lock overlay */}
                  <div style={{ position: "relative", height: 345, background: "linear-gradient(140deg, #080E22, #101830)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {thumbnailUrl && (
                      <img src={thumbnailUrl} alt={course.title}
                        style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", position: "absolute", inset: 0, filter: "brightness(0.55) saturate(0.7)" }} />
                    )}
                    {!thumbnailUrl && (
                      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5a2.5 2.5 0 0 0 0 5H20"/>
                        </svg>
                      </div>
                    )}
                    {/* Lock icon */}
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                      <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(6,13,31,0.70)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "18px 20px 20px" }}>
                    <h3 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 15, letterSpacing: 1.2, color: "var(--text-secondary)", marginBottom: 6, lineHeight: 1.3 }}>
                      {course.title}
                    </h3>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                      <span>{course._count.modules} módulo{course._count.modules !== 1 ? "s" : ""}</span>
                      <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--text-muted)", flexShrink: 0 }} />
                      <span>{totalLessons} aula{totalLessons !== 1 ? "s" : ""}</span>
                    </div>
                    {course.price ? (
                      <Link href={`/checkout/${course.id}`} style={{
                        width: "100%", padding: "10px 14px", borderRadius: 12, textDecoration: "none",
                        background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 7,
                        color: "var(--navy-darkest)", fontSize: 11, fontWeight: 700,
                        fontFamily: "'Cinzel',serif", letterSpacing: 1.5, textTransform: "uppercase",
                        boxShadow: "0 4px 16px rgba(201,169,122,0.30)",
                      }}>
                        <span>Comprar Agora</span>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>
                          R$ {course.price.toFixed(2).replace(".", ",")}
                        </span>
                      </Link>
                    ) : (
                      <div style={{
                        width: "100%", padding: "10px 14px", borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                        color: "var(--text-muted)", fontSize: 11, fontWeight: 600,
                        fontFamily: "'Cinzel',serif", letterSpacing: 1.5, textTransform: "uppercase",
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        Solicitar Acesso
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
