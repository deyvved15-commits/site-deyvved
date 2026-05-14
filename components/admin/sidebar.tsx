"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  {
    href: "/admin", label: "Dashboard", exact: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    mobileIcon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    href: "/admin/cursos", label: "Cursos",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5a2.5 2.5 0 0 0 0 5H20"/>
        <path d="M8 7h8M8 11h6"/>
      </svg>
    ),
  },
  {
    href: "/admin/alunos", label: "Alunos",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    href: "/admin/professores", label: "Professores",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 21v-2a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
        <path d="M12 11v2m0 4v.01"/>
      </svg>
    ),
  },
  {
    href: "/admin/ao-vivo", label: "Ao Vivo",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="14" height="12" rx="2"/><path d="M22 8l-6 4 6 4V8z"/>
      </svg>
    ),
  },
  {
    href: "/admin/financeiro", label: "Financeiro",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    href: "/admin/aula-semana", label: "Aula da Semana",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    ),
  },
  {
    href: "/admin/formados", label: "Formados",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7"/>
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
      </svg>
    ),
  },
  {
    href: "/admin/suporte", label: "Suporte",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    href: "/admin/afiliados", label: "Afiliados",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
  },
  {
    href: "/dashboard", label: "Ver como Aluno",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5z"/>
      </svg>
    ),
  },
];

export default function AdminSidebar({ user }: { user: { name?: string | null; email?: string | null } }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const initials = user.name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() ?? "A";

  // Load collapse state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setIsCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
  };

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className={`ka-sidebar ${isCollapsed ? "collapsed" : ""}`}
        style={{
          width: isCollapsed ? 80 : 240,
          background: "linear-gradient(180deg, #060D1F 0%, #0A1530 60%, #060D1F 100%)",
          borderRight: "1px solid rgba(201,169,122,0.12)",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
        }}
      >
        {/* Toggle Button */}
        <button
          onClick={toggleCollapse}
          style={{
            position: "absolute",
            top: 20,
            right: isCollapsed ? "50%" : 12,
            transform: isCollapsed ? "translateX(50%)" : "none",
            zIndex: 10,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "rgba(201,169,122,0.15)",
            border: "1px solid rgba(201,169,122,0.3)",
            color: "var(--gold)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
          title={isCollapsed ? "Expandir" : "Recolher"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: isCollapsed ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}>
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #C9A97A, transparent)" }} />

        {/* Logo */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 32, paddingBottom: 20, paddingLeft: isCollapsed ? 12 : 24, paddingRight: isCollapsed ? 12 : 24, borderBottom: "1px solid rgba(201,169,122,0.10)", transition: "padding 0.3s" }}>
          <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", width: isCollapsed ? 60 : 144, height: isCollapsed ? 60 : 144, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,169,122,0.15) 0%, transparent 70%)", pointerEvents: "none", transition: "all 0.3s" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-nova.png" alt="Kadima Academy"
            style={{ width: isCollapsed ? 40 : 80, height: isCollapsed ? 40 : 80, objectFit: "contain", position: "relative", zIndex: 1, marginBottom: isCollapsed ? 0 : 12, filter: "drop-shadow(0 0 24px rgba(201,169,122,0.50))", transition: "all 0.3s" }} />
          
          {!isCollapsed && (
            <>
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: 14, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: "var(--text-primary)", position: "relative", zIndex: 1 }}>
                Kadima
              </p>
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#C9A97A", marginTop: 2, position: "relative", zIndex: 1 }}>
                Academy
              </p>
              <span style={{
                marginTop: 10, fontSize: 9, fontWeight: 700, padding: "3px 12px", borderRadius: 999,
                letterSpacing: 2, textTransform: "uppercase",
                background: "rgba(201,169,122,0.10)", color: "#C9A97A", border: "1px solid rgba(201,169,122,0.25)",
                position: "relative", zIndex: 1,
              }}>
                Administrador
              </span>
            </>
          )}
        </div>

        {/* Nav */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", position: "relative", zIndex: 1 }} className="ka-sidebar-nav-scroll">
          <nav style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 20 }}>
            {links.map(({ href, label, icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link key={href} href={href}
                  title={isCollapsed ? label : ""}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: isCollapsed ? "11px" : "11px 16px", borderRadius: 12,
                    fontSize: 14, fontWeight: 500,
                    textDecoration: "none",
                    transition: "all 0.2s",
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    ...(active ? {
                      background: "linear-gradient(135deg, rgba(201,169,122,0.20), rgba(201,169,122,0.08))",
                      border: "1px solid rgba(201,169,122,0.30)",
                      color: "#E8D5A8",
                      boxShadow: "0 2px 16px rgba(201,169,122,0.12)",
                    } : {
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.45)",
                    }),
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    ...(active ? { background: "rgba(201,169,122,0.20)", boxShadow: "0 0 12px rgba(201,169,122,0.20)" } : { background: "rgba(255,255,255,0.05)" }),
                  }}>
                    {icon}
                  </div>
                  {!isCollapsed && <span>{label}</span>}
                  {active && !isCollapsed && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#C9A97A", boxShadow: "0 0 6px #C9A97A" }} />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div style={{ margin: "0 16px", height: 1, background: "linear-gradient(90deg, transparent, rgba(201,169,122,0.12), transparent)", position: "relative", zIndex: 1 }} />

        {/* User */}
        <div style={{ padding: 16, position: "relative", zIndex: 1 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            justifyContent: isCollapsed ? "center" : "flex-start",
          }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg, #C9A97A, #9A7A50)", color: "#060D1F" }}>
              {initials}
            </div>
            {!isCollapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.30)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  title="Sair"
                  style={{ flexShrink: 0, padding: 6, borderRadius: 8, border: "none", background: "none", cursor: "pointer", color: "rgba(255,255,255,0.20)", transition: "all 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.10)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.20)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="ka-mobile-nav">
        {links.map(({ href, label, icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`ka-mobile-nav-btn${active ? " active" : ""}`}>
              {icon}
              <span>{label}</span>
            </Link>
          );
        })}
        <button className="ka-mobile-nav-btn" onClick={() => signOut({ callbackUrl: "/login" })}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Sair</span>
        </button>
      </nav>
    </>
  );
}
