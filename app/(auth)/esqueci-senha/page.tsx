"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao enviar e-mail.");
        return;
      }
      setSent(true);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.20); }
        .fp-input {
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
        .fp-input:focus { border-color: rgba(201,169,122,0.55); background: rgba(255,255,255,0.07); }
        .fp-btn {
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
        .fp-btn:enabled { background: linear-gradient(135deg, #C9A97A, #8B6914); color: #060D1F; box-shadow: 0 6px 24px rgba(201,169,122,0.35); }
        .fp-btn:disabled { background: rgba(201,169,122,0.15); color: rgba(201,169,122,0.35); cursor: default; }
        @media (max-width: 480px) {
          .fp-card { padding: 22px 18px 28px !important; }
          .fp-logo-img { width: 80px !important; height: 80px !important; }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(180deg, #060D1F 0%, #0F1A3D 100%)",
        position: "relative", overflow: "hidden", padding: "24px 16px", boxSizing: "border-box",
      }}>
        <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", top: "-60px", left: "15%", background: "radial-gradient(circle, rgba(201,169,122,0.12) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", bottom: "-80px", right: "10%", background: "radial-gradient(circle, rgba(80,110,200,0.14) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(201,169,122,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,122,0.025) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 420 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
            <Image src="/logo-nova.png" alt="Kadima Academy" width={110} height={110} className="fp-logo-img"
              style={{ objectFit: "contain", marginBottom: 16, filter: "drop-shadow(0 0 28px rgba(201,169,122,0.35))" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 40, height: 1, background: "linear-gradient(90deg, transparent, rgba(201,169,122,0.40))" }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 400, letterSpacing: 4, color: "rgba(201,169,122,0.45)", textTransform: "uppercase" }}>
                Escola Teológica Online
              </span>
              <span style={{ width: 40, height: 1, background: "linear-gradient(90deg, rgba(201,169,122,0.40), transparent)" }} />
            </div>
          </div>

          <div style={{
            borderRadius: 24,
            background: "linear-gradient(160deg, rgba(11,17,40,0.94) 0%, rgba(15,24,55,0.94) 100%)",
            border: "1px solid rgba(201,169,122,0.15)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.50), 0 0 0 1px rgba(201,169,122,0.05)",
            overflow: "hidden",
          }}>
            <div style={{
              padding: "13px 24px",
              borderBottom: "1px solid rgba(201,169,122,0.08)",
              background: "rgba(201,169,122,0.025)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#C9A97A", boxShadow: "0 0 6px #C9A97A", opacity: 0.7 }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "rgba(201,169,122,0.55)" }}>
                Recuperar Acesso
              </span>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#C9A97A", boxShadow: "0 0 6px #C9A97A", opacity: 0.7 }} />
            </div>

            <div className="fp-card" style={{ padding: "28px 24px 32px" }}>
              {sent ? (
                <div style={{ textAlign: "center", padding: "8px 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
                  <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 16, fontWeight: 700, letterSpacing: 2, color: "#E8D5A8", marginBottom: 12 }}>
                    E-mail enviado!
                  </h2>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", lineHeight: 1.7, marginBottom: 24 }}>
                    Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha em instantes.
                  </p>
                  <Link href="/login" style={{
                    display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11,
                    color: "rgba(201,169,122,0.70)", fontFamily: "'Cinzel',serif",
                    letterSpacing: 2, textTransform: "uppercase", textDecoration: "none",
                  }}>
                    ← Voltar ao login
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", lineHeight: 1.7, margin: 0 }}>
                    Informe o e-mail cadastrado e enviaremos um link para redefinir sua senha.
                  </p>
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
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="seu@email.com" required autoComplete="email" className="fp-input" />
                    </div>
                  </div>

                  {error && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(230,57,70,0.08)", border: "1px solid rgba(230,57,70,0.25)" }}>
                      <span style={{ fontSize: 12, color: "#FF8088", fontFamily: "'Poppins',sans-serif" }}>{error}</span>
                    </div>
                  )}

                  <button type="submit" disabled={loading || !email.trim()} className="fp-btn">
                    {loading ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.55 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.46 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.83-.83a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 17.5"/>
                        </svg>
                        Enviar link de recuperação
                      </>
                    )}
                  </button>
                  <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.30)", fontFamily: "'Poppins',sans-serif", margin: 0 }}>
                    Lembrou a senha?{" "}
                    <Link href="/login" style={{ color: "rgba(201,169,122,0.70)", textDecoration: "none", fontWeight: 500 }}>
                      Fazer login
                    </Link>
                  </p>
                </form>
              )}
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.12)", marginTop: 24, fontFamily: "'Cinzel',serif" }}>
            © {new Date().getFullYear()} Kadima Academy
          </p>
        </div>
      </div>
    </>
  );
}
