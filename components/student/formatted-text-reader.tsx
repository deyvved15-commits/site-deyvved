"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface FormattedTextReaderProps {
  text: string;
  title: string;
  onClose: () => void;
  logoUrl?: string; // URL da logo Kadima Academy
}

type BlockType = "h1" | "h2" | "h3" | "li" | "oli" | "p";

interface Block {
  type: BlockType;
  text: string;
  num?: number;
}

interface Page {
  blocks: Block[];
  pageNum: number;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Converte **negrito** e *itálico* em HTML seguro (escapa tudo antes). */
function renderInline(raw: string): string {
  let s = escapeHtml(raw);
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
  return s;
}

/**
 * Sintaxe suportada:
 *   # Título 1        -> h1
 *   ## Título 2       -> h2
 *   ### Título 3      -> h3
 *   - item / * item    -> lista com marcador
 *   1. item            -> lista numerada
 *   linha em branco     -> separa parágrafos
 *   **negrito** *itálico*
 * Fallback: linha toda em MAIÚSCULAS (conteúdo legado) vira h2.
 */
function parseBlocks(text: string): Block[] {
  const rawLines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      blocks.push({ type: "p", text: paragraphBuffer.join(" ") });
      paragraphBuffer = [];
    }
  };

  for (const rawLine of rawLines) {
    const line = rawLine.trim();

    if (line === "") {
      flushParagraph();
      continue;
    }

    const h1 = line.match(/^#\s+(.*)/);
    const h2 = line.match(/^##\s+(.*)/);
    const h3 = line.match(/^###\s+(.*)/);
    const li = line.match(/^[-*]\s+(.*)/);
    const oli = line.match(/^(\d+)[.)]\s+(.*)/);

    if (h1) { flushParagraph(); blocks.push({ type: "h1", text: h1[1] }); continue; }
    if (h2) { flushParagraph(); blocks.push({ type: "h2", text: h2[1] }); continue; }
    if (h3) { flushParagraph(); blocks.push({ type: "h3", text: h3[1] }); continue; }
    if (li) { flushParagraph(); blocks.push({ type: "li", text: li[1] }); continue; }
    if (oli) { flushParagraph(); blocks.push({ type: "oli", text: oli[2], num: parseInt(oli[1], 10) }); continue; }

    // Fallback legado: linha toda em maiúsculas vira título
    if (line === line.toUpperCase() && /[A-ZÀ-Ú]/.test(line) && line.split(" ").length >= 2) {
      flushParagraph();
      blocks.push({ type: "h2", text: line });
      continue;
    }

    paragraphBuffer.push(line);
  }
  flushParagraph();
  return blocks;
}

function blockWeight(b: Block): number {
  const base = b.text.length;
  if (b.type === "h1") return base + 220;
  if (b.type === "h2") return base + 140;
  if (b.type === "h3") return base + 90;
  if (b.type === "li" || b.type === "oli") return base + 30;
  return base + 20;
}

function paginateBlocks(blocks: Block[], fontSize: number): Page[] {
  const budgetPerPage = Math.max(900, Math.floor(34000 / fontSize));
  const pages: Page[] = [];
  let current: Block[] = [];
  let used = 0;
  let pageNum = 1;

  blocks.forEach(b => {
    const w = blockWeight(b);
    if (used + w > budgetPerPage && current.length > 0) {
      pages.push({ blocks: current, pageNum });
      current = [];
      used = 0;
      pageNum++;
    }
    current.push(b);
    used += w;
  });

  if (current.length > 0) pages.push({ blocks: current, pageNum });
  return pages;
}

export default function FormattedTextReader({
  text,
  title,
  onClose,
  logoUrl = "/logo-kadima-academy.png", // Padrão
}: FormattedTextReaderProps) {
  const [fontSize, setFontSize] = useState<number>(16);
  const [isDark, setIsDark] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pages, setPages] = useState<Page[]>([]);
  const storageKey = `formatted-text-${btoa(title).slice(0, 40)}`;

  // Parse text into blocks, then paginate
  useEffect(() => {
    const blocks = parseBlocks(text);
    setPages(paginateBlocks(blocks, fontSize));
  }, [text, fontSize]);

  // Load saved preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const { fontSize: size, isDark: dark, page } = JSON.parse(saved);
        setFontSize(size);
        setIsDark(dark);
        setCurrentPage(page);
      }
    } catch {}
  }, [storageKey]);

  // Save preferences on change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        fontSize,
        isDark,
        page: currentPage,
      }));
    } catch {}
  }, [fontSize, isDark, currentPage, storageKey]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+") { e.preventDefault(); setFontSize(s => Math.min(28, s + 2)); }
      if (e.key === "-") { e.preventDefault(); setFontSize(s => Math.max(12, s - 2)); }
      if (e.key === "d") setIsDark(!isDark);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") setCurrentPage(p => Math.min(p + 1, pages.length));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") setCurrentPage(p => Math.max(p - 1, 1));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isDark, onClose, pages.length]);

  const bgColor = isDark ? "#0F172A" : "#F5F3ED";
  const textColor = isDark ? "#E4D9CF" : "#2C1810";
  const accentColor = "#C9A97A";
  const accentLight = "#E8D5A8";
  const progress = pages.length > 0 ? Math.round((currentPage / pages.length) * 100) : 0;
  const page = pages[currentPage - 1];

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: isDark ? "rgba(4, 8, 20, 0.98)" : "rgba(255, 250, 245, 0.98)",
      display: "flex",
      flexDirection: "column",
      backdropFilter: "blur(8px)",
    }}>
      {/* Top Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 24px",
        background: isDark
          ? "linear-gradient(135deg, rgba(15,26,61,0.95) 0%, rgba(9,16,40,0.95) 100%)"
          : "linear-gradient(135deg, rgba(245,243,237,0.95) 0%, rgba(230,220,210,0.95) 100%)",
        borderBottom: `1px solid ${isDark ? "rgba(201,169,122,0.18)" : "rgba(201,169,122,0.30)"}`,
        flexShrink: 0,
      }}>
        {/* Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: "'Cinzel',serif",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: isDark ? "rgba(201,169,122,0.6)" : "rgba(201,169,122,0.7)",
            marginBottom: 2,
          }}>
            Apostila
          </p>
          <p style={{
            fontFamily: "'Cinzel',serif",
            fontSize: 13,
            fontWeight: 700,
            color: isDark ? "#F5EFE0" : "#2C1810",
            letterSpacing: 1.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {title}
          </p>
        </div>

        {/* Font Size Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <CtrlBtn onClick={() => setFontSize(s => Math.max(12, s - 2))} isDark={isDark} title="Diminuir (−)">
            <span style={{ fontSize: 16, fontWeight: "bold" }}>−</span>
          </CtrlBtn>
          <span style={{
            fontSize: 11,
            color: isDark ? "rgba(201,169,122,0.7)" : "rgba(201,169,122,0.8)",
            fontFamily: "'Cinzel',serif",
            minWidth: 40,
            textAlign: "center",
          }}>
            {fontSize}px
          </span>
          <CtrlBtn onClick={() => setFontSize(s => Math.min(28, s + 2))} isDark={isDark} title="Aumentar (+)">
            <span style={{ fontSize: 16, fontWeight: "bold" }}>+</span>
          </CtrlBtn>
        </div>

        {/* Theme Toggle */}
        <CtrlBtn
          onClick={() => setIsDark(!isDark)}
          isDark={isDark}
          title="Alternar tema (D)"
        >
          {isDark ? "☀️" : "🌙"}
        </CtrlBtn>

        {/* Progress Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{
            width: 80,
            height: 4,
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
            borderRadius: 4,
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${accentColor}, ${accentLight})`,
              borderRadius: 4,
              transition: "width 0.1s",
            }} />
          </div>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: isDark ? "rgba(201,169,122,0.8)" : "rgba(201,169,122,0.9)",
            fontFamily: "'Cinzel',serif",
            minWidth: 30,
          }}>
            {progress}%
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          title="Fechar (Esc)"
          style={{
            flexShrink: 0,
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "rgba(230,57,70,0.12)",
            border: "1px solid rgba(230,57,70,0.25)",
            color: "rgba(255,128,136,0.8)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(230,57,70,0.25)";
            e.currentTarget.style.color = "#FF8088";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(230,57,70,0.12)";
            e.currentTarget.style.color = "rgba(255,128,136,0.8)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Content Area */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        background: bgColor,
        color: textColor,
        padding: "40px 60px",
        fontSize: fontSize + "px",
        lineHeight: 1.8,
        fontFamily: "'Merriweather', serif",
        position: "relative",
      }}>
        {/* Marca d'água */}
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.08,
          pointerEvents: "none",
          zIndex: 0,
        }}>
          <div style={{
            fontSize: "120px",
            fontFamily: "'Cinzel',serif",
            fontWeight: "bold",
            color: isDark ? "#FFFFFF" : "#000000",
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "8px",
          }}>
            KADIMA<br />ACADEMY
          </div>
        </div>

        {/* Content */}
        <div style={{
          maxWidth: "800px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}>
          {page ? (
            page.blocks.map((b, idx) => {
              const html = { __html: renderInline(b.text) };

              if (b.type === "h1") {
                return (
                  <h1 key={idx} style={{
                    fontSize: `${fontSize * 2}px`, fontWeight: "bold", color: accentColor,
                    textTransform: "uppercase", letterSpacing: "2px",
                    marginTop: idx === 0 ? 0 : "1.6em", marginBottom: "0.6em",
                    fontFamily: "'Cinzel',serif", lineHeight: 1.3,
                    borderBottom: `2px solid ${isDark ? "rgba(201,169,122,0.25)" : "rgba(201,169,122,0.35)"}`,
                    paddingBottom: "0.3em",
                  }} dangerouslySetInnerHTML={html} />
                );
              }
              if (b.type === "h2") {
                return (
                  <h2 key={idx} style={{
                    fontSize: `${fontSize * 1.5}px`, fontWeight: "bold", color: accentColor,
                    letterSpacing: "1px",
                    marginTop: idx === 0 ? 0 : "1.4em", marginBottom: "0.5em",
                    fontFamily: "'Cinzel',serif", lineHeight: 1.3,
                  }} dangerouslySetInnerHTML={html} />
                );
              }
              if (b.type === "h3") {
                return (
                  <h3 key={idx} style={{
                    fontSize: `${fontSize * 1.2}px`, fontWeight: "600", color: accentLight,
                    marginTop: idx === 0 ? 0 : "1.1em", marginBottom: "0.4em",
                    lineHeight: 1.3,
                  }} dangerouslySetInnerHTML={html} />
                );
              }
              if (b.type === "li") {
                return (
                  <div key={idx} style={{ display: "flex", gap: "0.6em", marginBottom: "0.5em", paddingLeft: "0.2em" }}>
                    <span style={{ color: accentColor, flexShrink: 0 }}>▸</span>
                    <span style={{ flex: 1 }} dangerouslySetInnerHTML={html} />
                  </div>
                );
              }
              if (b.type === "oli") {
                return (
                  <div key={idx} style={{ display: "flex", gap: "0.6em", marginBottom: "0.5em", paddingLeft: "0.2em" }}>
                    <span style={{ color: accentColor, fontWeight: 700, flexShrink: 0, minWidth: "1.4em" }}>{b.num}.</span>
                    <span style={{ flex: 1 }} dangerouslySetInnerHTML={html} />
                  </div>
                );
              }
              return (
                <p key={idx} style={{ marginBottom: "1em", textAlign: "justify" }} dangerouslySetInnerHTML={html} />
              );
            })
          ) : (
            <p style={{ textAlign: "center", opacity: 0.5 }}>Sem conteúdo</p>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "12px 24px",
        background: isDark
          ? "rgba(9,16,40,0.95)"
          : "rgba(245,243,237,0.95)",
        borderTop: `1px solid ${isDark ? "rgba(201,169,122,0.10)" : "rgba(201,169,122,0.20)"}`,
        flexShrink: 0,
      }}>
        {/* Previous */}
        <button
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage <= 1}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 18px",
            borderRadius: 10,
            fontSize: 11,
            fontFamily: "'Cinzel',serif",
            fontWeight: 600,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            background: currentPage <= 1
              ? "transparent"
              : isDark ? "rgba(201,169,122,0.08)" : "rgba(201,169,122,0.12)",
            border: `1px solid ${currentPage <= 1
              ? isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"
              : isDark ? "rgba(201,169,122,0.20)" : "rgba(201,169,122,0.30)"}`,
            color: currentPage <= 1
              ? isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"
              : isDark ? "rgba(201,169,122,0.85)" : "rgba(201,169,122,0.9)",
            cursor: currentPage <= 1 ? "default" : "pointer",
            transition: "all 0.2s",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Anterior
        </button>

        {/* Page Info */}
        <span style={{
          fontSize: 11,
          fontFamily: "'Cinzel',serif",
          color: isDark ? "rgba(201,169,122,0.8)" : "rgba(201,169,122,0.9)",
          fontWeight: 600,
        }}>
          {currentPage} / {pages.length}
        </span>

        {/* Next */}
        <button
          onClick={() => setCurrentPage(p => Math.min(p + 1, pages.length))}
          disabled={currentPage >= pages.length}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 18px",
            borderRadius: 10,
            fontSize: 11,
            fontFamily: "'Cinzel',serif",
            fontWeight: 600,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            background: currentPage >= pages.length
              ? "transparent"
              : isDark ? "rgba(201,169,122,0.08)" : "rgba(201,169,122,0.12)",
            border: `1px solid ${currentPage >= pages.length
              ? isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"
              : isDark ? "rgba(201,169,122,0.20)" : "rgba(201,169,122,0.30)"}`,
            color: currentPage >= pages.length
              ? isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"
              : isDark ? "rgba(201,169,122,0.85)" : "rgba(201,169,122,0.9)",
            cursor: currentPage >= pages.length ? "default" : "pointer",
            transition: "all 0.2s",
          }}
        >
          Próxima
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  );
}

function CtrlBtn({
  onClick,
  isDark,
  title,
  children,
}: {
  onClick: () => void;
  isDark: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
        border: isDark
          ? "1px solid rgba(201,169,122,0.15)"
          : "1px solid rgba(201,169,122,0.25)",
        color: isDark ? "rgba(201,169,122,0.8)" : "rgba(201,169,122,0.9)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
      }}
    >
      {children}
    </button>
  );
}
