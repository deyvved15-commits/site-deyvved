"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function CadastroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", phone: "", church: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password, phone: form.phone, church: form.church }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Erro ao criar conta.");
      setLoading(false);
      return;
    }

    const login = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    if (login?.error) {
      router.push("/login");
      return;
    }

    router.push("/");
    router.refresh();
  }

  const hasError = !!error;

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.20); }
        .cad-input {
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
        .cad-input:focus {
          border-color: rgba(201,169,122,0.55);
          background: rgba(255,255,255,0.07);
        }
        .cad-input.error { border-color: rgba(230,57,70,0.45); }
        .cad-input-right { padding-right: 44px; }
        .cad-input-no-icon { padding-left: 14px; }
        .cad-btn {
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
        .cad-btn:enabled {
          background: linear-gradient(135deg, #C9A97A, #8B6914);
          color: #060D1F;
          box-shadow: 0 6px 24px rgba(201,169,122,0.35);
        }
        .cad-btn:disabled {
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
          .cad-card { padding: 22px 18px 28px !important; }
          .cad-row { grid-template-columns: 1fr !important; }
          .corner { display: none; }
          .cad-bokeh { display: none; }
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
        <div className="cad-bokeh" style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", top: "-60px", left: "15%", background: "radial-gradient(circle, rgba(201,169,122,0.12) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
        <div className="cad-bokeh" style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", bottom: "-80px", right: "10%", background: "radial-gradient(circle, rgba(80,110,200,0.14) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />

        {/* Grid */}
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

        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 480 }}>

          {/* Logo */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
            <Image
              src="/logo-nova.png"
              alt="Kadima Academy"
              width={90}
              height={90}
              style={{
                objectFit: "contain",
                marginBottom: 14,
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
            {/* Header */}
            <div style={{
              padding: "13px 24px",
              borderBottom: "1px solid rgba(201,169,122,0.08)",
              background: "rgba(201,169,122,0.025)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#C9A97A", boxShadow: "0 0 6px #C9A97A", opacity: 0.7 }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "rgba(201,169,122,0.55)" }}>
                Criar Conta
              </span>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#C9A97A", boxShadow: "0 0 6px #C9A97A", opacity: 0.7 }} />
            </div>

            <form onSubmit={handleSubmit} className="cad-card" style={{ padding: "24px 24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Nome */}
              <div>
                <label style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "#C9A97A", display: "block", marginBottom: 8 }}>
                  Nome Completo
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(201,169,122,0.38)", pointerEvents: "none" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <input type="text" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Seu nome completo" required autoComplete="name" className="cad-input" />
                </div>
              </div>

              {/* Email */}
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
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="seu@email.com" required autoComplete="email" className={`cad-input${hasError ? " error" : ""}`} />
                </div>
              </div>

              {/* Senha + Confirmar — lado a lado */}
              <div className="cad-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
                      type={showPass ? "text" : "password"}
                      value={form.password}
                      onChange={e => set("password", e.target.value)}
                      placeholder="Min. 6 chars"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className={`cad-input cad-input-right${hasError ? " error" : ""}`}
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4, color: "rgba(201,169,122,0.35)", lineHeight: 0 }}>
                      {showPass ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "#C9A97A", display: "block", marginBottom: 8 }}>
                    Confirmar Senha
                  </label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(201,169,122,0.38)", pointerEvents: "none" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    </div>
                    <input
                      type={showPass ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={e => set("confirmPassword", e.target.value)}
                      placeholder="Repita a senha"
                      required
                      autoComplete="new-password"
                      className={`cad-input${hasError ? " error" : ""}`}
                    />
                  </div>
                </div>
              </div>

              {/* Telefone + Igreja — lado a lado */}
              <div className="cad-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "#C9A97A", display: "block", marginBottom: 8 }}>
                    Telefone <span style={{ opacity: 0.4, letterSpacing: 1 }}>(opc.)</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(201,169,122,0.38)", pointerEvents: "none" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.08 6.08l1.21-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </div>
                    <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(00) 00000-0000" autoComplete="tel" className="cad-input" />
                  </div>
                </div>
                <div>
                  <label style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "#C9A97A", display: "block", marginBottom: 8 }}>
                    Igreja / Org. <span style={{ opacity: 0.4, letterSpacing: 1 }}>(opc.)</span>
                  </label>
                  <input type="text" value={form.church} onChange={e => set("church", e.target.value)} placeholder="Nome da sua igreja" className="cad-input cad-input-no-icon" />
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
                disabled={loading || !form.name.trim() || !form.email.trim() || !form.password.trim() || !form.confirmPassword.trim()}
                className="cad-btn"
                style={{ marginTop: 4 }}
              >
                {loading ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Criando Conta...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                    </svg>
                    Criar Minha Conta
                  </>
                )}
              </button>

              {/* Link login */}
              <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.30)", fontFamily: "'Poppins',sans-serif", marginTop: 4 }}>
                Já tem conta?{" "}
                <Link href="/login" style={{ color: "rgba(201,169,122,0.70)", textDecoration: "none", fontWeight: 500 }}>
                  Entrar
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
