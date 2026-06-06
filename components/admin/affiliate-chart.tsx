"use client";

import { useState, useEffect, useCallback } from "react";

interface Serie  { date: string; clicks: number; sales: number; revenue: number }
interface TopAff { id: string; name: string; affiliateCode: string; clicks: number; sales: number; revenue: number }
interface Report {
  series: Serie[];
  topAffiliates: TopAff[];
  totalClicks: number;
  totalSales: number;
  totalRevenue: number;
  convRate: string;
}

const PERIODS = [
  { label: "7 dias",   days: 7 },
  { label: "30 dias",  days: 30 },
  { label: "90 dias",  days: 90 },
];

function fmt(v: number) {
  return "R$ " + v.toFixed(2).replace(".", ",");
}

function fmtDateShort(iso: string, days: number) {
  const d = new Date(iso + "T12:00:00");
  if (days <= 7)  return d.toLocaleDateString("pt-BR", { weekday: "short" });
  if (days <= 30) return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

// ── SVG Bar Chart ──────────────────────────────────────────────────────────
function BarChart({ series, days }: { series: Serie[]; days: number }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; d: Serie } | null>(null);

  const W = 800, H = 220;
  const padL = 36, padR = 8, padT = 12, padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  // Agrupa por semana se 90 dias
  const grouped: Serie[] = (() => {
    if (days <= 30) return series;
    const weeks: Serie[] = [];
    for (let i = 0; i < series.length; i += 7) {
      const slice = series.slice(i, i + 7);
      weeks.push({
        date: slice[0].date,
        clicks:  slice.reduce((s, d) => s + d.clicks,  0),
        sales:   slice.reduce((s, d) => s + d.sales,   0),
        revenue: slice.reduce((s, d) => s + d.revenue, 0),
      });
    }
    return weeks;
  })();

  const maxVal = Math.max(...grouped.map(d => Math.max(d.clicks, d.sales)), 1);
  const yTicks = 4;
  const barGroupW = chartW / grouped.length;
  const barW = Math.min(Math.max(barGroupW * 0.3, 4), 18);
  const gap  = Math.min(barW * 0.4, 4);

  const yScale = (v: number) => chartH - (v / maxVal) * chartH;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", display: "block" }}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Y grid lines + labels */}
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const v = Math.round((maxVal / yTicks) * (yTicks - i));
          const y = padT + (i / yTicks) * chartH;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y}
                stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
              <text x={padL - 6} y={y + 4} textAnchor="end"
                fill="rgba(255,255,255,0.25)" fontSize="9">{v}</text>
            </g>
          );
        })}

        {/* Bars */}
        {grouped.map((d, i) => {
          const cx = padL + i * barGroupW + barGroupW / 2;
          const xClicks = cx - gap / 2 - barW;
          const xSales  = cx + gap / 2;
          const hClicks = (d.clicks / maxVal) * chartH;
          const hSales  = (d.sales  / maxVal) * chartH;
          const yClicks = padT + yScale(d.clicks);
          const ySales  = padT + yScale(d.sales);

          return (
            <g key={d.date}>
              {/* Click bar */}
              {d.clicks > 0 && (
                <rect
                  x={xClicks} y={yClicks} width={barW} height={hClicks}
                  rx="3"
                  fill="url(#goldGrad)"
                  opacity="0.85"
                />
              )}
              {d.clicks === 0 && (
                <rect x={xClicks} y={padT + chartH - 2} width={barW} height={2} rx="1" fill="rgba(201,169,122,0.15)" />
              )}

              {/* Sales bar */}
              {d.sales > 0 && (
                <rect
                  x={xSales} y={ySales} width={barW} height={hSales}
                  rx="3"
                  fill="url(#greenGrad)"
                  opacity="0.90"
                />
              )}
              {d.sales === 0 && (
                <rect x={xSales} y={padT + chartH - 2} width={barW} height={2} rx="1" fill="rgba(110,231,183,0.15)" />
              )}

              {/* Hover target */}
              <rect
                x={cx - barGroupW / 2 + 2} y={padT}
                width={barGroupW - 4} height={chartH}
                fill="transparent"
                style={{ cursor: "default" }}
                onMouseEnter={e => {
                  const rect = (e.target as SVGRectElement).closest("svg")!.getBoundingClientRect();
                  setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, d });
                }}
              />

              {/* X label */}
              <text
                x={cx} y={H - padB + 14}
                textAnchor="middle"
                fill="rgba(255,255,255,0.30)"
                fontSize={days <= 7 ? "10" : "9"}
              >
                {fmtDateShort(d.date, days)}
              </text>
            </g>
          );
        })}

        {/* Axis */}
        <line x1={padL} y1={padT} x2={padL} y2={padT + chartH}
          stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <line x1={padL} y1={padT + chartH} x2={W - padR} y2={padT + chartH}
          stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

        {/* Gradients */}
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8D5A8" />
            <stop offset="100%" stopColor="#C9A97A" />
          </linearGradient>
          <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>
        </defs>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: "absolute",
          left: Math.min(tooltip.x + 12, 680),
          top: tooltip.y - 10,
          pointerEvents: "none",
          zIndex: 10,
          background: "linear-gradient(160deg, #0F1A3D, #0A122D)",
          border: "1px solid rgba(201,169,122,0.25)",
          borderRadius: 10, padding: "10px 14px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.50)",
          minWidth: 140,
        }}>
          <p style={{ fontSize: 10, color: "var(--gold)", fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>
            {new Date(tooltip.d.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <span style={{ fontSize: 11, color: "#C9A97A" }}>Cliques</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#E8D5A8" }}>{tooltip.d.clicks}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <span style={{ fontSize: 11, color: "#6ee7b7" }}>Vendas</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#a7f3d0" }}>{tooltip.d.sales}</span>
            </div>
            {tooltip.d.revenue > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 2 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Comissão</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.60)" }}>{fmt(tooltip.d.revenue)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AffiliateChart({ affiliates }: { affiliates: { id: string; name: string; affiliateCode: string | null }[] }) {
  const [days,        setDays]        = useState(30);
  const [affiliateId, setAffiliateId] = useState("");
  const [data,        setData]        = useState<Report | null>(null);
  const [loading,     setLoading]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ days: String(days) });
      if (affiliateId) params.set("affiliateId", affiliateId);
      const res = await fetch(`/api/admin/affiliate-report?${params}`);
      const json = await res.json();
      setData(json);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [days, affiliateId]);

  useEffect(() => { load(); }, [load]);

  const selectStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(201,169,122,0.18)",
    borderRadius: 10, padding: "8px 36px 8px 14px",
    color: "var(--text-primary)", fontSize: 12,
    fontFamily: "var(--font-poppins)", outline: "none",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C9A97A' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    colorScheme: "dark",
    cursor: "pointer",
  };

  return (
    <div>
      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {PERIODS.map(p => (
            <button key={p.days} onClick={() => setDays(p.days)} style={{
              padding: "7px 16px", borderRadius: 8, fontSize: 11, cursor: "pointer",
              fontFamily: "var(--font-cinzel)", fontWeight: 600, letterSpacing: 1.2,
              textTransform: "uppercase", border: "1px solid",
              background: days === p.days
                ? "linear-gradient(135deg, rgba(201,169,122,0.22), rgba(201,169,122,0.08))"
                : "rgba(255,255,255,0.03)",
              color: days === p.days ? "var(--gold-light)" : "rgba(255,255,255,0.35)",
              borderColor: days === p.days ? "rgba(201,169,122,0.40)" : "rgba(255,255,255,0.08)",
              transition: "all 0.2s",
            }}>
              {p.label}
            </button>
          ))}
        </div>

        <select value={affiliateId} onChange={e => setAffiliateId(e.target.value)} style={selectStyle}>
          <option value="">Todos os afiliados</option>
          {affiliates.map(a => (
            <option key={a.id} value={a.id}>{a.name} ({a.affiliateCode})</option>
          ))}
        </select>

        {loading && (
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.30)" }}>Carregando…</span>
        )}
      </div>

      {/* KPIs */}
      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Cliques",      value: String(data.totalClicks),              color: "#C9A97A" },
            { label: "Vendas",       value: String(data.totalSales),               color: "#6ee7b7" },
            { label: "Conversão",    value: `${data.convRate}%`,                   color: "#a78bfa" },
            { label: "Comissões",    value: fmt(data.totalRevenue),                color: "#60a5fa" },
          ].map(k => (
            <div key={k.label} style={{
              borderRadius: 12, padding: "14px 18px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <p style={{ fontSize: 9, fontFamily: "var(--font-cinzel)", letterSpacing: 2, textTransform: "uppercase", color: k.color, marginBottom: 6 }}>{k.label}</p>
              <p style={{ fontFamily: "var(--font-cinzel)", fontWeight: 700, fontSize: 20, color: "var(--text-primary)", margin: 0 }}>{k.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Gráfico */}
      {data && data.series.length > 0 && (
        <div style={{
          borderRadius: 14, padding: "20px 16px 8px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          marginBottom: 24,
        }}>
          {/* Legenda */}
          <div style={{ display: "flex", gap: 20, marginBottom: 16, paddingLeft: 8 }}>
            {[
              { color: "#C9A97A", label: "Cliques" },
              { color: "#6ee7b7", label: "Vendas" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, display: "block" }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{l.label}</span>
              </div>
            ))}
          </div>
          <BarChart series={data.series} days={days} />
        </div>
      )}

      {/* Top afiliados no período */}
      {data && data.topAffiliates.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 3, height: 14, background: "var(--gold)", borderRadius: 2 }} />
            <span style={{ fontFamily: "var(--font-cinzel)", fontSize: 10, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
              Top Afiliados no Período
            </span>
          </div>

          <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(201,169,122,0.10)" }}>
            <div style={{ display: "flex", padding: "10px 20px", background: "rgba(201,169,122,0.04)", borderBottom: "1px solid rgba(201,169,122,0.08)", gap: 12 }}>
              {["Afiliado", "Código", "Cliques", "Vendas", "Conv.", "Comissão"].map(h => (
                <span key={h} style={{ flex: h === "Afiliado" ? 2 : 1, fontSize: 9, fontFamily: "var(--font-cinzel)", letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)" }}>{h}</span>
              ))}
            </div>
            {data.topAffiliates.map((a, i) => {
              const conv = a.clicks > 0 ? ((a.sales / a.clicks) * 100).toFixed(1) : "0.0";
              return (
                <div key={a.id} style={{
                  display: "flex", padding: "13px 20px", gap: 12, alignItems: "center",
                  borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
                }}>
                  <span style={{ flex: 2, fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{a.name}</span>
                  <span style={{ flex: 1 }}>
                    <code style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "rgba(201,169,122,0.08)", border: "1px solid rgba(201,169,122,0.18)", color: "var(--gold-light)" }}>
                      {a.affiliateCode}
                    </code>
                  </span>
                  <span style={{ flex: 1, fontSize: 13, color: "#C9A97A", fontWeight: 600 }}>{a.clicks}</span>
                  <span style={{ flex: 1, fontSize: 13, color: "#6ee7b7", fontWeight: 600 }}>{a.sales}</span>
                  <span style={{ flex: 1, fontSize: 12, color: "#a78bfa" }}>{conv}%</span>
                  <span style={{ flex: 1, fontSize: 12, fontFamily: "var(--font-cinzel)", fontWeight: 700, color: "#60a5fa" }}>{fmt(a.revenue)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data && data.totalClicks === 0 && data.totalSales === 0 && !loading && (
        <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "24px 0" }}>
          Nenhum dado de cliques ou vendas no período selecionado.
        </p>
      )}
    </div>
  );
}
