import React from "react";

export default function CoursesLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      
      {/* ── Header Skeleton ── */}
      <div style={{ padding: "36px 44px 28px", borderBottom: "1px solid rgba(201,169,122,0.10)" }}>
        <div className="ka-skeleton" style={{ width: 150, height: 12, marginBottom: 8 }} />
        <div className="ka-skeleton" style={{ width: 300, height: 32, marginBottom: 6 }} />
        <div className="ka-skeleton" style={{ width: 400, height: 16 }} />
      </div>

      {/* ── Grid Skeleton ── */}
      <section className="ka-section" style={{ padding: "44px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 32 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
    </div>
  );
}
