"use client";

import { useState, useEffect, useRef } from "react";

interface TextReaderProps {
  content: string;
  title: string;
  onClose: () => void;
}

export default function TextReader({ content, title, onClose }: TextReaderProps) {
  const [fontSize, setFontSize] = useState<number>(16);
  const [isDark, setIsDark] = useState<boolean>(true);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const storageKey = `text-reader-${btoa(title).slice(0, 40)}`;

  // Load saved preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const { fontSize: size, isDark: dark, scroll } = JSON.parse(saved);
        setFontSize(size);
        setIsDark(dark);
        setTimeout(() => {
          if (contentRef.current && scroll) {
            contentRef.current.scrollTop = scroll;
          }
        }, 100);
      }
    } catch {}
  }, [storageKey]);

  // Save preferences on change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        fontSize,
        isDark,
        scroll: contentRef.current?.scrollTop || 0,
      }));
    } catch {}
  }, [fontSize, isDark, storageKey]);

  // Handle scroll progress
  const handleScroll = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setScrollProgress(Math.min(100, Math.max(0, progress)));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+") { e.preventDefault(); setFontSize(s => Math.min(28, s + 2)); }
      if (e.key === "-") { e.preventDefault(); setFontSize(s => Math.max(12, s - 2)); }
      if (e.key === "d") setIsDark(!isDark);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isDark, onClose]);

  const bgColor = isDark ? "#0F172A" : "#F5F3ED";
  const textColor = isDark ? "#E4D9CF" : "#2C1810";
  const accentColor = "#C9A97A";
  const accentLight = "#E8D5A8";

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
        minWidth: 0,
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
            Leitura
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
              width: `${scrollProgress}%`,
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
            {Math.round(scrollProgress)}%
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
      <div
        ref={contentRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          background: bgColor,
          color: textColor,
          padding: "40px 60px",
          fontSize: fontSize + "px",
          lineHeight: 1.8,
          fontFamily: "'Merriweather', serif",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            wordSpacing: "0.05em",
            textRendering: "optimizeLegibility",
            WebkitFontSmoothing: "antialiased",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <style>{`
        /* Webkit scrollbar styling */
        ${contentRef.current?.classList}::-webkit-scrollbar {
          width: 8px;
        }
        ${contentRef.current?.classList}::-webkit-scrollbar-track {
          background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"};
        }
        ${contentRef.current?.classList}::-webkit-scrollbar-thumb {
          background: ${accentColor};
          border-radius: 4px;
        }
        ${contentRef.current?.classList}::-webkit-scrollbar-thumb:hover {
          background: ${accentLight};
        }

        /* Text selection styling */
        div[dangerouslySetInnerHTML] ::selection {
          background: ${isDark ? "rgba(201,169,122,0.3)" : "rgba(201,169,122,0.4)"};
          color: inherit;
        }

        @media (max-width: 640px) {
          div[dangerouslySetInnerHTML] {
            padding: 20px 16px;
          }
          div[style*="maxWidth"] {
            padding: 0 !important;
          }
        }
      `}</style>
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
