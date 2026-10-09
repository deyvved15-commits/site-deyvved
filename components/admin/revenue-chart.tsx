function fmt(v: number) {
  return "R$ " + v.toFixed(2).replace(".", ",");
}

export default function RevenueChart({ months }: { months: { label: string; total: number }[] }) {
  const maxMonth = Math.max(...months.map(m => m.total), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 140 }}>
      {months.map((m, i) => {
        const h = Math.max(4, Math.round((m.total / maxMonth) * 110));
        const isLast = i === months.length - 1;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'Poppins',sans-serif" }}>
              {m.total > 0 ? fmt(m.total).replace("R$ ", "").split(",")[0] : ""}
            </span>
            <div style={{
              width: "100%", maxWidth: 48, height: h, borderRadius: "6px 6px 2px 2px",
              background: isLast ? "linear-gradient(180deg, #E8D5A8, #C9A97A)" : "linear-gradient(180deg, rgba(201,169,122,0.45), rgba(201,169,122,0.18))",
              boxShadow: isLast ? "0 0 14px rgba(201,169,122,0.35)" : "none",
              transition: "height 0.3s",
            }} />
            <span style={{ fontSize: 10, fontFamily: "'Cinzel',serif", letterSpacing: 1, textTransform: "uppercase", color: isLast ? "var(--gold-light)" : "var(--text-muted)" }}>
              {m.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
