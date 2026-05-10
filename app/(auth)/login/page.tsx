"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", { email, password, redirect: false });

    if (res?.error) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes live-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        input::placeholder { color: rgba(255,255,255,0.20); }
        .login-input {
          width: 100%;
          padding: 12px 14px 12px 40px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(201,169,122,0.18);
          border-radius: 12px;
          font-size: 14px;
          color: #E8D5A8;
          outline: none;
          font-family: 'Poppins', sans-serif;
          box-sizing: border-box;
          transition: border-color 0.2s, background 0.2s;
          -webkit-appearance: none;
        }
        .login-input:focus {
          border-color: rgba(201,169,122,0.55);
          background: rgba(255,255,255,0.07);
        }
        .login-input.error {
          border-color: rgba(230,57,70,0.45);
        }
        .login-input-right { padding-right: 44px; }
        .login-btn {
          width: 100%;
          padding: 14px 24px;
          border-radius: 14px;
          cursor: pointer;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 3px;
          text-transform: uppercase;
          border: none;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .login-btn:enabled {
          background: linear-gradient(135deg, #C9A97A, #8B6914);
          color: #060D1F;
          box-shadow: 0 6px 24px rgba(201,169,122,0.35);
        }
        .login-btn:disabled {
          background: rgba(201,169,122,0.15);
          color: rgba(201,169,122,0.35);
          cursor: default;
        }
        .corner {
          position: absolute;
          width: 36px;
          height: 36px;
        }
        @media (max-width: 480px) {
          .login-card { padding: 22px 18px 28px !important; }
          .login-logo-img { width: 80px !important; height: 80px !important; }
          .login-logo-wrap { margin-bottom: 24px !important; }
          .login-title { font-size: 18px !important; letter-spacing: 5px !important; }
          .corner { display: none; }
          .login-bokeh { display: none; }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #060D1F 0%, #0F1A3D 100%)",
        position: "relative",
        overflow: "hidden",
        padding: "24px 16px",
        boxSizing: "border-box",
      }}>

        {/* Bokeh */}
        <div className="login-bokeh" style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", top: "-60px", left: "15%", background: "radial-gradient(circle, rgba(201,169,122,0.12) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
        <div className="login-bokeh" style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", bottom: "-80px", right: "10%", background: "radial-gradient(circle, rgba(80,110,200,0.14) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />

        {/* Grid sutil */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(201,169,122,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,122,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        {/* Cantos */}
        <div className="corner" style={{ top: 20, left: 20, borderTop: "1px solid rgba(201,169,122,0.20)", borderLeft: "1px solid rgba(201,169,122,0.20)" }} />
        <div className="corner" style={{ top: 20, right: 20, borderTop: "1px solid rgba(201,169,122,0.20)", borderRight: "1px solid rgba(201,169,122,0.20)" }} />
        <div className="corner" style={{ bottom: 20, left: 20, borderBottom: "1px solid rgba(201,169,122,0.20)", borderLeft: "1px solid rgba(201,169,122,0.20)" }} />
        <div className="corner" style={{ bottom: 20, right: 20, borderBottom: "1px solid rgba(201,169,122,0.20)", borderRight: "1px solid rgba(201,169,122,0.20)" }} />

        {/* Conteúdo */}
        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 420 }}>

          {/* Logo */}
          <div className="login-logo-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
            <Image
              src="/logo-nova.png"
              alt="Kadima Academy"
              width={110}
              height={110}
              className="login-logo-img"
              style={{
                objectFit: "contain",
                marginBottom: 16,
                filter: "drop-shadow(0 0 28px rgba(201,169,122,0.35))",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 40, height: 1, background: "linear-gradient(90deg, transparent, rgba(201,169,122,0.40))" }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 400, letterSpacing: 4, color: "rgba(201,169,122,0.45)", textTransform: "uppercase" }}>
                Escola Teológica Online
              </span>
              <span style={{ width: 40, height: 1, background: "linear-gradient(90deg, rgba(201,169,122,0.40), transparent)" }} />
            </div>
          </div>

          {/* Card */}
          <div style={{
            borderRadius: 24,
            background: "linear-gradient(160deg, rgba(11,17,40,0.94) 0%, rgba(15,24,55,0.94) 100%)",
            border: "1px solid rgba(201,169,122,0.15)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.50), 0 0 0 1px rgba(201,169,122,0.05)",
            overflow: "hidden",
          }}>
            {/* Header do card */}
            <div style={{
              padding: "13px 24px",
              borderBottom: "1px solid rgba(201,169,122,0.08)",
              background: "rgba(201,169,122,0.025)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#C9A97A", boxShadow: "0 0 6px #C9A97A", opacity: 0.7 }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "rgba(201,169,122,0.55)" }}>
                Acesso à Plataforma
              </span>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#C9A97A", boxShadow: "0 0 6px #C9A97A", opacity: 0.7 }} />
            </div>

            <form onSubmit={handleSubmit} className="login-card" style={{ padding: "24px 24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

              {/* E-mail */}
              <div>
                <label style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "#C9A97A", display: "block", marginBottom: 8 }}>
                  E-mail
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(201,169,122,0.38)", pointerEvents: "none" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    autoComplete="email"
                    className={`login-input${error ? " error" : ""}`}
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "#C9A97A", display: "block", marginBottom: 8 }}>
                  Senha
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(201,169,122,0.38)", pointerEvents: "none" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className={`login-input login-input-right${error ? " error" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4, color: "rgba(201,169,122,0.35)", lineHeight: 0 }}
                  >
                    {showPassword ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Erro */}
              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(230,57,70,0.08)", border: "1px solid rgba(230,57,70,0.25)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF8088" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span style={{ fontSize: 12, color: "#FF8088", fontFamily: "'Poppins',sans-serif" }}>{error}</span>
                </div>
              )}

              {/* Botão */}
              <button
                type="submit"
                disabled={loading || !email.trim() || !password.trim()}
                className="login-btn"
                style={{ marginTop: 4 }}
              >
                {loading ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Entrando...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                    Acessar Plataforma
                  </>
                )}
              </button>
              {/* Link cadastro */}
              <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.30)", fontFamily: "'Poppins',sans-serif", marginTop: 4 }}>
                Não tem conta?{" "}
                <Link href="/cadastro" style={{ color: "rgba(201,169,122,0.70)", textDecoration: "none", fontWeight: 500 }}>
                  Cadastrar
                </Link>
              </p>
            </form>
          </div>

          <p style={{ textAlign: "center", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.12)", marginTop: 24, fontFamily: "'Cinzel',serif" }}>
            © {new Date().getFullYear()} Kadima Academy
          </p>
        </div>
      </div>
    </>
  );
}
