"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Package, Truck, MapPin, CheckCircle, Store } from "lucide-react";
import { getGoogleDriveImageUrl } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  price: number;
  type: string;
  weightG: number | null;
  heightCm: number | null;
  widthCm: number | null;
  lengthCm: number | null;
}

interface ShippingOption {
  id: number;
  name: string;
  company: string;
  price: number;
  days: number;
  logoUrl: string | null;
}

interface ShippingAddress {
  name: string;
  cep: string;
  address: string;
  number: string;
  city: string;
  state: string;
}

const INPUT: React.CSSProperties = {
  width: "100%", background: "rgba(0,0,0,0.25)",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
  padding: "11px 14px", color: "white", fontSize: 13, boxSizing: "border-box",
  outline: "none",
};

function getThumbnailUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.includes("drive.google.com")) return getGoogleDriveImageUrl(url);
  return url;
}

export default function ProductCheckoutPage({ params: paramsPromise }: { params: Promise<{ productId: string }> }) {
  const params      = use(paramsPromise);
  const router      = useRouter();
  const productId   = params.productId;

  const [product, setProduct]           = useState<Product | null>(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet]       = useState(false);
  const [session, setSession]           = useState<any>(null);
  const [userData, setUserData]         = useState({ name: "", email: "", password: "" });
  const [couponCode, setCouponCode]     = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError]   = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [deliveryMethod, setDeliveryMethod]     = useState<"shipping" | "pickup">("shipping");
  const [shippingAddr, setShippingAddr]         = useState<ShippingAddress>({ name: "", cep: "", address: "", number: "", city: "", state: "" });
  const [shippingOptions, setShippingOptions]   = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [quotingShipping, setQuotingShipping]   = useState(false);
  const [shippingError, setShippingError]       = useState("");

  const isPrinted = product?.type === "PRINTED";
  const isPickup  = isPrinted && deliveryMethod === "pickup";

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setProduct(d); })
      .catch(() => setError("Produto não encontrado."));

    fetch("/api/auth/session")
      .then(r => r.json())
      .then(s => { if (s && Object.keys(s).length > 0) setSession(s); });

    fetch("/api/affiliate/wallet")
      .then(r => r.json())
      .then(d => setWalletBalance(d.balance ?? 0))
      .catch(() => {});
  }, [productId]);

  async function fetchAddressByCep(cep: string) {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setShippingAddr(p => ({
          ...p,
          address: `${data.logradouro}${data.bairro ? ", " + data.bairro : ""}`,
          city: data.localidade,
          state: data.uf,
        }));
      }
    } catch {}
  }

  async function quoteShipping() {
    const digits = shippingAddr.cep.replace(/\D/g, "");
    if (digits.length !== 8) { setShippingError("CEP inválido."); return; }
    if (!shippingAddr.name.trim()) { setShippingError("Informe o nome do destinatário."); return; }
    setQuotingShipping(true);
    setShippingError("");
    setShippingOptions([]);
    setSelectedShipping(null);
    try {
      const res  = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cep: digits,
          weightG:  product?.weightG  ?? 300,
          heightCm: product?.heightCm ?? 2,
          widthCm:  product?.widthCm  ?? 22,
          lengthCm: product?.lengthCm ?? 31,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setShippingError(data.error ?? "Erro ao cotar frete."); return; }
      if (!data.length) { setShippingError("Nenhuma opção disponível para este CEP."); return; }
      setShippingOptions(data);
    } catch { setShippingError("Falha de conexão ao cotar frete."); }
    finally   { setQuotingShipping(false); }
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError("");
    try {
      const res  = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (res.ok) setAppliedCoupon(data);
      else setCouponError(data.error || "Cupom inválido");
    } catch { setCouponError("Erro ao validar cupom"); }
    finally   { setValidatingCoupon(false); }
  }

  const walletAmount   = useWallet ? Math.min(walletBalance, product?.price ?? 0) : 0;
  const couponDiscount = appliedCoupon
    ? (appliedCoupon.discountType === "PERCENTAGE"
        ? (product?.price ?? 0) * (appliedCoupon.discountValue / 100)
        : appliedCoupon.discountValue)
    : 0;
  const shippingCost = isPickup ? 0 : (selectedShipping?.price ?? 0);
  const finalPrice   = Math.max(0, (product?.price ?? 0) + shippingCost - walletAmount - couponDiscount);

  const needsShippingChoice = isPrinted && !isPickup && !selectedShipping;

  async function handleCheckout() {
    if (isPrinted && !isPickup) {
      if (!shippingAddr.name || !shippingAddr.cep || !shippingAddr.address || !shippingAddr.city || !shippingAddr.state) {
        setError("Preencha o endereço de entrega completo."); return;
      }
      if (!selectedShipping) { setError("Selecione uma opção de frete."); return; }
    }
    if (!session && (!userData.name || !userData.email || !userData.password)) {
      setError("Preencha todos os campos para criar sua conta."); return;
    }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          walletAmount: useWallet ? walletAmount : 0,
          couponId: appliedCoupon?.id,
          userData: !session ? userData : null,
          shipping: isPrinted
            ? isPickup
              ? { name: "Retirada na loja", cep: "21730000", address: "Av. Brasil, 29010", city: "Rio de Janeiro", state: "RJ", service: "RETIRADA", price: 0, days: 0 }
              : selectedShipping
                ? { name: shippingAddr.name, cep: shippingAddr.cep, address: `${shippingAddr.address}${shippingAddr.number ? ", " + shippingAddr.number : ""}`, city: shippingAddr.city, state: shippingAddr.state, service: selectedShipping.name, price: selectedShipping.price, days: selectedShipping.days }
                : null
            : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao iniciar pagamento."); setLoading(false); return; }
      if (data.paid && data.redirectUrl) { window.location.href = data.redirectUrl; return; }
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Erro de conexão.");
      setLoading(false);
    }
  }

  function formatCep(v: string) {
    return v.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9);
  }

  const thumbUrl = getThumbnailUrl(product?.thumbnail ?? null);

  return (
    <>
      <style>{`
        .co-wrap {
          min-height: 100vh;
          background: linear-gradient(160deg, var(--navy-darkest) 0%, var(--navy-mid) 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 16px 48px;
        }
        .co-back {
          width: 100%;
          max-width: 960px;
          margin-bottom: 20px;
        }
        .co-grid {
          width: 100%;
          max-width: 960px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }
        .co-card {
          border-radius: 20px;
          background: linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%);
          border: 1px solid rgba(201,169,122,0.15);
          overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,0.45);
        }
        .co-thumb {
          width: 100%;
          aspect-ratio: 4/3;
          background: #060D1F;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .co-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .co-product-body {
          padding: 28px;
        }
        .co-form-card {
          border-radius: 20px;
          background: linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%);
          border: 1px solid rgba(201,169,122,0.15);
          padding: 28px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.45);
        }
        .co-section {
          margin-bottom: 20px;
          padding: 18px;
          background: rgba(201,169,122,0.05);
          border-radius: 14px;
          border: 1px solid rgba(201,169,122,0.13);
        }
        .co-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
          font-family: 'Cinzel', serif;
          font-size: 9px;
          letter-spacing: 3px;
          color: var(--gold);
          text-transform: uppercase;
          font-weight: 700;
        }
        .co-row { display: flex; gap: 8px; }
        .co-shipping-opt {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 8px;
        }
        .co-radio {
          width: 18px; height: 18px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (max-width: 700px) {
          .co-grid {
            grid-template-columns: 1fr;
          }
          .co-thumb {
            aspect-ratio: 16/9;
          }
        }
      `}</style>

      <div className="co-wrap">
        {/* Voltar */}
        <div className="co-back">
          <button onClick={() => router.back()} style={{
            display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
            cursor: "pointer", color: "var(--gold)", fontSize: 11, letterSpacing: 2,
            textTransform: "uppercase", fontFamily: "'Cinzel',serif",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Voltar
          </button>
        </div>

        {!product ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 60 }}>
            {error || "Carregando..."}
          </div>
        ) : (
          <div className="co-grid">

            {/* ── Coluna esquerda: produto ── */}
            <div className="co-card">
              <div className="co-thumb">
                {thumbUrl
                  ? <img src={thumbUrl} alt={product.title} />
                  : <Package size={56} color="rgba(201,169,122,0.3)" />
                }
              </div>
              <div className="co-product-body">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 3, height: 14, background: "linear-gradient(180deg,var(--gold-light),var(--gold))", borderRadius: 2 }} />
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: "var(--gold)" }}>
                    Resumo da Compra
                  </span>
                </div>

                <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 22, letterSpacing: 1, color: "var(--text-primary)", lineHeight: 1.3, marginBottom: 10 }}>
                  {product.title}
                </h1>

                {product.description && (
                  <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
                    {product.description}
                  </p>
                )}

                {/* Preço base */}
                <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(201,169,122,0.07)", border: "1px solid rgba(201,169,122,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 2, color: "var(--text-muted)", textTransform: "uppercase" }}>Valor do produto</span>
                  <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 22, color: "var(--gold-light)" }}>
                    R$ {product.price.toFixed(2).replace(".", ",")}
                  </span>
                </div>

                {/* Frete selecionado */}
                {!isPickup && selectedShipping && (
                  <div style={{ padding: "12px 18px", borderRadius: 12, marginBottom: 10, background: "rgba(201,169,122,0.04)", border: "1px dashed rgba(201,169,122,0.25)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Truck size={12} color="var(--gold)" />
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{selectedShipping.company} ({selectedShipping.days}d úteis)</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold-light)" }}>+ R$ {selectedShipping.price.toFixed(2).replace(".", ",")}</span>
                  </div>
                )}

                {/* Retirada badge */}
                {isPickup && (
                  <div style={{ padding: "12px 18px", borderRadius: 12, marginBottom: 10, background: "rgba(201,169,122,0.04)", border: "1px dashed rgba(201,169,122,0.25)", display: "flex", alignItems: "center", gap: 8 }}>
                    <Store size={13} color="var(--gold)" />
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Retirada na loja — <strong style={{ color: "var(--gold)" }}>Grátis</strong></span>
                  </div>
                )}

                {/* Cupom desconto */}
                {appliedCoupon && (
                  <div style={{ padding: "12px 18px", borderRadius: 12, marginBottom: 10, background: "rgba(110,231,183,0.06)", border: "1px dashed rgba(110,231,183,0.3)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "#6ee7b7", fontWeight: 600 }}>CUPOM {appliedCoupon.code}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#6ee7b7" }}>-R$ {couponDiscount.toFixed(2).replace(".", ",")}</span>
                  </div>
                )}

                {/* Carteira desconto */}
                {useWallet && walletAmount > 0 && (
                  <div style={{ padding: "12px 18px", borderRadius: 12, marginBottom: 10, background: "rgba(110,231,183,0.06)", border: "1px dashed rgba(110,231,183,0.3)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "#6ee7b7", fontWeight: 600 }}>SALDO KADIMA</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#6ee7b7" }}>-R$ {walletAmount.toFixed(2).replace(".", ",")}</span>
                  </div>
                )}

                {/* Total */}
                {(shippingCost > 0 || couponDiscount > 0 || walletAmount > 0) && (
                  <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(201,169,122,0.1)", border: "1px solid rgba(201,169,122,0.28)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 700, fontFamily: "'Cinzel',serif", letterSpacing: 1 }}>TOTAL A PAGAR</span>
                    <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 26, color: "var(--gold-light)" }}>
                      R$ {finalPrice.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Coluna direita: formulário ── */}
            <div className="co-form-card">

              {/* Cadastro visitante */}
              {!session && (
                <div className="co-section">
                  <div className="co-section-title">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Crie sua conta para acessar
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <input type="text" placeholder="Nome Completo" value={userData.name} onChange={e => setUserData({ ...userData, name: e.target.value })} style={INPUT} />
                    <input type="email" placeholder="E-mail" value={userData.email} onChange={e => setUserData({ ...userData, email: e.target.value })} style={INPUT} />
                    <input type="password" placeholder="Crie uma Senha" value={userData.password} onChange={e => setUserData({ ...userData, password: e.target.value })} style={INPUT} />
                    <p style={{ fontSize: 10, color: "var(--text-muted)" }}>
                      Já tem conta?{" "}
                      <a href={`/login?callbackUrl=/checkout/product/${productId}`} style={{ color: "var(--gold)", textDecoration: "none" }}>Faça login</a>
                    </p>
                  </div>
                </div>
              )}

              {/* ── ENTREGA (apenas PRINTED) ── */}
              {isPrinted && (
                <div className="co-section">
                  <div className="co-section-title">
                    <Truck size={13} />
                    Método de Recebimento
                  </div>

                  {/* Toggle Enviar / Retirar */}
                  <div className="co-row" style={{ marginBottom: 16 }}>
                    {([
                      { key: "shipping", label: "Enviar",          icon: <Truck size={13} /> },
                      { key: "pickup",   label: "Retirar na loja", icon: <Store size={13} /> },
                    ] as const).map(({ key, label, icon }) => (
                      <button key={key} onClick={() => { setDeliveryMethod(key); setSelectedShipping(null); setShippingOptions([]); setShippingError(""); }}
                        style={{
                          flex: 1, padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                          background: deliveryMethod === key ? "rgba(201,169,122,0.18)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${deliveryMethod === key ? "rgba(201,169,122,0.5)" : "rgba(255,255,255,0.1)"}`,
                          color: deliveryMethod === key ? "var(--gold)" : "var(--text-muted)",
                          fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s",
                        }}
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>

                  {/* Formulário de endereço */}
                  {deliveryMethod === "shipping" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <input type="text" placeholder="Nome do destinatário" value={shippingAddr.name} onChange={e => setShippingAddr(p => ({ ...p, name: e.target.value }))} style={INPUT} />

                      <div className="co-row">
                        <input type="text" placeholder="CEP" maxLength={9} value={shippingAddr.cep}
                          onChange={e => { const v = formatCep(e.target.value); setShippingAddr(p => ({ ...p, cep: v })); if (v.replace(/\D/g, "").length === 8) fetchAddressByCep(v); }}
                          style={{ ...INPUT, width: 130 }} />
                        <input type="text" placeholder="Endereço e bairro" value={shippingAddr.address} onChange={e => setShippingAddr(p => ({ ...p, address: e.target.value }))} style={{ ...INPUT, flex: 1 }} />
                        <input type="text" placeholder="Nº" value={shippingAddr.number} onChange={e => setShippingAddr(p => ({ ...p, number: e.target.value }))} style={{ ...INPUT, width: 64 }} />
                      </div>

                      <div className="co-row">
                        <input type="text" placeholder="Cidade" value={shippingAddr.city} onChange={e => setShippingAddr(p => ({ ...p, city: e.target.value }))} style={{ ...INPUT, flex: 1 }} />
                        <input type="text" placeholder="UF" maxLength={2} value={shippingAddr.state} onChange={e => setShippingAddr(p => ({ ...p, state: e.target.value.toUpperCase() }))} style={{ ...INPUT, width: 58 }} />
                      </div>

                      <button onClick={quoteShipping} disabled={quotingShipping}
                        style={{ padding: "11px 20px", borderRadius: 10, cursor: "pointer", background: "linear-gradient(135deg,rgba(201,169,122,0.2),rgba(201,169,122,0.07))", border: "1px solid rgba(201,169,122,0.35)", color: "var(--gold)", fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <Truck size={13} />
                        {quotingShipping ? "Calculando..." : "Calcular Frete"}
                      </button>

                      {shippingError && <p style={{ color: "#FF8088", fontSize: 11 }}>{shippingError}</p>}

                      {shippingOptions.length > 0 && (
                        <div style={{ marginTop: 4 }}>
                          <p style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Cinzel',serif", marginBottom: 8 }}>
                            Escolha o frete
                          </p>
                          {shippingOptions.map(opt => (
                            <div key={opt.id} onClick={() => setSelectedShipping(opt)}
                              className="co-shipping-opt"
                              style={{
                                background: selectedShipping?.id === opt.id ? "rgba(201,169,122,0.12)" : "rgba(255,255,255,0.02)",
                                border: `1px solid ${selectedShipping?.id === opt.id ? "rgba(201,169,122,0.40)" : "rgba(255,255,255,0.07)"}`,
                              }}>
                              <div className="co-radio" style={{ border: `2px solid ${selectedShipping?.id === opt.id ? "var(--gold)" : "rgba(255,255,255,0.2)"}`, background: selectedShipping?.id === opt.id ? "var(--gold)" : "transparent" }}>
                                {selectedShipping?.id === opt.id && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--navy-darkest)" }} />}
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{opt.company} — {opt.name}</p>
                                <p style={{ fontSize: 10, color: "var(--text-muted)" }}>Prazo: até {opt.days} dias úteis</p>
                              </div>
                              <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 13, color: "var(--gold-light)", flexShrink: 0 }}>
                                R$ {opt.price.toFixed(2).replace(".", ",")}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card retirada */}
                  {deliveryMethod === "pickup" && (
                    <div style={{ padding: 16, borderRadius: 12, background: "rgba(201,169,122,0.08)", border: "1px solid rgba(201,169,122,0.22)", display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <MapPin size={18} color="var(--gold)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Av. Brasil, nº 29010 — Realengo</p>
                        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Rio de Janeiro — RJ</p>
                        <p style={{ fontSize: 11, color: "var(--gold)", marginTop: 8, fontWeight: 600 }}>
                          Grátis · Horário combinado por WhatsApp após o pagamento
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cupom */}
              <div style={{ marginBottom: 16 }}>
                {!appliedCoupon ? (
                  <div className="co-row">
                    <input type="text" placeholder="Tem um cupom?" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} style={{ ...INPUT, flex: 1 }} />
                    <button onClick={handleApplyCoupon} disabled={validatingCoupon || !couponCode}
                      style={{ padding: "11px 18px", borderRadius: 10, border: "1px solid rgba(201,169,122,0.35)", background: "rgba(201,169,122,0.1)", color: "var(--gold)", fontSize: 10, fontWeight: 700, fontFamily: "'Cinzel',serif", cursor: "pointer", textTransform: "uppercase", letterSpacing: 1, whiteSpace: "nowrap" }}>
                      {validatingCoupon ? "..." : "Aplicar"}
                    </button>
                  </div>
                ) : (
                  <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(110,231,183,0.1)", border: "1px solid rgba(110,231,183,0.3)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <CheckCircle size={14} color="#6ee7b7" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#6ee7b7", letterSpacing: 1 }}>{appliedCoupon.code} ATIVADO</span>
                    </div>
                    <button onClick={() => { setAppliedCoupon(null); setCouponCode(""); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 10 }}>Remover</button>
                  </div>
                )}
                {couponError && <p style={{ color: "#FF8088", fontSize: 11, marginTop: 4 }}>{couponError}</p>}
              </div>

              {/* Carteira */}
              {walletBalance > 0 && (
                <div onClick={() => setUseWallet(!useWallet)} style={{ padding: "14px 18px", borderRadius: 12, marginBottom: 16, background: useWallet ? "rgba(110,231,183,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${useWallet ? "rgba(110,231,183,0.25)" : "rgba(255,255,255,0.08)"}`, cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${useWallet ? "#6ee7b7" : "rgba(255,255,255,0.15)"}`, background: useWallet ? "#6ee7b7" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}>
                      {useWallet && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#060D1F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Wallet size={13} color={useWallet ? "#6ee7b7" : "var(--text-muted)"} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: useWallet ? "#6ee7b7" : "var(--text-secondary)" }}>Usar Carteira Kadima</span>
                      </div>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Saldo: R$ {walletBalance.toFixed(2).replace(".", ",")}</p>
                    </div>
                    {useWallet && <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 13, color: "#6ee7b7" }}>-R$ {walletAmount.toFixed(2).replace(".", ",")}</span>}
                  </div>
                </div>
              )}

              {error && <p style={{ color: "#FF8088", fontSize: 12, marginBottom: 14, textAlign: "center" }}>{error}</p>}

              <button onClick={handleCheckout} disabled={loading || needsShippingChoice}
                style={{
                  width: "100%", padding: "15px 24px", borderRadius: 14,
                  background: loading ? "rgba(201,169,122,0.2)"
                    : needsShippingChoice ? "rgba(255,255,255,0.05)"
                    : finalPrice <= 0 ? "linear-gradient(135deg,#6ee7b7,#34d399)"
                    : "linear-gradient(135deg,#009EE3,#007BC2)",
                  color: loading || needsShippingChoice ? "rgba(255,255,255,0.3)" : finalPrice <= 0 ? "#060D1F" : "#fff",
                  fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 12,
                  letterSpacing: 2, textTransform: "uppercase", border: "none",
                  cursor: loading || needsShippingChoice ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.2s",
                }}>
                {loading ? "Processando..."
                  : needsShippingChoice ? "Calcule o frete para continuar"
                  : finalPrice <= 0 ? "Comprar com Saldo"
                  : `Finalizar Pedido — R$ ${finalPrice.toFixed(2).replace(".", ",")}`}
              </button>

              <p style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
                {isPickup
                  ? "Retire após a confirmação. Combinamos o horário por WhatsApp."
                  : isPrinted
                  ? "Entrega via transportadora após confirmação do pagamento."
                  : "O download é liberado imediatamente após a confirmação."}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
