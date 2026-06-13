"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Bookmark {
  id: string;
  note: string | null;
  createdAt: string;
  lesson: {
    id: string;
    title: string;
    duration: string | null;
    module: {
      id: string;
      title: string;
      course: { id: string; title: string; slug: string; thumbnail: string | null };
    };
  };
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "hoje";
  if (d === 1) return "ontem";
  if (d < 30) return `${d} dias atrás`;
  const m = Math.floor(d / 30);
  return `${m} mês${m > 1 ? "es" : ""} atrás`;
}

export default function FavoritosPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookmarks")
      .then(r => r.json())
      .then(d => { setBookmarks(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function removeBookmark(lessonId: string) {
    await fetch(`/api/lessons/${lessonId}/bookmark`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    setBookmarks(prev => prev.filter(b => b.lesson.id !== lessonId));
  }

  // Group by course
  const grouped = bookmarks.reduce<Record<string, { course: Bookmark["lesson"]["module"]["course"]; items: Bookmark[] }>>((acc, b) => {
    const cid = b.lesson.module.course.id;
    if (!acc[cid]) acc[cid] = { course: b.lesson.module.course, items: [] };
    acc[cid].items.push(b);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)", paddingBottom: 60 }}>
      {/* Header */}
      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Biblioteca</div>
        <h1 className="ka-page-title">Aulas <span>Favoritas</span></h1>
        {!loading && (
          <p className="ka-page-subtitle">
            {bookmarks.length} aula{bookmarks.length !== 1 ? "s" : ""} salva{bookmarks.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="ka-section" style={{ paddingTop: 20 }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: 72, borderRadius: 14, background: "rgba(255,255,255,0.03)", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.3 }}>🔖</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Nenhuma aula salva</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 24 }}>
              Salve aulas para acessá-las rapidamente aqui.
            </p>
            <Link href="/cursos" style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px",
              borderRadius: 12, background: "linear-gradient(135deg, #C9A97A, #A07840)",
              color: "#060D1F", fontFamily: "'Cinzel',serif", fontWeight: 700,
              fontSize: 11, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none",
            }}>
              Explorar Cursos
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {Object.values(grouped).map(({ course, items }) => (
              <div key={course.id}>
                {/* Course header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "rgba(255,255,255,0.04)" }}>
                    {course.thumbnail ? (
                      <Image src={course.thumbnail} alt={course.title} width={36} height={36}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,122,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5a2.5 2.5 0 0 0 0 5H20"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, fontWeight: 700, color: "var(--gold-light)", letterSpacing: 1.5, textTransform: "uppercase" }}>
                      {course.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                      {items.length} aula{items.length !== 1 ? "s" : ""} salva{items.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                {/* Lessons */}
                <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(201,169,122,0.12)", background: "linear-gradient(160deg, rgba(15,26,61,0.70) 0%, rgba(10,18,45,0.70) 100%)" }}>
                  {items.map((b, idx) => (
                    <div key={b.id} style={{ borderBottom: idx < items.length - 1 ? "1px solid rgba(201,169,122,0.07)" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
                        {/* Play icon */}
                        <Link
                          href={`/cursos/${course.slug}/aula/${b.lesson.id}`}
                          style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(201,169,122,0.08)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "background 0.15s" }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#C9A97A", marginLeft: 1 }}>
                            <polygon points="5 3 19 12 5 21 5 3"/>
                          </svg>
                        </Link>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Link href={`/cursos/${course.slug}/aula/${b.lesson.id}`} style={{ textDecoration: "none" }}>
                            <div style={{ fontSize: 14, fontWeight: 500, color: "#fff", fontFamily: "'Poppins',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {b.lesson.title}
                            </div>
                          </Link>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                              {b.lesson.module.title}
                            </span>
                            {b.lesson.duration && (
                              <>
                                <span style={{ width: 2, height: 2, borderRadius: "50%", background: "var(--text-muted)", flexShrink: 0 }} />
                                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{b.lesson.duration}</span>
                              </>
                            )}
                            <span style={{ width: 2, height: 2, borderRadius: "50%", background: "var(--text-muted)", flexShrink: 0 }} />
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{timeAgo(b.createdAt)}</span>
                          </div>
                          {b.note && (
                            <div style={{ fontSize: 11, color: "rgba(201,169,122,0.50)", marginTop: 4, fontStyle: "italic" }}>
                              "{b.note}"
                            </div>
                          )}
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeBookmark(b.lesson.id)}
                          title="Remover dos favoritos"
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 6, color: "rgba(255,255,255,0.20)", transition: "color 0.15s", flexShrink: 0, lineHeight: 0 }}
                          onMouseEnter={e => (e.currentTarget.style.color = "#FF8088")}
                          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.20)")}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}
