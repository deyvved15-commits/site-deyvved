"use client";

import { useState } from "react";

export default function ResetPasswordButton({ studentId }: { studentId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleReset() {
    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      if (res.ok) {
        setSuccess("Senha alterada com sucesso!");
        setNewPassword("");
        setTimeout(() => {
          setIsOpen(false);
          setSuccess("");
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error ?? "Erro ao alterar senha.");
      }
    } catch (err) {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  if (isOpen) {
    return (
      <div style={{ 
        display: "flex", flexDirection: "column", gap: 10, padding: 16, 
        borderRadius: 14, background: "rgba(255,255,255,0.03)", 
        border: "1px solid rgba(201,169,122,0.15)",
        marginTop: 10, width: "100%", maxWidth: 300 
      }}>
        <p style={{ fontSize: 11, color: "var(--gold)", fontFamily: "'Cinzel',serif", fontWeight: 600, letterSpacing: 1 }}>
          NOVA SENHA
        </p>
        <input
          type="text"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Digite a nova senha"
          style={{
            padding: "10px 14px", borderRadius: 10,
            background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)",
            color: "white", fontSize: 13, width: "100%"
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleReset}
            disabled={loading}
            style={{
              flex: 1, padding: "10px", borderRadius: 10, border: "none",
              background: loading ? "rgba(201,169,122,0.3)" : "var(--gold)",
              color: "var(--navy-darkest)", fontSize: 11, fontFamily: "'Cinzel',serif",
              fontWeight: 700, cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            disabled={loading}
            style={{
              padding: "10px 14px", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
              color: "rgba(255,255,255,0.5)", fontSize: 11, cursor: "pointer",
            }}
          >
            Cancelar
          </button>
        </div>
        {error && <p style={{ fontSize: 11, color: "#f87171" }}>{error}</p>}
        {success && <p style={{ fontSize: 11, color: "#6ee7b7" }}>{success}</p>}
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "8px 18px", borderRadius: 10,
        border: "1px solid rgba(201,169,122,0.25)", background: "rgba(201,169,122,0.06)",
        color: "var(--gold)", fontSize: 10, fontFamily: "'Cinzel',serif",
        fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase",
        cursor: "pointer", transition: "all 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,169,122,0.14)"; e.currentTarget.style.borderColor = "rgba(201,169,122,0.45)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(201,169,122,0.06)"; e.currentTarget.style.borderColor = "rgba(201,169,122,0.25)"; }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      Nova Senha
    </button>
  );
}
