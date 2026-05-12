"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

export default function SearchInput({ placeholder = "Pesquisar..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    const next = new URLSearchParams(params.toString());
    if (q) next.set("q", q); else next.delete("q");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`));
  }

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 340 }}>
      <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gold)", opacity: 0.6, pointerEvents: "none" }}
      >
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        type="search"
        defaultValue={params.get("q") ?? ""}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "10px 16px 10px 38px",
          background: "rgba(201,169,122,0.05)", border: "1px solid rgba(201,169,122,0.18)",
          borderRadius: 12, color: "var(--text-primary)", fontSize: 13,
          fontFamily: "'Poppins',sans-serif", outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,169,122,0.45)")}
        onBlur={e => (e.currentTarget.style.borderColor = "rgba(201,169,122,0.18)")}
      />
    </div>
  );
}
