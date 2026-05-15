"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

interface CourseResult {
  id: string;
  title: string;
  thumbnail: string | null;
  _count: { modules: number };
}

interface LessonResult {
  id: string;
  title: string;
  description: string | null;
  moduleId: string;
  module: {
    id: string;
    title: string;
    courseId: string;
    course: { id: string; title: string };
  };
}

interface StudentResult {
  id: string;
  name: string;
  email: string;
  active: boolean;
  createdAt: string;
}

interface SearchResults {
  courses: CourseResult[];
  lessons: LessonResult[];
  students: StudentResult[];
}

function highlight(text: string, q: string) {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "rgba(201,169,122,0.30)", color: "#E8D5A8", borderRadius: 2, padding: "0 1px" }}>
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

export default function BuscaPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (val.length < 2) { setResults(null); setLoading(false); return; }
    setLoading(true);
    timerRef.current = setTimeout(() => search(val), 350);
  }

  const total = results ? results.courses.length + results.lessons.length + results.students.length : 0;
  const hasResults = results && total > 0;

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)", paddingBottom: 60 }}>
      <style>{`
        .busca-input::placeholder { color: rgba(255,255,255,0.20); }
        .busca-input:focus { border-color: rgba(201,169,122,0.55) !important; background: rgba(255,255,255,0.07) !important; }
        .busca-result-item { transition: background 0.15s; border-bottom: 1px solid rgba(201,169,122,0.06); }
        .busca-result-item:last-child { border-bottom: none; }
        .busca-result-item:hover { background: rgba(201,169,122,0.06); }
      `}</style>

      {/* Header */}
      <div style={{ padding: "28px 32px 0" }}>
        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, letterSpacing: 5, textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>
          Plataforma
        </p>
        <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 26, letterSpacing: 3, color: "var(--text-primary)", textTransform: "uppercase", marginBottom: 28 }}>
          <span style={{ color: "var(--gold-light)" }}>Busca</span> Global
        </h1>
      </div>

      <div style={{ padding: "0 32px", maxWidth: 720 }}>
        {/* Search input */}
        <div style={{ position: "relative", marginBottom: 32 }}>
          <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(201,169,122,0.45)", pointerEvents: "none" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            className="busca-input"
            value={query}
            onChange={handleChange}
            placeholder="Buscar cursos, aulas, alunos..."
            style={{
              width: "100%", padding: "16px 48px 16px 46px",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,122,0.20)",
              borderRadius: 16, fontSize: 15, color: "#E8D5A8", outline: "none",
              fontFamily: "'Poppins',sans-serif", boxSizing: "border-box",
              boxShadow: "0 8px 32px rgba(0,0,0,0.30)", transition: "border-color 0.2s",
            }}
          />
          {loading && (
            <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(201,169,122,0.45)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            </div>
          )}
          {!loading && query && (
            <button onClick={() => { setQuery(""); setResults(null); inputRef.current?.focus(); }}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4, color: "rgba(201,169,122,0.35)", lineHeight: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>

        {/* Status */}
        {query.length >= 2 && !loading && results && (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.30)", fontFamily: "'Poppins',sans-serif", marginBottom: 20 }}>
            {total === 0 ? `Nenhum resultado para "${query}"` : `${total} resultado${total > 1 ? "s" : ""} para "${query}"`}
          </p>
        )}

        {/* Empty state */}
        {!query && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>🔍</div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.30)", fontFamily: "'Poppins',sans-serif" }}>
              Digite para buscar cursos e aulas
              {isAdmin ? " ou alunos" : ""}
            </p>
          </div>
        )}

        {/* No results */}
        {query.length >= 2 && !loading && results && total === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>🫥</div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.30)", fontFamily: "'Poppins',sans-serif" }}>
              Nenhum resultado encontrado.<br/>Tente palavras diferentes.
            </p>
          </div>
        )}

        {/* Results */}
        {hasResults && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Courses */}
            {results.courses.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 3, height: 16, borderRadius: 2, background: "linear-gradient(180deg, #E8D5A8, #C9A97A)" }} />
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "rgba(201,169,122,0.70)" }}>
                    Cursos ({results.courses.length})
                  </span>
                </div>
                <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(201,169,122,0.12)", background: "linear-gradient(160deg, rgba(15,26,61,0.70) 0%, rgba(10,18,45,0.70) 100%)" }}>
                  {results.courses.map(course => (
                    <Link
                      key={course.id}
                      href={`/cursos/${course.id}`}
                      className="busca-result-item"
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", textDecoration: "none" }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "rgba(255,255,255,0.05)" }}>
                        {course.thumbnail ? (
                          <Image src={course.thumbnail} alt={course.title} width={44} height={44} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,122,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5a2.5 2.5 0 0 0 0 5H20"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#E8D5A8", fontFamily: "'Poppins',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {highlight(course.title, query)}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                          {course._count.modules} módulo{course._count.modules !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,122,0.30)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Lessons */}
            {results.lessons.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 3, height: 16, borderRadius: 2, background: "linear-gradient(180deg, #E8D5A8, #C9A97A)" }} />
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "rgba(201,169,122,0.70)" }}>
                    Aulas ({results.lessons.length})
                  </span>
                </div>
                <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(201,169,122,0.12)", background: "linear-gradient(160deg, rgba(15,26,61,0.70) 0%, rgba(10,18,45,0.70) 100%)" }}>
                  {results.lessons.map(lesson => (
                    <Link
                      key={lesson.id}
                      href={`/cursos/${lesson.module.courseId}/aulas/${lesson.id}`}
                      className="busca-result-item"
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", textDecoration: "none" }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(201,169,122,0.08)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,122,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#fff", fontFamily: "'Poppins',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {highlight(lesson.title, query)}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.30)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {lesson.module.course.title} · {lesson.module.title}
                        </div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,122,0.30)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Students (admin only) */}
            {isAdmin && results.students.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 3, height: 16, borderRadius: 2, background: "linear-gradient(180deg, #E8D5A8, #C9A97A)" }} />
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "rgba(201,169,122,0.70)" }}>
                    Alunos ({results.students.length})
                  </span>
                </div>
                <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(201,169,122,0.12)", background: "linear-gradient(160deg, rgba(15,26,61,0.70) 0%, rgba(10,18,45,0.70) 100%)" }}>
                  {results.students.map(student => {
                    const initials = (student.name ?? "").split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() || "A";
                    return (
                      <Link
                        key={student.id}
                        href={`/admin/alunos/${student.id}`}
                        className="busca-result-item"
                        style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", textDecoration: "none" }}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                          background: "radial-gradient(circle at 30% 30%, #E8D5A8, #C9A97A 50%, #7A5530)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 13, color: "#060D1F",
                        }}>
                          {initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#fff", fontFamily: "'Poppins',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {highlight(student.name ?? "", query)}
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.30)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {highlight(student.email, query)}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{
                            fontSize: 9, letterSpacing: 1, textTransform: "uppercase",
                            padding: "3px 8px", borderRadius: 20,
                            background: student.active ? "rgba(110,231,183,0.10)" : "rgba(230,57,70,0.10)",
                            color: student.active ? "#6ee7b7" : "#ff8088",
                            border: `1px solid ${student.active ? "rgba(110,231,183,0.20)" : "rgba(230,57,70,0.20)"}`,
                            flexShrink: 0,
                          }}>
                            {student.active ? "Ativo" : "Inativo"}
                          </span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,122,0.30)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
