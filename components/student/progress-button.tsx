"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProgressButton({ lessonId, completed: initial }: { lessonId: string; completed: boolean }) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const next = !completed;
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, completed: next }),
    });
    setCompleted(next);
    router.refresh();
    setLoading(false);
  }

  return (
    <Button
      variant={completed ? "ghost" : "gold"}
      size="md"
      loading={loading}
      onClick={toggle}
      className="shrink-0 group relative overflow-hidden"
      style={{ 
        fontFamily: "'Cinzel',serif", 
        fontSize: 10, 
        letterSpacing: 2, 
        textTransform: "uppercase",
        minWidth: 180,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        ...(completed ? {
          background: "linear-gradient(135deg, rgba(110,231,183,0.1) 0%, rgba(16,185,129,0.05) 100%)",
          borderColor: "rgba(110,231,183,0.3)",
          color: "#6ee7b7",
          boxShadow: "0 4px 12px rgba(16,185,129,0.1)"
        } : {})
      }}
    >
      {completed ? (
        <>
          <CheckCircle size={14} className="transition-all duration-300 group-hover:scale-110" style={{ filter: "drop-shadow(0 0 4px rgba(110,231,183,0.5))" }} />
          Aula Assistida
        </>
      ) : (
        <>
          <Circle size={14} className="transition-all duration-300 group-hover:rotate-90 group-hover:scale-110" />
          Marcar como Assistida
        </>
      )}
    </Button>
  );
}
