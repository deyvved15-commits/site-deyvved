"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getGoogleDriveImageUrl } from "@/lib/utils";

interface Module { id: string; title: string; _count: { lessons: number } }
interface Course {
  id: string; title: string; slug: string;
  description: string | null; thumbnail: string | null; price: number | null;
  _count: { enrollments: number; modules: number };
  modules: Module[];
  teachers: { teacher: { name: string } }[];
}

function thumb(url: string | null) {
  if (!url) return null;
  return url.includes("drive.google.com") ? getGoogleDriveImageUrl(url) : url;
}

function fmt(v: number | null) {
  if (!v) return "Gratuito";
  return "R$ " + v.toFixed(2).replace(".", ",");
}

export default function CoursesSection({ courses }: { courses: Course[] }) {
  const [selected, setSelected] = useState<Course | null>(null);

  // Lock body scroll when modal open
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!courses.length) return null;

  return (
    <section id="cursos" style={{ padding: "100px 40px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <div style={{ fontSize: 10, fontFamily: "var(--font-cinzel)", letterSpacing: 5, textTransform: "uppercase", color: "var(--gold)", marginBottom: 14 }}>
          Formação Teológica
        </div>
        <h2 style={{ fontFamily: "var(--font-cinzel)", fontWeight: 700, fontSize: "clamp(28px, 4vw, 42px)", letterSpacing: 2, color: "#fff", marginBottom: 16 }}>
          Nossos <span style={{ color: "var(--gold)" }}>Treinamentos</span>
        </h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", maxWidth: 560, margin: "0 auto", lineHeight: 1.8 }}>
          Cursos teológicos desenvolvidos para formar líderes íntegros, com profundidade bíblica e excelência acadêmica.
        </p>
        <div style={{ width: 60, height: 2, background: "linear-gradient(90deg, transparent, var(--gold), transparent)", margin: "24px auto 0" }} />
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 28 }}>
        {courses.map(course => (
          <CourseCard key={course.id} course={course} onSelect={() => setSelected(course)} />
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <CourseModal course={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}

function CourseCard({ course, onSelect }: { course: Course; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  const imgUrl = thumb(course.thumbnail);
  const totalLessons = course.modules.reduce((a, m) => a + m._count.lessons, 0);

  return (
    <article
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 20, overflow: "hidden", cursor: "pointer",
        background: "linear-gradient(160deg, rgba(15,26,61,0.80) 0%, rgba(10,18,45,0.80) 100%)",
        border: `1px solid ${hovered ? "rgba(201,169,122,0.40)" : "rgba(201,169,122,0.12)"}`,
        boxShadow: hovered ? "0 16px 48px rgba(0,0,0,0.50), 0 0 0 1px rgba(201,169,122,0.15)" : "0 8px 32px rgba(0,0,0,0.35)",
        transform: hovered ? "translateY(-4px)" : "none",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", aspectRatio: "4/3", background: "linear-gradient(140deg, var(--navy-darkest), #101830)", overflow: "hidden" }}>
        {imgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgUrl} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", transition: "transform 0.4s ease", transform: hovered ? "scale(1.04)" : "scale(1)" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,122,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5a2.5 2.5 0 0 0 0 5H20"/>
            </svg>
          </div>
        )}
        {/* Overlay gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,13,31,0.8) 0%, transparent 60%)" }} />
        {/* Price badge */}
        {course.price && (
          <div style={{
            position: "absolute", top: 14, right: 14,
            background: "rgba(6,13,31,0.85)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(201,169,122,0.35)", borderRadius: 8,
            padding: "4px 12px", fontFamily: "var(--font-cinzel)",
            fontWeight: 700, fontSize: 12, color: "var(--gold)",
          }}>
            {fmt(course.price)}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "20px 22px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontFamily: "var(--font-cinzel)", fontWeight: 600, fontSize: 16, letterSpacing: 1, color: "#fff", marginBottom: 8, lineHeight: 1.3 }}>
          {course.title}
        </h3>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 16, flex: 1,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {course.description || "Formação teológica de excelência."}
        </p>

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5a2.5 2.5 0 0 0 0 5H20"/></svg>
            {course._count.modules} módulo{course._count.modules !== 1 ? "s" : ""}
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            {totalLessons} aula{totalLessons !== 1 ? "s" : ""}
          </span>
        </div>

        <button style={{
          width: "100%", padding: "11px", borderRadius: 10,
          background: hovered ? "linear-gradient(135deg, var(--gold), var(--gold-deep))" : "rgba(201,169,122,0.08)",
          border: "1px solid rgba(201,169,122,0.35)",
          color: hovered ? "var(--navy-darkest)" : "var(--gold)",
          fontFamily: "var(--font-cinzel)", fontWeight: 700, fontSize: 11,
          letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer",
          transition: "all 0.25s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          Saiba Mais
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </article>
  );
}

function CourseModal({ course, onClose }: { course: Course; onClose: () => void }) {
  const imgUrl = thumb(course.thumbnail);
  const totalLessons = course.modules.reduce((a, m) => a + m._count.lessons, 0);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 700, maxHeight: "90vh",
          borderRadius: 24, overflow: "hidden", overflowY: "auto",
          background: "linear-gradient(160deg, #0D1A3E 0%, #060D1F 100%)",
          border: "1px solid rgba(201,169,122,0.25)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.60), 0 0 0 1px rgba(201,169,122,0.08)",
          position: "relative",
        }}
      >
        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16, zIndex: 10,
          width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(0,0,0,0.50)", color: "rgba(255,255,255,0.70)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Thumbnail */}
        {imgUrl && (
          <div style={{ height: 240, overflow: "hidden", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgUrl} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #060D1F 0%, transparent 60%)" }} />
          </div>
        )}

        {/* Body */}
        <div style={{ padding: "28px 32px 32px" }}>
          {/* Badge teachers */}
          {course.teachers.length > 0 && (
            <div style={{ fontSize: 10, fontFamily: "var(--font-cinzel)", color: "var(--gold)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>
              {course.teachers.map(t => t.teacher.name).join(", ")}
            </div>
          )}

          <h2 style={{ fontFamily: "var(--font-cinzel)", fontWeight: 700, fontSize: 24, letterSpacing: 1.5, color: "#fff", marginBottom: 14, lineHeight: 1.3 }}>
            {course.title}
          </h2>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 20, marginBottom: 18, flexWrap: "wrap" }}>
            {[
              { icon: "📚", label: `${course._count.modules} módulo${course._count.modules !== 1 ? "s" : ""}` },
              { icon: "🎬", label: `${totalLessons} aula${totalLessons !== 1 ? "s" : ""}` },
              { icon: "👥", label: `${course._count.enrollments} aluno${course._count.enrollments !== 1 ? "s" : ""}` },
            ].map(s => (
              <span key={s.label} style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 6 }}>
                {s.icon} {s.label}
              </span>
            ))}
          </div>

          {course.description && (
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.8, marginBottom: 24 }}>
              {course.description}
            </p>
          )}

          {/* Modules list */}
          {course.modules.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 10, fontFamily: "var(--font-cinzel)", color: "var(--gold)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>
                Conteúdo do Curso
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {course.modules.map((m, i) => (
                  <div key={m.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", borderRadius: 10,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 10, fontFamily: "var(--font-cinzel)", color: "var(--gold)", opacity: 0.5, minWidth: 20 }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{m.title}</span>
                    </div>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap", marginLeft: 12 }}>
                      {m._count.lessons} aula{m._count.lessons !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price + CTAs */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", paddingTop: 4 }}>
            <div>
              {course.price ? (
                <>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Investimento</div>
                  <div style={{ fontFamily: "var(--font-cinzel)", fontWeight: 700, fontSize: 26, color: "var(--gold)" }}>
                    {fmt(course.price)}
                  </div>
                </>
              ) : (
                <div style={{ fontFamily: "var(--font-cinzel)", fontWeight: 700, fontSize: 20, color: "var(--green)" }}>Gratuito</div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href={`/curso/${course.slug}`} style={{
                padding: "11px 20px", borderRadius: 10, textDecoration: "none",
                border: "1px solid rgba(201,169,122,0.35)", color: "var(--gold)",
                fontFamily: "var(--font-cinzel)", fontWeight: 600, fontSize: 11,
                letterSpacing: 1.5, textTransform: "uppercase",
                display: "flex", alignItems: "center", gap: 6,
                background: "transparent",
              }}>
                Ver Página
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </Link>
              <Link href={course.price ? `/checkout/${course.id}` : `/login`} style={{
                padding: "11px 24px", borderRadius: 10, textDecoration: "none",
                background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
                color: "var(--navy-darkest)", fontFamily: "var(--font-cinzel)",
                fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase",
                display: "flex", alignItems: "center", gap: 6,
                boxShadow: "0 4px 16px rgba(201,169,122,0.35)",
              }}>
                {course.price ? "Matricular-se" : "Acessar"}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
