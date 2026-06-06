"use client";

import { useState, useEffect } from "react";

interface Course { id: string; title: string }

const S = {
  input: {
    width: "100%", boxSizing: "border-box" as const,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(201,169,122,0.18)",
    borderRadius: 10, padding: "12px 16px",
    color: "var(--text-primary)", fontSize: 13,
    fontFamily: "var(--font-poppins)", outline: "none",
  } as React.CSSProperties,
  textarea: {
    width: "100%", boxSizing: "border-box" as const,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(201,169,122,0.18)",
    borderRadius: 10, padding: "12px 16px",
    color: "var(--text-primary)", fontSize: 13,
    fontFamily: "var(--font-poppins)", outline: "none",
    resize: "vertical" as const, minHeight: 180,
  } as React.CSSProperties,
  select: {
    width: "100%", boxSizing: "border-box" as const,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(201,169,122,0.18)",
    borderRadius: 10, padding: "12px 16px",
    color: "var(--text-primary)", fontSize: 13,
    fontFamily: "var(--font-poppins)", outline: "none",
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C9A97A' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    paddingRight: 40,
    colorScheme: "dark" as const,
  } as React.CSSProperties,
  label: {
    display: "block", fontSize: 10, fontFamily: "var(--font-cinzel)",
    fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase" as const,
    color: "var(--gold)", marginBottom: 8,
  } as React.CSSProperties,
  card: {
    borderRadius: 16, padding: "24px",
    background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
    border: "1px solid rgba(201,169,122,0.10)",
    marginBottom: 20,
  } as React.CSSProperties,
};

export default function AdminEmailPage() {
  const [subject,   setSubject]   = useState("");
  const [body,      setBody]      = useState("");
  const [ctaUrl,    setCtaUrl]    = useState("");
  const [ctaLabel,  setCtaLabel]  = useState("");
  const [audience,  setAudience]  = useState("all");
  const [courseId,  setCourseId]  = useState("");
  const [courses,   setCourses]   = useState<Course[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [preview,   setPreview]   = useState(false);
  const [result,    setResult]    = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [error,     setError]     = useState("");
  const [config,    setConfig]    = useState<{ configured: boolean; from: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/cursos-list")
      .then(r => r.json())
      .then(d => setCourses(d.courses ?? []))
      .catch(() => {});
    fetch("/api/admin/email")
      .then(r => r.json())
      .then(d => setConfig(d))
      .catch(() => {});
  }, []);

  async function send() {
    setError("");
    setResult(null);
    if (!subject.trim() || !body.trim()) {
      setError("Assunto e mensagem são obrigatórios.");
      return;
    }
    if (audience === "course" && !courseId) {
      setError("Selecione um curso.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body, ctaUrl, ctaLabel, audience, courseId }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Erro ao enviar."); return; }
      if (json.errors?.length) setError(`Algumas falhas: ${json.errors[0]}`);
      setResult(json);
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  const audienceLabel =
    audience === "all"    ? "Todos os alunos" :
    audience === "active" ? "Alunos com acesso ativo" :
    courses.find(c => c.id === courseId)?.title ?? "Curso selecionado";

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      {/* Header */}
      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Admin</div>
        <h1 className="ka-page-title">E-mail <span>Campanhas</span></h1>
        <p className="ka-page-subtitle">Envie comunicados e mensagens diretamente para os alunos</p>
      </div>

      <div style={{ padding: "0 44px 60px", maxWidth: 860 }}>

        {/* Status da configuração */}
        {config && !config.configured && (
          <div style={{
            borderRadius: 14, padding: "16px 20px", marginBottom: 24,
            background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.30)",
            display: "flex", gap: 14, alignItems: "flex-start",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#fbbf24", margin: "0 0 4px" }}>
                RESEND_API_KEY não configurada
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", margin: 0, lineHeight: 1.6 }}>
                Adicione <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 6px", borderRadius: 4 }}>RESEND_API_KEY</code> nas variáveis de ambiente do projeto para enviar e-mails.
                Crie a chave em <strong style={{ color: "#fbbf24" }}>resend.com → API Keys</strong>.
              </p>
            </div>
          </div>
        )}
        {config?.configured && (
          <div style={{
            borderRadius: 14, padding: "12px 18px", marginBottom: 24,
            background: "rgba(110,231,183,0.05)", border: "1px solid rgba(110,231,183,0.20)",
            display: "flex", gap: 10, alignItems: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", margin: 0 }}>
              Resend configurado · remetente: <strong style={{ color: "#6ee7b7" }}>{config.from}</strong>
            </p>
          </div>
        )}

        {/* Resultado */}
        {result && (
          <div style={{
            borderRadius: 14, padding: "18px 24px", marginBottom: 24,
            background: "rgba(110,231,183,0.07)", border: "1px solid rgba(110,231,183,0.25)",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#6ee7b7", margin: 0 }}>
                Campanha enviada com sucesso!
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", margin: "4px 0 0" }}>
                {result.sent} e-mail{result.sent !== 1 ? "s" : ""} enviado{result.sent !== 1 ? "s" : ""}
                {result.failed > 0 && ` · ${result.failed} falha${result.failed !== 1 ? "s" : ""}`}
                {" "}de {result.total} destinatário{result.total !== 1 ? "s" : ""}
              </p>
            </div>
            <button onClick={() => setResult(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 18 }}>×</button>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div style={{
            borderRadius: 14, padding: "14px 20px", marginBottom: 24,
            background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.25)",
            fontSize: 13, color: "#f87171",
          }}>
            {error}
          </div>
        )}

        {/* Destinatários */}
        <div style={S.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2 }} />
            <h2 style={{ fontFamily: "var(--font-cinzel)", fontSize: 12, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)", margin: 0 }}>
              Destinatários
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: audience === "course" ? "1fr 1fr" : "1fr", gap: 16 }}>
            <div>
              <label style={S.label}>Público-alvo</label>
              <select value={audience} onChange={e => { setAudience(e.target.value); setCourseId(""); }} style={S.select}>
                <option value="all">Todos os alunos</option>
                <option value="active">Alunos com acesso ativo</option>
                <option value="course">Alunos de um curso específico</option>
              </select>
            </div>
            {audience === "course" && (
              <div>
                <label style={S.label}>Curso</label>
                <select value={courseId} onChange={e => setCourseId(e.target.value)} style={S.select}>
                  <option value="">Selecione o curso…</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div style={S.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2 }} />
            <h2 style={{ fontFamily: "var(--font-cinzel)", fontSize: 12, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)", margin: 0 }}>
              Conteúdo do E-mail
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={S.label}>Assunto</label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Ex: Novidades da semana na Kadima Academy"
                style={S.input}
              />
            </div>
            <div>
              <label style={S.label}>Mensagem</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder={"Escreva o conteúdo do e-mail aqui.\n\nParagrafos separados por linha em branco aparecem como blocos distintos."}
                style={S.textarea}
              />
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 6 }}>
                Separe parágrafos com uma linha em branco. O nome do aluno é incluído automaticamente.
              </p>
            </div>
          </div>
        </div>

        {/* CTA opcional */}
        <div style={S.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2 }} />
            <h2 style={{ fontFamily: "var(--font-cinzel)", fontSize: 12, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)", margin: 0 }}>
              Botão de Ação <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400 }}>(opcional)</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={S.label}>Texto do botão</label>
              <input value={ctaLabel} onChange={e => setCtaLabel(e.target.value)} placeholder="Ex: Acessar a Plataforma" style={S.input} />
            </div>
            <div>
              <label style={S.label}>Link do botão</label>
              <input value={ctaUrl} onChange={e => setCtaUrl(e.target.value)} placeholder="https://..." style={S.input} />
            </div>
          </div>
        </div>

        {/* Preview */}
        {preview && subject && body && (
          <div style={{ ...S.card, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2 }} />
              <h2 style={{ fontFamily: "var(--font-cinzel)", fontSize: 12, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)", margin: 0 }}>
                Pré-visualização
              </h2>
            </div>
            <div style={{
              borderRadius: 12, padding: "20px 24px",
              background: "#060D1F", border: "1px solid rgba(201,169,122,0.12)",
            }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.30)", marginBottom: 4 }}>
                <strong style={{ color: "rgba(255,255,255,0.50)" }}>Para:</strong> {audienceLabel}
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.30)", marginBottom: 16 }}>
                <strong style={{ color: "rgba(255,255,255,0.50)" }}>Assunto:</strong> {subject}
              </p>
              <div style={{ borderTop: "1px solid rgba(201,169,122,0.10)", paddingTop: 16 }}>
                <p style={{ fontSize: 13, color: "rgba(201,169,122,0.70)", marginBottom: 12 }}>
                  Olá, <strong style={{ color: "#C9A97A" }}>Nome do Aluno</strong> — aqui está uma mensagem da Kadima Academy:
                </p>
                {body.split("\n\n").map((p, i) => (
                  <p key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.8, marginBottom: 12 }}>
                    {p}
                  </p>
                ))}
                {ctaLabel && ctaUrl && (
                  <div style={{ marginTop: 20 }}>
                    <span style={{
                      display: "inline-block", padding: "11px 28px", borderRadius: 10,
                      background: "linear-gradient(135deg,#C9A97A,#A07840)",
                      color: "#060D1F", fontSize: 11, fontWeight: 700, letterSpacing: 2,
                      textTransform: "uppercase",
                    }}>
                      {ctaLabel}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ações */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => setPreview(v => !v)}
            style={{
              padding: "12px 24px", borderRadius: 10, cursor: "pointer",
              border: "1px solid rgba(201,169,122,0.25)",
              background: "rgba(201,169,122,0.06)",
              color: "var(--gold-light)", fontSize: 11,
              fontFamily: "var(--font-cinzel)", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase",
            }}
          >
            {preview ? "Ocultar Prévia" : "Visualizar E-mail"}
          </button>

          <button
            onClick={send}
            disabled={loading}
            style={{
              padding: "12px 32px", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer",
              border: "1px solid rgba(201,169,122,0.40)",
              background: loading
                ? "rgba(201,169,122,0.10)"
                : "linear-gradient(135deg, rgba(201,169,122,0.25), rgba(201,169,122,0.10))",
              color: loading ? "rgba(255,255,255,0.30)" : "var(--gold-light)", fontSize: 11,
              fontFamily: "var(--font-cinzel)", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            {loading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Enviando…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Enviar Campanha
              </>
            )}
          </button>

          {!loading && !result && (
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
              Público: <strong style={{ color: "rgba(255,255,255,0.45)" }}>{audienceLabel}</strong>
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.20); }
        select option { background: #0F1A3D; }
      `}</style>
    </div>
  );
}
