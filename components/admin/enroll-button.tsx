"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EnrollButton({ studentId, courses }: { studentId: string; courses: { id: string; title: string; paymentType?: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function enroll(courseId: string) {
    setLoading(true);
    await fetch(`/api/students/${studentId}/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    router.refresh();
    setOpen(false);
    setLoading(false);
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "8px 16px", borderRadius: 10, cursor: "pointer",
          background: "linear-gradient(135deg, rgba(201,169,122,0.18), rgba(201,169,122,0.08))",
          border: "1px solid rgba(201,169,122,0.35)",
          color: "#E8D5A8",
          fontSize: 11, fontWeight: 700,
          fontFamily: "'Cinzel',serif", letterSpacing: 1.5, textTransform: "uppercase",
          transition: "all 0.2s",
          boxShadow: open ? "0 0 16px rgba(201,169,122,0.20)" : "none",
          whiteSpace: "nowrap",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Atribuir Curso
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          minWidth: 240, borderRadius: 14, overflow: "hidden", zIndex: 50,
          background: "#0A1530",
          border: "1px solid rgba(201,169,122,0.20)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.60)",
        }}>
          <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid rgba(201,169,122,0.08)" }}>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)" }}>
              Selecionar curso
            </p>
          </div>
          {courses.map((c, i) => (
            <button
              key={c.id}
              onClick={() => enroll(c.id)}
              disabled={loading}
              style={{
                width: "100%", textAlign: "left", padding: "11px 16px",
                fontSize: 13, color: "rgba(255,255,255,0.75)",
                background: "none", border: "none", cursor: loading ? "default" : "pointer",
                borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                transition: "all 0.15s",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(201,169,122,0.08)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)"; }}
            >
              <span>{c.title}</span>
              {c.paymentType === "MONTHLY" && (
                <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 999, background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24", fontFamily: "'Poppins',sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>
                  ⟳ 30d
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
