"use client";
import { useState, useRef, useEffect } from "react";

export type LayoutElement = {
  id: string;
  label: string;
  x: number;   // 0–100 (% da largura, âncora do alinhamento)
  y: number;   // 0–100 (% da altura, centro vertical)
  fontSize: number;
  color: string;
  fontFamily: "Cinzel" | "Poppins";
  bold: boolean;
  align: "left" | "center" | "right";
  visible: boolean;
};

export const DEFAULT_LAYOUT: LayoutElement[] = [
  { id: "studentName",  label: "Nome do Aluno (1)",    x: 50, y: 43, fontSize: 32, color: "#000000", fontFamily: "Cinzel",  bold: true,  align: "center", visible: true },
  { id: "studentName2", label: "Nome do Aluno (2)",    x: 50, y: 50, fontSize: 20, color: "#333333", fontFamily: "Cinzel",  bold: false, align: "center", visible: true },
  { id: "customText",   label: "Texto Descritivo",     x: 50, y: 58, fontSize: 12, color: "#555555", fontFamily: "Poppins", bold: false, align: "center", visible: true },
  { id: "courseTitle",  label: "Título do Curso",      x: 50, y: 66, fontSize: 20, color: "#111111", fontFamily: "Cinzel",  bold: true,  align: "center", visible: true },
  { id: "date",         label: "Data de Emissão",      x: 18, y: 85, fontSize: 11, color: "#333333", fontFamily: "Poppins", bold: false, align: "left",   visible: true },
  { id: "teacherName",  label: "Nome do Professor",    x: 50, y: 85, fontSize: 12, color: "#000000", fontFamily: "Poppins", bold: true,  align: "center", visible: true },
  { id: "certId",       label: "ID do Certificado",   x: 82, y: 87, fontSize:  8, color: "#aaaaaa", fontFamily: "Poppins", bold: false, align: "right",  visible: true },
];

const SAMPLE: Record<string, string> = {
  studentName:  "NOME DO ALUNO",
  studentName2: "NOME DO ALUNO",
  customText:   "concluiu com aproveitamento o curso de formação em",
  courseTitle:  "Título do Curso",
  date:         "01 de junho de 2026",
  teacherName:  "Prof. Nome do Professor",
  certId:       "ID: CERT-XXXXXXXX",
};

const LS: React.CSSProperties = {
  fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.35)",
  textTransform: "uppercase", display: "block", marginBottom: 4,
  fontFamily: "'Poppins', sans-serif",
};
const IS: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(201,169,122,0.15)", borderRadius: 8,
  padding: "7px 10px", fontSize: 12, color: "#fff", outline: "none",
};

export default function CertificateLayoutEditor({
  bgUrl,
  courseTitle,
  customText,
  value,
  onChange,
}: {
  bgUrl?: string | null;
  courseTitle: string;
  customText?: string | null;
  value: LayoutElement[] | null;
  onChange: (l: LayoutElement[]) => void;
}) {
  const [elements, setElements] = useState<LayoutElement[]>(() => {
    if (value && Array.isArray(value) && value.length > 0) return value as LayoutElement[];
    return DEFAULT_LAYOUT;
  });
  const [selected, setSelected] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<string | null>(null);
  const elementsRef = useRef(elements);
  elementsRef.current = elements;
  const [previewW, setPreviewW] = useState(700);

  useEffect(() => {
    if (!previewRef.current) return;
    const ro = new ResizeObserver(([e]) => setPreviewW(e.contentRect.width));
    ro.observe(previewRef.current);
    return () => ro.disconnect();
  }, []);

  const scale = previewW / 1000;

  const update = (id: string, patch: Partial<LayoutElement>) => {
    const next = elementsRef.current.map(e => e.id === id ? { ...e, ...patch } : e);
    setElements(next);
    onChange(next);
  };

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.preventDefault();
    setSelected(id);
    dragRef.current = id;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent, id: string) => {
    if (dragRef.current !== id || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = Math.round(Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.round(Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)));
    setElements(prev => prev.map(el => el.id === id ? { ...el, x, y } : el));
  };

  const handlePointerUp = (id: string) => {
    if (dragRef.current === id) {
      dragRef.current = null;
      onChange(elementsRef.current);
    }
  };

  const sel = selected ? elements.find(e => e.id === selected) ?? null : null;

  const sampleValues: Record<string, string> = {
    ...SAMPLE,
    courseTitle: courseTitle || SAMPLE.courseTitle,
    customText: customText || SAMPLE.customText,
  };

  return (
    <div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');`}</style>

      {/* ── PREVIEW ── */}
      <div
        ref={previewRef}
        style={{
          position: "relative", width: "100%", aspectRatio: "1.414 / 1",
          background: bgUrl ? `url('${bgUrl}') center/cover no-repeat` : "#f8f6f0",
          borderRadius: 8, overflow: "hidden",
          border: "1px solid rgba(201,169,122,0.30)",
          userSelect: "none",
        }}
      >
        {!bgUrl && (
          <>
            <div style={{ position: "absolute", inset: 12, border: "2px solid rgba(201,169,122,0.45)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: 20, border: "1px solid rgba(201,169,122,0.25)", pointerEvents: "none" }} />
            <p style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
              fontSize: 11 * scale, color: "rgba(0,0,0,0.20)", fontFamily: "'Poppins',sans-serif",
              pointerEvents: "none", whiteSpace: "nowrap",
            }}>
              Adicione uma imagem de fundo para ver o resultado real
            </p>
          </>
        )}

        {elements.map(el => {
          if (!el.visible) return null;
          const isSelected = selected === el.id;
          const translateX = el.align === "center" ? "-50%" : el.align === "right" ? "-100%" : "0";
          return (
            <div
              key={el.id}
              style={{
                position: "absolute",
                left: `${el.x}%`,
                top: `${el.y}%`,
                transform: `translate(${translateX}, -50%)`,
                fontSize: el.fontSize * scale,
                color: el.color,
                fontFamily: el.fontFamily === "Cinzel" ? "'Cinzel', serif" : "'Poppins', sans-serif",
                fontWeight: el.bold ? 700 : 400,
                whiteSpace: "pre-line",
                lineHeight: 1.2,
                cursor: "move",
                touchAction: "none",
                outline: isSelected ? "1.5px dashed #C9A97A" : "none",
                outlineOffset: 4,
                padding: `${2 * scale}px ${4 * scale}px`,
                background: isSelected ? "rgba(201,169,122,0.10)" : "transparent",
                borderRadius: 3,
                zIndex: isSelected ? 10 : 1,
              }}
              onPointerDown={e => handlePointerDown(e, el.id)}
              onPointerMove={e => handlePointerMove(e, el.id)}
              onPointerUp={() => handlePointerUp(el.id)}
              onClick={() => setSelected(el.id)}
            >
              {sampleValues[el.id] || el.label}
            </div>
          );
        })}

        <div style={{
          position: "absolute", bottom: 6, right: 8,
          fontSize: Math.max(8, 9 * scale), color: "rgba(0,0,0,0.25)",
          pointerEvents: "none", fontFamily: "Poppins, sans-serif",
        }}>
          Arraste para posicionar
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        {/* Lista de elementos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ fontSize: 9, letterSpacing: 3, color: "var(--gold)", textTransform: "uppercase", fontFamily: "'Cinzel',serif", marginBottom: 4, margin: "0 0 8px" }}>
            Elementos
          </p>

          {elements.map(el => (
            <button
              key={el.id}
              type="button"
              onClick={() => setSelected(el.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 10px", borderRadius: 10, cursor: "pointer",
                textAlign: "left", border: "none",
                background: selected === el.id ? "rgba(201,169,122,0.14)" : "rgba(255,255,255,0.03)",
                outline: selected === el.id ? "1px solid rgba(201,169,122,0.40)" : "1px solid rgba(255,255,255,0.05)",
                color: el.visible ? "#fff" : "rgba(255,255,255,0.28)",
                fontSize: 12, transition: "all 0.15s",
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: el.color, flexShrink: 0, border: "1px solid rgba(255,255,255,0.2)" }} />
              <span style={{ flex: 1 }}>{el.label}</span>
              {/* toggle visibilidade */}
              <span
                onClick={e => { e.stopPropagation(); update(el.id, { visible: !el.visible }); }}
                style={{ color: el.visible ? "rgba(201,169,122,0.7)" : "rgba(255,255,255,0.2)", lineHeight: 1, cursor: "pointer" }}
              >
                {el.visible ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                )}
              </span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => { setElements(DEFAULT_LAYOUT); onChange(DEFAULT_LAYOUT); }}
            style={{
              marginTop: 6, padding: "6px 10px", borderRadius: 8, fontSize: 10,
              background: "transparent", border: "1px solid rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.28)", cursor: "pointer",
            }}
          >
            Restaurar padrão
          </button>
        </div>

        {/* Controles do elemento selecionado */}
        <div>
          {sel ? (
            <>
              <p style={{ fontSize: 9, letterSpacing: 3, color: "var(--gold)", textTransform: "uppercase", fontFamily: "'Cinzel',serif", margin: "0 0 12px" }}>
                {sel.label}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* X e Y */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <label style={LS}>X (%)</label>
                    <input type="number" min={0} max={100} value={sel.x}
                      onChange={e => update(sel.id, { x: Number(e.target.value) })} style={IS} />
                  </div>
                  <div>
                    <label style={LS}>Y (%)</label>
                    <input type="number" min={0} max={100} value={sel.y}
                      onChange={e => update(sel.id, { y: Number(e.target.value) })} style={IS} />
                  </div>
                </div>

                {/* Tamanho + Cor */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <label style={LS}>Tamanho (px)</label>
                    <input type="number" min={6} max={96} value={sel.fontSize}
                      onChange={e => update(sel.id, { fontSize: Number(e.target.value) })} style={IS} />
                  </div>
                  <div>
                    <label style={LS}>Cor do Texto</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input type="color" value={sel.color}
                        onChange={e => update(sel.id, { color: e.target.value })}
                        style={{ width: 32, height: 32, padding: 2, border: "1px solid rgba(201,169,122,0.2)", background: "none", cursor: "pointer", borderRadius: 6 }} />
                      <input value={sel.color}
                        onChange={e => update(sel.id, { color: e.target.value })}
                        style={{ ...IS, flex: 1 }} />
                    </div>
                  </div>
                </div>

                {/* Fonte + Negrito */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <label style={LS}>Fonte</label>
                    <select value={sel.fontFamily}
                      onChange={e => update(sel.id, { fontFamily: e.target.value as "Cinzel" | "Poppins" })}
                      style={{ ...IS, paddingRight: 6 }}>
                      <option value="Cinzel">Cinzel (Clássica)</option>
                      <option value="Poppins">Poppins (Moderna)</option>
                    </select>
                  </div>
                  <div>
                    <label style={LS}>Negrito</label>
                    <button
                      type="button"
                      onClick={() => update(sel.id, { bold: !sel.bold })}
                      style={{
                        width: "100%", padding: "7px", borderRadius: 8, cursor: "pointer",
                        fontSize: 14, fontWeight: 700,
                        background: sel.bold ? "rgba(201,169,122,0.18)" : "rgba(255,255,255,0.03)",
                        border: sel.bold ? "1px solid rgba(201,169,122,0.50)" : "1px solid rgba(255,255,255,0.07)",
                        color: sel.bold ? "#C9A97A" : "rgba(255,255,255,0.35)",
                      }}
                    >
                      B
                    </button>
                  </div>
                </div>

                {/* Alinhamento */}
                <div>
                  <label style={LS}>Alinhamento</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    {(["left", "center", "right"] as const).map(a => (
                      <button key={a} type="button" onClick={() => update(sel.id, { align: a })} style={{
                        flex: 1, padding: "7px", borderRadius: 7, cursor: "pointer",
                        background: sel.align === a ? "rgba(201,169,122,0.18)" : "rgba(255,255,255,0.03)",
                        border: sel.align === a ? "1px solid rgba(201,169,122,0.50)" : "1px solid rgba(255,255,255,0.07)",
                        color: sel.align === a ? "#C9A97A" : "rgba(255,255,255,0.28)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {a === "left" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>}
                        {a === "center" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="10" x2="7" y2="10"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="7" y2="18"/></svg>}
                        {a === "right" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ paddingTop: 36, textAlign: "center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,122,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 10 }}>
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", fontFamily: "'Poppins',sans-serif" }}>
                Clique em um texto no<br />preview para editar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
