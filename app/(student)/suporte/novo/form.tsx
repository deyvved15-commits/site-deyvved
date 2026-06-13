"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Send } from "lucide-react";

export default function CreateTicketForm({ courses }: { courses: { id: string; title: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    courseId: initialCourseId,
    priority: "medium",
    message: ""
  });

  // Sync if URL changes
  useEffect(() => {
    const cid = searchParams.get("courseId");
    if (cid) setFormData(prev => ({ ...prev, courseId: cid }));
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.subject || !formData.message) return;

    setLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const ticket = await res.json();
        router.push(`/suporte/${ticket.id}`);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const S = {
    label: { display: "block", fontSize: 10, fontFamily: "'Cinzel',serif", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, color: "var(--gold-light)", marginBottom: 10, opacity: 0.8 },
    input: { width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,169,122,0.15)", borderRadius: 12, padding: "14px 18px", color: "#fff", fontSize: 14, outline: "none", transition: "all 0.2s" } as React.CSSProperties,
    select: { width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,169,122,0.15)", borderRadius: 12, padding: "14px 18px", color: "#fff", fontSize: 14, outline: "none", cursor: "pointer", appearance: "none" as const } as React.CSSProperties,
    textarea: { width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,169,122,0.15)", borderRadius: 12, padding: "14px 18px", color: "#fff", fontSize: 14, outline: "none", minHeight: 160, resize: "vertical" as const, fontFamily: "'Poppins', sans-serif" } as React.CSSProperties,
    btn: { width: "100%", padding: "16px", borderRadius: 12, background: "linear-gradient(135deg, var(--gold), var(--gold-deep))", border: "none", color: "var(--navy-darkest)", fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: "uppercase" as const, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 12, boxShadow: "0 10px 30px rgba(201,169,122,0.25)", transition: "all 0.3s" } as React.CSSProperties
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 24 }}>
        <div>
          <label style={S.label}>Assunto da Mensagem</label>
          <input 
            style={S.input} 
            value={formData.subject}
            onChange={e => setFormData(d => ({ ...d, subject: e.target.value }))}
            placeholder="Ex: Dúvida sobre o módulo 2"
            required
            className="focus-gold"
          />
        </div>
        <div>
          <label style={S.label}>Relacionado ao Curso (Opcional)</label>
          <div style={{ position: "relative" }}>
            <select 
              style={S.select}
              value={formData.courseId}
              onChange={e => setFormData(d => ({ ...d, courseId: e.target.value }))}
              className="focus-gold"
            >
              <option value="" style={{ background: "#0a1129" }}>Geral / Suporte Técnico</option>
              {courses.map(c => (
                <option key={c.id} value={c.id} style={{ background: "#0a1129" }}>{c.title}</option>
              ))}
            </select>
            <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label style={S.label}>Prioridade</label>
        <div style={{ display: "flex", gap: 12 }}>
          {["low", "medium", "high"].map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setFormData(d => ({ ...d, priority: p }))}
              style={{
                flex: 1, padding: "10px", borderRadius: 10, fontSize: 11, fontWeight: 700, 
                fontFamily: "'Cinzel',serif", textTransform: "uppercase", letterSpacing: 1,
                cursor: "pointer", transition: "all 0.2s",
                background: formData.priority === p ? "rgba(201,169,122,0.15)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${formData.priority === p ? "var(--gold)" : "rgba(255,255,255,0.1)"}`,
                color: formData.priority === p ? "var(--gold)" : "rgba(255,255,255,0.4)"
              }}
            >
              {p === "low" ? "Baixa" : p === "medium" ? "Normal" : "Urgente"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={S.label}>Sua Pergunta / Mensagem</label>
        <textarea 
          style={S.textarea}
          value={formData.message}
          onChange={e => setFormData(d => ({ ...d, message: e.target.value }))}
          placeholder="Descreva detalhadamente sua dúvida para que o professor possa te ajudar..."
          required
          className="focus-gold"
        />
      </div>

      <button 
        type="submit" 
        disabled={loading} 
        style={{ ...S.btn, opacity: loading ? 0.6 : 1 }}
        className="btn-submit"
      >
        {loading ? "Enviando..." : <><Send size={18} /> Enviar Pergunta</>}
      </button>

      <style>{`
        .focus-gold:focus {
          border-color: var(--gold) !important;
          background: rgba(255,255,255,0.05) !important;
          box-shadow: 0 0 15px rgba(201,169,122,0.1);
        }
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(201,169,122,0.4);
        }
        .btn-submit:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
    </form>
  );
}
