"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(140deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)",
      fontFamily: "var(--font-poppins)", padding: "24px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "rgba(230,57,70,0.05)", filter: "blur(80px)", top: "10%", left: "20%", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 480 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
        <div style={{ width: 60, height: 2, background: "linear-gradient(90deg, transparent, var(--gold), transparent)", margin: "0 auto 24px" }} />
        <h1 style={{ fontFamily: "var(--font-cinzel)", fontSize: "clamp(18px, 4vw, 26px)", fontWeight: 700, letterSpacing: 2, color: "#fff", marginBottom: 12 }}>
          Algo deu errado
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, marginBottom: 36 }}>
          Ocorreu um erro inesperado. Tente novamente ou volte ao início.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{
              padding: "12px 28px", borderRadius: 12, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
              color: "var(--navy-darkest)", fontFamily: "var(--font-cinzel)",
              fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
              boxShadow: "0 4px 16px rgba(201,169,122,0.30)",
            }}
          >
            Tentar Novamente
          </button>
          <Link href="/dashboard" style={{
            padding: "12px 28px", borderRadius: 12, textDecoration: "none",
            border: "1px solid rgba(201,169,122,0.25)", color: "var(--gold)",
            fontFamily: "var(--font-cinzel)", fontWeight: 600, fontSize: 11,
            letterSpacing: 2, textTransform: "uppercase",
            display: "inline-flex", alignItems: "center",
          }}>
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}
