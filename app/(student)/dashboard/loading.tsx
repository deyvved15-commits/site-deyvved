import React from "react";

export default function DashboardLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      
      {/* ── Hero Skeleton ── */}
      <section className="ka-hero">
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="ka-skeleton" style={{ width: 100, height: 100, borderRadius: "50%", marginBottom: 18 }} />
          <div className="ka-skeleton" style={{ width: 300, height: 40, marginBottom: 14 }} />
          <div className="ka-skeleton" style={{ width: 200, height: 20, marginBottom: 10 }} />
          <div className="ka-skeleton" style={{ width: 150, height: 16 }} />
        </div>
      </section>

      {/* ── Section Skeleton ── */}
      <section className="ka-section" style={{ padding: "38px 44px 44px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26 }}>
          <div className="ka-skeleton" style={{ width: 38, height: 38, borderRadius: 12 }} />
          <div className="ka-skeleton" style={{ width: 200, height: 24 }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 280px))", gap: 24 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="ka-card" style={{ height: 480, border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="ka-skeleton" style={{ height: 345, borderRadius: 0 }} />
              <div style={{ padding: "20px 22px 22px" }}>
                <div className="ka-skeleton" style={{ width: "80%", height: 20, marginBottom: 12 }} />
                <div className="ka-skeleton" style={{ width: "50%", height: 14, marginBottom: 16 }} />
                <div className="ka-skeleton" style={{ width: "100%", height: 40, borderRadius: 12 }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Vitrine Skeleton ── */}
      <section className="ka-section" style={{ padding: "0 44px 56px" }}>
        <div className="ka-skeleton" style={{ height: 1, width: "100%", marginBottom: 36, opacity: 0.2 }} />
        
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26 }}>
          <div className="ka-skeleton" style={{ width: 38, height: 38, borderRadius: 12 }} />
          <div>
            <div className="ka-skeleton" style={{ width: 250, height: 24, marginBottom: 6 }} />
            <div className="ka-skeleton" style={{ width: 180, height: 14 }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 280px))", gap: 24 }}>
          {[1, 2].map((i) => (
            <div key={i} className="ka-card" style={{ height: 480, border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="ka-skeleton" style={{ height: 345, borderRadius: 0 }} />
              <div style={{ padding: "20px 22px 22px" }}>
                <div className="ka-skeleton" style={{ width: "80%", height: 20, marginBottom: 12 }} />
                <div className="ka-skeleton" style={{ width: "60%", height: 14, marginBottom: 16 }} />
                <div className="ka-skeleton" style={{ width: "100%", height: 40, borderRadius: 12 }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
