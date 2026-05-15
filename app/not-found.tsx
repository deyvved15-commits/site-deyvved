import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(140deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)",
      fontFamily: "var(--font-poppins)", padding: "24px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Bokeh */}
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "rgba(201,169,122,0.06)", filter: "blur(80px)", top: "10%", left: "20%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "rgba(80,110,200,0.08)", filter: "blur(60px)", bottom: "10%", right: "15%", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 480 }}>
        <div style={{ fontFamily: "var(--font-cinzel)", fontSize: "clamp(80px, 20vw, 120px)", fontWeight: 900, color: "rgba(201,169,122,0.15)", lineHeight: 1, marginBottom: 8 }}>
          404
        </div>
        <div style={{ width: 60, height: 2, background: "linear-gradient(90deg, transparent, var(--gold), transparent)", margin: "0 auto 24px" }} />
        <h1 style={{ fontFamily: "var(--font-cinzel)", fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 700, letterSpacing: 2, color: "#fff", marginBottom: 12 }}>
          Página não encontrada
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, marginBottom: 36 }}>
          A página que você está procurando não existe ou foi movida.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/dashboard" style={{
            padding: "12px 28px", borderRadius: 12, textDecoration: "none",
            background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
            color: "var(--navy-darkest)", fontFamily: "var(--font-cinzel)",
            fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
            boxShadow: "0 4px 16px rgba(201,169,122,0.30)",
          }}>
            Ir para o Dashboard
          </Link>
          <Link href="/login" style={{
            padding: "12px 28px", borderRadius: 12, textDecoration: "none",
            border: "1px solid rgba(201,169,122,0.25)", color: "var(--gold)",
            fontFamily: "var(--font-cinzel)", fontWeight: 600, fontSize: 11,
            letterSpacing: 2, textTransform: "uppercase",
          }}>
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
  );
}
