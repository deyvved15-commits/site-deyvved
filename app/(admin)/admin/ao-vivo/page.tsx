import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LiveControls from "@/components/admin/live-controls";

export default async function AdminAoVivoPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const [activeSession, records] = await Promise.all([
    prisma.liveSession.findFirst({ where: { active: true }, orderBy: { createdAt: "desc" } }),
    prisma.liveAttendance.findMany({
      orderBy: [{ date: "desc" }, { joinedAt: "asc" }],
      include: { user: { select: { name: true, email: true, church: true } } },
    }),
  ]);

  const byDate = records.reduce<Record<string, typeof records>>((acc, r) => {
    if (!acc[r.date]) acc[r.date] = [];
    acc[r.date].push(r);
    return acc;
  }, {});
  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      {/* Header */}
      <div className="ka-live-header">
        <div style={{
          width: 44, height: 44, borderRadius: 14, flexShrink: 0,
          background: "linear-gradient(135deg, rgba(230,57,70,0.20), rgba(230,57,70,0.08))",
          border: "1px solid rgba(230,57,70,0.30)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 20px rgba(230,57,70,0.20)",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF8088" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="14" height="12" rx="2"/><path d="M22 8l-6 4 6 4V8z"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div className="ka-page-eyebrow" style={{ marginBottom: 4 }}>Transmissões</div>
          <h1 className="ka-page-title" style={{ fontSize: 22 }}>
            Gerenciar <span>Ao Vivo</span>
          </h1>
        </div>
        {activeSession && (
          <div className="ka-live-indicator">
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF8088", boxShadow: "0 0 6px #FF8088", flexShrink: 0 }} />
            AO VIVO
          </div>
        )}
      </div>

      <div className="ka-section" style={{ padding: "28px 44px 44px" }}>

        {/* Live controls (client) */}
        <LiveControls activeSession={activeSession ? { ...activeSession, createdAt: activeSession.createdAt.toISOString() } : null} />

        {/* Attendance history */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ width: 3, height: 16, background: "linear-gradient(180deg, var(--gold-light), var(--gold))", borderRadius: 2, boxShadow: "0 0 8px var(--gold)" }} />
          <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-primary)" }}>
            Histórico de Presenças
          </h2>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>
            {records.length} registro{records.length !== 1 ? "s" : ""}
          </span>
        </div>

        {dates.length === 0 ? (
          <div style={{
            borderRadius: 16, padding: "40px 24px", textAlign: "center",
            background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
            border: "1px solid rgba(201,169,122,0.10)",
          }}>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Nenhuma presença registrada ainda.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {dates.map((date) => {
              const attendees = byDate[date];
              const [year, month, day] = date.split("-");
              const label = `${day}/${month}/${year}`;
              return (
                <div key={date} style={{
                  borderRadius: 16, overflow: "hidden",
                  background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)",
                  border: "1px solid rgba(201,169,122,0.10)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                }}>
                  <div style={{
                    padding: "12px 20px", borderBottom: "1px solid rgba(201,169,122,0.08)",
                    background: "rgba(201,169,122,0.03)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span style={{ fontFamily: "'Cinzel',serif", fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "var(--text-primary)" }}>{label}</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, background: "rgba(201,169,122,0.08)", border: "1px solid var(--gold-20)", color: "var(--gold)", padding: "2px 10px", borderRadius: 999, fontFamily: "'Cinzel',serif" }}>
                      {attendees.length} presença{attendees.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {attendees.map((r, i) => (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", borderTop: i > 0 ? "1px solid rgba(201,169,122,0.05)" : "none" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(201,169,122,0.35)", width: 18, flexShrink: 0, fontFamily: "'Cinzel',serif" }}>{i + 1}</span>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: "radial-gradient(circle at 30% 30%, var(--gold-bright), var(--gold) 50%, var(--gold-deep))", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 10, color: "var(--navy-darkest)" }}>
                        {r.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.user.name}</p>
                        <p style={{ fontSize: 10, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.user.email}</p>
                      </div>
                      {r.user.church && (
                        <span style={{ fontSize: 9, fontWeight: 600, background: "rgba(201,169,122,0.08)", border: "1px solid var(--gold-20)", color: "var(--gold)", padding: "2px 8px", borderRadius: 999, flexShrink: 0 }}>{r.user.church}</span>
                      )}
                      <span style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>
                        {new Date(r.joinedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
