export default function CursoLoading() {
  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      {/* Back */}
      <div style={{ padding: "10px 44px 0" }}>
        <div className="ka-skeleton" style={{ width: 100, height: 14, borderRadius: 6 }} />
      </div>

      {/* Course header strip */}
      <div style={{ margin: "16px clamp(16px,4vw,44px) 0", borderRadius: 20, overflow: "hidden" }}>
        <div style={{
          height: 120, borderRadius: 20, overflow: "hidden",
          background: "linear-gradient(135deg, #060D1F, #0F1A3D)",
          border: "1px solid rgba(201,169,122,0.10)",
          display: "flex", alignItems: "center", padding: "0 32px", gap: 24,
        }}>
          <div className="ka-skeleton" style={{ width: 60, height: 74, borderRadius: 10, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="ka-skeleton" style={{ width: 80, height: 10, marginBottom: 10 }} />
            <div className="ka-skeleton" style={{ width: 260, height: 22, marginBottom: 12 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="ka-skeleton" style={{ flex: 1, maxWidth: 200, height: 6, borderRadius: 999 }} />
              <div className="ka-skeleton" style={{ width: 30, height: 12 }} />
              <div className="ka-skeleton" style={{ width: 70, height: 12 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Modules section */}
      <section style={{ padding: "32px 44px 44px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div className="ka-skeleton" style={{ width: 36, height: 36, borderRadius: 10 }} />
          <div className="ka-skeleton" style={{ width: 220, height: 22 }} />
        </div>

        {/* Carousel skeletons */}
        <div style={{ display: "flex", gap: 24 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="ka-card" style={{ flexShrink: 0, width: 280, border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="ka-skeleton" style={{ aspectRatio: "4/5", borderRadius: 0 }} />
              <div style={{ padding: "18px 20px 20px" }}>
                <div className="ka-skeleton" style={{ width: "80%", height: 16, marginBottom: 10 }} />
                <div className="ka-skeleton" style={{ width: "50%", height: 12, marginBottom: 14 }} />
                <div className="ka-skeleton" style={{ width: "100%", height: 6, borderRadius: 999, marginBottom: 14 }} />
                <div className="ka-skeleton" style={{ width: "100%", height: 40, borderRadius: 12 }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
