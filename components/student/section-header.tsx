import React from "react";

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  highlight?: string;
  subtitle?: string;
}

export default function SectionHeader({ icon, title, highlight, subtitle }: SectionHeaderProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26 }}>
      <div style={{
        width: 38, height: 38, borderRadius: "var(--radius-md)",
        background: "linear-gradient(135deg, rgba(201,169,122,0.20), rgba(201,169,122,0.05))",
        border: "1px solid var(--gold-35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--gold-light)", boxShadow: "0 0 14px rgba(201,169,122,0.18)",
      }}>
        {icon}
      </div>
      <div>
        <h2 style={{ 
          fontFamily: "var(--font-cinzel)",
          fontWeight: 600, 
          fontSize: subtitle ? 18 : 22, 
          letterSpacing: 3, 
          color: subtitle ? "var(--text-secondary)" : "var(--text-primary)", 
          textTransform: "uppercase" 
        }}>
          {title} {highlight && <span style={{ color: "var(--gold-light)" }}>{highlight}</span>}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3, fontFamily: "var(--font-poppins)" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
