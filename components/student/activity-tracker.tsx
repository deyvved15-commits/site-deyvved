"use client";

import { useEffect } from "react";

export default function ActivityTracker({ type, metadata }: { type: string; metadata?: Record<string, string> }) {
  useEffect(() => {
    fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, metadata }),
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
