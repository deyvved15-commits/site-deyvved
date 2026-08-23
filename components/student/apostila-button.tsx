"use client";

import { useState, lazy, Suspense } from "react";

const PdfReader = lazy(() => import("./pdf-reader"));

interface ApostilaButtonProps {
  url: string;
  title: string;
}

function isPdf(url: string) {
  return url.toLowerCase().includes(".pdf") || url.toLowerCase().includes("/pdf");
}

export default function ApostilaButton({ url, title }: ApostilaButtonProps) {
  const [open, setOpen] = useState(false);

  if (!isPdf(url)) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "8px 14px", borderRadius: 10,
          background: "linear-gradient(135deg, rgba(201,169,122,0.15), rgba(201,169,122,0.05))",
          border: "1px solid rgba(201,169,122,0.30)",
          color: "#E8D5A8", fontSize: 11,
          fontFamily: "'Cinzel',serif", fontWeight: 600,
          letterSpacing: 1.5, textTransform: "uppercase",
          cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, rgba(201,169,122,0.25), rgba(201,169,122,0.10))"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,169,122,0.55)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, rgba(201,169,122,0.15), rgba(201,169,122,0.05))"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,169,122,0.30)"; }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        Ler Apostila
      </button>

      {open && (
        <Suspense fallback={null}>
          <PdfReader url={url} title={title} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
