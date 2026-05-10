"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function EnrollButton({ studentId, courses }: { studentId: string; courses: { id: string; title: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
    <div className="relative">
      <Button size="sm" variant="ghost" onClick={() => setOpen(!open)}>
        <Plus size={13} /> Matricular em curso
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-[rgba(201,169,122,0.2)] overflow-hidden z-20"
          style={{ background: "#0F1A3D" }}>
          {courses.map(c => (
            <button key={c.id} onClick={() => enroll(c.id)} disabled={loading}
              className="w-full text-left px-4 py-3 text-sm text-[rgba(255,255,255,0.7)] hover:bg-[rgba(201,169,122,0.08)] hover:text-white transition-colors">
              {c.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
