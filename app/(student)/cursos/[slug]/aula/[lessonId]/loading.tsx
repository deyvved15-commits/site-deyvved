export default function AulaLoading() {
  return (
    <div style={{ display: "flex", height: "100%", background: "var(--navy-darkest)" }}>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

        {/* Top bar */}
        <div style={{
          padding: "14px 28px",
          borderBottom: "1px solid rgba(201,169,122,0.10)",
          display: "flex", alignItems: "center", gap: 14, flexShrink: 0,
          background: "linear-gradient(135deg, rgba(201,169,122,0.03) 0%, transparent 100%)",
        }}>
          <div className="ka-skeleton" style={{ width: 90, height: 12, borderRadius: 6 }} />
          <div style={{ flex: 1 }} />
          <div className="ka-skeleton" style={{ width: 180, height: 6, borderRadius: 999 }} />
          <div className="ka-skeleton" style={{ width: 36, height: 20, borderRadius: 4 }} />
        </div>

        {/* Video skeleton */}
        <div className="ka-skeleton" style={{ width: "100%", aspectRatio: "16/9", borderRadius: 0, flexShrink: 0 }} />

        {/* Lesson info */}
        <div style={{ padding: "28px 32px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <div className="ka-skeleton" style={{ width: "65%", height: 28, marginBottom: 12 }} />
              <div className="ka-skeleton" style={{ width: 150, height: 14 }} />
            </div>
            <div className="ka-skeleton" style={{ width: 120, height: 40, borderRadius: 12, flexShrink: 0 }} />
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
            <div className="ka-skeleton" style={{ width: 100, height: 36, borderRadius: 10 }} />
            <div className="ka-skeleton" style={{ width: 100, height: 36, borderRadius: 10 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="ka-skeleton" style={{ width: "100%", height: 14 }} />
            <div className="ka-skeleton" style={{ width: "90%", height: 14 }} />
            <div className="ka-skeleton" style={{ width: "75%", height: 14 }} />
          </div>
        </div>
      </div>

      {/* Lesson drawer skeleton (hidden on mobile) */}
      <div style={{ width: 300, flexShrink: 0, borderLeft: "1px solid rgba(201,169,122,0.10)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 16px 12px", borderBottom: "1px solid rgba(201,169,122,0.08)" }}>
          <div className="ka-skeleton" style={{ width: 120, height: 10 }} />
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ padding: "11px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div className="ka-skeleton" style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="ka-skeleton" style={{ width: "80%", height: 12, marginBottom: 5 }} />
              <div className="ka-skeleton" style={{ width: 50, height: 10 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
