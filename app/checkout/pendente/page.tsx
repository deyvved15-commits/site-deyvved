"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CheckoutPendente() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const productId = searchParams.get("productId");

  const [dots, setDots] = useState(".");
  const [elapsed, setElapsed] = useState(0);
  const [approved, setApproved] = useState(false);

  // Animação dos pontos
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 600);
    return () => clearInterval(t);
  }, []);

  // Contador de tempo
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Polling de status do pagamento
  useEffect(() => {
    if (!courseId && !productId) return;

    const params = courseId ? `courseId=${courseId}` : `productId=${productId}`;

    const poll = async () => {
      try {
        const res = await fetch(`/api/checkout/status?${params}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "approved") {
          setApproved(true);
          setTimeout(() => {
            router.push(courseId ? "/cursos" : "/loja");
          }, 2000);
        }
      } catch {
        // silencia erros de rede
      }
    };

    // Primeira verificação após 5s, depois a cada 5s
    const timer = setTimeout(() => {
      poll();
      const interval = setInterval(poll, 5000);
      return () => clearInterval(interval);
    }, 5000);

    return () => clearTimeout(timer);
  }, [courseId, productId, router]);

  if (approved) {
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
          boxShadow: "0 24px 64px rgba(0,0,0,0.50)",
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
            Pagamento Confirmado!
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7 }}>
            Redirecionando para seus cursos...
          </p>
        </div>
      </div>
    );
  }

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
        {/* Ícone animado */}
        <div style={{
          width: 72, height: 72, borderRadius: "50%", margin: "0 auto 24px",
          background: "rgba(251,191,36,0.10)", border: "1px solid rgba(251,191,36,0.30)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: "spin 3s linear infinite" }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        </div>

        <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 22, letterSpacing: 2, color: "#fbbf24", marginBottom: 12 }}>
          Aguardando Pagamento
        </h1>

        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 8 }}>
          Verificando seu pagamento PIX automaticamente{dots}
        </p>

        {elapsed > 0 && (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginBottom: 28 }}>
            {elapsed < 60
              ? `${elapsed}s aguardando`
              : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s aguardando`}
          </p>
        )}

        <div style={{
          padding: "16px 20px", borderRadius: 14, marginBottom: 28,
          background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.15)",
          textAlign: "left",
        }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.60)", lineHeight: 1.8, margin: 0 }}>
            <strong style={{ color: "#fbbf24" }}>PIX é processado em segundos.</strong><br />
            Após confirmar o pagamento no seu banco, o acesso é liberado automaticamente. Pode fechar o app bancário e aguardar aqui.
          </p>
        </div>

        <Link href="/dashboard" style={{
          display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
          padding: "12px 28px", borderRadius: 12,
          background: "rgba(201,169,122,0.12)", border: "1px solid rgba(201,169,122,0.25)",
          color: "var(--gold-light)", fontFamily: "'Cinzel',serif",
          fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
        }}>
          Ir para o Início
        </Link>

        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.20)", marginTop: 16 }}>
          Seu acesso será liberado mesmo que você saia desta página.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
