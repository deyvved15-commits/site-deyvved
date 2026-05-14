"use client";

import Link from "next/link";
import { ShoppingBag, Download, FileText, Music, Video, Box } from "lucide-react";
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

export default function ProductCard({ product, isPurchased }: ProductCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "EBOOK": return <FileText size={20} />;
      case "AUDIO": return <Music size={20} />;
      case "VIDEO": return <Video size={20} />;
      default: return <Box size={20} />;
    }
  };

  return (
    <div className="ka-card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="ka-thumb" style={{ height: 180, position: "relative" }}>
        {product.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={product.thumbnail.includes("drive.google.com") ? getGoogleDriveImageUrl(product.thumbnail) : product.thumbnail} 
            alt={product.title} 
            className="ka-thumb-img" 
          />
        ) : (
          <div style={{ color: "var(--gold-35)" }}>
            {getTypeIcon(product.type)}
          </div>
        )}
        
        <div style={{
          position: "absolute", top: 12, left: 12,
          padding: "4px 10px", borderRadius: 8,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          border: "1px solid rgba(201,169,122,0.3)",
          fontSize: 10, fontWeight: 700, color: "var(--gold-light)",
          display: "flex", alignItems: "center", gap: 6, textTransform: "uppercase"
        }}>
          {getTypeIcon(product.type)}
          {product.type}
        </div>
      </div>

      <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 16, fontWeight: 700, color: "white", marginBottom: 8, lineHeight: 1.3 }}>
          {product.title}
        </h3>
        
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20, flex: 1, lineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {product.description || "Sem descrição disponível."}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
          {!isPurchased ? (
            <>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Valor</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: "var(--gold-bright)" }}>
                  R$ {product.price.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <Link href={`/checkout/product/${product.id}`} className="ka-btn-gold" style={{ padding: "8px 16px", borderRadius: 10 }}>
                Comprar
              </Link>
            </>
          ) : (
            <div style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#10B981", fontSize: 11, fontWeight: 600, marginBottom: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
                JÁ ADQUIRIDO
              </div>
              <a 
                href={product.fileUrl || "#"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="ka-continue-btn"
                style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))", borderColor: "rgba(16, 185, 129, 0.3)", color: "#A7F3D0" }}
              >
                <Download size={14} />
                Download
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
