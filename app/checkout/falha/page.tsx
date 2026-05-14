import Link from "next/link";

export default function CheckoutFalha({ searchParams }: { searchParams: Promise<{ courseId?: string }> }) {
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
        border: "1px solid rgba(230,57,70,0.25)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.50)",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", margin: "0 auto 24px",
          background: "rgba(230,57,70,0.10)", border: "1px solid rgba(230,57,70,0.30)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF8088" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>

        <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 22, letterSpacing: 2, color: "#FF8088", marginBottom: 12 }}>
          Pagamento Não Aprovado
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
          Não foi possível processar seu pagamento. Verifique os dados do cartão e tente novamente.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/dashboard" style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none",
            padding: "12px 28px", borderRadius: 12,
            background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
            color: "var(--navy-darkest)", fontFamily: "'Cinzel',serif",
            fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
            boxShadow: "0 4px 16px rgba(201,169,122,0.35)",
          }}>
            Tentar Novamente
          </Link>
          <Link href="/dashboard" style={{
            fontSize: 12, color: "var(--text-muted)", textDecoration: "none",
            fontFamily: "'Poppins',sans-serif",
          }}>
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
