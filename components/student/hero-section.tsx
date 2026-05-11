import Image from "next/image";

interface HeroSectionProps {
  userName: string;
}

export default function HeroSection({ userName }: HeroSectionProps) {
  const firstName = userName.split(" ")[0] ?? "Aluno";

  return (
    <section className="ka-hero">
      {/* Bokeh effects */}
      <div className="ka-bokeh" style={{ top: -30, left: "10%", width: 180, height: 180, background: "rgba(201,169,122,0.25)" }} />
      <div className="ka-bokeh" style={{ bottom: -50, right: "15%", width: 220, height: 220, background: "rgba(80,110,200,0.18)" }} />
      <div className="ka-bokeh" style={{ top: "40%", left: "60%", width: 140, height: 140, background: "rgba(232,213,168,0.15)" }} />

      <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 20px" }}>
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
          fontFamily: "'Cinzel',serif", 
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
            fontFamily: "'Cinzel',serif", 
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
        
        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 15, fontWeight: 300, color: "var(--text-secondary)", letterSpacing: 1 }}>
          Bem-vindo, <strong style={{ fontWeight: 600, color: "var(--gold-light)" }}>{firstName}</strong>
        </p>
      </div>
    </section>
  );
}
