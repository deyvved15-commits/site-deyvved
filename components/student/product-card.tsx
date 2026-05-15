"use client";

import Link from "next/link";
import { Download, FileText, Music, Video, Box } from "lucide-react";
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

function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case "EBOOK": return <FileText size={20} />;
    case "AUDIO": return <Music size={20} />;
    case "VIDEO": return <Video size={20} />;
    default: return <Box size={20} />;
  }
}

export default function ProductCard({ product, isPurchased }: ProductCardProps) {
  const thumbUrl = product.thumbnail?.includes("drive.google.com")
    ? getGoogleDriveImageUrl(product.thumbnail)
    : product.thumbnail;

  return (
    <article className="ka-card">
      {/* Thumbnail */}
      <div className="ka-thumb">
        {thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbUrl} alt={product.title} className="ka-thumb-img" />
        ) : (
          <div style={{ color: "var(--gold-35)" }}>
            <TypeIcon type={product.type} />
          </div>
        )}

        {/* Type badge */}
        <div style={{
          position: "absolute", top: 10, left: 10,
          padding: "3px 10px", borderRadius: "var(--radius-sm)",
          background: "rgba(0,0,0,0.60)", backdropFilter: "blur(4px)",
          border: "1px solid rgba(201,169,122,0.30)",
          fontSize: 10, fontWeight: 700, color: "var(--gold-light)",
          display: "flex", alignItems: "center", gap: 5, textTransform: "uppercase",
          letterSpacing: 1,
        }}>
          <TypeIcon type={product.type} />
          {product.type === "EBOOK" ? "E-Book" : product.type === "AUDIO" ? "Áudio" : product.type === "VIDEO" ? "Vídeo" : "Arquivo"}
        </div>

        {/* Purchased badge */}
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
          {product.description || "Sem descrição disponível."}
        </p>

        {isPurchased ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--green)", fontSize: 11, fontWeight: 600, marginBottom: 10 }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 4px var(--green)", flexShrink: 0 }} />
              JÁ ADQUIRIDO
            </div>
            <a
              href={product.fileUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="ka-continue-btn"
              style={{
                background: "linear-gradient(135deg, var(--green-bg), rgba(16,185,129,0.05))",
                borderColor: "var(--green-border)",
                color: "var(--green-light)",
              }}
            >
              <Download size={14} />
              Download
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, display: "block" }}>Valor</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "var(--gold-bright)", fontFamily: "var(--font-cinzel)" }}>
                R$ {product.price.toFixed(2).replace(".", ",")}
              </span>
            </div>
            <Link href={`/checkout/product/${product.id}`} className="ka-btn-gold" style={{ padding: "8px 18px" }}>
              Comprar
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
