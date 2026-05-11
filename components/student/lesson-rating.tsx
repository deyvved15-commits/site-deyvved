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
    <div style={{ marginTop: 24, padding: "20px 24px", background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(201,169,122,0.1)" }}>
      <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>
        O que achou desta aula?
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => handleRate(star)}
            disabled={loading}
            style={{ 
              background: "none", border: "none", padding: 0, cursor: "pointer", 
              color: (hover || rating) >= star ? "var(--gold)" : "rgba(255,255,255,0.1)",
              transition: "transform 0.1s ease",
              transform: hover === star ? "scale(1.2)" : "scale(1)"
            }}
          >
            <Star size={24} fill={(hover || rating) >= star ? "var(--gold)" : "none"} strokeWidth={1.5} />
          </button>
        ))}
        {sent && (
          <span style={{ marginLeft: 12, fontSize: 11, color: "#6ee7b7", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
            Obrigado pelo feedback!
          </span>
        )}
      </div>
    </div>
  );
}
