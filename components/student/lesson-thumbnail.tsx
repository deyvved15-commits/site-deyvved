"use client";

import { useState } from "react";
import { getGoogleDriveImageUrl } from "@/lib/utils";

export default function LessonThumbnail({ src }: { src?: string | null }) {
  const [error, setError] = useState(false);

  const imageUrl = src?.includes("drive.google.com")
    ? getGoogleDriveImageUrl(src)
    : src;

  if (imageUrl && !error) {
    return (
      <img
        src={imageUrl}
        alt=""
        style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover", border: "1px solid rgba(201,169,122,0.2)" }}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(201,169,122,0.1)", border: "1px solid rgba(201,169,122,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    </div>
  );
}
