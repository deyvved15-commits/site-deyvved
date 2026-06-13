import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LiveViewer from "@/components/student/live-viewer";

export default async function AoVivoPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const activeSession = await prisma.liveSession.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ height: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div className="ka-live-header">
        <div style={{
          width: 44, height: 44, borderRadius: 14, flexShrink: 0,
          background: activeSession
            ? "linear-gradient(135deg, rgba(52,211,153,0.20), rgba(52,211,153,0.08))"
            : "linear-gradient(135deg, rgba(201,169,122,0.15), rgba(201,169,122,0.05))",
          border: `1px solid ${activeSession ? "rgba(52,211,153,0.30)" : "rgba(201,169,122,0.20)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: activeSession ? "0 0 20px rgba(52,211,153,0.20)" : "0 0 14px rgba(201,169,122,0.10)",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activeSession ? "#6ee7b7" : "var(--gold)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="14" height="12" rx="2"/><path d="M22 8l-6 4 6 4V8z"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div className="ka-page-eyebrow" style={{ marginBottom: 4 }}>Transmissão ao Vivo</div>
          <h1 className="ka-page-title" style={{ fontSize: 22 }}>
            {activeSession ? <><span>{activeSession.title}</span></> : <>Aula ao <span>Vivo</span></>}
          </h1>
          <p style={{ fontSize: 11, color: "var(--gold-light)", opacity: 0.8, letterSpacing: 1, marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Sextas-feiras, às 19h30
          </p>
        </div>
        {activeSession && (
          <div className="ka-live-indicator" style={{ background: "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.08))", border: "1px solid rgba(52,211,153,0.30)", color: "#6ee7b7", boxShadow: "0 0 16px rgba(52,211,153,0.25)" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 6px #34d399", flexShrink: 0 }} />
            AO VIVO
          </div>
        )}
      </div>

      {/* Viewer */}
      <LiveViewer
        initialSession={activeSession ? { id: activeSession.id, title: activeSession.title, roomName: activeSession.roomName, youtubeUrl: activeSession.youtubeUrl } : null}
        displayName={session.user.name ?? "Aluno"}
        email={session.user.email ?? ""}
        currentUserId={session.user.id}
        currentUserRole={session.user.role ?? "STUDENT"}
      />
    </div>
  );
}
