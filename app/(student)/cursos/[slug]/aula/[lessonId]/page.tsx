import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getYoutubeId } from "@/lib/utils";
import Link from "next/link";
import ProgressButton from "@/components/student/progress-button";
import BookmarkButton from "@/components/student/bookmark-button";
import LessonComments from "@/components/student/lesson-comments";
import LessonRating from "@/components/student/lesson-rating";
import HtmlContent from "@/components/student/html-content";
import LessonThumbnail from "@/components/student/lesson-thumbnail";

export default async function AulaPage({ params }: { params: Promise<{ slug: string; lessonId: string }> }) {
  const session = await auth();
  if (!session) return null;
  const { slug, lessonId } = await params;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      teachers: true,
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              progress: { where: { userId: session.user.id } },
              ratings: { where: { userId: session.user.id } }
            },
          },
        },
      },
    },
  });
  if (!course) notFound();

  // Verifica matrícula e expiração
  const isTeacher = course.teachers.some(t => t.teacherId === session.user.id);
  const isAdmin = session.user.role === "ADMIN";
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
  });

  if (!enrollment && !isTeacher && !isAdmin) redirect("/dashboard");

  if (enrollment && enrollment.expiresAt && enrollment.expiresAt < new Date()) {
    redirect(`/checkout/${course.id}?renovar=1`);
  }

  const modules = course.modules || [];
  const allLessons = modules.flatMap(m => m.lessons || []);
  const mainModules = modules.filter(m => !m.isBonus);
  const mainLessons = mainModules.flatMap(m => m.lessons || []);

  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  if (currentIndex === -1) notFound();

  // Drip content check
  const enrolledAt = enrollment?.createdAt ?? new Date(2000, 0, 1);
  const daysSinceEnrollment = Math.floor((Date.now() - enrolledAt.getTime()) / 86400000);
  const lesson = allLessons[currentIndex];
  const initialRating = (lesson as any).ratings[0]?.rating;

  if (!isTeacher && !isAdmin && lesson.releaseAfterDays > daysSinceEnrollment) {
    redirect(`/cursos/${slug}?bloqueada=1`);
  }

  const prev = allLessons[currentIndex - 1] ?? null;
  const next = allLessons[currentIndex + 1] ?? null;
  const ytId = getYoutubeId(lesson.youtubeUrl);
  const isCompleted = lesson.progress[0]?.completed ?? false;

  const done = mainLessons.filter(l => l.progress[0]?.completed).length;
  const total = mainLessons.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ display: "flex", height: "100%", background: "var(--navy-darkest)" }}>

      {/* ── Main content ── */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

        {/* Top bar */}
        <div style={{
          padding: "14px 28px",
          borderBottom: "1px solid rgba(201,169,122,0.10)",
          display: "flex", alignItems: "center", gap: 14,
          background: "linear-gradient(135deg, rgba(201,169,122,0.03) 0%, transparent 100%)",
          flexShrink: 0,
        }}>
          <Link href={`/cursos/${slug}`} style={{
            display: "flex", alignItems: "center", gap: 7,
            fontSize: 11, fontWeight: 500, letterSpacing: 1.5,
            textTransform: "uppercase", color: "var(--gold)", textDecoration: "none",
            transition: "color 0.2s",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            {course.title}
          </Link>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Aula {currentIndex + 1} de {total}
          </span>
          <div style={{ width: 80 }}>
            <div className="ka-progress-bar">
              <div className="ka-progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", fontFamily: "'Cinzel',serif" }}>{pct}%</span>
        </div>

        {/* Video player */}
        <div style={{ padding: "24px 28px 0" }}>
          <div style={{
            borderRadius: 16, overflow: "hidden",
            background: "#000",
            border: "1px solid rgba(201,169,122,0.10)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.60)",
            aspectRatio: "16/9",
          }}>
            {ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                style={{ width: "100%", height: "100%", display: "block" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "rgba(201,169,122,0.20)" }}>
                  <rect x="2" y="6" width="14" height="12" rx="2" /><path d="M22 8l-6 4 6 4V8z" />
                </svg>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Vídeo não disponível</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Navigation Bar ── */}
        <div style={{
          margin: "16px 28px 0",
          padding: "16px 24px",
          borderRadius: 20,
          background: "linear-gradient(135deg, rgba(201,169,122,0.08) 0%, rgba(201,169,122,0.03) 100%)",
          border: "1px solid rgba(201,169,122,0.15)",
          backdropFilter: "blur(10px)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        }}>
          {prev ? (
            <Link href={`/cursos/${slug}/aula/${prev.id}`} style={{
              display: "flex", alignItems: "center", gap: 10,
              fontSize: 11, color: "var(--text-muted)", textDecoration: "none",
              fontFamily: "'Cinzel',serif", fontWeight: 700, letterSpacing: 1.5,
              transition: "all 0.2s",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Anterior
            </Link>
          ) : <div />}

          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, color: "var(--gold-light)", fontWeight: 700, letterSpacing: 2 }}>
            {currentIndex + 1} <span style={{ opacity: 0.4, margin: "0 4px" }}>/</span> {total}
          </div>

          {next ? (
            <Link href={`/cursos/${slug}/aula/${next.id}`} style={{
              display: "flex", alignItems: "center", gap: 10,
              fontSize: 11, color: "var(--gold)", textDecoration: "none",
              fontFamily: "'Cinzel',serif", fontWeight: 700, letterSpacing: 1.5,
              transition: "all 0.2s",
            }}>
              Próxima
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <Link href={`/cursos/${slug}`} style={{
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 11, color: "#6ee7b7", textDecoration: "none",
              fontFamily: "'Cinzel',serif", fontWeight: 700, letterSpacing: 1.5,
            }}>
              ✓ Finalizar
            </Link>
          )}
        </div>

        {/* ── Lesson info ── */}
        <div style={{ padding: "32px 28px 40px" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24,
            marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid rgba(201,169,122,0.12)"
          }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 24, letterSpacing: 2, color: "var(--text-primary)", lineHeight: 1.2, textTransform: "uppercase" }}>
                {lesson.title}
              </h1>
              {lesson.duration && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)", boxShadow: "0 0 6px var(--gold)" }} />
                  <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "'Cinzel',serif" }}>
                    Duração: {lesson.duration}
                  </p>
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <BookmarkButton lessonId={lesson.id} />
              <ProgressButton lessonId={lesson.id} completed={isCompleted} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {lesson.description && (
              <div style={{ flex: 1 }}>
                <HtmlContent html={lesson.description} className="prose-lesson" style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8 }} />
              </div>
            )}

            <div style={{ maxWidth: 450 }}>
              <LessonRating lessonId={lesson.id} initialRating={initialRating} />
            </div>
          </div>
        </div>

        {/* Course material */}
        {lesson.content && (
          <div style={{ margin: "16px 28px 0" }}>
            <div style={{
              borderRadius: 16, overflow: "hidden",
              background: "rgba(15,26,61,0.5)",
              border: "1px solid rgba(201,169,122,0.12)",
            }}>
              <div style={{
                padding: "11px 20px",
                borderBottom: "1px solid rgba(201,169,122,0.08)",
                background: "rgba(201,169,122,0.03)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <div style={{ width: 3, height: 14, background: "var(--gold)", borderRadius: 2, boxShadow: "0 0 6px var(--gold)" }} />
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)" }}>
                  Material da Aula
                </span>
              </div>
              <HtmlContent html={lesson.content} className="prose-lesson" style={{ padding: "20px 24px", color: "rgba(255,255,255,0.8)", lineHeight: 1.8, fontSize: 14 }} />
            </div>
          </div>
        )}

        {/* Downloads */}
        {lesson.attachments && Array.isArray(lesson.attachments) && lesson.attachments.length > 0 && (
          <div style={{ margin: "24px 28px 0" }}>
            <div style={{
              borderRadius: 16, overflow: "hidden",
              background: "linear-gradient(135deg, rgba(201,169,122,0.10) 0%, rgba(201,169,122,0.02) 100%)",
              border: "1px solid rgba(201,169,122,0.20)",
              padding: "16px 20px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)" }}>
                  Arquivos e Downloads
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                {(lesson.attachments as { title: string; url: string }[]).map((at, i) => (
                  <a key={i} href={at.url} target="_blank" rel="noopener noreferrer" style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                    background: "rgba(255,255,255,0.05)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                    color: "white", textDecoration: "none", fontSize: 12, transition: "all 0.2s"
                  }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,169,122,0.15)"; e.currentTarget.style.borderColor = "var(--gold)"; }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{at.title || "Arquivo"}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Comments */}
        <LessonComments
          lessonId={lesson.id}
          userId={session.user.id}
          isAdmin={session.user.role === "ADMIN"}
        />
      </div>

      {/* ── Lesson list sidebar ── */}
      <aside className="ka-lesson-sidebar" style={{ width: 280, overflow: "hidden auto", flexShrink: 0 }}>
        <div style={{
          padding: "14px 16px",
          borderBottom: "1px solid rgba(201,169,122,0.10)",
          background: "rgba(201,169,122,0.02)",
        }}>
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "var(--gold)" }}>
            Conteúdo
          </p>
        </div>
        <div style={{ paddingBottom: 16 }}>
          {course.modules.map((mod) => (
            <div key={mod.id}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10, padding: "16px 16px 8px"
              }}>
                <LessonThumbnail src={mod.thumbnail} />
                <p className="ka-lesson-module-title" style={{ padding: 0, margin: 0 }}>{mod.title}</p>
              </div>
              {mod.lessons.map((l) => {
                const active = l.id === lessonId;
                const lDone = l.progress[0]?.completed;
                const isLocked = l.releaseAfterDays > daysSinceEnrollment;
                const daysLeft = l.releaseAfterDays - daysSinceEnrollment;

                if (isLocked) {
                  return (
                    <div key={l.id} className="ka-lesson-item" style={{ opacity: 0.5, cursor: "default" }} title={`Disponível em ${daysLeft} dia${daysLeft !== 1 ? "s" : ""}`}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span style={{ fontSize: 12, lineHeight: 1.4, color: "var(--text-muted)", fontFamily: "'Poppins',sans-serif" }}>
                        {l.title}
                        <span style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 1 }}>em {daysLeft}d</span>
                      </span>
                    </div>
                  );
                }

                return (
                  <Link key={l.id} href={`/cursos/${slug}/aula/${l.id}`}
                    className={`ka-lesson-item${active ? " active" : ""}`}
                    style={{ textDecoration: "none" }}>
                    {lDone ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--gold)" : "rgba(201,169,122,0.25)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    )}
                    <span style={{
                      fontSize: 12, lineHeight: 1.4,
                      color: active ? "var(--text-primary)" : "var(--text-secondary)",
                      fontWeight: active ? 600 : 400,
                      fontFamily: "'Poppins',sans-serif",
                    }}>
                      {l.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Support CTA */}
        <div style={{ padding: "20px 16px", marginTop: "auto", borderTop: "1px solid rgba(201,169,122,0.1)" }}>
          <Link href={`/suporte/novo?courseId=${course.id}`} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "12px", borderRadius: 12,
            background: "rgba(201,169,122,0.08)", border: "1px solid rgba(201,169,122,0.2)",
            textDecoration: "none", color: "var(--gold-light)", transition: "all 0.2s"
          }} className="hover-gold-cta">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 700, margin: 0, fontFamily: "'Cinzel',serif", textTransform: "uppercase", letterSpacing: 1 }}>Dúvidas?</p>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", margin: 0 }}>Fale com o professor</p>
            </div>
          </Link>
        </div>
      </aside>

      <style>{`
        .hover-gold-cta:hover {
          background: rgba(201,169,122,0.15) !important;
          border-color: var(--gold) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
