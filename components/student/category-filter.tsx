"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function CategoryFilter({ categories }: { categories: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("categoria") || "todos";

  function setCategory(cat: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "todos") {
      params.delete("categoria");
    } else {
      params.set("categoria", cat);
    }
    router.push(`/cursos?${params.toString()}`);
  }

  return (
    <div style={{ 
      display: "flex", 
      gap: 12, 
      marginBottom: 32, 
      overflowX: "auto", 
      paddingBottom: 8,
      scrollbarWidth: "none"
    }}>
      <button 
        onClick={() => setCategory("todos")}
        style={{
          padding: "8px 18px",
          borderRadius: "var(--radius-xl)",
          fontSize: 11,
          fontFamily: "var(--font-cinzel)",
          fontWeight: 600,
          letterSpacing: 2,
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "all 0.2s",
          whiteSpace: "nowrap",
          ...(active === "todos" 
            ? { background: "var(--gold)", color: "var(--navy-darkest)", border: "none" }
            : { background: "rgba(255,255,255,0.03)", color: "var(--text-muted)", border: "1px solid rgba(255,255,255,0.1)" })
        }}
      >
        Todos
      </button>
      {categories.map(cat => (
        <button 
          key={cat}
          onClick={() => setCategory(cat)}
          style={{
            padding: "8px 18px",
            borderRadius: "var(--radius-xl)",
            fontSize: 11,
            fontFamily: "var(--font-cinzel)",
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
            ...(active === cat 
              ? { background: "var(--gold)", color: "var(--navy-darkest)", border: "none" }
              : { background: "rgba(255,255,255,0.03)", color: "var(--text-muted)", border: "1px solid rgba(255,255,255,0.1)" })
          }}
        >
          {cat}
        </button>
      ))}
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
