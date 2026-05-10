"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function DeleteCourseButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Excluir o curso "${title}"? Esta ação não pode ser desfeita.`)) return;
    setLoading(true);
    await fetch(`/api/courses/${id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <Button variant="danger" size="sm" loading={loading} onClick={handleDelete}>
      <Trash2 size={13} />
    </Button>
  );
}
