"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, FileText, Music, Video, Box, Printer, X } from "lucide-react";
import { getGoogleDriveImageUrl } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  type: string;
  thumbnail: string | null;
  fileUrl: string | null;
}

interface ProductCardProps {
  product: Product;
  isPurchased: boolean;
}

function TypeIcon({ type, size = 16 }: { type: string; size?: number }) {
  switch (type) {
    case "EBOOK":   return <FileText size={size} />;
    case "AUDIO":   return <Music size={size} />;
    case "VIDEO":   return <Video size={size} />;
    case "PRINTED": return <Printer size={size} />;
    default:        return <Box size={size} />;
  }
}

function typeLabel(type: string) {
  switch (type) {
    case "EBOOK":   return "E-Book";
    case "AUDIO":   return "Áudio";
    case "VIDEO":   return "Vídeo";
    case "PRINTED": return "Material Impresso";
    default:        return "Arquivo";
  }
}

export default function ProductCard({ product, isPurchased }: ProductCardProps) {
  const [open, setOpen] = useState(false);

  const thumbUrl = product.thumbnail?.includes("drive.google.com")
    ? getGoogleDriveImageUrl(product.thumbnail)
    : product.thumbnail;

  return (
    <>
      {/* ── Card ── */}
      <article
        className="ka-card"
        onClick={() => setOpen(true)}
        style={{ cursor: "pointer" }}
      >
        {/* Thumbnail */}
        <div className="ka-thumb">
          {thumbUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbUrl} alt={product.title} className="ka-thumb-img" />
          ) : (
            <div style={{ color: "var(--gold-35)" }}>
              <TypeIcon type={product.type} size={32} />
            </div>
          )}

          <div style={{
            position: "absolute", top: 10, left: 10,
            padding: "3px 10px", borderRadius: "var(--radius-sm)",
            background: "rgba(0,0,0,0.60)", backdropFilter: "blur(4px)",
            border: "1px solid rgba(201,169,122,0.30)",
            fontSize: 10, fontWeight: 700, color: "var(--gold-light)",
            display: "flex", alignItems: "center", gap: 5, textTransform: "uppercase",
            letterSpacing: 1,
          }}>
            <TypeIcon type={product.type} size={12} />
            {typeLabel(product.type)}
          </div>

          {isPurchased && (
            <div className="ka-progress-badge" style={{ background: "var(--green)", boxShadow: "0 0 10px rgba(16,185,129,0.5)" }}>
              ✓
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
          <h3 style={{
            fontFamily: "var(--font-cinzel)", fontWeight: 600, fontSize: 16,
            letterSpacing: 1.5, color: "var(--text-primary)", marginBottom: 6, lineHeight: 1.3,
          }}>
            {product.title}
          </h3>

          <p style={{
            fontSize: 12, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.6,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            flex: 1,
          }}>
            {product.description || "Clique para ver os detalhes."}
          </p>

          {isPurchased ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--green)", fontSize: 11, fontWeight: 600 }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 4px var(--green)", flexShrink: 0 }} />
              JÁ ADQUIRIDO
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, display: "block" }}>Valor</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: "var(--gold-bright)", fontFamily: "var(--font-cinzel)" }}>
                  R$ {product.price.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <span className="ka-btn-gold" style={{ padding: "8px 18px", pointerEvents: "none" }}>
                Ver mais
              </span>
            </div>
          )}
        </div>
      </article>

      {/* ── Modal ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px 16px",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 520, borderRadius: 24,
              background: "linear-gradient(160deg, #0F1A3D 0%, #080E22 100%)",
              border: "1px solid rgba(201,169,122,0.20)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.70)",
              overflow: "hidden", position: "relative",
              maxHeight: "90vh", display: "flex", flexDirection: "column",
            }}
          >
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              style={{
                position: "absolute", top: 14, right: 14, zIndex: 10,
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(0,0,0,0.50)", border: "1px solid rgba(255,255,255,0.10)",
                color: "rgba(255,255,255,0.60)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              <X size={16} />
            </button>

            {/* Thumbnail */}
            <div style={{ height: 220, background: "#060D1F", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {thumbUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbUrl} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <div style={{ color: "rgba(201,169,122,0.20)" }}>
                  <TypeIcon type={product.type} size={64} />
                </div>
              )}
            </div>

            {/* Body */}
            <div style={{ padding: "28px 28px 32px", overflowY: "auto", flex: 1 }}>

              {/* Type badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14, padding: "4px 12px", borderRadius: 999, background: "rgba(201,169,122,0.08)", border: "1px solid rgba(201,169,122,0.20)" }}>
                <TypeIcon type={product.type} size={12} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--gold)", letterSpacing: 2, textTransform: "uppercase" }}>
                  {typeLabel(product.type)}
                </span>
              </div>

              <h2 style={{
                fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 22,
                letterSpacing: 2, color: "#fff", marginBottom: 14, lineHeight: 1.3,
              }}>
                {product.title}
              </h2>

              {product.description && (
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.60)", lineHeight: 1.8, marginBottom: 24 }}>
                  {product.description}
                </p>
              )}

              <div style={{ height: 1, background: "rgba(201,169,122,0.10)", marginBottom: 24 }} />

              {isPurchased ? (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6ee7b7", fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6ee7b7", boxShadow: "0 0 6px #6ee7b7" }} />
                    PRODUTO JÁ ADQUIRIDO
                  </div>
                  <a
                    href={product.fileUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                      width: "100%", padding: "14px 24px", borderRadius: 14,
                      background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))",
                      border: "1px solid rgba(16,185,129,0.30)", color: "#6ee7b7",
                      fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 12,
                      letterSpacing: 2, textTransform: "uppercase", textDecoration: "none",
                    }}
                  >
                    <Download size={16} />
                    Fazer Download
                  </a>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                  <div>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 2, display: "block", marginBottom: 4 }}>Valor</span>
                    <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 28, color: "#E8D5A8" }}>
                      R$ {product.price.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <Link
                    href={`/checkout/product/${product.id}`}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "14px 28px", borderRadius: 14,
                      background: "linear-gradient(135deg, #C9A97A, #A07840)",
                      color: "#060D1F", fontFamily: "'Cinzel',serif",
                      fontWeight: 700, fontSize: 12, letterSpacing: 2,
                      textTransform: "uppercase", textDecoration: "none",
                      boxShadow: "0 6px 24px rgba(201,169,122,0.35)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Comprar Agora
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
