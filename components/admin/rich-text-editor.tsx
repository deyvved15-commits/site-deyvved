"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import { useState, useEffect } from "react";

const COLORS = ["#F5EFE0", "#C9A97A", "#E8D5A8", "#6ee7b7", "#FF8088", "#93C5FD", "#000000"];

function ToolbarBtn({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        width: 30, height: 30, borderRadius: 7,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: active ? "rgba(201,169,122,0.25)" : "transparent",
        border: active ? "1px solid rgba(201,169,122,0.5)" : "1px solid transparent",
        color: active ? "#E8D5A8" : "rgba(255,255,255,0.65)",
        cursor: "pointer", fontSize: 13, fontWeight: 700,
        transition: "all 0.15s",
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const [fullscreen, setFullscreen] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Link.configure({ openOnClick: false, autolink: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        style: "min-height: 260px; outline: none; padding: 16px;",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sincroniza quando o value externo muda (ex: trocar de aula no admin)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const currentBlock = editor.isActive("heading", { level: 1 })
    ? "h1"
    : editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
    ? "h3"
    : "p";

  return (
    <div style={{
      border: "1px solid rgba(201,169,122,0.18)",
      borderRadius: 12,
      overflow: "hidden",
      background: "rgba(255,255,255,0.03)",
      position: fullscreen ? "fixed" : "relative",
      inset: fullscreen ? 0 : "auto",
      zIndex: fullscreen ? 9999 : "auto",
      display: fullscreen ? "flex" : "block",
      flexDirection: fullscreen ? "column" : undefined,
      height: fullscreen ? "100vh" : "auto",
    }}>
      {fullscreen && <div style={{ position: "absolute", inset: 0, background: "#060D1F", zIndex: -1 }} />}

      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap",
        padding: "8px 10px",
        background: "rgba(9,16,40,0.9)",
        borderBottom: "1px solid rgba(201,169,122,0.15)",
      }}>
        {/* Dropdown de bloco */}
        <select
          value={currentBlock}
          onChange={e => {
            const v = e.target.value;
            if (v === "p") editor.chain().focus().setParagraph().run();
            else if (v === "h1") editor.chain().focus().toggleHeading({ level: 1 }).run();
            else if (v === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
            else if (v === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
          }}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(201,169,122,0.20)",
            borderRadius: 8, color: "#E8D5A8", fontSize: 12,
            padding: "6px 8px", outline: "none", cursor: "pointer",
            fontFamily: "'Poppins',sans-serif",
          }}
        >
          <option value="p">Parágrafo</option>
          <option value="h1">Título 1</option>
          <option value="h2">Título 2</option>
          <option value="h3">Título 3</option>
        </select>

        <div style={{ width: 1, height: 20, background: "rgba(201,169,122,0.15)", margin: "0 4px" }} />

        <ToolbarBtn title="Negrito" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <span style={{ fontWeight: 900 }}>B</span>
        </ToolbarBtn>
        <ToolbarBtn title="Itálico" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <span style={{ fontStyle: "italic" }}>I</span>
        </ToolbarBtn>
        <ToolbarBtn title="Sublinhado" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <span style={{ textDecoration: "underline" }}>U</span>
        </ToolbarBtn>

        <div style={{ width: 1, height: 20, background: "rgba(201,169,122,0.15)", margin: "0 4px" }} />

        <ToolbarBtn title="Alinhar à esquerda" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
        </ToolbarBtn>
        <ToolbarBtn title="Centralizar" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
        </ToolbarBtn>
        <ToolbarBtn title="Alinhar à direita" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
        </ToolbarBtn>
        <ToolbarBtn title="Justificar" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </ToolbarBtn>

        <div style={{ width: 1, height: 20, background: "rgba(201,169,122,0.15)", margin: "0 4px" }} />

        {/* Cor de texto */}
        <div style={{ position: "relative" }}>
          <ToolbarBtn title="Cor do texto" onClick={() => setShowColors(s => !s)}>
            <span style={{ fontWeight: 900, color: editor.getAttributes("textStyle").color || undefined }}>A</span>
          </ToolbarBtn>
          {showColors && (
            <div style={{
              position: "absolute", top: 34, left: 0, zIndex: 10,
              display: "flex", gap: 6, padding: 8, borderRadius: 8,
              background: "#0F172A", border: "1px solid rgba(201,169,122,0.25)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { editor.chain().focus().setColor(c).run(); setShowColors(false); }}
                  style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer" }}
                  title={c}
                />
              ))}
              <button
                type="button"
                onClick={() => { editor.chain().focus().unsetColor().run(); setShowColors(false); }}
                title="Remover cor"
                style={{ width: 20, height: 20, borderRadius: "50%", background: "transparent", border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer", color: "#fff", fontSize: 10, lineHeight: "18px" }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div style={{ width: 1, height: 20, background: "rgba(201,169,122,0.15)", margin: "0 4px" }} />

        <ToolbarBtn title="Lista com marcador" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="9" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
        </ToolbarBtn>
        <ToolbarBtn title="Lista numerada" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M4 14h2c0 0 0 1 -1 1.5s-1 1.5 -1 1.5h2"/></svg>
        </ToolbarBtn>

        <div style={{ width: 1, height: 20, background: "rgba(201,169,122,0.15)", margin: "0 4px" }} />

        {/* Link */}
        <div style={{ position: "relative" }}>
          <ToolbarBtn title="Link" active={editor.isActive("link")} onClick={() => {
            if (editor.isActive("link")) { editor.chain().focus().unsetLink().run(); return; }
            setLinkUrl("");
            setShowLinkInput(s => !s);
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </ToolbarBtn>
          {showLinkInput && (
            <div style={{
              position: "absolute", top: 34, left: 0, zIndex: 10,
              display: "flex", gap: 6, padding: 8, borderRadius: 8,
              background: "#0F172A", border: "1px solid rgba(201,169,122,0.25)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}>
              <input
                autoFocus
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && linkUrl.trim()) {
                    editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
                    setShowLinkInput(false);
                  }
                  if (e.key === "Escape") setShowLinkInput(false);
                }}
                placeholder="https://..."
                style={{ width: 180, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,169,122,0.2)", borderRadius: 6, color: "#fff", fontSize: 12, padding: "5px 8px", outline: "none" }}
              />
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />

        <ToolbarBtn title={fullscreen ? "Sair da tela cheia" : "Tela cheia"} onClick={() => setFullscreen(f => !f)}>
          {fullscreen ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
          )}
        </ToolbarBtn>
      </div>

      {/* Editor area */}
      <div
        onClick={() => { setShowColors(false); setShowLinkInput(false); }}
        style={{
          flex: fullscreen ? 1 : undefined,
          overflowY: fullscreen ? "auto" : "visible",
          background: "#0B1330",
          color: "#E4D9CF",
          fontFamily: "'Merriweather',serif",
          fontSize: 14,
          lineHeight: 1.8,
        }}
      >
        <EditorContent editor={editor} className="ka-rte" />
      </div>

      <style>{`
        .ka-rte .ProseMirror p.is-editor-empty:first-child::before {
          content: ${JSON.stringify(placeholder || "Cole ou digite o texto da apostila...")};
          color: rgba(255,255,255,0.25);
          float: left; height: 0; pointer-events: none;
        }
        .ka-rte .ProseMirror h1 { font-family: 'Cinzel',serif; font-size: 1.9em; font-weight: 700; color: #C9A97A; letter-spacing: 1px; margin: 0.8em 0 0.4em; }
        .ka-rte .ProseMirror h2 { font-family: 'Cinzel',serif; font-size: 1.5em; font-weight: 700; color: #C9A97A; margin: 0.7em 0 0.4em; }
        .ka-rte .ProseMirror h3 { font-family: 'Cinzel',serif; font-size: 1.2em; font-weight: 600; color: #E8D5A8; margin: 0.6em 0 0.3em; }
        .ka-rte .ProseMirror p { margin: 0 0 0.9em; }
        .ka-rte .ProseMirror ul, .ka-rte .ProseMirror ol { padding-left: 1.4em; margin: 0 0 0.9em; }
        .ka-rte .ProseMirror a { color: #93C5FD; }
        .ka-rte .ProseMirror:focus { outline: none; }
      `}</style>
    </div>
  );
}
