"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      className={cn(
        "shrink-0 group transition-all duration-300",
        completed ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 px-3 sm:px-5" : "px-3 sm:px-5"
      )}
      style={{ 
        fontFamily: "'Cinzel',serif", 
        fontSize: 10, 
        letterSpacing: 2, 
        textTransform: "uppercase",
      }}
    >
      {completed ? (
        <>
          <CheckCircle size={16} className="transition-all group-hover:scale-110" style={{ filter: "drop-shadow(0 0 4px rgba(110,231,183,0.5))" }} />
          <span className="hidden sm:inline">Aula Assistida</span>
        </>
      ) : (
        <>
          <Circle size={16} className="transition-all group-hover:rotate-90 group-hover:scale-110" />
          <span className="hidden sm:inline">Marcar como Assistida</span>
        </>
      )}
    </Button>
  );
}
