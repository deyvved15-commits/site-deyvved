import Image from "next/image";

interface HeroSectionProps {
  userName: string;
  streak?: number;
}

export default function HeroSection({ userName, streak = 0 }: HeroSectionProps) {
  const firstName = userName.split(" ")[0] ?? "Aluno";

  return (
    <section className="ka-hero">
      {/* Bokeh effects */}
      <div className="ka-bokeh" style={{ top: -30, left: "10%", width: 180, height: 180, background: "rgba(201,169,122,0.25)" }} />
      <div className="ka-bokeh" style={{ bottom: -50, right: "15%", width: 220, height: 220, background: "rgba(80,110,200,0.18)" }} />
      <div className="ka-bokeh" style={{ top: "40%", left: "60%", width: 140, height: 140, background: "rgba(232,213,168,0.15)" }} />

      <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "44px 20px 0" }}>
        <div className="ka-hero-logo">
          <Image
            src="/logo-nova.png"
            alt="Kadima Academy"
            width={68}
            height={68}
            style={{ borderRadius: "50%", objectFit: "contain", position: "relative", zIndex: 1 }}
          />
        </div>
        <h1 style={{
          fontFamily: "var(--font-cinzel)",
          fontWeight: 700,
          fontSize: 36,
          letterSpacing: 8,
          color: "var(--text-primary)",
          marginBottom: 14,
          textShadow: "0 2px 20px rgba(201,169,122,0.40)"
        }}>
          KADIMA ACADEMY
        </h1>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 10 }}>
          <span style={{ width: 60, height: 1, background: "linear-gradient(90deg, transparent, var(--gold) 50%, transparent)" }} />
          <span style={{
            fontFamily: "var(--font-cinzel)",
            fontWeight: 500,
            fontSize: 11,
            letterSpacing: 5,
            color: "var(--gold-light)",
            textTransform: "uppercase"
          }}>
            Sua área de membros
          </span>
          <span style={{ width: 60, height: 1, background: "linear-gradient(90deg, var(--gold), transparent 50%, transparent)" }} />
        </div>

        <p style={{ fontFamily: "var(--font-poppins)", fontSize: 15, fontWeight: 300, color: "var(--text-secondary)", letterSpacing: 1 }}>
          Bem-vindo, <strong style={{ fontWeight: 600, color: "var(--gold-light)" }}>{firstName}</strong>
        </p>

        {streak > 0 && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginTop: 16,
            padding: "8px 20px", borderRadius: 40,
            background: "linear-gradient(135deg, rgba(201,169,122,0.15) 0%, rgba(201,169,122,0.05) 100%)",
            border: "1px solid rgba(201,169,122,0.30)",
            backdropFilter: "blur(8px)",
          }}>
            <span style={{ fontSize: 18 }}>🔥</span>
            <span style={{ fontFamily: "var(--font-cinzel)", fontWeight: 700, fontSize: 15, color: "var(--gold-bright)" }}>
              {streak} {streak === 1 ? "dia" : "dias"}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 1 }}>de sequência</span>
            {streak >= 7 && <span style={{ fontSize: 14 }}>⚡</span>}
            {streak >= 30 && <span style={{ fontSize: 14 }}>👑</span>}
          </div>
        )}
      </div>
    </section>
  );
}
