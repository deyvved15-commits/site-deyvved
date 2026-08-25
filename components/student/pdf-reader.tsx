"use client";

import { useState, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

function buildPages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const show = new Set<number>();
  for (let p = 1; p <= Math.min(2, total); p++) show.add(p);
  for (let p = Math.max(1, total - 1); p <= total; p++) show.add(p);
  for (let p = Math.max(1, current - 1); p <= Math.min(total, current + 1); p++) show.add(p);
  const sorted = [...show].sort((a, b) => a - b);
  const result: (number | "...")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("...");
    result.push(sorted[i]);
  }
  return result;
}

interface PdfReaderProps {
  url: string;
  title: string;
  onClose: () => void;
}

export default function PdfReader({ url, title, onClose }: PdfReaderProps) {
  const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(url)}`;
  const [numPages, setNumPages] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const storageKey = `pdf-page-${btoa(url).slice(0, 40)}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setPage(parseInt(saved, 10));
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    try { localStorage.setItem(storageKey, String(page)); } catch {}
  }, [page, storageKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") setPage(p => Math.min(p + 1, numPages));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") setPage(p => Math.max(p - 1, 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [numPages, onClose]);

  const pct = numPages > 0 ? Math.round((page / numPages) * 100) : 0;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(4, 8, 20, 0.98)",
      display: "flex", flexDirection: "column",
      backdropFilter: "blur(8px)",
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "12px 24px",
        background: "linear-gradient(135deg, rgba(15,26,61,0.95) 0%, rgba(9,16,40,0.95) 100%)",
        borderBottom: "1px solid rgba(201,169,122,0.18)",
        flexShrink: 0,
      }}>
        {/* Título */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "rgba(201,169,122,0.6)", marginBottom: 2 }}>
            Apostila
          </p>
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 13, fontWeight: 700, color: "#F5EFE0", letterSpacing: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {title}
          </p>
        </div>

        {/* Controles de zoom */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <CtrlBtn onClick={() => setScale(s => Math.max(0.6, s - 0.2))} title="Diminuir zoom">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </CtrlBtn>
          <span style={{ fontSize: 11, color: "rgba(201,169,122,0.7)", fontFamily: "'Poppins',sans-serif", minWidth: 38, textAlign: "center" }}>
            {Math.round(scale * 100)}%
          </span>
          <CtrlBtn onClick={() => setScale(s => Math.min(2.5, s + 0.2))} title="Aumentar zoom">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </CtrlBtn>
        </div>

        {/* Navegação de páginas */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CtrlBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} title="Página anterior (←)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </CtrlBtn>
          <form onSubmit={e => { e.preventDefault(); const v = parseInt((e.currentTarget.elements.namedItem("pg") as HTMLInputElement).value, 10); if (v >= 1 && v <= numPages) setPage(v); }} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <input
              name="pg"
              key={page}
              defaultValue={page}
              style={{ width: 40, height: 28, borderRadius: 7, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(201,169,122,0.20)", color: "#F5EFE0", fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 12, textAlign: "center", outline: "none" }}
            />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>/ {numPages || "—"}</span>
          </form>
          <CtrlBtn onClick={() => setPage(p => Math.min(numPages, p + 1))} disabled={page >= numPages} title="Próxima página (→)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </CtrlBtn>
        </div>

        {/* Progresso de leitura */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 80, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #C9A97A, #E8D5A8)", borderRadius: 4, transition: "width 0.3s" }} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(201,169,122,0.8)", fontFamily: "'Cinzel',serif", minWidth: 30 }}>{pct}%</span>
        </div>

        {/* Fechar */}
        <button onClick={onClose} title="Fechar (Esc)" style={{
          width: 34, height: 34, borderRadius: 10,
          background: "rgba(230,57,70,0.12)", border: "1px solid rgba(230,57,70,0.25)",
          color: "rgba(255,128,136,0.8)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(230,57,70,0.25)"; (e.currentTarget as HTMLElement).style.color = "#FF8088"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(230,57,70,0.12)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,128,136,0.8)"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* PDF area */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "auto", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "32px 24px" }}>
        {loading && !loadError && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,122,0.6)" strokeWidth="2" strokeLinecap="round" style={{ animation: "pdf-spin 1s linear infinite" }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: "rgba(201,169,122,0.5)", letterSpacing: 3 }}>CARREGANDO</p>
          </div>
        )}

        {loadError && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: 40, textAlign: "center" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,122,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="11" x2="12" y2="15"/><line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
            <div>
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: 14, color: "rgba(201,169,122,0.7)", marginBottom: 8, letterSpacing: 2 }}>Não foi possível carregar</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>O arquivo pode não ser um PDF ou a URL não é pública.</p>
              <a href={url} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px",
                borderRadius: 10, background: "rgba(201,169,122,0.12)", border: "1px solid rgba(201,169,122,0.25)",
                color: "#E8D5A8", textDecoration: "none", fontSize: 12, fontFamily: "'Cinzel',serif", letterSpacing: 1,
              }}>
                Baixar arquivo
              </a>
            </div>
          </div>
        )}

        <Document
          file={proxyUrl}
          onLoadSuccess={({ numPages }) => { setNumPages(numPages); setLoading(false); setLoadError(false); }}
          onLoadError={() => { setLoading(false); setLoadError(true); }}
          loading={null}
        >
          <div style={{
            boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(201,169,122,0.15)",
            borderRadius: 8,
            overflow: "hidden",
          }}>
            <Page
              pageNumber={page}
              scale={scale}
              renderAnnotationLayer={true}
              renderTextLayer={true}
            />
          </div>
        </Document>
      </div>

      {/* Bottom nav */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
        padding: "12px 24px",
        background: "rgba(9,16,40,0.95)",
        borderTop: "1px solid rgba(201,169,122,0.10)",
        flexShrink: 0,
      }}>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page <= 1}
          style={navBtnStyle(page <= 1)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Anterior
        </button>

        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {buildPages(page, numPages).map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} style={{ width: 24, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>···</span>
            ) : (
              <button key={p} onClick={() => setPage(p as number)} style={{
                width: 30, height: 30, borderRadius: 8, fontSize: 11,
                background: p === page ? "linear-gradient(135deg, #C9A97A, #A07840)" : "rgba(255,255,255,0.04)",
                border: p === page ? "1px solid #C9A97A" : "1px solid rgba(255,255,255,0.06)",
                color: p === page ? "#060D1F" : "rgba(255,255,255,0.35)",
                cursor: "pointer", fontFamily: "'Cinzel',serif", fontWeight: p === page ? 700 : 400,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}>{p}</button>
            )
          )}
        </div>

        <button
          onClick={() => setPage(p => Math.min(numPages, p + 1))}
          disabled={page >= numPages}
          style={navBtnStyle(page >= numPages)}
        >
          Próxima
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>

      <style>{`
        @keyframes pdf-spin { to { transform: rotate(360deg); } }
        .react-pdf__Page__textContent { color: transparent !important; }
        .react-pdf__Page__annotations a { color: #C9A97A !important; }
      `}</style>
    </div>
  );
}

function CtrlBtn({ onClick, disabled, title, children }: { onClick: () => void; disabled?: boolean; title?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: 30, height: 30, borderRadius: 8,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(201,169,122,0.15)",
        color: disabled ? "rgba(255,255,255,0.15)" : "rgba(201,169,122,0.8)",
        cursor: disabled ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

function navBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    display: "flex", alignItems: "center", gap: 7, padding: "9px 18px",
    borderRadius: 10, fontSize: 11, fontFamily: "'Cinzel',serif", fontWeight: 600,
    letterSpacing: 1.5, textTransform: "uppercase",
    background: disabled ? "transparent" : "rgba(201,169,122,0.08)",
    border: `1px solid ${disabled ? "rgba(255,255,255,0.04)" : "rgba(201,169,122,0.20)"}`,
    color: disabled ? "rgba(255,255,255,0.15)" : "rgba(201,169,122,0.85)",
    cursor: disabled ? "default" : "pointer",
    transition: "all 0.2s",
  };
}
