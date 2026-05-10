import Link from "next/link";

export default function CheckoutPendente() {
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
        border: "1px solid rgba(251,191,36,0.25)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.50)",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", margin: "0 auto 24px",
          background: "rgba(251,191,36,0.10)", border: "1px solid rgba(251,191,36,0.30)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 22, letterSpacing: 2, color: "#fbbf24", marginBottom: 12 }}>
          Pagamento Pendente
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
          Seu pagamento está sendo processado. Assim que confirmado, seu acesso será liberado automaticamente.
        </p>

        <Link href="/dashboard" style={{
          display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
          padding: "12px 28px", borderRadius: 12,
          background: "rgba(201,169,122,0.12)", border: "1px solid var(--gold-35)",
          color: "var(--gold-light)", fontFamily: "'Cinzel',serif",
          fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
        }}>
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
