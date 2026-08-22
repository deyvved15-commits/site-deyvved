"use client";

import { useState, useRef, useEffect, useId } from "react";

export interface KaSelectOption {
  value: string;
  label: string;
}

interface KaSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: KaSelectOption[];
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
}

export function KaSelect({
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  style,
  className,
  disabled,
}: KaSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <>
      <style>{`
        .ka-select-option-${id.replace(/:/g, "")}:hover {
          background: rgba(201,169,122,0.08) !important;
          color: #E8D5A8 !important;
        }
        .ka-select-trigger-${id.replace(/:/g, "")}:hover {
          border-color: rgba(201,169,122,0.40) !important;
          background: rgba(15,26,61,1) !important;
        }
        @keyframes ka-select-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        ref={ref}
        style={{ position: "relative", width: "100%", ...style }}
        className={className}
      >
        {/* Trigger */}
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className={`ka-select-trigger-${id.replace(/:/g, "")}`}
          style={{
            width: "100%",
            padding: "11px 40px 11px 14px",
            background: "rgba(15,26,61,0.98)",
            border: `1px solid ${open ? "rgba(201,169,122,0.55)" : "rgba(201,169,122,0.22)"}`,
            borderRadius: open ? "12px 12px 0 0" : "12px",
            color: selected ? "#F5EFE0" : "rgba(245,239,224,0.35)",
            fontSize: 13,
            fontFamily: "var(--font-poppins, 'Poppins', sans-serif)",
            cursor: disabled ? "not-allowed" : "pointer",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            boxShadow: open ? "0 0 0 3px rgba(201,169,122,0.10)" : "none",
            transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
            outline: "none",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selected?.label ?? placeholder}
          </span>
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="#C9A97A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1)",
              flexShrink: 0,
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Dropdown panel */}
        {open && (
          <div
            role="listbox"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "linear-gradient(160deg, #091028 0%, #0E1A3A 100%)",
              border: "1px solid rgba(201,169,122,0.30)",
              borderTop: "1px solid rgba(201,169,122,0.12)",
              borderRadius: "0 0 12px 12px",
              overflow: "hidden",
              zIndex: 9999,
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.65), 0 4px 16px rgba(0,0,0,0.40), 0 0 0 1px rgba(201,169,122,0.06)",
              maxHeight: 280,
              overflowY: "auto",
              animation: "ka-select-in 0.18s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {options.map((option, i) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`ka-select-option-${id.replace(/:/g, "")}`}
                  style={{
                    width: "100%",
                    padding: "11px 16px",
                    background: isSelected
                      ? "rgba(201,169,122,0.14)"
                      : "transparent",
                    border: "none",
                    borderBottom:
                      i < options.length - 1
                        ? "1px solid rgba(201,169,122,0.06)"
                        : "none",
                    color: isSelected ? "#E8D5A8" : "#D4CDB8",
                    fontSize: 13,
                    fontFamily: "var(--font-poppins, 'Poppins', sans-serif)",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  <span
                    style={{
                      width: 14,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSelected && (
                      <svg
                        width="10" height="10" viewBox="0 0 24 24" fill="none"
                        stroke="#C9A97A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
