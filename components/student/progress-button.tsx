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
      className="shrink-0"
      style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}
    >
      {completed ? (
        <>
          <CheckCircle size={14} style={{ color: "#6ee7b7" }} />
          Concluída
        </>
      ) : (
        <>
          <Circle size={14} />
          Marcar como concluída
        </>
      )}
    </Button>
  );
}
