"use client";

import { useState } from "react";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  releaseAfterDays: number;
  progress: { completed: boolean }[];
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Props {
  modules: Module[];
  currentLessonId: string;
  slug: string;
  daysSinceEnrollment: number;
  currentIndex: number;
  total: number;
}

export default function LessonDrawer({ modules, currentLessonId, slug, daysSinceEnrollment, currentIndex, total }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 198,
            background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 199,
        height: "75vh",
        background: "linear-gradient(180deg, #0A1129 0%, #060D1F 100%)",
        borderTop: "1px solid rgba(201,169,122,0.20)",
        borderRadius: "20px 20px 0 0",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.60)",
        transform: open ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
      }}
        className="ka-lesson-drawer"
      >
        {/* Header */}
        <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(201,169,122,0.30)", margin: "0 auto 14px" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid rgba(201,169,122,0.10)" }}>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)" }}>
              Conteúdo do Curso
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.40)", cursor: "pointer", padding: 4 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 0 24px" }}>
          {modules.map((mod) => (
            <div key={mod.id}>
              <div style={{ padding: "14px 16px 6px" }}>
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(201,169,122,0.50)", margin: 0 }}>
                  {mod.title}
                </p>
              </div>
              {mod.lessons.map((l) => {
                const active = l.id === currentLessonId;
                const done = l.progress[0]?.completed;
                const locked = l.releaseAfterDays > daysSinceEnrollment;

                if (locked) {
                  return (
                    <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", opacity: 0.4 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "'Poppins',sans-serif", lineHeight: 1.4 }}>{l.title}</span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={l.id}
                    href={`/cursos/${slug}/aula/${l.id}`}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 16px", textDecoration: "none",
                      background: active ? "rgba(201,169,122,0.08)" : "transparent",
                      borderLeft: active ? "2px solid var(--gold)" : "2px solid transparent",
                    }}
                  >
                    {done ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--gold)" : "rgba(201,169,122,0.25)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10"/>
                      </svg>
                    )}
                    <span style={{
                      fontSize: 12, lineHeight: 1.4, fontFamily: "'Poppins',sans-serif",
                      color: active ? "var(--text-primary)" : "var(--text-secondary)",
                      fontWeight: active ? 600 : 400,
                    }}>
                      {l.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* FAB trigger — only mobile */}
      <button
        onClick={() => setOpen(v => !v)}
        className="ka-lesson-fab"
        aria-label="Ver aulas do curso"
        style={{
          position: "fixed", bottom: "calc(70px + env(safe-area-inset-bottom, 0px) + 16px)",
          right: 16, zIndex: 197,
          width: 52, height: 52, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
          border: "none", cursor: "pointer",
          display: "none",
          alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(201,169,122,0.45)",
          color: "var(--navy-darkest)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16M4 12h16M4 18h10"/>
        </svg>
        {/* Counter badge */}
        <span style={{
          position: "absolute", top: -2, right: -2,
          minWidth: 18, height: 18, borderRadius: 9,
          background: "var(--navy-darkest)", border: "1.5px solid var(--gold)",
          color: "var(--gold-light)", fontSize: 9, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Cinzel',serif", padding: "0 3px",
        }}>
          {currentIndex + 1}/{total}
        </span>
      </button>

      <style>{`
        @media (max-width: 768px) {
          .ka-lesson-fab { display: flex !important; }
          .ka-lesson-drawer { display: flex !important; }
        }
      `}</style>
    </>
  );
}
