"use client";

import { useState } from "react";
import { Package, Truck, CheckCircle, Clock, Search, ExternalLink, Tag, Printer } from "lucide-react";

type Order = {
  id: string;
  createdAt: string;
  amount: number;
  shippingName: string | null;
  shippingCep: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingService: string | null;
  shippingPrice: number | null;
  shippingDays: number | null;
  shippingStatus: string | null;
  trackingCode: string | null;
  user: { name: string | null; email: string };
  product: {
    title: string;
    weightG: number | null;
    heightCm: number | null;
    widthCm: number | null;
    lengthCm: number | null;
  };
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: "Aguardando",  color: "#F59E0B", icon: <Clock size={14} /> },
  shipped:   { label: "Enviado",     color: "#3B82F6", icon: <Truck size={14} /> },
  delivered: { label: "Entregue",    color: "#10B981", icon: <CheckCircle size={14} /> },
};

export default function EntregasClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders]     = useState(initialOrders);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [trackModal, setTrackModal] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState("");

  const filtered = orders.filter(o => {
    const matchSearch = (o.user.name ?? o.user.email).toLowerCase().includes(search.toLowerCase())
      || o.product.title.toLowerCase().includes(search.toLowerCase())
      || (o.trackingCode ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || o.shippingStatus === filter;
    return matchSearch && matchFilter;
  });

  async function generateLabel(order: Order) {
    setLoadingId(order.id);
    try {
      const res = await fetch("/api/admin/shipping/label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (data.labelUrl) {
        window.open(data.labelUrl, "_blank");
      } else {
        alert(data.error || "Erro ao gerar etiqueta.");
      }
    } catch {
      alert("Falha ao conectar com Melhor Envio.");
    } finally {
      setLoadingId(null);
    }
  }

  async function saveTracking() {
    if (!trackModal) return;
    try {
      const res = await fetch(`/api/admin/shipping/${trackModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingCode: trackingInput, shippingStatus: "shipped" }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o =>
          o.id === trackModal.id
            ? { ...o, trackingCode: trackingInput, shippingStatus: "shipped" }
            : o
        ));
        setTrackModal(null);
      }
    } catch {
      alert("Erro ao salvar rastreio.");
    }
  }

  async function updateStatus(orderId: string, status: string) {
    try {
      await fetch(`/api/admin/shipping/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingStatus: status }),
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, shippingStatus: status } : o));
    } catch {}
  }

  const counts = {
    all:       orders.length,
    pending:   orders.filter(o => o.shippingStatus === "pending").length,
    shipped:   orders.filter(o => o.shippingStatus === "shipped").length,
    delivered: orders.filter(o => o.shippingStatus === "delivered").length,
  };

  return (
    <div className="ka-admin-container">
      {/* Barra de Ações */}
      <div className="ka-admin-actions">
        <div className="ka-search-container">
          <Search className="ka-search-icon" size={18} />
          <input
            type="text"
            placeholder="Buscar por aluno, produto ou rastreio..."
            className="ka-search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {(["all", "pending", "shipped", "delivered"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "1px solid",
                borderColor: filter === s ? "var(--gold)" : "rgba(255,255,255,0.1)",
                background: filter === s ? "rgba(201,169,122,0.15)" : "transparent",
                color: filter === s ? "var(--gold)" : "var(--text-muted)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {s === "all" ? "Todos" : STATUS_CONFIG[s].label}
              <span style={{
                background: filter === s ? "var(--gold)" : "rgba(255,255,255,0.1)",
                color: filter === s ? "#000" : "var(--text-muted)",
                borderRadius: 20,
                padding: "1px 7px",
                fontSize: 11,
              }}>
                {counts[s]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div style={{ background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Aluno / Produto", "Endereço", "Serviço", "Rastreio", "Status", "Ações"].map(h => (
                <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
                  <Package size={32} style={{ marginBottom: 12, opacity: 0.4, display: "block", margin: "0 auto 12px" }} />
                  Nenhum pedido de entrega encontrado.
                </td>
              </tr>
            )}
            {filtered.map(order => {
              const cfg = STATUS_CONFIG[order.shippingStatus ?? "pending"];
              return (
                <tr key={order.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  {/* Aluno / Produto */}
                  <td style={{ padding: "16px 20px" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                      {order.user.name ?? order.user.email}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{order.product.title}</p>
                    <p style={{ fontSize: 11, color: "var(--gold-20)", marginTop: 2 }}>
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </td>

                  {/* Endereço */}
                  <td style={{ padding: "16px 20px" }}>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{order.shippingName}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{order.shippingAddress}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {order.shippingCity} — {order.shippingState} · {order.shippingCep}
                    </p>
                  </td>

                  {/* Serviço */}
                  <td style={{ padding: "16px 20px" }}>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>{order.shippingService}</p>
                    <p style={{ fontSize: 12, color: "var(--gold)", marginTop: 2 }}>
                      R$ {order.shippingPrice?.toFixed(2).replace(".", ",")}
                    </p>
                    {order.shippingDays && (
                      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{order.shippingDays} dias úteis</p>
                    )}
                  </td>

                  {/* Rastreio */}
                  <td style={{ padding: "16px 20px" }}>
                    {order.trackingCode ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)" }}>
                          {order.trackingCode}
                        </span>
                        <a
                          href={`https://rastreamento.correios.com.br/app/index.php?objeto=${order.trackingCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--gold)", display: "flex" }}
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setTrackModal(order); setTrackingInput(""); }}
                        style={{ fontSize: 12, color: "var(--gold)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                      >
                        <Tag size={12} /> Informar rastreio
                      </button>
                    )}
                  </td>

                  {/* Status */}
                  <td style={{ padding: "16px 20px" }}>
                    <select
                      value={order.shippingStatus ?? "pending"}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      style={{
                        background: "rgba(0,0,0,0.3)",
                        border: `1px solid ${cfg.color}40`,
                        borderRadius: 8,
                        color: cfg.color,
                        padding: "6px 10px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <option value="pending">Aguardando</option>
                      <option value="shipped">Enviado</option>
                      <option value="delivered">Entregue</option>
                    </select>
                  </td>

                  {/* Ações */}
                  <td style={{ padding: "16px 20px" }}>
                    <button
                      onClick={() => generateLabel(order)}
                      disabled={loadingId === order.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 14px",
                        borderRadius: 8,
                        background: loadingId === order.id ? "rgba(201,169,122,0.1)" : "rgba(201,169,122,0.15)",
                        border: "1px solid var(--gold-30)",
                        color: "var(--gold)",
                        cursor: loadingId === order.id ? "wait" : "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Printer size={13} />
                      {loadingId === order.id ? "Gerando..." : "Etiqueta"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal rastreio */}
      {trackModal && (
        <div className="ka-modal-overlay">
          <div className="ka-modal-content" style={{ maxWidth: 420 }}>
            <div className="ka-modal-header">
              <h2 className="ka-page-title" style={{ fontSize: 16 }}>
                Informar <span>Código de Rastreio</span>
              </h2>
              <button onClick={() => setTrackModal(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>✕</button>
            </div>
            <div className="ka-modal-body">
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
                Pedido de <strong style={{ color: "var(--text-secondary)" }}>{trackModal.user.name ?? trackModal.user.email}</strong>
                {" "}— {trackModal.product.title}
              </p>
              <div className="ka-form-group">
                <label className="ka-label">Código de rastreio</label>
                <input
                  type="text"
                  className="ka-input"
                  placeholder="ex: AA123456789BR"
                  value={trackingInput}
                  onChange={e => setTrackingInput(e.target.value.toUpperCase())}
                  autoFocus
                />
              </div>
              <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 16 }}>
                <button onClick={() => setTrackModal(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  CANCELAR
                </button>
                <button onClick={saveTracking} className="ka-btn-gold" disabled={!trackingInput.trim()}>
                  SALVAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
