"use client";

import { useState, useEffect } from "react";

interface Course { id: string; title: string; }
interface Student { id: string; name: string; email: string; }
interface Broadcast {
  title: string;
  message: string;
  link: string | null;
  createdAt: string;
  count: number;
}

export default function AdminNotificacoes() {
  const [target, setTarget] = useState<"all" | "user" | "course">("all");
  const [userId, setUserId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ sent: number; message?: string } | null>(null);
  const [error, setError] = useState("");

  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [studentSearch, setStudentSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/cursos-list").then(r => r.json()).then(d => setCourses(d.courses ?? []));
    fetch("/api/admin/students-list").then(r => r.json()).then(d => setStudents(d.students ?? []));
    loadBroadcasts();
  }, []);

  async function loadBroadcasts() {
    const res = await fetch("/api/admin/notifications");
    if (res.ok) {
      const data = await res.json();
      setBroadcasts(data.broadcasts ?? []);
    }
  }

  const filteredStudents = students.filter(s =>
    studentSearch.length >= 2 &&
    (s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
     s.email.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  async function handleSend() {
    if (!title.trim() || !message.trim()) {
      setError("Título e mensagem são obrigatórios.");
      return;
    }
    if (target === "user" && !userId) {
      setError("Selecione um aluno.");
      return;
    }
    if (target === "course" && !courseId) {
      setError("Selecione um curso.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const body: Record<string, string> = { target, title: title.trim(), message: message.trim() };
    if (link.trim()) body.link = link.trim();
    if (target === "user") body.userId = userId;
    if (target === "course") body.courseId = courseId;

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar.");
      } else {
        setResult(data);
        setTitle("");
        setMessage("");
        setLink("");
        setUserId("");
        setCourseId("");
        setStudentSearch("");
        loadBroadcasts();
      }
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  const targetLabel = { all: "Todos os alunos", user: "Aluno específico", course: "Alunos do curso" };

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Central de Comunicação</div>
        <h1 className="ka-page-title">Enviar <span>Notificação</span></h1>
        <p className="ka-page-subtitle">Notificações in-app e push para alunos</p>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .ka-notif-grid { grid-template-columns: 1fr !important; padding: 0 16px 80px !important; }
        }
      `}</style>
      <div className="ka-notif-grid" style={{ padding: "0 44px 44px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>

        {/* Form */}
        <div style={{
          borderRadius: 20, padding: 32,
          background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
          border: "1px solid rgba(201,169,122,0.12)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        }}>
          <SectionTitle>Destinatários</SectionTitle>

          {/* Target selector */}
          <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
            {(["all", "user", "course"] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTarget(t); setUserId(""); setCourseId(""); setStudentSearch(""); }}
                style={{
                  padding: "8px 18px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.2s",
                  background: target === t ? "linear-gradient(135deg, #C9A97A, #E8D5A8)" : "rgba(255,255,255,0.04)",
                  border: target === t ? "1px solid var(--gold)" : "1px solid rgba(255,255,255,0.08)",
                  color: target === t ? "#060D1F" : "var(--text-muted)",
                  fontFamily: "'Cinzel',serif", letterSpacing: 1,
                }}
              >
                {targetLabel[t]}
              </button>
            ))}
          </div>

          {/* User search */}
          {target === "user" && (
            <div style={{ marginBottom: 20 }}>
              <Label>Buscar aluno</Label>
              <input
                value={studentSearch}
                onChange={e => { setStudentSearch(e.target.value); setUserId(""); }}
                placeholder="Nome ou e-mail..."
                style={inputStyle}
              />
              {filteredStudents.length > 0 && !userId && (
                <div style={{
                  marginTop: 6, borderRadius: 10, overflow: "hidden",
                  border: "1px solid rgba(201,169,122,0.15)",
                  background: "var(--navy-darkest)",
                }}>
                  {filteredStudents.slice(0, 6).map(s => (
                    <div
                      key={s.id}
                      onClick={() => { setUserId(s.id); setStudentSearch(`${s.name} — ${s.email}`); }}
                      style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 13 }}
                      className="admin-row-hover"
                    >
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{s.name}</span>
                      <span style={{ color: "var(--text-muted)", marginLeft: 8, fontSize: 11 }}>{s.email}</span>
                    </div>
                  ))}
                </div>
              )}
              {userId && (
                <p style={{ fontSize: 11, color: "#6ee7b7", marginTop: 6 }}>✓ Aluno selecionado</p>
              )}
            </div>
          )}

          {/* Course select */}
          {target === "course" && (
            <div style={{ marginBottom: 20 }}>
              <Label>Curso</Label>
              <select value={courseId} onChange={e => setCourseId(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                <option value="">Selecione um curso...</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          )}

          <SectionTitle style={{ marginTop: 8 }}>Conteúdo</SectionTitle>

          <div style={{ marginBottom: 16 }}>
            <Label>Título <span style={{ color: "var(--text-muted)" }}>({title.length}/100)</span></Label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value.slice(0, 100))}
              placeholder="Ex: Nova aula disponível!"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <Label>Mensagem <span style={{ color: "var(--text-muted)" }}>({message.length}/500)</span></Label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value.slice(0, 500))}
              placeholder="Escreva o conteúdo da notificação..."
              rows={4}
              style={{ ...inputStyle, resize: "vertical" as const }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <Label>Link <span style={{ color: "var(--text-muted)", fontSize: 10 }}>(opcional)</span></Label>
            <input
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="/cursos/meu-curso"
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(230,57,70,0.10)", border: "1px solid rgba(230,57,70,0.25)", borderRadius: 10, color: "#f87171", fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {result && (
            <div style={{ padding: "10px 14px", background: "rgba(110,231,183,0.08)", border: "1px solid rgba(110,231,183,0.20)", borderRadius: 10, color: "#6ee7b7", fontSize: 13, marginBottom: 16 }}>
              ✓ Enviado para {result.sent} {result.sent === 1 ? "aluno" : "alunos"}{result.message ? ` — ${result.message}` : ""}
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={loading}
            style={{
              width: "100%", padding: "14px 24px", borderRadius: 12,
              background: loading ? "rgba(201,169,122,0.3)" : "linear-gradient(135deg, #C9A97A, #E8D5A8)",
              border: "none", color: "#060D1F", fontFamily: "'Cinzel',serif",
              fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: "uppercase" as const,
              cursor: loading ? "default" : "pointer", transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Enviando...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Enviar Notificação
              </>
            )}
          </button>
        </div>

        {/* Recent broadcasts */}
        <div style={{
          borderRadius: 20, overflow: "hidden",
          background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
          border: "1px solid rgba(201,169,122,0.12)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        }}>
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid rgba(201,169,122,0.10)",
            background: "rgba(201,169,122,0.03)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2 }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
              Enviadas Recentemente
            </span>
          </div>

          {broadcasts.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              Nenhuma notificação enviada ainda.
            </div>
          ) : (
            <div style={{ maxHeight: 520, overflowY: "auto" }}>
              {broadcasts.map((b, i) => (
                <div key={i} style={{
                  padding: "16px 20px",
                  borderTop: i > 0 ? "1px solid rgba(201,169,122,0.06)" : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>{b.title}</p>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, flexShrink: 0,
                      background: "rgba(201,169,122,0.10)", border: "1px solid var(--gold-20)", color: "var(--gold)",
                    }}>
                      {b.count} aluno{b.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4, marginBottom: 6 }}>{b.message}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
                      {new Date(b.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {b.link && (
                      <span style={{ fontSize: 10, color: "var(--gold)", opacity: 0.6 }}>→ {b.link}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, ...style }}>
      <div style={{ width: 3, height: 14, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2 }} />
      <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)" }}>
        {children}
      </span>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
  color: "var(--text-primary)", fontSize: 13, fontFamily: "var(--font-poppins, Poppins, sans-serif)",
  outline: "none", boxSizing: "border-box",
  transition: "border 0.2s",
};
