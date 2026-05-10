"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getYoutubeId, getGoogleDriveImageUrl } from "@/lib/utils";
import { Plus, Trash2, ChevronDown, ChevronRight, Eye, EyeOff, Pencil, X, Check } from "lucide-react";

type Lesson = { id: string; title: string; youtubeUrl: string; duration: string | null; content: string | null; order: number; releaseAfterDays: number };
type Module = { id: string; title: string; thumbnail: string | null; order: number; lessons: Lesson[] };
type Course = { id: string; title: string; description: string | null; thumbnail: string | null; price: number | null; paymentType: "ONE_TIME" | "MONTHLY"; published: boolean; modules: Module[] };

const textareaClass = "w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(201,169,122,0.18)] rounded-xl px-4 py-3 text-sm text-white placeholder-[rgba(255,255,255,0.2)] outline-none resize-none focus:border-[rgba(201,169,122,0.5)] focus:bg-[rgba(255,255,255,0.06)] transition-all";
const labelClass = "text-[10px] tracking-[3px] uppercase text-[rgba(201,169,122,0.7)] font-medium mb-2 block";

export default function CourseEditor({ course: initial }: { course: Course }) {
  const router = useRouter();
  const [course, setCourse] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleThumbnail, setNewModuleThumbnail] = useState("");
  const [addingModule, setAddingModule] = useState(false);
  const [addingLesson, setAddingLesson] = useState<string | null>(null);
  const [newLesson, setNewLesson] = useState({ title: "", youtubeUrl: "", duration: "", content: "", releaseAfterDays: 0 });
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [editLesson, setEditLesson] = useState({ title: "", youtubeUrl: "", duration: "", content: "", releaseAfterDays: 0 });
  const [editSaving, setEditSaving] = useState(false);

  async function saveCourse() {
    setSaving(true);
    const res = await fetch(`/api/courses/${course.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: course.title, description: course.description, thumbnail: course.thumbnail, price: course.price, paymentType: course.paymentType, published: course.published }),
    });
    if (res.ok) router.refresh();
    setSaving(false);
  }

  async function addModule() {
    if (!newModuleTitle.trim()) return;
    const res = await fetch(`/api/courses/${course.id}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newModuleTitle, thumbnail: newModuleThumbnail || undefined }),
    });
    const mod = await res.json();
    setCourse(c => ({ ...c, modules: [...c.modules, { ...mod, lessons: [] }] }));
    setNewModuleTitle("");
    setNewModuleThumbnail("");
    setAddingModule(false);
  }

  async function deleteModule(moduleId: string) {
    if (!confirm("Excluir módulo e todas as aulas?")) return;
    await fetch(`/api/courses/${course.id}/modules/${moduleId}`, { method: "DELETE" });
    setCourse(c => ({ ...c, modules: c.modules.filter(m => m.id !== moduleId) }));
  }

  async function addLesson(moduleId: string) {
    if (!newLesson.title.trim() || !newLesson.youtubeUrl.trim()) return;
    const res = await fetch(`/api/courses/${course.id}/modules/${moduleId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLesson),
    });
    const lesson = await res.json();
    setCourse(c => ({ ...c, modules: c.modules.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, lesson] } : m) }));
    setNewLesson({ title: "", youtubeUrl: "", duration: "", content: "", releaseAfterDays: 0 });
    setAddingLesson(null);
  }

  async function deleteLesson(moduleId: string, lessonId: string) {
    if (!confirm("Excluir esta aula?")) return;
    await fetch(`/api/courses/${course.id}/modules/${moduleId}/lessons/${lessonId}`, { method: "DELETE" });
    setCourse(c => ({ ...c, modules: c.modules.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m) }));
  }

  function startEditLesson(lesson: Lesson) {
    setEditingLesson(lesson.id);
    setEditLesson({ title: lesson.title, youtubeUrl: lesson.youtubeUrl, duration: lesson.duration ?? "", content: lesson.content ?? "", releaseAfterDays: lesson.releaseAfterDays ?? 0 });
  }

  async function saveEditLesson(moduleId: string, lessonId: string) {
    setEditSaving(true);
    const res = await fetch(`/api/courses/${course.id}/modules/${moduleId}/lessons/${lessonId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editLesson),
    });
    const updated = await res.json();
    setCourse(c => ({ ...c, modules: c.modules.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...updated } : l) } : m) }));
    setEditingLesson(null);
    setEditSaving(false);
  }

  function toggleModule(id: string) {
    setOpenModules(s => ({ ...s, [id]: !s[id] }));
  }

  const S = {
    field: { display: "flex", flexDirection: "column" as const, gap: 6 },
    label: { fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" as const, color: "rgba(201,169,122,0.75)" },
    input: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,122,0.18)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#fff", outline: "none", width: "100%", fontFamily: "'Poppins',sans-serif", transition: "border-color 0.2s" } as React.CSSProperties,
    textarea: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,122,0.18)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#fff", outline: "none", width: "100%", fontFamily: "'Poppins',sans-serif", resize: "vertical" as const, lineHeight: 1.7 },
    sectionHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 20 },
    goldBar: { width: 3, height: 18, background: "linear-gradient(180deg, #E8D5A8, #C9A97A)", borderRadius: 2, boxShadow: "0 0 8px rgba(201,169,122,0.5)", flexShrink: 0 },
    card: { background: "linear-gradient(160deg, rgba(15,26,61,0.6) 0%, rgba(10,18,45,0.6) 100%)", border: "1px solid rgba(201,169,122,0.12)", borderRadius: 20, overflow: "hidden" as const },
    btnGold: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: "linear-gradient(135deg, rgba(201,169,122,0.15), rgba(201,169,122,0.05))", border: "1px solid rgba(201,169,122,0.3)", color: "#C9A97A", fontSize: 11, fontFamily: "'Cinzel',serif", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, cursor: "pointer" },
    btnPrimary: { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 12, background: "linear-gradient(135deg, #C9A97A, #A07840)", border: "none", color: "#060D1F", fontSize: 11, fontFamily: "'Cinzel',serif", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, cursor: "pointer", boxShadow: "0 4px 16px rgba(201,169,122,0.30)" } as React.CSSProperties,
    btnSave: { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 22px", borderRadius: 12, background: "linear-gradient(135deg, #C9A97A, #A07840)", border: "none", color: "#060D1F", fontSize: 11, fontFamily: "'Cinzel',serif", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, cursor: "pointer", boxShadow: "0 4px 16px rgba(201,169,122,0.35)", flexShrink: 0 } as React.CSSProperties,
    btnGhost: { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 12, background: "transparent", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.45)", fontSize: 11, fontFamily: "'Cinzel',serif", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, cursor: "pointer" } as React.CSSProperties,
    btnRed: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 6, borderRadius: 8, background: "transparent", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", transition: "all 0.2s" },
    btnEdit: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 6, borderRadius: 8, background: "transparent", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", transition: "all 0.2s" },
  };

  const thumbUrl = course.thumbnail?.includes("drive.google.com")
    ? getGoogleDriveImageUrl(course.thumbnail)
    : course.thumbnail;

  return (
    <div style={{ maxWidth: 900 }}>

      {/* ── Header sticky ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, marginBottom: 36, marginLeft: -44, marginRight: -44, padding: "16px 44px", background: "linear-gradient(180deg, rgba(6,13,31,0.98) 80%, transparent)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(201,169,122,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, maxWidth: 900 }}>
        <div>
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 5, textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>
            Editando Curso
          </p>
          <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 20, letterSpacing: 2, color: "var(--text-primary)", lineHeight: 1.2 }}>
            {course.title}
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <button onClick={() => setCourse(c => ({ ...c, published: !c.published }))} style={{
            display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 12, cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "'Cinzel',serif", letterSpacing: 1.5, textTransform: "uppercase", transition: "all 0.2s",
            ...(course.published
              ? { color: "#6ee7b7", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }
              : { color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }),
          }}>
            {course.published ? <><Eye size={13} /> Publicado</> : <><EyeOff size={13} /> Rascunho</>}
          </button>
          <button onClick={saveCourse} disabled={saving} style={{ ...S.btnSave, opacity: saving ? 0.6 : 1 }}>
            {saving ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            )}
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
      </div>

      {/* ── Dados do curso ── */}
      <div style={{ ...S.card, padding: 28, marginBottom: 24 }}>
        <div style={S.sectionHeader}>
          <div style={S.goldBar} />
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "var(--gold)" }}>
            Informações do Curso
          </span>
        </div>

        <div style={{ display: "grid", gap: 20 }}>
          {/* Título */}
          <div style={S.field}>
            <label style={S.label}>Título</label>
            <input style={S.input} value={course.title} onChange={e => setCourse(c => ({ ...c, title: e.target.value }))} placeholder="Nome do curso" />
          </div>

          {/* Descrição + thumbnail preview lado a lado */}
          <div style={{ display: "grid", gridTemplateColumns: thumbUrl ? "1fr 140px" : "1fr", gap: 20, alignItems: "start" }}>
            <div style={S.field}>
              <label style={S.label}>Descrição</label>
              <textarea style={S.textarea} rows={4} value={course.description ?? ""} onChange={e => setCourse(c => ({ ...c, description: e.target.value }))} placeholder="Descreva o curso..." />
            </div>
            {thumbUrl && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ ...S.label, fontSize: 9 }}>Prévia da capa</span>
                <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(201,169,122,0.2)", background: "#080E22", height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={thumbUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
              </div>
            )}
          </div>

          {/* URL Capa */}
          <div style={S.field}>
            <label style={S.label}>URL da Capa</label>
            <input style={S.input} value={course.thumbnail ?? ""} onChange={e => setCourse(c => ({ ...c, thumbnail: e.target.value }))} placeholder="https://drive.google.com/..." />
          </div>

          {/* Preço + Tipo */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={S.field}>
              <label style={S.label}>
                Preço <span style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Poppins',sans-serif", fontSize: 9, letterSpacing: 0.5, textTransform: "none", fontWeight: 400 }}>(vazio = matrícula manual)</span>
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "rgba(201,169,122,0.6)", fontFamily: "'Poppins',sans-serif", pointerEvents: "none" }}>R$</span>
                <input type="number" min="0" step="0.01" value={course.price ?? ""} onChange={e => setCourse(c => ({ ...c, price: e.target.value ? parseFloat(e.target.value) : null }))} placeholder="0,00" style={{ ...S.input, paddingLeft: 36 }} />
              </div>
            </div>
            <div style={S.field}>
              <label style={S.label}>Tipo de Acesso</label>
              <select value={course.paymentType} onChange={e => setCourse(c => ({ ...c, paymentType: e.target.value as "ONE_TIME" | "MONTHLY" }))} style={{ ...S.input, cursor: "pointer", appearance: "none" as const }}>
                <option value="ONE_TIME" style={{ background: "#0F1A3D" }}>Pagamento Único</option>
                <option value="MONTHLY" style={{ background: "#0F1A3D" }}>Mensalidade (30 dias)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Módulos ── */}
      <div style={{ ...S.sectionHeader, marginBottom: 16 }}>
        <div style={S.goldBar} />
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "var(--gold)", flex: 1 }}>
          Módulos e Aulas
          <span style={{ marginLeft: 10, fontFamily: "'Poppins',sans-serif", fontSize: 11, letterSpacing: 0, textTransform: "none", color: "var(--text-muted)", fontWeight: 400 }}>
            {course.modules.length} módulo{course.modules.length !== 1 ? "s" : ""}
          </span>
        </span>
        <button style={S.btnGold} onClick={() => setAddingModule(true)}>
          <Plus size={12} /> Novo Módulo
        </button>
      </div>

      {addingModule && (
        <div style={{ ...S.card, padding: 20, marginBottom: 16 }}>
          <p style={{ ...S.label, marginBottom: 14 }}>Novo Módulo</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} placeholder="Nome do módulo *" onKeyDown={e => e.key === "Enter" && addModule()} style={{ ...S.input, borderColor: "rgba(201,169,122,0.3)" }} />
            <input value={newModuleThumbnail} onChange={e => setNewModuleThumbnail(e.target.value)} placeholder="URL da capa do módulo (800×1000px)" style={S.input} />
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.btnPrimary} onClick={addModule}>Adicionar</button>
              <button style={S.btnGhost} onClick={() => { setAddingModule(false); setNewModuleThumbnail(""); }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {course.modules.map((mod, mi) => (
          <div key={mod.id} style={S.card}>
            {/* Module header */}
            <div onClick={() => toggleModule(mod.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", cursor: "pointer", background: openModules[mod.id] ? "rgba(201,169,122,0.04)" : "transparent", transition: "background 0.2s" }}>
              <div style={{ color: openModules[mod.id] ? "#C9A97A" : "rgba(255,255,255,0.3)", flexShrink: 0 }}>
                {openModules[mod.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              {mod.thumbnail
                ? <img src={mod.thumbnail.includes("drive.google.com") ? getGoogleDriveImageUrl(mod.thumbnail) : mod.thumbnail} alt="" style={{ width: 32, height: 40, objectFit: "contain", borderRadius: 6, border: "1px solid rgba(201,169,122,0.15)", flexShrink: 0 }} />
                : <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(201,169,122,0.08)", border: "1px solid rgba(201,169,122,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: 12, fontWeight: 700, color: "rgba(201,169,122,0.5)" }}>{mi + 1}</span>
                  </div>}
              <span style={{ flex: 1, fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 14, color: "var(--text-primary)", letterSpacing: 0.5 }}>{mod.title}</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'Poppins',sans-serif", padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {mod.lessons.length} aula{mod.lessons.length !== 1 ? "s" : ""}
              </span>
              <button onClick={e => { e.stopPropagation(); deleteModule(mod.id); }} style={S.btnRed} onMouseEnter={e => (e.currentTarget.style.color = "#f87171")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}>
                <Trash2 size={13} />
              </button>
            </div>

            {openModules[mod.id] && (
              <div style={{ borderTop: "1px solid rgba(201,169,122,0.08)", padding: "16px 20px" }}>
                {/* Thumbnail URL */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: 10, color: "rgba(201,169,122,0.5)", fontFamily: "'Cinzel',serif", letterSpacing: 2, textTransform: "uppercase", flexShrink: 0 }}>Capa</span>
                  <input defaultValue={mod.thumbnail ?? ""} placeholder="URL da capa do módulo (800×1000px)"
                    onBlur={async e => {
                      const val = e.target.value.trim();
                      if (val === (mod.thumbnail ?? "")) return;
                      await fetch(`/api/courses/${course.id}/modules/${mod.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ thumbnail: val || null }) });
                      setCourse(c => ({ ...c, modules: c.modules.map(m => m.id === mod.id ? { ...m, thumbnail: val || null } : m) }));
                    }}
                    style={{ flex: 1, background: "transparent", border: "none", borderBottom: "1px solid rgba(201,169,122,0.15)", padding: "4px 0", fontSize: 12, color: "rgba(255,255,255,0.6)", outline: "none", fontFamily: "'Poppins',sans-serif" }}
                  />
                </div>

                {/* Lessons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                  {mod.lessons.map((lesson, li) => {
                    const ytId = getYoutubeId(lesson.youtubeUrl);
                    const isEditing = editingLesson === lesson.id;

                    if (isEditing) {
                      return (
                        <div key={lesson.id} style={{ background: "rgba(6,13,31,0.8)", border: "1px solid rgba(201,169,122,0.25)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                          <p style={{ ...S.label, marginBottom: 0 }}>Editando Aula</p>
                          <div style={S.field}><label style={S.label}>Título</label><input style={S.input} value={editLesson.title} onChange={e => setEditLesson(l => ({ ...l, title: e.target.value }))} /></div>
                          <div style={S.field}><label style={S.label}>Link YouTube</label><input style={S.input} value={editLesson.youtubeUrl} onChange={e => setEditLesson(l => ({ ...l, youtubeUrl: e.target.value }))} /></div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div style={S.field}><label style={S.label}>Duração</label><input style={S.input} value={editLesson.duration} onChange={e => setEditLesson(l => ({ ...l, duration: e.target.value }))} placeholder="Ex: 45min" /></div>
                            <div style={S.field}>
                              <label style={S.label}>Liberar após (dias) <span style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Poppins',sans-serif", fontSize: 9, letterSpacing: 0, textTransform: "none", fontWeight: 400 }}>0 = imediato</span></label>
                              <input type="number" min="0" style={S.input} value={editLesson.releaseAfterDays} onChange={e => setEditLesson(l => ({ ...l, releaseAfterDays: parseInt(e.target.value) || 0 }))} placeholder="0" />
                            </div>
                          </div>
                          <div style={S.field}>
                            <label style={S.label}>Conteúdo HTML (apostila)</label>
                            <textarea value={editLesson.content} onChange={e => setEditLesson(l => ({ ...l, content: e.target.value }))} style={S.textarea} rows={10} placeholder="Cole o HTML da apostila..." />
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button style={{ ...S.btnPrimary, opacity: editSaving ? 0.6 : 1 }} onClick={() => saveEditLesson(mod.id, lesson.id)} disabled={editSaving}>
                              <Check size={12} /> {editSaving ? "Salvando..." : "Salvar Aula"}
                            </button>
                            <button style={S.btnGhost} onClick={() => setEditingLesson(null)}><X size={12} /> Cancelar</button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={lesson.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", transition: "border-color 0.2s" }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(201,169,122,0.15)")}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)")}>
                        {ytId ? (
                          <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="" style={{ width: 80, height: 46, objectFit: "cover", borderRadius: 8, flexShrink: 0, border: "1px solid rgba(255,255,255,0.06)" }} />
                        ) : (
                          <div style={{ width: 80, height: 46, borderRadius: 8, background: "rgba(255,255,255,0.04)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'Poppins',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {li + 1}. {lesson.title}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                            {lesson.duration && <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'Poppins',sans-serif" }}>{lesson.duration}</span>}
                            {lesson.content && (
                              <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 6, background: "rgba(201,169,122,0.1)", color: "#C9A97A", border: "1px solid rgba(201,169,122,0.2)", fontFamily: "'Cinzel',serif", letterSpacing: 2, fontWeight: 600 }}>HTML</span>
                            )}
                            {lesson.releaseAfterDays > 0 && (
                              <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 6, background: "rgba(99,179,237,0.1)", color: "#63B3ED", border: "1px solid rgba(99,179,237,0.25)", fontFamily: "'Cinzel',serif", letterSpacing: 1, fontWeight: 600 }}>+{lesson.releaseAfterDays}d</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => startEditLesson(lesson)} style={S.btnEdit} onMouseEnter={e => { e.currentTarget.style.color = "#C9A97A"; e.currentTarget.style.background = "rgba(201,169,122,0.08)"; }} onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = "transparent"; }}>
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => deleteLesson(mod.id, lesson.id)} style={S.btnRed} onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.08)"; }} onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = "transparent"; }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {addingLesson === mod.id ? (
                  <div style={{ background: "rgba(6,13,31,0.7)", border: "1px solid rgba(201,169,122,0.18)", borderRadius: 14, padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                    <p style={{ ...S.label, marginBottom: 0 }}>Nova Aula</p>
                    <div style={S.field}><label style={S.label}>Título *</label><input style={S.input} value={newLesson.title} onChange={e => setNewLesson(l => ({ ...l, title: e.target.value }))} placeholder="Ex: Introdução ao Módulo" /></div>
                    <div style={S.field}><label style={S.label}>Link YouTube *</label><input style={S.input} value={newLesson.youtubeUrl} onChange={e => setNewLesson(l => ({ ...l, youtubeUrl: e.target.value }))} placeholder="https://youtu.be/..." /></div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={S.field}><label style={S.label}>Duração</label><input style={S.input} value={newLesson.duration} onChange={e => setNewLesson(l => ({ ...l, duration: e.target.value }))} placeholder="Ex: 45min" /></div>
                      <div style={S.field}>
                        <label style={S.label}>Liberar após (dias) <span style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Poppins',sans-serif", fontSize: 9, letterSpacing: 0, textTransform: "none", fontWeight: 400 }}>0 = imediato</span></label>
                        <input type="number" min="0" style={S.input} value={newLesson.releaseAfterDays} onChange={e => setNewLesson(l => ({ ...l, releaseAfterDays: parseInt(e.target.value) || 0 }))} placeholder="0" />
                      </div>
                    </div>
                    <div style={S.field}>
                      <label style={S.label}>Conteúdo HTML (apostila)</label>
                      <textarea value={newLesson.content} onChange={e => setNewLesson(l => ({ ...l, content: e.target.value }))} style={S.textarea} rows={8} placeholder="Cole aqui o HTML da apostila..." />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={S.btnPrimary} onClick={() => addLesson(mod.id)}><Check size={12} /> Adicionar Aula</button>
                      <button style={S.btnGhost} onClick={() => setAddingLesson(null)}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAddingLesson(mod.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, background: "rgba(201,169,122,0.06)", border: "1px dashed rgba(201,169,122,0.25)", cursor: "pointer", fontSize: 11, color: "rgba(201,169,122,0.6)", fontFamily: "'Cinzel',serif", letterSpacing: 2, textTransform: "uppercase", transition: "all 0.2s", width: "100%" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#C9A97A"; e.currentTarget.style.borderColor = "rgba(201,169,122,0.5)"; e.currentTarget.style.background = "rgba(201,169,122,0.10)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(201,169,122,0.6)"; e.currentTarget.style.borderColor = "rgba(201,169,122,0.25)"; e.currentTarget.style.background = "rgba(201,169,122,0.06)"; }}>
                    <Plus size={13} /> Adicionar Nova Aula
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
