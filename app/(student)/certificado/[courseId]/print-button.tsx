"use client";
import { Printer } from "lucide-react";

export default function PrintButton({ color }: { color: string }) {
  return (
    <button
      onClick={() => window.print()}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 20px", background: color, color: "#060D1F",
        border: "none", borderRadius: 10,
        fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 12,
        cursor: "pointer", boxShadow: `0 4px 14px ${color}66`,
      }}
    >
      <Printer size={16} /> Imprimir / PDF
    </button>
  );
}
