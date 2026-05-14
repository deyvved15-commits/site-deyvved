"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getGoogleDriveImageUrl } from "@/lib/utils";
import { Wallet } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  price: number;
  _count: { modules: number; enrollments: number };
}

export default function CheckoutPage({ params, searchParams }: { params: Promise<{ courseId: string }>; searchParams: Promise<{ renovar?: string }> }) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [courseId, setCourseId] = useState("");
  const [isRenewal, setIsRenewal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [userData, setUserData] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    Promise.all([params, searchParams]).then(([p, sp]) => {
      setCourseId(p.courseId);
      setIsRenewal(sp.renovar === "1");
      
      // Buscar curso
      fetch(`/api/courses/${p.courseId}/public`)
        .then(r => r.json())
        .then(setCourse)
        .catch(() => setError("Curso não encontrado."));

      // Buscar sessão
      fetch("/api/auth/session")
        .then(r => r.json())
        .then(s => {
          if (s && Object.keys(s).length > 0) setSession(s);
        });

      // Buscar saldo da carteira (só funciona se logado)
      fetch("/api/affiliate/wallet")
        .then(r => r.json())
        .then(data => setWalletBalance(data.balance ?? 0))
        .catch(() => {});
    });
  }, [params, searchParams]);

  const walletAmount = useWallet ? Math.min(walletBalance, course?.price ?? 0) : 0;
  const finalPrice = (course?.price ?? 0) - walletAmount;

  async function handleCheckout() {
    setLoading(true);
    setError("");

    // Validação básica para convidados
    if (!session) {
      if (!userData.name || !userData.email || !userData.password) {
        setError("Por favor, preencha todos os campos para criar sua conta.");
        setLoading(false);
        return;
      }
    }

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        courseId, 
        walletAmount: useWallet ? walletAmount : 0,
        userData: !session ? userData : null 
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Erro ao iniciar pagamento."); setLoading(false); return; }

    // Se pagou 100% com saldo
    if (data.paid && data.redirectUrl) {
      window.location.href = data.redirectUrl;
      return;
    }

    window.location.href = data.checkoutUrl;
  }

  const thumbUrl = course?.thumbnail?.includes("drive.google.com")
    ? getGoogleDriveImageUrl(course.thumbnail)
    : course?.thumbnail;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)",
      padding: "24px 16px",
    }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* Back */}
        <button onClick={() => router.back()} style={{
          display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
          cursor: "pointer", color: "var(--gold)", fontSize: 11, letterSpacing: 2,
          textTransform: "uppercase", fontFamily: "'Cinzel',serif", marginBottom: 24,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Voltar
        </button>

        {!course ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
            {error || "Carregando..."}
          </div>
        ) : (
          <div style={{
            borderRadius: 24,
            background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
            border: "1px solid rgba(201,169,122,0.15)",
            overflow: "hidden",
            boxShadow: "0 24px 64px rgba(0,0,0,0.50)",
          }}>
            {/* Thumbnail */}
            {thumbUrl && (
              <div style={{ height: 200, background: "#080E22", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbUrl} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
            )}

            <div style={{ padding: "28px 28px 32px" }}>
              {/* Header card */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2, boxShadow: "0 0 8px var(--gold)" }} />
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "var(--gold)" }}>
                  {isRenewal ? "Renovar Acesso" : "Resumo da Compra"}
                </span>
              </div>

              <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 20, letterSpacing: 2, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.3 }}>
                {course.title}
              </h1>

              {/* Se não estiver logado, pede os dados */}
              {!session && (
                <div style={{ marginBottom: 24, padding: "20px", background: "rgba(201,169,122,0.05)", borderRadius: 16, border: "1px solid rgba(201,169,122,0.15)" }}>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 2, color: "var(--gold)", marginBottom: 16, textTransform: "uppercase", fontWeight: 700 }}>
                    Crie sua conta para acessar
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <input 
                      type="text" placeholder="Nome Completo" 
                      value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})}
                      style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "white", fontSize: 13 }}
                    />
                    <input 
                      type="email" placeholder="E-mail" 
                      value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})}
                      style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "white", fontSize: 13 }}
                    />
                    <input 
                      type="password" placeholder="Crie uma Senha" 
                      value={userData.password} onChange={e => setUserData({...userData, password: e.target.value})}
                      style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "white", fontSize: 13 }}
                    />
                    <p style={{ fontSize: 9, color: "var(--text-muted)", margin: 0 }}>
                      Já tem conta? <Link href="/login" style={{ color: "var(--gold)", textDecoration: "none" }}>Faça login aqui</Link>
                    </p>
                  </div>
                </div>
              )}

              {/* Price */}
              <div style={{
                padding: "16px 20px", borderRadius: 14, marginBottom: 16,
                background: "rgba(201,169,122,0.06)", border: "1px solid rgba(201,169,122,0.18)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 2, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  {isRenewal ? "Mensalidade (30 dias)" : "Valor do curso"}
                </span>
                <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 26, color: useWallet && walletAmount > 0 ? "var(--text-muted)" : "var(--gold-light)", textDecoration: useWallet && walletAmount > 0 ? "line-through" : "none" }}>
                  R$ {course.price.toFixed(2).replace(".", ",")}
                </span>
              </div>

              {/* Wallet Option */}
              {walletBalance > 0 && (
                <div style={{
                  padding: "16px 20px", borderRadius: 14, marginBottom: 16,
                  background: useWallet ? "rgba(110,231,183,0.06)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${useWallet ? "rgba(110,231,183,0.25)" : "rgba(255,255,255,0.08)"}`,
                  cursor: "pointer", transition: "all 0.2s",
                }} onClick={() => setUseWallet(!useWallet)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6,
                      border: `2px solid ${useWallet ? "#6ee7b7" : "rgba(255,255,255,0.15)"}`,
                      background: useWallet ? "#6ee7b7" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s", flexShrink: 0,
                    }}>
                      {useWallet && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#060D1F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Wallet size={14} color={useWallet ? "#6ee7b7" : "var(--text-muted)"} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: useWallet ? "#6ee7b7" : "var(--text-secondary)" }}>
                          Usar Carteira Kadima
                        </span>
                      </div>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        Saldo disponível: R$ {walletBalance.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                    {useWallet && (
                      <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 14, color: "#6ee7b7" }}>
                        -R$ {walletAmount.toFixed(2).replace(".", ",")}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Final Price */}
              {useWallet && walletAmount > 0 && (
                <div style={{
                  padding: "16px 20px", borderRadius: 14, marginBottom: 16,
                  background: "rgba(110,231,183,0.06)", border: "1px solid rgba(110,231,183,0.20)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 2, color: "#6ee7b7", textTransform: "uppercase" }}>
                    {finalPrice <= 0 ? "Valor coberto pelo saldo" : "Valor a pagar"}
                  </span>
                  <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 26, color: "#6ee7b7" }}>
                    R$ {Math.max(0, finalPrice).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              )}

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(230,57,70,0.08)", border: "1px solid rgba(230,57,70,0.25)", marginBottom: 16 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF8088" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span style={{ fontSize: 12, color: "#FF8088", fontFamily: "'Poppins',sans-serif" }}>{error}</span>
                </div>
              )}

              {/* Checkout button */}
              <button
                onClick={handleCheckout}
                disabled={loading}
                style={{
                  width: "100%", padding: "14px 24px", borderRadius: 14, cursor: loading ? "default" : "pointer",
                  background: loading ? "rgba(201,169,122,0.20)" : finalPrice <= 0 ? "linear-gradient(135deg, #6ee7b7, #34d399)" : "linear-gradient(135deg, #009EE3, #007BC2)",
                  color: loading ? "rgba(255,255,255,0.40)" : finalPrice <= 0 ? "#060D1F" : "#fff",
                  fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 12,
                  letterSpacing: 2, textTransform: "uppercase", border: "none",
                  boxShadow: loading ? "none" : finalPrice <= 0 ? "0 6px 24px rgba(110,231,183,0.35)" : "0 6px 24px rgba(0,158,227,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  transition: "all 0.2s",
                }}
              >
                {loading ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Redirecionando...
                  </>
                ) : finalPrice <= 0 ? (
                  <>
                    <Wallet size={16} />
                    Comprar com Saldo
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    Pagar com Mercado Pago
                  </>
                )}
              </button>

              <p style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 12, fontFamily: "'Poppins',sans-serif", lineHeight: 1.6 }}>
                {finalPrice <= 0
                  ? "Seu saldo da Carteira Kadima cobre o valor total deste curso."
                  : <>Você será redirecionado para o Mercado Pago.<br />{isRenewal ? "Acesso renovado por 30 dias após confirmação." : "Pagamento 100% seguro. Acesso liberado imediatamente após confirmação."}</>
                }
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
