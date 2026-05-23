"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

const S = {
  field: { display: "flex", flexDirection: "column" as const, gap: 8 },
  label: {
    fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600,
    letterSpacing: 3, textTransform: "uppercase" as const, color: "rgba(201,169,122,0.75)",
  },
  input: {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,122,0.18)",
    borderRadius: 12, padding: "13px 16px", fontSize: 13, color: "#fff",
    outline: "none", width: "100%", fontFamily: "'Poppins',sans-serif",
    boxSizing: "border-box" as const, transition: "border-color 0.2s",
  },
  textarea: {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,122,0.18)",
    borderRadius: 12, padding: "13px 16px", fontSize: 13, color: "#fff",
    outline: "none", width: "100%", fontFamily: "'Poppins',sans-serif",
    boxSizing: "border-box" as const, resize: "vertical" as const, minHeight: 90,
    lineHeight: 1.6, transition: "border-color 0.2s",
  },
  btnPrimary: {
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: "12px 28px", borderRadius: 12,
    background: "linear-gradient(135deg, #C9A97A, #A07840)",
    border: "none", color: "#060D1F", fontSize: 11,
    fontFamily: "'Cinzel',serif", fontWeight: 700,
    letterSpacing: 2, textTransform: "uppercase" as const,
    cursor: "pointer", boxShadow: "0 4px 16px rgba(201,169,122,0.30)",
  } as React.CSSProperties,
  sectionTitle: { display: "flex", alignItems: "center", gap: 10, marginBottom: 20 },
  sectionBar: {
    width: 3, height: 18, borderRadius: 2,
    background: "linear-gradient(180deg, #E8D5A8, #C9A97A)",
    boxShadow: "0 0 8px rgba(201,169,122,0.5)", flexShrink: 0,
  },
  sectionLabel: {
    fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600,
    letterSpacing: 4, textTransform: "uppercase" as const, color: "var(--gold)",
  },
};

function Alert({ type, msg }: { type: "error" | "success"; msg: string }) {
  const isErr = type === "error";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10,
      background: isErr ? "rgba(230,57,70,0.08)" : "rgba(110,231,183,0.08)",
      border: `1px solid ${isErr ? "rgba(230,57,70,0.25)" : "rgba(110,231,183,0.25)"}`,
    }}>
      <span style={{ fontSize: 12, color: isErr ? "#FF8088" : "#6ee7b7", fontFamily: "'Poppins',sans-serif" }}>
        {msg}
      </span>
    </div>
  );
}

interface UserData { id: string; name: string | null; email: string | null; bio: string | null; avatar: string | null }

export default function PerfilPage() {
  const { update: updateSession } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [infoLoading, setInfoLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "error" | "success"; msg: string } | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then((data: UserData) => {
        setUser(data);
        setName(data.name ?? "");
        setBio(data.bio ?? "");
        setAvatar(data.avatar ?? "");
      });
  }, []);

  async function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError("");
    setAvatarUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setAvatarError(data.error ?? "Erro ao fazer upload."); return; }
      setAvatar(data.url);
      // Salva automaticamente no perfil
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: data.url }),
      });
      await updateSession({});
    } catch {
      setAvatarError("Erro de conexão. Tente novamente.");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleInfoSave(e: React.FormEvent) {
    e.preventDefault();
    setInfoLoading(true);
    setInfoMsg(null);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio: bio || null, avatar: avatar || null }),
    });
    const data = await res.json();
    setInfoLoading(false);
    if (!res.ok) { setInfoMsg({ type: "error", msg: data.error ?? "Erro ao salvar." }); return; }
    setUser(u => u ? { ...u, name: data.name, bio: data.bio, avatar: data.avatar } : u);
    setAvatar(data.avatar ?? "");
    await updateSession({ name: data.name });
    setInfoMsg({ type: "success", msg: "Perfil atualizado com sucesso!" });
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setPwMsg({ type: "error", msg: "As senhas não coincidem." }); return; }
    setPwLoading(true);
    setPwMsg(null);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setPwLoading(false);
    if (!res.ok) { setPwMsg({ type: "error", msg: data.error ?? "Erro ao atualizar senha." }); return; }
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setPwMsg({ type: "success", msg: "Senha atualizada com sucesso!" });
  }

  const displayName = name || user?.name || "";
  const initials = displayName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() || "A";
  const currentAvatar = avatar || user?.avatar || "";

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .pf-input:focus, .pf-textarea:focus { border-color: rgba(201,169,122,0.55) !important; background: rgba(255,255,255,0.07) !important; }`}</style>

      {/* Header */}
      <div style={{ padding: "28px 32px 0" }}>
        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, letterSpacing: 5, textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>
          Conta
        </p>
        <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 26, letterSpacing: 3, color: "var(--text-primary)", textTransform: "uppercase", marginBottom: 28 }}>
          Meu <span style={{ color: "var(--gold-light)" }}>Perfil</span>
        </h1>
      </div>

      <div style={{ padding: "0 32px 56px", maxWidth: 640 }}>

        {/* Avatar card */}
        <div style={{
          borderRadius: 20, padding: "28px 32px", marginBottom: 24,
          background: "linear-gradient(160deg, rgba(15,26,61,0.7) 0%, rgba(10,18,45,0.7) 100%)",
          border: "1px solid rgba(201,169,122,0.14)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.40)",
          display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
        }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handleAvatarFile}
            />
            <div
              onClick={() => !avatarUploading && fileInputRef.current?.click()}
              title="Clique para trocar a foto"
              style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "radial-gradient(circle at 30% 30%, #E8D5A8 0%, #C9A97A 50%, #7A5530 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 28,
                color: "var(--navy-darkest)",
                boxShadow: "0 0 30px rgba(201,169,122,0.40), 0 0 60px rgba(201,169,122,0.15)",
                border: "2px solid var(--gold-light)",
                overflow: "hidden",
                cursor: avatarUploading ? "default" : "pointer",
                opacity: avatarUploading ? 0.6 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {avatarUploading ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#060D1F" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              ) : currentAvatar ? (
                <Image
                  src={currentAvatar}
                  alt={displayName}
                  width={80}
                  height={80}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={() => setAvatar("")}
                  unoptimized
                />
              ) : initials}
            </div>
            <button
              type="button"
              onClick={() => !avatarUploading && fileInputRef.current?.click()}
              title="Alterar foto"
              style={{
                position: "absolute", bottom: 0, right: 0,
                width: 26, height: 26, borderRadius: "50%",
                background: "linear-gradient(135deg, #C9A97A, #8B6914)",
                border: "2px solid #060D1F",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: avatarUploading ? "default" : "pointer", color: "#060D1F",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 18, letterSpacing: 2, color: "var(--text-primary)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName || "Carregando..."}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: bio ? 8 : 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email ?? ""}
            </div>
            {bio && (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {bio}
              </div>
            )}
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => !avatarUploading && fileInputRef.current?.click()}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "5px 12px", borderRadius: 8,
                  background: "rgba(201,169,122,0.08)", border: "1px solid rgba(201,169,122,0.20)",
                  color: "rgba(201,169,122,0.80)", fontSize: 10,
                  fontFamily: "'Cinzel',serif", letterSpacing: 1.5, textTransform: "uppercase",
                  cursor: avatarUploading ? "default" : "pointer",
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                {avatarUploading ? "Enviando..." : "Trocar foto"}
              </button>
              {currentAvatar && !avatarUploading && (
                <button
                  type="button"
                  onClick={async () => {
                    setAvatar("");
                    await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ avatar: null }) });
                  }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "5px 12px", borderRadius: 8,
                    background: "rgba(230,57,70,0.06)", border: "1px solid rgba(230,57,70,0.18)",
                    color: "rgba(255,128,136,0.70)", fontSize: 10,
                    fontFamily: "'Cinzel',serif", letterSpacing: 1.5, textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Remover
                </button>
              )}
            </div>
            {avatarError && (
              <p style={{ fontSize: 11, color: "#FF8088", marginTop: 6, fontFamily: "'Poppins',sans-serif" }}>{avatarError}</p>
            )}
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.20)", marginTop: 6, fontFamily: "'Poppins',sans-serif" }}>
              JPG, PNG ou WebP · Máx 5MB
            </p>
          </div>
        </div>

        {/* Info section (nome + bio) */}
        <div style={{
          borderRadius: 20, padding: "28px 32px", marginBottom: 20,
          background: "linear-gradient(160deg, rgba(15,26,61,0.7) 0%, rgba(10,18,45,0.7) 100%)",
          border: "1px solid rgba(201,169,122,0.14)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.30)",
        }}>
          <div style={S.sectionTitle}>
            <div style={S.sectionBar} />
            <span style={S.sectionLabel}>Informações Pessoais</span>
          </div>

          <form onSubmit={handleInfoSave} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={S.field}>
              <label style={S.label}>Seu Nome</label>
              <input className="pf-input" style={S.input} value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome completo" required />
            </div>
            <div style={S.field}>
              <label style={S.label}>Bio <span style={{ opacity: 0.5, fontWeight: 400 }}>(opcional)</span></label>
              <textarea
                className="pf-textarea"
                style={S.textarea}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Fale um pouco sobre você..."
                maxLength={500}
              />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'Poppins',sans-serif", textAlign: "right" }}>
                {bio.length}/500
              </span>
            </div>
            {infoMsg && <Alert type={infoMsg.type} msg={infoMsg.msg} />}
            <div>
              <button type="submit" disabled={infoLoading} style={{ ...S.btnPrimary, opacity: infoLoading ? 0.7 : 1 }}>
                {infoLoading
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>}
                {infoLoading ? "Salvando..." : "Salvar Perfil"}
              </button>
            </div>
          </form>
        </div>

        {/* Password section */}
        <div style={{
          borderRadius: 20, padding: "28px 32px",
          background: "linear-gradient(160deg, rgba(15,26,61,0.7) 0%, rgba(10,18,45,0.7) 100%)",
          border: "1px solid rgba(201,169,122,0.14)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.30)",
        }}>
          <div style={S.sectionTitle}>
            <div style={S.sectionBar} />
            <span style={S.sectionLabel}>Alterar Senha</span>
          </div>

          <form onSubmit={handlePasswordSave} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={S.field}>
              <label style={S.label}>Senha Atual</label>
              <input type="password" className="pf-input" style={S.input} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <div style={S.field}>
              <label style={S.label}>Nova Senha</label>
              <input type="password" className="pf-input" style={S.input} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Confirmar Nova Senha</label>
              <input type="password" className="pf-input" style={S.input} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repita a nova senha" required />
            </div>
            {pwMsg && <Alert type={pwMsg.type} msg={pwMsg.msg} />}
            <div>
              <button type="submit" disabled={pwLoading} style={{ ...S.btnPrimary, opacity: pwLoading ? 0.7 : 1 }}>
                {pwLoading
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                {pwLoading ? "Salvando..." : "Alterar Senha"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
