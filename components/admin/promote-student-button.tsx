"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default function PromoteStudentButton({ studentId, studentName, currentRole }: { studentId: string; studentName: string; currentRole: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (currentRole === "TEACHER" || currentRole === "ADMIN") return null;

  async function handlePromote() {
    if (!confirm(`Promover ${studentName} a Professor?`)) return;
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "TEACHER" }),
      });
      
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Erro ao promover.");
      }
    } catch (err) {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <button
        onClick={handlePromote}
        disabled={loading}
        style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "8px 18px", borderRadius: 10,
          border: "1px solid rgba(110, 231, 183, 0.25)", background: "rgba(16, 185, 129, 0.06)",
          color: "rgba(110, 231, 183, 0.8)", fontSize: 10, fontFamily: "'Cinzel',serif",
          fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase",
          cursor: loading ? "default" : "pointer", transition: "all 0.15s",
        }}
        onMouseEnter={e => { 
          if (!loading) {
            e.currentTarget.style.background = "rgba(16, 185, 129, 0.14)"; 
            e.currentTarget.style.color = "#6ee7b7"; 
            e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.45)"; 
          }
        }}
        onMouseLeave={e => { 
          if (!loading) {
            e.currentTarget.style.background = "rgba(16, 185, 129, 0.06)"; 
            e.currentTarget.style.color = "rgba(110, 231, 183, 0.8)"; 
            e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.25)"; 
          }
        }}
      >
        <ShieldAlert size={12} />
        {loading ? "Promovendo..." : "Promover a Professor"}
      </button>
      {error && <p style={{ fontSize: 10, color: "#f87171", margin: 0, textAlign: "right" }}>{error}</p>}
    </div>
  );
}
