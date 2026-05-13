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
      variant="ghost"
      size="md"
      loading={loading}
      onClick={toggle}
      className={cn(
        "shrink-0 group transition-all duration-300 relative overflow-hidden px-4 sm:px-6",
        completed 
          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10" 
          : "bg-[rgba(201,169,122,0.03)] border-[rgba(201,169,122,0.15)] text-[#C9A97A] hover:bg-[rgba(201,169,122,0.08)]"
      )}
      style={{ 
        fontFamily: "'Cinzel',serif", 
        fontSize: 10, 
        letterSpacing: 2, 
        textTransform: "uppercase",
        borderLeft: completed ? "3px solid #10b981" : "3px solid #C9A97A",
        borderRadius: "12px",
      }}
    >
      {completed ? (
        <div className="flex items-center gap-3">
          <CheckCircle size={16} className="transition-all group-hover:scale-110" style={{ filter: "drop-shadow(0 0 4px rgba(110,231,183,0.5))" }} />
          <span className="hidden sm:inline">Aula Assistida</span>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Circle size={16} className="transition-all group-hover:rotate-90 group-hover:scale-110" />
          <span className="hidden sm:inline">Marcar como Assistida</span>
        </div>
      )}
    </Button>
  );
}
