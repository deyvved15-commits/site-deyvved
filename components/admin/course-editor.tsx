"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getYoutubeId, getGoogleDriveImageUrl } from "@/lib/utils";
import { Plus, Trash2, ChevronDown, ChevronRight, Eye, EyeOff, Pencil, X, Check } from "lucide-react";

type Lesson = { id: string; title: string; youtubeUrl: string; duration: string | null; content: string | null; order: number; releaseAfterDays: number; attachments?: { title: string; url: string }[] };
type Module = { id: string; title: string; thumbnail: string | null; order: number; lessons: Lesson[] };
type Course = { id: string; title: string; description: string | null; thumbnail: string | null; price: number | null; paymentType: "ONE_TIME" | "MONTHLY"; published: boolean; category: string | null; modules: Module[]; teacherId: string | null; commissionPercentage: number };

const textareaClass = "w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(201,169,122,0.18)] rounded-xl px-4 py-3 text-sm text-white placeholder-[rgba(255,255,255,0.2)] outline-none resize-none focus:border-[rgba(201,169,122,0.5)] focus:bg-[rgba(255,255,255,0.06)] transition-all";
const labelClass = "text-[10px] tracking-[3px] uppercase text-[rgba(201,169,122,0.7)] font-medium mb-2 block";

export default function CourseEditor({ course: initial, teachers, isAdmin = true }: { course: Course, teachers: { id: string; name: string }[], isAdmin?: boolean }) {
  const router = useRouter();
  const [course, setCourse] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleThumbnail, setNewModuleThumbnail] = useState("");
  const [addingModule, setAddingModule] = useState(false);
  const [addingLesson, setAddingLesson] = useState<string | null>(null);
  const [newLesson, setNewLesson] = useState({ title: "", youtubeUrl: "", duration: "", content: "", releaseAfterDays: 0, attachments: [] as { title: string; url: string }[] });
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [editLesson, setEditLesson] = useState({ title: "", youtubeUrl: "", duration: "", content: "", releaseAfterDays: 0, attachments: [] as { title: string; url: string }[] });
  const [editSaving, setEditSaving] = useState(false);

  async function saveCourse() {
    setSaving(true);
    const res = await fetch(`/api/courses/${course.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        title: course.title, 
        description: course.description, 
        thumbnail: course.thumbnail, 
        price: course.price, 
        paymentType: course.paymentType, 
        published: course.published,
        category: course.category,
        teacherId: course.teacherId,
        commissionPercentage: course.commissionPercentage
      }),
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
    setNewLesson({ title: "", youtubeUrl: "", duration: "", content: "", releaseAfterDays: 0, attachments: [] });
    setAddingLesson(null);
  }

  async function deleteLesson(moduleId: string, lessonId: string) {
    if (!confirm("Excluir esta aula?")) return;
    await fetch(`/api/courses/${course.id}/modules/${moduleId}/lessons/${lessonId}`, { method: "DELETE" });
    setCourse(c => ({ ...c, modules: c.modules.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m) }));
  }

  function startEditLesson(lesson: Lesson) {
    setEditingLesson(lesson.id);
    setEditLesson({ 
      title: lesson.title, 
      youtubeUrl: lesson.youtubeUrl, 
      duration: lesson.duration ?? "", 
      content: lesson.content ?? "", 
      releaseAfterDays: lesson.releaseAfterDays ?? 0,
      attachments: lesson.attachments ?? []
    });
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={S.field}>
              <label style={S.label}>Título</label>
              <input style={S.input} value={course.title} onChange={e => setCourse(c => ({ ...c, title: e.target.value }))} placeholder="Nome do curso" />
            </div>
            <div style={S.field}>
              <label style={S.label}>Categoria</label>
              <input style={S.input} value={course.category ?? ""} onChange={e => setCourse(c => ({ ...c, category: e.target.value || null }))} placeholder="Ex: Teologia, Liderança..." />
            </div>
          </div>

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

          <div style={S.field}>
            <label style={S.label}>URL da Capa</label>
            <input style={S.input} value={course.thumbnail ?? ""} onChange={e => setCourse(c => ({ ...c, thumbnail: e.target.value }))} placeholder="https://drive.google.com/..." />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={S.field}>
              <label style={S.label}>Preço</label>
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

          {isAdmin && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={S.field}>
                <label style={S.label}>Professor Responsável</label>
                <select value={course.teacherId || ""} onChange={e => setCourse(c => ({ ...c, teacherId: e.target.value || null }))} style={{ ...S.input, cursor: "pointer", appearance: "none" as const }}>
                  <option value="" style={{ background: "#0F1A3D" }}>Nenhum professor selecionado</option>
                  {teachers.map(t => (<option key={t.id} value={t.id} style={{ background: "#0F1A3D" }}>{t.name}</option>))}
                </select>
              </div>
              <div style={S.field}>
                <label style={S.label}>Comissão (%)</label>
                <input type="number" min="0" max="100" value={course.commissionPercentage} onChange={e => setCourse(c => ({ ...c, commissionPercentage: parseFloat(e.target.value) || 0 }))} style={S.input} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Módulos ── */}
      <div style={{ ...S.sectionHeader, marginBottom: 16 }}>
        <div style={S.goldBar} />
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "var(--gold)", flex: 1 }}>Módulos e Aulas</span>
        <button style={S.btnGold} onClick={() => setAddingModule(true)}><Plus size={12} /> Novo Módulo</button>
      </div>

      {addingModule && (
        <div style={{ ...S.card, padding: 20, marginBottom: 16 }}>
          <p style={S.label}>Novo Módulo</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} placeholder="Nome do módulo" style={S.input} />
            <input value={newModuleThumbnail} onChange={e => setNewModuleThumbnail(e.target.value)} placeholder="URL da capa" style={S.input} />
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.btnPrimary} onClick={addModule}>Adicionar</button>
              <button style={S.btnGhost} onClick={() => setAddingModule(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {course.modules.map((mod, mi) => (
          <div key={mod.id} style={S.card}>
            <div onClick={() => toggleModule(mod.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", cursor: "pointer", background: openModules[mod.id] ? "rgba(201,169,122,0.04)" : "transparent" }}>
              {openModules[mod.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <div style={{ width: 32, height: 40, borderRadius: 6, background: "rgba(255,255,255,0.05)", overflow: "hidden", border: "1px solid rgba(201,169,122,0.15)", flexShrink: 0 }}>
                {mod.thumbnail && <img src={getGoogleDriveImageUrl(mod.thumbnail)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
              <span style={{ flex: 1, fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 14 }}>{mod.title}</span>
              <button onClick={e => { e.stopPropagation(); deleteModule(mod.id); }} style={S.btnRed}><Trash2 size={13} /></button>
            </div>

            {openModules[mod.id] && (
              <div style={{ borderTop: "1px solid rgba(201,169,122,0.08)", padding: 20 }}>
                {/* Capa do Módulo */}
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

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                  {mod.lessons.map((lesson, li) => (
                    <div key={lesson.id}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600 }}>{li + 1}. {lesson.title}</p>
                          <div style={{ display: "flex", gap: 8 }}>
                             {lesson.duration && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{lesson.duration}</span>}
                             {lesson.attachments && Array.isArray(lesson.attachments) && lesson.attachments.length > 0 && (
                               <span style={{ fontSize: 9, color: "var(--gold)" }}>{lesson.attachments.length} anexo(s)</span>
                             )}
                          </div>
                        </div>
                        <button onClick={() => startEditLesson(lesson)} style={S.btnEdit}><Pencil size={13} /></button>
                        <button onClick={() => deleteLesson(mod.id, lesson.id)} style={S.btnRed}><Trash2 size={13} /></button>
                      </div>

                      {editingLesson === lesson.id && (
                        <div style={{ background: "rgba(6,13,31,0.95)", border: "1px solid var(--gold)", borderRadius: 16, padding: 20, margin: "8px 0 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                          <p style={{ ...S.label, color: "var(--gold)" }}>Editando Aula: {lesson.title}</p>
                          <div style={{ display: "grid", gap: 12 }}>
                            <div style={S.field}>
                              <label style={S.label}>Título</label>
                              <input style={S.input} value={editLesson.title} onChange={e => setEditLesson(l => ({ ...l, title: e.target.value }))} />
                            </div>
                            <div style={S.field}>
                              <label style={S.label}>URL YouTube</label>
                              <input style={S.input} value={editLesson.youtubeUrl} onChange={e => setEditLesson(l => ({ ...l, youtubeUrl: e.target.value }))} />
                            </div>
                            <div style={S.field}>
                              <label style={S.label}>Conteúdo (HTML)</label>
                              <textarea style={S.textarea} value={editLesson.content || ""} onChange={e => setEditLesson(l => ({ ...l, content: e.target.value }))} rows={4} placeholder="HTML da apostila" />
                            </div>
                            
                            {/* Anexos */}
                            <div style={{ padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(201,169,122,0.15)" }}>
                              <p style={{ ...S.label, fontSize: 9, marginBottom: 12 }}>Materiais de Apoio (Anexos)</p>
                              {editLesson.attachments.map((at, i) => (
                                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                  <input style={{ ...S.input, flex: 1 }} value={at.title} onChange={e => setEditLesson(l => ({ ...l, attachments: l.attachments.map((a, j) => i === j ? { ...a, title: e.target.value } : a) }))} placeholder="Título do arquivo" />
                                  <input style={{ ...S.input, flex: 2 }} value={at.url} onChange={e => setEditLesson(l => ({ ...l, attachments: l.attachments.map((a, j) => i === j ? { ...a, url: e.target.value } : a) }))} placeholder="URL do arquivo" />
                                  <button onClick={() => setEditLesson(l => ({ ...l, attachments: l.attachments.filter((_, j) => i !== j) }))} style={S.btnRed}><Trash2 size={13} /></button>
                                </div>
                              ))}
                              <button onClick={() => setEditLesson(l => ({ ...l, attachments: [...l.attachments, { title: "", url: "" }] }))} style={{ ...S.btnGold, width: "100%", marginTop: 4 }}>+ Adicionar Anexo</button>
                            </div>

                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                              <button style={S.btnPrimary} onClick={() => saveEditLesson(mod.id, editingLesson)}>Salvar Alterações</button>
                              <button style={S.btnGhost} onClick={() => setEditingLesson(null)}>Cancelar</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!addingLesson && !editingLesson && (
                  <button onClick={() => setAddingLesson(mod.id)} style={{ ...S.btnGhost, width: "100%" }}>+ Nova Aula</button>
                )}

                {addingLesson === mod.id && (
                  <div style={{ background: "rgba(6,13,31,0.5)", padding: 16, borderRadius: 12, marginTop: 12 }}>
                    <p style={S.label}>Nova Aula</p>
                    <div style={{ display: "grid", gap: 12 }}>
                      <input style={S.input} value={newLesson.title} onChange={e => setNewLesson(l => ({ ...l, title: e.target.value }))} placeholder="Título" />
                      <input style={S.input} value={newLesson.youtubeUrl} onChange={e => setNewLesson(l => ({ ...l, youtubeUrl: e.target.value }))} placeholder="Link YouTube" />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button style={S.btnPrimary} onClick={() => addLesson(mod.id)}>Adicionar</button>
                        <button style={S.btnGhost} onClick={() => setAddingLesson(null)}>Cancelar</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
