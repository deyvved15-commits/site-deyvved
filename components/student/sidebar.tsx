"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  {
    href: "/dashboard", label: "Início", exact: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5z"/>
      </svg>
    ),
  },
  {
    href: "/cursos", label: "Cursos",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5a2.5 2.5 0 0 0 0 5H20"/>
        <path d="M8 7h8M8 11h6"/>
      </svg>
    ),
  },
  {
    href: "/ao-vivo", label: "Ao Vivo", live: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="14" height="12" rx="2"/>
        <path d="M22 8l-6 4 6 4V8z"/>
      </svg>
    ),
  },
  {
    href: "/aula-da-semana", label: "Aula da Semana",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    ),
  },
  {
    href: "/certificados", label: "Certificados",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7"/>
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
      </svg>
    ),
  },
  {
    href: "/suporte", label: "Suporte",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    href: "/perfil", label: "Perfil",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function StudentSidebar({ user, streak = 0 }: { user: { name?: string | null; email?: string | null; role?: string }; streak?: number }) {
  const pathname = usePathname();
  const initials = user.name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() ?? "A";
  
  const allLinks = [...links];
  if (user.role === "ADMIN") {
    allLinks.push({
      href: "/admin", label: "Administração",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      ),
    });
  } else if (user.role === "TEACHER") {
    allLinks.push({
      href: "/professor", label: "Área do Professor",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
    });
  }

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="ka-sidebar">
        {/* Logo */}
        <div style={{ padding: "28px 20px 20px", textAlign: "center" }}>
          <div className="ka-logo-ring" style={{ color: "var(--navy-darkest)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-nova.png" alt="Kadima Academy"
              style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "contain" }} />
          </div>
          <div style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 22, letterSpacing: 4, color: "var(--text-primary)", marginBottom: 2 }}>
            KADIMA
          </div>
          <div style={{ fontFamily: "'Cinzel',serif", fontWeight: 500, fontSize: 11, letterSpacing: 6, color: "var(--gold-light)", textTransform: "uppercase" }}>
            Academy
          </div>

          {streak > 0 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, padding: "4px 12px", borderRadius: 20, background: "rgba(201,169,122,0.08)", border: "1px solid rgba(201,169,122,0.18)" }}>
              <span style={{ fontSize: 13 }}>🔥</span>
              <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 12, color: "var(--gold-bright)" }}>
                {streak} {streak === 1 ? "dia" : "dias"}
              </span>
            </div>
          )}
        </div>

        <div className="ka-divider" />

        {/* Nav */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "0 14px" }} className="ka-sidebar-nav-scroll">
          <nav style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 20 }}>
            {allLinks.map(({ href, label, icon, exact, live }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link key={href} href={href} className={`ka-nav-btn${active ? " active" : ""}`}>
                  <span style={{ color: active ? "var(--gold-bright)" : "var(--gold-light)", opacity: active ? 1 : 0.85, flexShrink: 0 }}>
                    {icon}
                  </span>
                  <span>{label}</span>
                  {live && (
                    <span className="ka-live-badge">
                      <span className="ka-live-dot" />
                      AO VIVO
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div style={{ padding: 16, borderTop: "1px solid rgba(201,169,122,0.10)", background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.30) 100%)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, padding: 8, borderRadius: 12, background: "rgba(255,255,255,0.02)", marginBottom: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
              background: "radial-gradient(circle at 30% 30%, var(--gold-bright) 0%, var(--gold) 50%, var(--gold-deep) 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--navy-darkest)", fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 14,
              boxShadow: "0 0 14px rgba(201,169,122,0.45)", border: "1px solid var(--gold-light)",
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.name}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.email}
              </div>
            </div>
          </div>
          <button className="ka-logout-btn" onClick={() => signOut({ callbackUrl: "/login" })}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sair da conta
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="ka-mobile-nav">
        {allLinks.map(({ href, label, icon, exact, live }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`ka-mobile-nav-btn${active ? " active" : ""}`}>
              <span style={{ position: "relative" }}>
                {icon}
                {live && (
                  <span style={{
                    position: "absolute", top: -3, right: -3,
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#E63946", border: "1.5px solid #060D1F",
                    boxShadow: "0 0 6px rgba(230,57,70,0.80)",
                  }} />
                )}
              </span>
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
