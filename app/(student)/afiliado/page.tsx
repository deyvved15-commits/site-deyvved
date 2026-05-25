"use client";

import { useEffect, useState } from "react";
import { Link2, Copy, CheckCircle, DollarSign, Users, TrendingUp, Wallet, MousePointer, Trophy } from "lucide-react";
import Link from "next/link";

interface ReferralItem {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  course: { title: string };
}

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  affiliatePercentage: number;
}

interface RankingItem {
  position: number;
  name: string;
  affiliateCode: string;
  totalEarned: number;
  totalSales: number;
  isMe: boolean;
}

interface AffiliateData {
  affiliateCode: string | null;
  walletBalance: number;
  totalReferrals: number;
  totalClicks: number;
  totalEarned: number;
  recentReferrals: ReferralItem[];
  courses: CourseItem[];
  ranking: RankingItem[];
}

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function AfiliadoPage() {
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/affiliate").then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  async function activate() {
    setActivating(true);
    const res = await fetch("/api/affiliate", { method: "POST" });
    const result = await res.json();
    setData(d => d ? { ...d, affiliateCode: result.affiliateCode } : d);
    setActivating(false);
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Carregando...</p>
    </div>
  );

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Programa de Indicação</div>
        <h1 className="ka-page-title">Seja um <span>Afiliado</span></h1>
        <p className="ka-page-subtitle">Indique cursos e ganhe créditos na sua Carteira Kadima para usar em novos cursos.</p>
      </div>

      <div className="ka-section" style={{ padding: "0 44px 44px" }}>

        {!data?.affiliateCode ? (
          <div style={{
            borderRadius: 24, padding: "48px 40px", textAlign: "center",
            background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
            border: "1px solid rgba(201,169,122,0.15)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.40)",
            maxWidth: 520, margin: "0 auto",
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%", margin: "0 auto 24px",
              background: "linear-gradient(135deg, rgba(201,169,122,0.15), rgba(201,169,122,0.05))",
              border: "1px solid rgba(201,169,122,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Link2 size={36} color="var(--gold)" />
            </div>
            <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 20, color: "var(--text-primary)", marginBottom: 12 }}>
              Ative seu Código de Afiliado
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 28, maxWidth: 400, margin: "0 auto 28px" }}>
              Com o seu link exclusivo, você pode indicar cursos para amigos. Cada venda realizada gera créditos na sua <strong style={{ color: "var(--gold)" }}>Carteira Kadima</strong>.
            </p>
            <button
              onClick={activate}
              disabled={activating}
              style={{
                padding: "14px 32px", borderRadius: 14, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #C9A97A, #A07840)",
                color: "#060D1F", fontFamily: "'Cinzel',serif", fontWeight: 700,
                fontSize: 12, letterSpacing: 2, textTransform: "uppercase",
                boxShadow: "0 6px 24px rgba(201,169,122,0.40)",
              }}
            >
              {activating ? "Ativando..." : "Ativar Agora"}
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
              {[
                { icon: <Wallet size={22} />, label: "Saldo na Carteira", value: `R$ ${data.walletBalance.toFixed(2).replace(".", ",")}`, color: "#6ee7b7" },
                { icon: <MousePointer size={22} />, label: "Cliques nos Links", value: String(data.totalClicks), color: "#a78bfa" },
                { icon: <Users size={22} />, label: "Vendas Geradas", value: String(data.totalReferrals), color: "#60a5fa" },
                { icon: <TrendingUp size={22} />, label: "Total Acumulado", value: `R$ ${data.totalEarned.toFixed(2).replace(".", ",")}`, color: "#C9A97A" },
              ].map(stat => (
                <div key={stat.label} style={{
                  borderRadius: 20, padding: "20px 24px",
                  background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
                  border: "1px solid rgba(201,169,122,0.12)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.30)",
                }}>
                  <div style={{ color: stat.color, marginBottom: 10 }}>{stat.icon}</div>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>{stat.label}</p>
                  <p style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 22, color: "var(--text-primary)" }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Link Geral */}
            <div style={{
              borderRadius: 20, padding: "24px 28px", marginBottom: 24,
              background: "linear-gradient(135deg, rgba(201,169,122,0.10) 0%, rgba(201,169,122,0.03) 100%)",
              border: "1px solid rgba(201,169,122,0.25)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.30)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 3, height: 16, background: "var(--gold)", borderRadius: 2 }} />
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)" }}>
                  Link de Indicação Geral
                </span>
              </div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12 }}>
                Envia o visitante para a vitrine de todos os cursos.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(0,0,0,0.25)", borderRadius: 12, padding: "12px 16px" }}>
                <code style={{ flex: 1, fontSize: 12, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {baseUrl}/ref/{data.affiliateCode}
                </code>
                <button
                  onClick={() => copyToClipboard(`${baseUrl}/ref/${data.affiliateCode}`, "general")}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10,
                    background: copiedLink === "general" ? "rgba(110,231,183,0.15)" : "rgba(201,169,122,0.15)",
                    border: `1px solid ${copiedLink === "general" ? "rgba(110,231,183,0.30)" : "rgba(201,169,122,0.30)"}`,
                    color: copiedLink === "general" ? "#6ee7b7" : "var(--gold)",
                    fontSize: 11, fontFamily: "'Cinzel',serif", fontWeight: 700, letterSpacing: 1,
                    cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
                  }}
                >
                  {copiedLink === "general" ? <><CheckCircle size={14} /> Copiado!</> : <><Copy size={14} /> Copiar</>}
                </button>
              </div>
            </div>

            {/* Links por Curso */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 3, height: 16, background: "var(--gold)", borderRadius: 2 }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
                Links por Curso
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
              {data.courses.map(course => {
                const link = `${baseUrl}/ref/${data.affiliateCode}/${course.slug}`;
                const isCopied = copiedLink === course.id;
                return (
                  <div key={course.id} style={{
                    borderRadius: 14, padding: "14px 18px",
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "white", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{course.title}</p>
                      <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>
                        Comissão: <span style={{ color: "#6ee7b7", fontWeight: 700 }}>{course.affiliatePercentage}%</span>
                        {" · "}R$ {course.price?.toFixed(2).replace(".", ",")}
                        {" · "}
                        <span style={{ color: "rgba(201,169,122,0.5)", fontFamily: "monospace", textTransform: "none" }}>
                          /ref/{data.affiliateCode}/{course.slug}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(link, course.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 10, flexShrink: 0,
                        background: isCopied ? "rgba(110,231,183,0.15)" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${isCopied ? "rgba(110,231,183,0.30)" : "rgba(255,255,255,0.12)"}`,
                        color: isCopied ? "#6ee7b7" : "var(--text-secondary)",
                        fontSize: 10, fontFamily: "'Cinzel',serif", fontWeight: 700, letterSpacing: 1,
                        cursor: "pointer", transition: "all 0.2s",
                      }}
                    >
                      {isCopied ? <><CheckCircle size={13} /> Copiado!</> : <><Link2 size={13} /> Copiar Link</>}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Ranking */}
            {data.ranking.length > 0 && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 3, height: 16, background: "var(--gold)", borderRadius: 2 }} />
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
                    Ranking de Afiliados
                  </span>
                  <Trophy size={14} color="var(--gold)" />
                </div>

                <div style={{
                  borderRadius: 20, overflow: "hidden",
                  background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
                  border: "1px solid rgba(201,169,122,0.12)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                  marginBottom: 32,
                }}>
                  {data.ranking.map((r, i) => (
                    <div key={r.affiliateCode} style={{
                      display: "flex", alignItems: "center", gap: 16, padding: "14px 24px",
                      borderBottom: i < data.ranking.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      background: r.isMe ? "rgba(201,169,122,0.06)" : "transparent",
                    }}>
                      <span style={{ fontSize: r.position <= 3 ? 20 : 13, minWidth: 28, textAlign: "center", fontFamily: "'Cinzel',serif", fontWeight: 700, color: "rgba(255,255,255,0.35)" }}>
                        {MEDAL[r.position] ?? `#${r.position}`}
                      </span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: r.isMe ? "var(--gold)" : "white" }}>
                          {r.name} {r.isMe && <span style={{ fontSize: 9, letterSpacing: 2, color: "var(--gold)", fontFamily: "'Cinzel',serif" }}>· VOCÊ</span>}
                        </p>
                        <p style={{ fontSize: 10, color: "var(--text-muted)" }}>{r.totalSales} {r.totalSales === 1 ? "venda" : "vendas"}</p>
                      </div>
                      <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 14, color: "#6ee7b7" }}>
                        R$ {r.totalEarned.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Carteira */}
            <div style={{ marginBottom: 36 }}>
              <Link href="/carteira" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: 12,
                background: "rgba(110,231,183,0.08)", border: "1px solid rgba(110,231,183,0.20)",
                color: "#6ee7b7", fontSize: 11, fontFamily: "'Cinzel',serif", fontWeight: 700,
                letterSpacing: 2, textTransform: "uppercase", textDecoration: "none",
              }}>
                <DollarSign size={16} /> Ver Extrato da Carteira
              </Link>
            </div>

            {/* Indicações Recentes */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 3, height: 16, background: "var(--gold)", borderRadius: 2 }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
                Indicações Recentes
              </span>
            </div>

            <div style={{
              borderRadius: 20, overflow: "hidden",
              background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
              border: "1px solid rgba(201,169,122,0.12)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            }}>
              {data.recentReferrals.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Nenhuma indicação ainda. Comece a compartilhar seus links!</p>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(201,169,122,0.08)" }}>
                      <th style={{ padding: "14px 24px", textAlign: "left", fontFamily: "'Cinzel',serif", fontSize: 9, color: "var(--gold)", letterSpacing: 2 }}>DATA</th>
                      <th style={{ padding: "14px 24px", textAlign: "left", fontFamily: "'Cinzel',serif", fontSize: 9, color: "var(--gold)", letterSpacing: 2 }}>CURSO</th>
                      <th style={{ padding: "14px 24px", textAlign: "center", fontFamily: "'Cinzel',serif", fontSize: 9, color: "var(--gold)", letterSpacing: 2 }}>STATUS</th>
                      <th style={{ padding: "14px 24px", textAlign: "right", fontFamily: "'Cinzel',serif", fontSize: 9, color: "var(--gold)", letterSpacing: 2 }}>COMISSÃO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentReferrals.map((ref, i) => (
                      <tr key={ref.id} style={{ borderBottom: i < data.recentReferrals.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                        <td style={{ padding: "14px 24px", color: "var(--text-muted)" }}>{new Date(ref.createdAt).toLocaleDateString("pt-BR")}</td>
                        <td style={{ padding: "14px 24px", fontWeight: 500, color: "white" }}>{ref.course.title}</td>
                        <td style={{ padding: "14px 24px", textAlign: "center" }}>
                          <span style={{
                            padding: "4px 10px", borderRadius: 20, fontSize: 9, fontWeight: 700, letterSpacing: 1,
                            background: ref.status === "credited" ? "rgba(110,231,183,0.10)" : "rgba(251,191,36,0.10)",
                            color: ref.status === "credited" ? "#6ee7b7" : "#FBBF24",
                            border: `1px solid ${ref.status === "credited" ? "rgba(110,231,183,0.25)" : "rgba(251,191,36,0.25)"}`,
                          }}>
                            {ref.status === "credited" ? "CREDITADO" : "PENDENTE"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 24px", textAlign: "right", fontWeight: 700, color: "#6ee7b7" }}>
                          + R$ {ref.amount.toFixed(2).replace(".", ",")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
