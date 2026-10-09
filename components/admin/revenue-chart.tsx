function fmt(v: number) {
  return "R$ " + v.toFixed(2).replace(".", ",");
}

interface MonthData {
  label: string;
  total: number;
  expense?: number;
}

export default function RevenueChart({ months }: { months: MonthData[] }) {
  const hasExpense = months.some(m => m.expense !== undefined);
  const maxVal = Math.max(...months.map(m => Math.max(m.total, m.expense ?? 0)), 1);

  return (
    <div>
      {hasExpense && (
        <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: "linear-gradient(180deg, #E8D5A8, #C9A97A)" }} />
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'Poppins',sans-serif" }}>Receita</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: "linear-gradient(180deg, #FF8088, #E63946)" }} />
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'Poppins',sans-serif" }}>Despesa</span>
          </div>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 140 }}>
        {months.map((m, i) => {
          const hRevenue = Math.max(4, Math.round((m.total / maxVal) * 110));
          const hExpense = m.expense !== undefined ? Math.max(4, Math.round((m.expense / maxVal) * 110)) : 0;
          const isLast = i === months.length - 1;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, width: "100%", justifyContent: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1, maxWidth: hasExpense ? 26 : 48 }}>
                  <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "'Poppins',sans-serif" }}>
                    {m.total > 0 ? fmt(m.total).replace("R$ ", "").split(",")[0] : ""}
                  </span>
                  <div style={{
                    width: "100%", height: hRevenue, borderRadius: "6px 6px 2px 2px",
                    background: isLast ? "linear-gradient(180deg, #E8D5A8, #C9A97A)" : "linear-gradient(180deg, rgba(201,169,122,0.45), rgba(201,169,122,0.18))",
                    boxShadow: isLast ? "0 0 14px rgba(201,169,122,0.35)" : "none",
                    transition: "height 0.3s",
                  }} />
                </div>
                {hasExpense && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1, maxWidth: 26 }}>
                    <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "'Poppins',sans-serif" }}>
                      {(m.expense ?? 0) > 0 ? fmt(m.expense ?? 0).replace("R$ ", "").split(",")[0] : ""}
                    </span>
                    <div style={{
                      width: "100%", height: hExpense, borderRadius: "6px 6px 2px 2px",
                      background: isLast ? "linear-gradient(180deg, #FF8088, #E63946)" : "linear-gradient(180deg, rgba(230,57,70,0.45), rgba(230,57,70,0.18))",
                      boxShadow: isLast ? "0 0 14px rgba(230,57,70,0.30)" : "none",
                      transition: "height 0.3s",
                    }} />
                  </div>
                )}
              </div>
              <span style={{ fontSize: 10, fontFamily: "'Cinzel',serif", letterSpacing: 1, textTransform: "uppercase", color: isLast ? "var(--gold-light)" : "var(--text-muted)" }}>
                {m.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
