export default function AdminLoading({ rows = 6 }: { rows?: number }) {
  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)", animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}>
      {/* Header skeleton */}
      <div className="ka-page-header">
        <div style={{ width: 80, height: 10, borderRadius: 4, background: "rgba(201,169,122,0.12)", marginBottom: 12 }} />
        <div style={{ width: 200, height: 24, borderRadius: 6, background: "rgba(255,255,255,0.06)", marginBottom: 10 }} />
        <div style={{ width: 140, height: 12, borderRadius: 4, background: "rgba(255,255,255,0.04)" }} />
      </div>

      <div className="ka-section">
        <div style={{ borderRadius: 20, overflow: "hidden", background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)", border: "1px solid rgba(201,169,122,0.08)" }}>
          {/* Table header skeleton */}
          <div style={{ padding: "14px 24px", borderBottom: "1px solid rgba(201,169,122,0.06)", display: "flex", gap: 24 }}>
            {[120, 160, 80, 100, 80].map((w, i) => (
              <div key={i} style={{ width: w, height: 10, borderRadius: 4, background: "rgba(201,169,122,0.10)" }} />
            ))}
          </div>
          {/* Row skeletons */}
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} style={{ padding: "20px 24px", borderTop: i > 0 ? "1px solid rgba(201,169,122,0.05)" : "none", display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(201,169,122,0.08)", flexShrink: 0 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ width: `${140 + (i % 3) * 40}px`, height: 14, borderRadius: 4, background: "rgba(255,255,255,0.06)" }} />
                <div style={{ width: `${100 + (i % 2) * 60}px`, height: 10, borderRadius: 4, background: "rgba(255,255,255,0.03)" }} />
              </div>
              <div style={{ width: 80, height: 32, borderRadius: 10, background: "rgba(201,169,122,0.06)", flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
