import Link from "next/link";

export default function CheckoutSucesso() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)",
      padding: "24px 16px",
    }}>
      <div style={{
        width: "100%", maxWidth: 420, textAlign: "center",
        borderRadius: 24, padding: "48px 36px",
        background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
        border: "1px solid rgba(52,211,153,0.25)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.50), 0 0 0 1px rgba(52,211,153,0.08)",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", margin: "0 auto 24px",
          background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.30)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 32px rgba(52,211,153,0.20)",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 22, letterSpacing: 2, color: "#6ee7b7", marginBottom: 12 }}>
          Pagamento Aprovado!
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
          Sua matrícula foi confirmada. Você já pode acessar o curso completo.
        </p>

        <Link href="/cursos" style={{
          display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
          padding: "12px 28px", borderRadius: 12,
          background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
          color: "var(--navy-darkest)", fontFamily: "'Cinzel',serif",
          fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
          boxShadow: "0 4px 16px rgba(201,169,122,0.35)",
        }}>
          Ir para Meus Cursos →
        </Link>
      </div>
    </div>
  );
}
