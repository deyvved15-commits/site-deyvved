"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

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
      borderBottom: scrolled ? "1px solid rgba(201,169,122,0.12)" : "1px solid transparent",
      transition: "all 0.35s ease",
      padding: "0 40px",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-nova.png" alt="Kadima Academy" style={{ width: 38, height: 38, objectFit: "contain", filter: "drop-shadow(0 0 8px rgba(201,169,122,0.5))" }} />
          <div>
            <div style={{ fontFamily: "var(--font-cinzel)", fontWeight: 700, fontSize: 16, letterSpacing: 4, color: "#fff", lineHeight: 1 }}>
              KADIMA
            </div>
            <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 9, letterSpacing: 5, color: "var(--gold)", textTransform: "uppercase" }}>
              Academy
            </div>
          </div>
        </Link>

        {/* Nav — desktop */}
        <nav style={{ display: "flex", alignItems: "center", gap: 8 }} className="landing-nav-desktop">
          <a href="#cursos" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: 13, fontWeight: 500, padding: "8px 16px", borderRadius: 8, transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
          >Cursos</a>
          <a href="#sobre" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: 13, fontWeight: 500, padding: "8px 16px", borderRadius: 8, transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
          >Sobre</a>
        </nav>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/login" style={{
            padding: "10px 22px", borderRadius: 10, textDecoration: "none",
            background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
            color: "var(--navy-darkest)", fontFamily: "var(--font-cinzel)",
            fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase",
            boxShadow: "0 4px 16px rgba(201,169,122,0.35)",
            transition: "all 0.2s", whiteSpace: "nowrap",
          }}>
            Área de Membros
          </Link>

          {/* Hamburger */}
          <button
            className="landing-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 8, display: "none" }}
            aria-label="Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          borderTop: "1px solid rgba(201,169,122,0.12)",
          padding: "20px 40px 24px",
        }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <a href="#cursos" onClick={() => setMenuOpen(false)} style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: 15, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>Cursos</a>
            <a href="#sobre"  onClick={() => setMenuOpen(false)} style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: 15, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>Sobre</a>
            <Link href="/login" onClick={() => setMenuOpen(false)} style={{ color: "var(--gold)", textDecoration: "none", fontSize: 15, padding: "12px 0", fontWeight: 600 }}>Área de Membros →</Link>
          </nav>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .landing-nav-desktop { display: none !important; }
          .landing-hamburger { display: flex !important; }
        }
        header { padding: 0 20px !important; }
        @media (min-width: 641px) {
          header { padding: 0 40px !important; }
        }
      `}</style>
    </header>
  );
}
