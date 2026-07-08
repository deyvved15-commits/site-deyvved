"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Preciso ter formação prévia em teologia para estudar na Kadima?",
    a: "Não. Nossos cursos são acessíveis tanto para iniciantes quanto para quem já tem base teológica. Cada trilha indica o nível recomendado, e você avança no seu próprio ritmo.",
  },
  {
    q: "Como funciona o acesso após a matrícula?",
    a: "Após a confirmação do pagamento você recebe acesso imediato à plataforma. Dependendo do plano escolhido, o acesso pode ser vitalício (pagamento único) ou por 30 dias (mensalidade renovável).",
  },
  {
    q: "As aulas são ao vivo ou gravadas?",
    a: "A maioria do conteúdo é gravado e disponível 24h, para você estudar onde e quando quiser. Além disso, realizamos aulas ao vivo periódicas com os professores, salvas na plataforma depois.",
  },
  {
    q: "Recebo certificado ao concluir o curso?",
    a: "Sim. Ao concluir todas as aulas de um curso você pode gerar e baixar o certificado digital de conclusão diretamente pela plataforma.",
  },
  {
    q: "Posso acessar pelo celular?",
    a: "Sim. A plataforma é totalmente responsiva e funciona em qualquer dispositivo — celular, tablet ou computador — sem necessidade de instalar aplicativo.",
  },
  {
    q: "Como funciona o programa de afiliados?",
    a: "Alunos podem indicar novos estudantes e receber comissão sobre cada matrícula gerada. O saldo fica disponível na sua carteira e pode ser solicitado de retirada.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" style={{ padding: "100px 40px", background: "var(--navy-darkest)", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 60% at 50% 0%, rgba(201,169,122,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ fontSize: 10, fontFamily: "var(--font-cinzel)", letterSpacing: 5, textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>
            Dúvidas
          </div>
          <h2 style={{ fontFamily: "var(--font-cinzel)", fontWeight: 700, fontSize: "clamp(24px, 3.5vw, 38px)", letterSpacing: 1.5, color: "#fff", marginBottom: 16, lineHeight: 1.2 }}>
            Perguntas Frequentes
          </h2>
          <div style={{ width: 50, height: 2, background: "linear-gradient(90deg, transparent, var(--gold), transparent)", margin: "0 auto" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              style={{
                borderRadius: 14,
                border: `1px solid ${open === i ? "rgba(201,169,122,0.30)" : "rgba(201,169,122,0.10)"}`,
                background: open === i ? "rgba(201,169,122,0.05)" : "rgba(15,26,61,0.40)",
                overflow: "hidden",
                transition: "border-color 0.2s, background 0.2s",
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%", textAlign: "left", background: "none", border: "none",
                  padding: "20px 24px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                }}
              >
                <span style={{
                  fontFamily: "var(--font-poppins, 'Poppins', sans-serif)",
                  fontSize: 14, fontWeight: 500,
                  color: open === i ? "var(--gold)" : "rgba(255,255,255,0.85)",
                  lineHeight: 1.5, transition: "color 0.2s",
                }}>
                  {faq.q}
                </span>
                <span style={{
                  flexShrink: 0,
                  width: 28, height: 28, borderRadius: "50%",
                  border: "1px solid rgba(201,169,122,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--gold)", fontSize: 18, lineHeight: 1,
                  transition: "transform 0.25s",
                  transform: open === i ? "rotate(45deg)" : "none",
                }}>
                  +
                </span>
              </button>

              {open === i && (
                <div style={{ padding: "0 24px 20px" }}>
                  <p style={{
                    fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.85,
                    margin: 0,
                    fontFamily: "var(--font-poppins, 'Poppins', sans-serif)",
                  }}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
