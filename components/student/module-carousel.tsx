"use client";

import { useRef } from "react";
import Link from "next/link";
import CourseThumbnail from "./course-thumbnail";
import { getGoogleDriveImageUrl } from "@/lib/utils";

import type { ModuleAccessResult } from "@/lib/module-access";

interface ModuleCarouselProps {
  modules: any[];
  slug: string;
  moduleAccess?: Record<string, ModuleAccessResult>;
}

export default function ModuleCarousel({ modules, slug, moduleAccess = {} }: ModuleCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Arrows */}
      <button
        onClick={() => scroll("left")}
        style={{
          position: "absolute", left: -20, top: "40%", zIndex: 10,
          width: 40, height: 40, borderRadius: "50%",
          background: "rgba(10,17,41,0.85)", border: "1px solid rgba(201,169,122,0.3)",
          color: "var(--gold)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)", boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          transition: "all 0.2s"
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--gold)")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(201,169,122,0.3)")}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <button
        onClick={() => scroll("right")}
        style={{
          position: "absolute", right: -20, top: "40%", zIndex: 10,
          width: 40, height: 40, borderRadius: "50%",
          background: "rgba(10,17,41,0.85)", border: "1px solid rgba(201,169,122,0.3)",
          color: "var(--gold)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)", boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          transition: "all 0.2s"
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--gold)")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(201,169,122,0.3)")}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        style={{
          display: "flex", gap: 24, overflowX: "auto", paddingBottom: 20,
          scrollbarWidth: "none", msOverflowStyle: "none"
        }}
        className="no-scrollbar"
      >
        {modules.map((mod) => {
          const access = moduleAccess[mod.id] ?? { unlocked: true };
          const isLocked = !access.unlocked;
          const modLessons = mod.lessons;
          const modDone = modLessons.filter((l: any) => l.progress[0]?.completed).length;
          const modTotal = modLessons.length;
          const pct = modTotal > 0 ? Math.round((modDone / modTotal) * 100) : 0;
          const nextLesson = !isLocked ? (modLessons.find((l: any) => !l.progress[0]?.completed) ?? modLessons[0]) : null;
          const thumbUrl = mod.thumbnail?.includes("drive.google.com")
            ? getGoogleDriveImageUrl(mod.thumbnail)
            : mod.thumbnail;
          const label = pct > 0 && pct < 100 ? "Continuar" : pct === 100 ? "Rever" : "Começar";

          // Mensagem de bloqueio
          let lockMsg = "";
          if (!access.unlocked) {
            if (access.reason === "days") {
              lockMsg = access.daysLeft === 1
                ? "Disponível amanhã"
                : `Disponível em ${access.daysLeft} dias`;
            } else {
              lockMsg = "Complete o módulo anterior";
            }
          }

          return (
            <article
              key={mod.id}
              className="ka-card"
              style={{ flexShrink: 0, width: 280, opacity: isLocked ? 0.7 : 1, transition: "opacity 0.2s" }}
            >
              {/* Thumbnail */}
              <div className="ka-thumb" style={{ position: "relative" }}>
                {thumbUrl && <CourseThumbnail src={thumbUrl} alt={mod.title} />}
                {!thumbUrl && (
                  <div className="ka-thumb-mark">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </div>
                )}

                {/* Overlay de bloqueio */}
                {isLocked && (
                  <div style={{
                    position: "absolute", inset: 0, background: "rgba(6,13,31,0.75)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: 8, zIndex: 6, backdropFilter: "blur(2px)",
                  }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(201,169,122,0.15)", border: "1px solid rgba(201,169,122,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", textAlign: "center", padding: "0 16px", lineHeight: 1.4 }}>
                      {lockMsg}
                    </span>
                  </div>
                )}

                {!isLocked && <div className="ka-progress-badge">{pct}%</div>}
                {mod.isBonus && (
                  <div style={{
                    position: "absolute", top: 10, left: 10,
                    background: "linear-gradient(135deg, var(--gold-bright), var(--gold))",
                    borderRadius: "var(--radius-sm)", padding: "3px 10px", fontSize: 9, fontWeight: 800,
                    color: "var(--navy-darkest)", letterSpacing: 1, textTransform: "uppercase",
                    zIndex: 5, boxShadow: "0 0 10px rgba(201,169,122,0.3)"
                  }}>
                    Bônus
                  </div>
                )}
                {nextLesson && (
                  <Link href={`/cursos/${slug}/aula/${nextLesson.id}`} className="ka-play-overlay">
                    <div className="ka-play-circle">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </Link>
                )}
              </div>

              {/* Body */}
              <div style={{ padding: "18px 20px 20px" }}>
                <h3 style={{ fontFamily: "var(--font-cinzel)", fontWeight: 600, fontSize: 15, letterSpacing: 1.2, color: "var(--text-primary)", marginBottom: 5, lineHeight: 1.3 }}>
                  {mod.title}
                </h3>
                {!isLocked ? (
                  <>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)", boxShadow: "0 0 4px var(--gold)", flexShrink: 0 }} />
                      {modDone}/{modTotal} aula{modTotal !== 1 ? "s" : ""} concluída{modDone !== 1 ? "s" : ""}
                    </div>
                    <div className="ka-progress-bar" style={{ marginBottom: 14 }}>
                      <div className="ka-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    {nextLesson ? (
                      <Link href={`/cursos/${slug}/aula/${nextLesson.id}`} className="ka-continue-btn">
                        {label}
                        <span>→</span>
                      </Link>
                    ) : (
                      <div className="ka-continue-btn" style={{ opacity: 0.4, cursor: "default" }}>Sem aulas</div>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    {lockMsg}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
