"use client";

import { useEffect, useState } from "react";
import { Wallet, ArrowUpRight, ArrowDownLeft, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

export default function CarteiraPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/affiliate/wallet")
      .then(r => r.json())
      .then(data => {
        setBalance(data.balance ?? 0);
        setTransactions(data.transactions ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}><p style={{ color: "var(--text-muted)", fontSize: 13 }}>Carregando...</p></div>;

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      <div className="ka-page-header">
        <div style={{ marginBottom: 16 }}>
          <Link href="/afiliado" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--gold)", textDecoration: "none", fontSize: 11, fontFamily: "'Cinzel',serif", letterSpacing: 2, textTransform: "uppercase" }}>
            <ArrowLeft size={14} /> Voltar ao Painel
          </Link>
        </div>
        <div className="ka-page-eyebrow">Seus Créditos</div>
        <h1 className="ka-page-title">Carteira <span>Kadima</span></h1>
        <p className="ka-page-subtitle">Use seus créditos para comprar cursos na plataforma.</p>
      </div>

      <div className="ka-section" style={{ padding: "0 44px 44px" }}>

        {/* Saldo Card */}
        <div style={{
          borderRadius: 24, padding: "40px",
          background: "linear-gradient(135deg, rgba(110,231,183,0.08) 0%, rgba(201,169,122,0.05) 100%)",
          border: "1px solid rgba(110,231,183,0.20)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
          display: "flex", alignItems: "center", gap: 28,
          marginBottom: 36,
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 22,
            background: "linear-gradient(135deg, #6ee7b7, #34d399)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 30px rgba(110,231,183,0.35)",
          }}>
            <Wallet size={36} color="#060D1F" strokeWidth={2} />
          </div>
          <div>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: "#6ee7b7", marginBottom: 6 }}>Saldo Disponível</p>
            <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 42, fontWeight: 800, color: "white", lineHeight: 1 }}>
              R$ {balance.toFixed(2).replace(".", ",")}
            </h2>
          </div>
        </div>

        {/* Extrato */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 3, height: 16, background: "var(--gold)", borderRadius: 2 }} />
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
            Extrato Completo
          </span>
        </div>

        <div style={{
          borderRadius: 20, overflow: "hidden",
          background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
          border: "1px solid rgba(201,169,122,0.12)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        }}>
          {transactions.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Nenhuma transação registrada ainda.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {transactions.map((tx, i) => (
                <div key={tx.id} style={{
                  padding: "18px 24px",
                  borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  display: "flex", alignItems: "center", gap: 16,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: tx.amount > 0 ? "rgba(110,231,183,0.08)" : "rgba(248,113,113,0.08)",
                    border: `1px solid ${tx.amount > 0 ? "rgba(110,231,183,0.20)" : "rgba(248,113,113,0.20)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {tx.amount > 0
                      ? <ArrowDownLeft size={18} color="#6ee7b7" />
                      : <ArrowUpRight size={18} color="#f87171" />
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 2 }}>{tx.description}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {new Date(tx.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                      {" · "}
                      <span style={{ textTransform: "capitalize" }}>
                        {tx.type === "affiliate_commission" ? "Comissão de indicação" :
                         tx.type === "course_purchase" ? "Compra de curso" :
                         tx.type === "admin_adjustment" ? "Ajuste manual" : tx.type}
                      </span>
                    </p>
                  </div>
                  <p style={{
                    fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 15,
                    color: tx.amount > 0 ? "#6ee7b7" : "#f87171",
                  }}>
                    {tx.amount > 0 ? "+" : ""}R$ {Math.abs(tx.amount).toFixed(2).replace(".", ",")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
