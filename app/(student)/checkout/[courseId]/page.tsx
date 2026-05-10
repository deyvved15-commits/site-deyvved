"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getGoogleDriveImageUrl } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  price: number;
  _count: { modules: number; enrollments: number };
}

export default function CheckoutPage({ params, searchParams }: { params: Promise<{ courseId: string }>; searchParams: Promise<{ renovar?: string }> }) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [courseId, setCourseId] = useState("");
  const [isRenewal, setIsRenewal] = useState(false);

  useEffect(() => {
    Promise.all([params, searchParams]).then(([p, sp]) => {
      setCourseId(p.courseId);
      setIsRenewal(sp.renovar === "1");
      fetch(`/api/courses/${p.courseId}/public`)
        .then(r => r.json())
        .then(setCourse)
        .catch(() => setError("Curso não encontrado."));
    });
  }, [params, searchParams]);

  async function handleCheckout() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Erro ao iniciar pagamento."); setLoading(false); return; }
    window.location.href = data.checkoutUrl;
  }

  const thumbUrl = course?.thumbnail?.includes("drive.google.com")
    ? getGoogleDriveImageUrl(course.thumbnail)
    : course?.thumbnail;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)",
      padding: "24px 16px",
    }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* Back */}
        <button onClick={() => router.back()} style={{
          display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
          cursor: "pointer", color: "var(--gold)", fontSize: 11, letterSpacing: 2,
          textTransform: "uppercase", fontFamily: "'Cinzel',serif", marginBottom: 24,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Voltar
        </button>

        {!course ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
            {error || "Carregando..."}
          </div>
        ) : (
          <div style={{
            borderRadius: 24,
            background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
            border: "1px solid rgba(201,169,122,0.15)",
            overflow: "hidden",
            boxShadow: "0 24px 64px rgba(0,0,0,0.50)",
          }}>
            {/* Thumbnail */}
            {thumbUrl && (
              <div style={{ height: 200, background: "#080E22", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbUrl} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
            )}

            <div style={{ padding: "28px 28px 32px" }}>
              {/* Header card */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2, boxShadow: "0 0 8px var(--gold)" }} />
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "var(--gold)" }}>
                  {isRenewal ? "Renovar Acesso" : "Resumo da Compra"}
                </span>
              </div>

              <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 20, letterSpacing: 2, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.3 }}>
                {course.title}
              </h1>

              {course.description && (
                <div className="prose-lesson" style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 16 }}
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              )}

              <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  📚 {course._count.modules} módulo{course._count.modules !== 1 ? "s" : ""}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  👥 {course._count.enrollments} aluno{course._count.enrollments !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Price */}
              <div style={{
                padding: "16px 20px", borderRadius: 14, marginBottom: 20,
                background: "rgba(201,169,122,0.06)", border: "1px solid rgba(201,169,122,0.18)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 2, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  {isRenewal ? "Mensalidade (30 dias)" : "Valor do curso"}
                </span>
                <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 26, color: "var(--gold-light)" }}>
                  R$ {course.price.toFixed(2).replace(".", ",")}
                </span>
              </div>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(230,57,70,0.08)", border: "1px solid rgba(230,57,70,0.25)", marginBottom: 16 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF8088" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span style={{ fontSize: 12, color: "#FF8088", fontFamily: "'Poppins',sans-serif" }}>{error}</span>
                </div>
              )}

              {/* Checkout button */}
              <button
                onClick={handleCheckout}
                disabled={loading}
                style={{
                  width: "100%", padding: "14px 24px", borderRadius: 14, cursor: loading ? "default" : "pointer",
                  background: loading ? "rgba(201,169,122,0.20)" : "linear-gradient(135deg, #009EE3, #007BC2)",
                  color: loading ? "rgba(255,255,255,0.40)" : "#fff",
                  fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 12,
                  letterSpacing: 2, textTransform: "uppercase", border: "none",
                  boxShadow: loading ? "none" : "0 6px 24px rgba(0,158,227,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  transition: "all 0.2s",
                }}
              >
                {loading ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Redirecionando...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    Pagar com Mercado Pago
                  </>
                )}
              </button>

              <p style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 12, fontFamily: "'Poppins',sans-serif", lineHeight: 1.6 }}>
                Você será redirecionado para o Mercado Pago.<br />
                {isRenewal ? "Acesso renovado por 30 dias após confirmação." : "Pagamento 100% seguro. Acesso liberado imediatamente após confirmação."}
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
