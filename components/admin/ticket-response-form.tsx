"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TicketResponseForm({ ticketId, isAdmin }: { ticketId: string, isAdmin?: boolean }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: message, isAdmin })
      });

      if (res.ok) {
        setMessage("");
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12 }}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Digite sua resposta..."
        disabled={loading}
        style={{ 
          flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", 
          borderRadius: 12, padding: "12px 16px", color: "#fff", fontSize: 14, resize: "none", 
          minHeight: 80, fontFamily: "inherit", outline: "none"
        }}
      />
      <button
        type="submit"
        disabled={loading || !message.trim()}
        style={{ 
          width: 50, height: 50, borderRadius: 12, background: "var(--gold)", color: "#060D1F",
          display: "flex", alignItems: "center", justifyContent: "center", border: "none",
          cursor: "pointer", transition: "all 0.2s", alignSelf: "flex-end",
          opacity: (loading || !message.trim()) ? 0.5 : 1
        }}
      >
        {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
      </button>
    </form>
  );
}
