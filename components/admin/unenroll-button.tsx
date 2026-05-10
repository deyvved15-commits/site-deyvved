"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UnenrollButton({ enrollmentId, courseName }: { enrollmentId: string; courseName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUnenroll() {
    setLoading(true);
    await fetch(`/api/admin/enrollments/${enrollmentId}`, { method: "DELETE" });
    router.refresh();
  }

  if (confirming) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: "rgba(255,130,130,0.9)", fontFamily: "'Poppins',sans-serif" }}>
          Remover &quot;{courseName}&quot;?
        </span>
        <button
          onClick={handleUnenroll}
          disabled={loading}
          style={{
            padding: "5px 12px", borderRadius: 8, border: "none", cursor: loading ? "default" : "pointer",
            background: "rgba(230,57,70,0.20)", color: "#FF8088",
            fontSize: 11, fontFamily: "'Cinzel',serif", fontWeight: 600, letterSpacing: 1,
          }}
        >
          {loading ? "..." : "Confirmar"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{
            padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.10)",
            background: "transparent", color: "rgba(255,255,255,0.35)",
            fontSize: 11, fontFamily: "'Cinzel',serif", fontWeight: 600, letterSpacing: 1, cursor: "pointer",
          }}
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{
        padding: "5px 14px", borderRadius: 8,
        border: "1px solid rgba(230,57,70,0.25)", background: "rgba(230,57,70,0.06)",
        color: "rgba(255,128,136,0.70)", fontSize: 10, fontFamily: "'Cinzel',serif",
        fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      Desassociar
    </button>
  );
}
