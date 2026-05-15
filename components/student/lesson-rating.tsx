"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export default function LessonRating({ lessonId, initialRating }: { lessonId: string, initialRating?: number }) {
  const [rating, setRating] = useState(initialRating || 0);
  const [hover, setHover] = useState(0);
  const [sent, setSent] = useState(!!initialRating);
  const [loading, setLoading] = useState(false);

  async function handleRate(val: number) {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: val })
      });
      if (res.ok) {
        setRating(val);
        setSent(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ 
      marginTop: 8, 
      padding: "24px", 
      background: "rgba(201,169,122,0.03)", 
      borderRadius: "var(--radius-xl)",
      border: "1px solid rgba(201,169,122,0.12)",
      display: "flex",
      flexDirection: "column",
      gap: 16
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <p style={{ fontFamily: "var(--font-cinzel)", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)", margin: 0 }}>
          O que achou desta aula?
        </p>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => handleRate(star)}
            disabled={loading}
            style={{ 
              background: "none", border: "none", padding: 0, cursor: "pointer", 
              color: (hover || rating) >= star ? "var(--gold)" : "rgba(255,255,255,0.2)",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: hover === star ? "scale(1.2)" : "scale(1)",
              filter: (hover || rating) >= star ? "drop-shadow(0 0 8px rgba(201,169,122,0.3))" : "none"
            }}
          >
            <Star 
              size={28} 
              fill={(hover || rating) >= star ? "var(--gold)" : "rgba(255,255,255,0.05)"} 
              strokeWidth={1.5} 
            />
          </button>
        ))}
        {sent && (
          <div style={{ 
            marginLeft: 12, padding: "4px 12px", borderRadius: "var(--radius-sm)",
            background: "rgba(110,231,183,0.1)", border: "1px solid rgba(110,231,183,0.2)"
          }}>
            <span style={{ fontSize: 10, color: "var(--green-light)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "var(--font-cinzel)" }}>
              Avaliado com sucesso
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
