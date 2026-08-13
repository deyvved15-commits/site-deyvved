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
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/" });
  }

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
        .google-btn {
          width: 100%;
          padding: 13px 24px;
          border-radius: 14px;
          cursor: pointer;
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          font-size: 13px;
          border: 1px solid rgba(201,169,122,0.20);
          background: rgba(255,255,255,0.04);
          color: #E8D5A8;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .google-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.08);
          border-color: rgba(201,169,122,0.35);
        }
        .google-btn:disabled {
          opacity: 0.4;
          cursor: default;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(201,169,122,0.12);
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
              {/* Divisor */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
                <span className="divider-line" />
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 3, color: "rgba(201,169,122,0.30)", textTransform: "uppercase", whiteSpace: "nowrap" }}>ou continue com</span>
                <span className="divider-line" />
              </div>

              {/* Botão Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="google-btn"
              >
                {googleLoading ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                {googleLoading ? "Conectando..." : "Entrar com Google"}
              </button>

              {/* Links */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.30)", fontFamily: "'Poppins',sans-serif", margin: 0 }}>
                  <Link href="/esqueci-senha" style={{ color: "rgba(201,169,122,0.60)", textDecoration: "none" }}>
                    Esqueci minha senha
                  </Link>
                </p>
                <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.30)", fontFamily: "'Poppins',sans-serif", margin: 0 }}>
                  Não tem conta?{" "}
                  <Link href="/cadastro" style={{ color: "rgba(201,169,122,0.70)", textDecoration: "none", fontWeight: 500 }}>
                    Cadastrar
                  </Link>
                </p>
              </div>
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
