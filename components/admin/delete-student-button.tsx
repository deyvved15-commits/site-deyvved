"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteStudentButton({ studentId, studentName }: { studentId: string; studentName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/students/${studentId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/alunos");
    } else {
      const data = await res.json();
      setError(data.error ?? "Erro ao excluir.");
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
        <p style={{ fontSize: 12, color: "rgba(255,130,130,0.9)", fontFamily: "'Poppins',sans-serif", lineHeight: 1.5 }}>
          Excluir <strong>{studentName}</strong> permanentemente?<br />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Matrículas, progresso e comentários serão apagados.</span>
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleDelete}
            disabled={loading}
            style={{
              padding: "8px 18px", borderRadius: 10, border: "none",
              background: loading ? "rgba(230,57,70,0.15)" : "rgba(230,57,70,0.25)",
              color: "#FF8088", fontSize: 11, fontFamily: "'Cinzel',serif",
              fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
              cursor: loading ? "default" : "pointer", transition: "all 0.15s",
            }}
          >
            {loading ? "Excluindo..." : "Confirmar Exclusão"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            style={{
              padding: "8px 16px", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.10)", background: "transparent",
              color: "rgba(255,255,255,0.35)", fontSize: 11,
              fontFamily: "'Cinzel',serif", fontWeight: 600,
              letterSpacing: 1, cursor: "pointer",
            }}
          >
            Cancelar
          </button>
        </div>
        {error && <p style={{ fontSize: 11, color: "#f87171" }}>{error}</p>}
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "8px 18px", borderRadius: 10,
        border: "1px solid rgba(230,57,70,0.25)", background: "rgba(230,57,70,0.06)",
        color: "rgba(255,128,136,0.70)", fontSize: 10, fontFamily: "'Cinzel',serif",
        fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase",
        cursor: "pointer", transition: "all 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(230,57,70,0.14)"; e.currentTarget.style.color = "#FF8088"; e.currentTarget.style.borderColor = "rgba(230,57,70,0.45)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(230,57,70,0.06)"; e.currentTarget.style.color = "rgba(255,128,136,0.70)"; e.currentTarget.style.borderColor = "rgba(230,57,70,0.25)"; }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
      </svg>
      Excluir Aluno
    </button>
  );
}
