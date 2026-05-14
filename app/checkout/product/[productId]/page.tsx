"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wallet, Package, FileText, Download } from "lucide-react";

interface Product {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  price: number;
  type: string;
}

export default function ProductCheckoutPage({ params: paramsPromise }: { params: Promise<{ productId: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const productId = params.productId;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    // Buscar produto
    fetch(`/api/products/${productId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setProduct(data);
      })
      .catch(() => setError("Produto não encontrado."));

    // Buscar sessão
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(s => {
        if (s && Object.keys(s).length > 0) setSession(s);
      });

    // Buscar saldo da carteira
    fetch("/api/affiliate/wallet")
      .then(r => r.json())
      .then(data => setWalletBalance(data.balance ?? 0))
      .catch(() => {});
  }, [productId]);

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError("");
    
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon(data);
      } else {
        setCouponError(data.error || "Cupom inválido");
      }
    } catch (err) {
      setCouponError("Erro ao validar cupom");
    } finally {
      setValidatingCoupon(false);
    }
  }

  const walletAmount = useWallet ? Math.min(walletBalance, product?.price ?? 0) : 0;
  
  // Cálculo de desconto do cupom
  const couponDiscount = appliedCoupon 
    ? (appliedCoupon.discountType === "PERCENTAGE" 
        ? (product?.price ?? 0) * (appliedCoupon.discountValue / 100)
        : appliedCoupon.discountValue)
    : 0;

  const finalPrice = Math.max(0, (product?.price ?? 0) - walletAmount - couponDiscount);

  async function handleCheckout() {
    if (!session) {
      router.push(`/login?callbackUrl=/checkout/product/${productId}`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productId, 
          walletAmount: useWallet ? walletAmount : 0,
          couponId: appliedCoupon?.id
        }),
      });
      const data = await res.json();
      if (!res.ok) { 
        setError(data.error ?? "Erro ao iniciar pagamento."); 
        setLoading(false); 
        return; 
      }

      if (data.paid && data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError("Erro de conexão.");
      setLoading(false);
    }
  }

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

        {!product ? (
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
            <div style={{ height: 180, background: "#080E22", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {product.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.thumbnail} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <Package size={48} color="var(--gold-35)" />
              )}
            </div>

            <div style={{ padding: "28px 28px 32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2 }} />
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "var(--gold)" }}>
                  Resumo da Compra
                </span>
              </div>

              <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 20, letterSpacing: 2, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.3 }}>
                {product.title}
              </h1>

              <div style={{
                padding: "16px 20px", borderRadius: 14, marginBottom: 16,
                background: "rgba(201,169,122,0.06)", border: "1px solid rgba(201,169,122,0.18)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 2, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Valor do produto
                </span>
                <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 26, color: useWallet && walletAmount > 0 ? "var(--text-muted)" : "var(--gold-light)", textDecoration: useWallet && walletAmount > 0 ? "line-through" : "none" }}>
                  R$ {product.price.toFixed(2).replace(".", ",")}
                </span>
              </div>

              {/* Cupom de Desconto */}
              <div style={{ marginBottom: 16 }}>
                {!appliedCoupon ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text" placeholder="Tem um cupom?"
                      value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      style={{ flex: 1, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "white", fontSize: 13 }}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !couponCode}
                      style={{
                        padding: "10px 20px", borderRadius: 10, border: "1px solid var(--gold-35)",
                        background: "rgba(201,169,122,0.1)", color: "var(--gold)",
                        fontSize: 10, fontWeight: 700, fontFamily: "'Cinzel',serif", cursor: "pointer",
                        textTransform: "uppercase", letterSpacing: 1
                      }}
                    >
                      {validatingCoupon ? "..." : "Aplicar"}
                    </button>
                  </div>
                ) : (
                  <div style={{
                    padding: "10px 14px", borderRadius: 10, background: "rgba(110,231,183,0.1)",
                    border: "1px solid rgba(110,231,183,0.3)", display: "flex", alignItems: "center", justifyContent: "space-between"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
                      </svg>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#6ee7b7", letterSpacing: 1 }}>{appliedCoupon.code} ATIVADO</span>
                    </div>
                    <button onClick={() => { setAppliedCoupon(null); setCouponCode(""); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 10 }}>Remover</button>
                  </div>
                )}
                {couponError && <p style={{ color: "#FF8088", fontSize: 11, marginTop: 4, marginLeft: 4 }}>{couponError}</p>}
              </div>

              {/* Discount Info (if any) */}
              {appliedCoupon && (
                <div style={{
                  padding: "12px 20px", borderRadius: 14, marginBottom: 12,
                  background: "rgba(110,231,183,0.06)", border: "1px dashed rgba(110,231,183,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <span style={{ fontSize: 11, color: "#6ee7b7", fontWeight: 600 }}>DESCONTO DO CUPOM</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#6ee7b7" }}>
                    -R$ {couponDiscount.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              )}

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

              {/* Final Price Container */}
              {(finalPrice < product.price) && (
                <div style={{
                  padding: "16px 20px", borderRadius: 14, marginBottom: 16,
                  background: "rgba(110,231,183,0.06)", border: "1px solid rgba(110,231,183,0.20)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <span style={{ fontSize: 11, color: "#6ee7b7", fontWeight: 600 }}>VALOR A PAGAR</span>
                  <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 26, color: "#6ee7b7" }}>
                    R$ {finalPrice.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              )}

              {error && <p style={{ color: "#FF8088", fontSize: 12, marginBottom: 16, textAlign: "center" }}>{error}</p>}

              <button
                onClick={handleCheckout}
                disabled={loading}
                style={{
                  width: "100%", padding: "14px 24px", borderRadius: 14,
                  background: loading ? "rgba(201,169,122,0.20)" : finalPrice <= 0 ? "linear-gradient(135deg, #6ee7b7, #34d399)" : "linear-gradient(135deg, #009EE3, #007BC2)",
                  color: loading ? "rgba(255,255,255,0.40)" : finalPrice <= 0 ? "#060D1F" : "#fff",
                  fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 12,
                  letterSpacing: 2, textTransform: "uppercase", border: "none", cursor: loading ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.2s",
                }}
              >
                {loading ? "Processando..." : finalPrice <= 0 ? "Comprar com Saldo" : "Pagar com Mercado Pago"}
              </button>

              <p style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
                O download será liberado imediatamente após a confirmação.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
