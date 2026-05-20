"use client";

import { useState } from "react";
import Link from "next/link";

const PRIMARY_HREFS = ["/dashboard", "/cursos", "/ao-vivo", "/loja"];

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
  live?: boolean;
}

interface Props {
  allLinks: NavLink[];
  pathname: string;
  onSignOut: () => void;
}

export default function MobileNav({ allLinks, pathname, onSignOut }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const primary = allLinks.filter(l => PRIMARY_HREFS.includes(l.href));
  const secondary = allLinks.filter(l => !PRIMARY_HREFS.includes(l.href));

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const anySecondaryActive = secondary.some(l => isActive(l.href, l.exact));

  return (
    <>
      {/* Drawer overlay */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 98,
            background: "rgba(0,0,0,0.60)", backdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: "fixed", bottom: 70, left: 0, right: 0, zIndex: 99,
        background: "linear-gradient(180deg, #0A1129 0%, #060D1F 100%)",
        borderTop: "1px solid rgba(201,169,122,0.20)",
        borderRadius: "16px 16px 0 0",
        padding: "16px 12px 8px",
        transform: drawerOpen ? "translateY(0)" : "translateY(110%)",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.50)",
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(201,169,122,0.30)", margin: "0 auto 16px" }} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
          {secondary.map(({ href, label, icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setDrawerOpen(false)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 6, padding: "12px 8px", borderRadius: 12, textDecoration: "none",
                  background: active ? "rgba(201,169,122,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? "rgba(201,169,122,0.35)" : "rgba(255,255,255,0.06)"}`,
                  color: active ? "var(--gold-light)" : "rgba(255,255,255,0.50)",
                  fontSize: 10, fontWeight: 600, letterSpacing: 0.3,
                  fontFamily: "'Poppins',sans-serif",
                  transition: "all 0.2s",
                }}
              >
                {icon}
                <span style={{ textAlign: "center", lineHeight: 1.2 }}>{label}</span>
              </Link>
            );
          })}

          {/* Sair */}
          <button
            onClick={() => { setDrawerOpen(false); onSignOut(); }}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 6, padding: "12px 8px", borderRadius: 12,
              background: "rgba(230,57,70,0.06)",
              border: "1px solid rgba(230,57,70,0.15)",
              color: "rgba(230,57,70,0.70)",
              fontSize: 10, fontWeight: 600, letterSpacing: 0.3,
              fontFamily: "'Poppins',sans-serif", cursor: "pointer",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Bottom Nav Bar */}
      <nav className="ka-mobile-nav" style={{ justifyContent: "space-around", overflow: "visible" }}>
        {primary.map(({ href, label, icon, exact, live }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href} className={`ka-mobile-nav-btn${active ? " active" : ""}`}>
              <span style={{ position: "relative" }}>
                {icon}
                {live && (
                  <span style={{
                    position: "absolute", top: -3, right: -3,
                    width: 8, height: 8, borderRadius: "50%",
                    background: "var(--red)", border: "1.5px solid var(--navy-darkest)",
                    boxShadow: "0 0 6px rgba(230,57,70,0.80)",
                  }} />
                )}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}

        {/* Mais */}
        <button
          className={`ka-mobile-nav-btn${(drawerOpen || anySecondaryActive) ? " active" : ""}`}
          onClick={() => setDrawerOpen(v => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>
          </svg>
          <span>Mais</span>
        </button>
      </nav>
    </>
  );
}
