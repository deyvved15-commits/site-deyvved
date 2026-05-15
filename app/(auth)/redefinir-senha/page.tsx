"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (!token) setError("Link inválido ou expirado.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    if (password.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao redefinir senha."); return; }
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 420 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
        <Image src="/logo-nova.png" alt="Kadima Academy" width={110} height={110}
          style={{ objectFit: "contain", marginBottom: 16, filter: "drop-shadow(0 0 28px rgba(201,169,122,0.35))" }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 40, height: 1, background: "linear-gradient(90deg, transparent, rgba(201,169,122,0.40))" }} />
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 4, color: "rgba(201,169,122,0.45)", textTransform: "uppercase" }}>
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
        boxShadow: "0 24px 64px rgba(0,0,0,0.50)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "13px 24px",
          borderBottom: "1px solid rgba(201,169,122,0.08)",
          background: "rgba(201,169,122,0.025)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#C9A97A", opacity: 0.7 }} />
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "rgba(201,169,122,0.55)" }}>
            Nova Senha
          </span>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#C9A97A", opacity: 0.7 }} />
        </div>

        <div style={{ padding: "28px 24px 32px" }}>
          {done ? (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 16, fontWeight: 700, letterSpacing: 2, color: "#E8D5A8", marginBottom: 12 }}>
                Senha redefinida!
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", lineHeight: 1.7, marginBottom: 20 }}>
                Sua senha foi atualizada com sucesso. Redirecionando para o login...
              </p>
              <Link href="/login" style={{ color: "rgba(201,169,122,0.70)", fontSize: 12, fontFamily: "'Cinzel',serif", letterSpacing: 2, textTransform: "uppercase", textDecoration: "none" }}>
                Ir para o login agora
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", lineHeight: 1.7, margin: 0 }}>
                Escolha uma nova senha para sua conta Kadima Academy.
              </p>

              <div>
                <label style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "#C9A97A", display: "block", marginBottom: 8 }}>
                  Nova Senha
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(201,169,122,0.38)", pointerEvents: "none" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required minLength={6}
                    disabled={!token}
                    style={{
                      width: "100%", padding: "12px 44px 12px 40px",
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,122,0.18)",
                      borderRadius: 12, fontSize: 14, color: "#E8D5A8", outline: "none",
                      fontFamily: "'Poppins',sans-serif", boxSizing: "border-box",
                    }}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4, color: "rgba(201,169,122,0.35)", lineHeight: 0 }}>
                    {showPw
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
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
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input
                    type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                    placeholder="Repita a nova senha"
                    required disabled={!token}
                    style={{
                      width: "100%", padding: "12px 14px 12px 40px",
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,122,0.18)",
                      borderRadius: 12, fontSize: 14, color: "#E8D5A8", outline: "none",
                      fontFamily: "'Poppins',sans-serif", boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(230,57,70,0.08)", border: "1px solid rgba(230,57,70,0.25)" }}>
                  <span style={{ fontSize: 12, color: "#FF8088", fontFamily: "'Poppins',sans-serif" }}>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password.trim() || !confirm.trim() || !token}
                style={{
                  width: "100%", padding: "14px 24px", borderRadius: 14, border: "none", cursor: "pointer",
                  fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 13, letterSpacing: 3, textTransform: "uppercase",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.2s",
                  background: (!password.trim() || !confirm.trim() || !token) ? "rgba(201,169,122,0.15)" : "linear-gradient(135deg, #C9A97A, #8B6914)",
                  color: (!password.trim() || !confirm.trim() || !token) ? "rgba(201,169,122,0.35)" : "#060D1F",
                  boxShadow: (!password.trim() || !confirm.trim() || !token) ? "none" : "0 6px 24px rgba(201,169,122,0.35)",
                }}
              >
                {loading ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Salvando...
                  </>
                ) : "Redefinir Senha"}
              </button>

              <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.30)", fontFamily: "'Poppins',sans-serif", margin: 0 }}>
                <Link href="/login" style={{ color: "rgba(201,169,122,0.70)", textDecoration: "none" }}>← Voltar ao login</Link>
              </p>
            </form>
          )}
        </div>
      </div>

      <p style={{ textAlign: "center", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.12)", marginTop: 24, fontFamily: "'Cinzel',serif" }}>
        © {new Date().getFullYear()} Kadima Academy
      </p>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(180deg, #060D1F 0%, #0F1A3D 100%)",
        position: "relative", overflow: "hidden", padding: "24px 16px", boxSizing: "border-box",
      }}>
        <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", top: "-60px", left: "15%", background: "radial-gradient(circle, rgba(201,169,122,0.12) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", bottom: "-80px", right: "10%", background: "radial-gradient(circle, rgba(80,110,200,0.14) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(201,169,122,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,122,0.025) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </>
  );
}
