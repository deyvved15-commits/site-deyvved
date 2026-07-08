"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(6,13,31,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(201,169,122,0.12)" : "1px solid transparent",
      transition: "all 0.35s ease",
    }}>
      <div className="landing-header-inner" style={{ maxWidth: 1200, margin: "0 auto", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>

        {/* Logo */}
        <Link href="/lp" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-nova.png" alt="Kadima Academy" style={{ width: 36, height: 36, objectFit: "contain", filter: "drop-shadow(0 0 8px rgba(201,169,122,0.5))" }} />
          <div>
            <div style={{ fontFamily: "var(--font-cinzel)", fontWeight: 700, fontSize: 15, letterSpacing: 4, color: "#fff", lineHeight: 1 }}>
              KADIMA
            </div>
            <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 9, letterSpacing: 5, color: "var(--gold)", textTransform: "uppercase" }}>
              Academy
            </div>
          </div>
        </Link>

        {/* Nav — desktop */}
        <nav style={{ display: "flex", alignItems: "center", gap: 4 }} className="landing-nav-desktop">
          {[
            { href: "#cursos", label: "Cursos" },
            { href: "#depoimentos", label: "Depoimentos" },
            { href: "#faq", label: "FAQ" },
            { href: "#sobre", label: "Sobre" },
          ].map(link => (
            <a key={link.href} href={link.href} style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: 13, fontWeight: 500, padding: "10px 14px", borderRadius: 8, transition: "color 0.2s", minHeight: 44, display: "flex", alignItems: "center" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
            >{link.label}</a>
          ))}
        </nav>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/login" style={{
            padding: "10px 18px", borderRadius: 10, textDecoration: "none",
            background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
            color: "var(--navy-darkest)", fontFamily: "var(--font-cinzel)",
            fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase",
            boxShadow: "0 4px 16px rgba(201,169,122,0.35)",
            transition: "all 0.2s", whiteSpace: "nowrap", minHeight: 44,
            display: "flex", alignItems: "center",
          }}>
            Área de Membros
          </Link>

          {/* Hamburger */}
          <button
            className="landing-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            style={{
              background: "none", border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff", cursor: "pointer",
              padding: 0, display: "none",
              width: 44, height: 44, borderRadius: 8,
              alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: "rgba(6,13,31,0.97)", backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(201,169,122,0.12)",
          padding: "16px 20px 20px",
        }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { href: "#cursos", label: "Cursos" },
              { href: "#depoimentos", label: "Depoimentos" },
              { href: "#faq", label: "FAQ" },
              { href: "#sobre", label: "Sobre" },
            ].map(link => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: 15, padding: "14px 4px", borderBottom: "1px solid rgba(255,255,255,0.05)", minHeight: 44, display: "flex", alignItems: "center" }}>{link.label}</a>
            ))}
            <Link href="/login" onClick={() => setMenuOpen(false)} style={{ color: "var(--gold)", textDecoration: "none", fontSize: 15, padding: "14px 4px", fontWeight: 600, minHeight: 44, display: "flex", alignItems: "center" }}>Área de Membros →</Link>
          </nav>
        </div>
      )}

      <style>{`
        .landing-header-inner { padding: 0 20px; }
        @media (min-width: 769px) {
          .landing-header-inner { padding: 0 40px; }
        }
        @media (max-width: 768px) {
          .landing-nav-desktop { display: none !important; }
          .landing-hamburger { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
