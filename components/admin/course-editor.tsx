"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getYoutubeId, getGoogleDriveImageUrl } from "@/lib/utils";
import { Plus, Trash2, ChevronDown, ChevronRight, Eye, EyeOff, Pencil, X, Check, Clock } from "lucide-react";

type Lesson = { id: string; title: string; youtubeUrl: string; duration: string | null; content: string | null; order: number; releaseAfterDays: number; attachments?: { title: string; url: string }[] };
type Module = { id: string; title: string; description: string | null; thumbnail: string | null; isBonus: boolean; order: number; lessons: Lesson[] };
type Course = { id: string; slug: string; title: string; description: string | null; thumbnail: string | null; price: number | null; paymentType: "ONE_TIME" | "MONTHLY"; published: boolean; category: string | null; modules: Module[]; teachers: { teacherId: string; commissionPercentage: number; teacher: { id: string; name: string } }[]; hasCertificate: boolean; affiliatePercentage: number; certificateBg?: string | null; certificatePrimaryColor?: string | null; certificateSecondaryColor?: string | null; certificateCustomText?: string | null; salesHeadline?: string | null; learningOutcomes?: string[]; targetAudience?: string | null; teacherBio?: string | null };

const textareaClass = "w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(201,169,122,0.18)] rounded-xl px-4 py-3 text-sm text-white placeholder-[rgba(255,255,255,0.2)] outline-none resize-none focus:border-[rgba(201,169,122,0.5)] focus:bg-[rgba(255,255,255,0.06)] transition-all";
const labelClass = "text-[10px] tracking-[3px] uppercase text-[rgba(201,169,122,0.7)] font-medium mb-2 block";

export default function CourseEditor({ course: initial, teachers: allTeachers, isAdmin = true }: { course: Course, teachers: { id: string; name: string }[], isAdmin?: boolean }) {
  const router = useRouter();
  const [course, setCourse] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleThumbnail, setNewModuleThumbnail] = useState("");
  const [newModuleIsBonus, setNewModuleIsBonus] = useState(false);
  const [addingModule, setAddingModule] = useState(false);
  const [addingLesson, setAddingLesson] = useState<string | null>(null);
  const [newLesson, setNewLesson] = useState({ title: "", youtubeUrl: "", duration: "", content: "", releaseAfterDays: 0, attachments: [] as { title: string; url: string }[] });
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [editLesson, setEditLesson] = useState({ title: "", youtubeUrl: "", duration: "", content: "", releaseAfterDays: 0, attachments: [] as { title: string; url: string }[] });
  const [editSaving, setEditSaving] = useState(false);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState("");

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
        teachers: course.teachers.map(t => ({
          teacherId: t.teacherId,
          commissionPercentage: t.commissionPercentage
        })),
        hasCertificate: course.hasCertificate,
        affiliatePercentage: course.affiliatePercentage,
        certificateBg: course.certificateBg,
        certificatePrimaryColor: course.certificatePrimaryColor,
        certificateSecondaryColor: course.certificateSecondaryColor,
        certificateCustomText: course.certificateCustomText,
        salesHeadline: course.salesHeadline,
        learningOutcomes: course.learningOutcomes ?? [],
        targetAudience: course.targetAudience,
        teacherBio: course.teacherBio,
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
      body: JSON.stringify({ title: newModuleTitle, thumbnail: newModuleThumbnail || undefined, isBonus: newModuleIsBonus }),
    });
    const mod = await res.json();
    setCourse(c => ({ ...c, modules: [...c.modules, { ...mod, lessons: [] }] }));
    setNewModuleTitle("");
    setNewModuleThumbnail("");
    setNewModuleIsBonus(false);
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

  function parseAttachments(raw: any): { title: string; url: string }[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; } catch { return []; }
    }
    return [];
  }

  function startEditLesson(lesson: Lesson) {
    setEditingLesson(lesson.id);
    setEditLesson({
      title: lesson.title,
      youtubeUrl: lesson.youtubeUrl,
      duration: lesson.duration ?? "",
      content: lesson.content ?? "",
      releaseAfterDays: lesson.releaseAfterDays ?? 0,
      attachments: parseAttachments(lesson.attachments),
    });
  }

  async function saveEditLesson(moduleId: string, lessonId: string) {
    setEditSaving(true);
    try {
      const res = await fetch(`/api/courses/${course.id}/modules/${moduleId}/lessons/${lessonId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editLesson),
      });
      const updated = await res.json();
      if (!res.ok) {
        alert(`Erro ao salvar: ${updated.error ? JSON.stringify(updated.error) : res.status}`);
        setEditSaving(false);
        return;
      }
      setCourse(c => ({ ...c, modules: c.modules.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...updated } : l) } : m) }));
      setEditingLesson(null);
    } catch {
      alert("Erro de conexão ao salvar aula.");
    }
    setEditSaving(false);
  }

  async function saveEditModule(moduleId: string) {
    if (!editModuleTitle.trim()) return;
    const res = await fetch(`/api/courses/${course.id}/modules/${moduleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editModuleTitle }),
    });
    if (res.ok) {
      setCourse(c => ({ ...c, modules: c.modules.map(m => m.id === moduleId ? { ...m, title: editModuleTitle } : m) }));
      setEditingModule(null);
    }
  }

  async function moveModule(index: number, direction: 'up' | 'down') {
    const newModules = [...course.modules];
    const otherIndex = direction === 'up' ? index - 1 : index + 1;
    if (otherIndex < 0 || otherIndex >= newModules.length) return;

    [newModules[index], newModules[otherIndex]] = [newModules[otherIndex], newModules[index]];
    setCourse(c => ({ ...c, modules: newModules }));

    await Promise.all([
      fetch(`/api/courses/${course.id}/modules/${newModules[index].id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: index }),
      }),
      fetch(`/api/courses/${course.id}/modules/${newModules[otherIndex].id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: otherIndex }),
      })
    ]);
  }

  async function moveLesson(modId: string, index: number, direction: 'up' | 'down') {
    const mod = course.modules.find(m => m.id === modId);
    if (!mod) return;
    const newLessons = [...mod.lessons];
    const otherIndex = direction === 'up' ? index - 1 : index + 1;
    if (otherIndex < 0 || otherIndex >= newLessons.length) return;

    [newLessons[index], newLessons[otherIndex]] = [newLessons[otherIndex], newLessons[index]];
    setCourse(c => ({
      ...c,
      modules: c.modules.map(m => m.id === modId ? { ...m, lessons: newLessons } : m)
    }));

    await Promise.all([
      fetch(`/api/courses/${course.id}/modules/${modId}/lessons/${newLessons[index].id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: index }),
      }),
      fetch(`/api/courses/${course.id}/modules/${modId}/lessons/${newLessons[otherIndex].id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: otherIndex }),
      })
    ]);
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
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .ka-course-editor-header { margin-left: -16px !important; margin-right: -16px !important; padding: 12px 16px !important; }
          .ka-course-editor-inner { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .ka-course-editor-title { font-size: 14px !important; letter-spacing: 1px !important; }
          .ka-course-editor-btns { width: 100%; justify-content: flex-end; }
        }
      `}</style>
      <div className="ka-course-editor-header" style={{ position: "sticky", top: 0, zIndex: 10, marginBottom: 36, marginLeft: -44, marginRight: -44, padding: "16px 44px", background: "linear-gradient(180deg, rgba(6,13,31,0.98) 80%, transparent)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(201,169,122,0.08)" }}>
      <div className="ka-course-editor-inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, maxWidth: 900 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 5, textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>
            Editando Curso
          </p>
          <h1 className="ka-course-editor-title" style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 20, letterSpacing: 2, color: "var(--text-primary)", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {course.title}
          </h1>
        </div>
        <div className="ka-course-editor-btns" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <button onClick={() => setCourse(c => ({ ...c, published: !c.published }))} style={{
            display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 12, cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "'Cinzel',serif", letterSpacing: 1.5, textTransform: "uppercase", transition: "all 0.2s",
            ...(course.published
              ? { color: "#6ee7b7", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }
              : { color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }),
          }}>
            {course.published ? <><Eye size={13} /> Publicado</> : <><EyeOff size={13} /> Rascunho</>}
          </button>
          <button onClick={saveCourse} disabled={saving} className="ka-btn-gold" style={{ padding: "10px 22px", flexShrink: 0 }}>
            {saving ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            )}
            {saving ? "Salvando..." : "Salvar"}
          </button>
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
            <div className="ka-field" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="ka-label">Título</label>
              <input className="ka-input" value={course.title} onChange={e => setCourse(c => ({ ...c, title: e.target.value }))} placeholder="Nome do curso" />
            </div>
            <div className="ka-field" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="ka-label">Categoria</label>
              <input className="ka-input" value={course.category ?? ""} onChange={e => setCourse(c => ({ ...c, category: e.target.value || null }))} placeholder="Ex: Teologia, Liderança..." />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: thumbUrl ? "1fr 140px" : "1fr", gap: 20, alignItems: "start" }}>
            <div className="ka-field" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="ka-label">Descrição</label>
              <textarea className="ka-textarea" rows={4} value={course.description ?? ""} onChange={e => setCourse(c => ({ ...c, description: e.target.value }))} placeholder="Descreva o curso..." />
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

          <div className="ka-field" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label className="ka-label">URL da Capa</label>
            <input className="ka-input" value={course.thumbnail ?? ""} onChange={e => setCourse(c => ({ ...c, thumbnail: e.target.value }))} placeholder="https://drive.google.com/..." />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={S.field}>
              <label style={S.label}>Preço</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "rgba(201,169,122,0.6)", fontFamily: "'Poppins',sans-serif", pointerEvents: "none" }}>R$</span>
                <input type="number" min="0" step="0.01" value={course.price ?? ""} onChange={e => setCourse(c => ({ ...c, price: e.target.value ? parseFloat(e.target.value) : null }))} placeholder="0,00" style={{ ...S.input, paddingLeft: 36 }} />
              </div>
            </div>
            <div className="ka-field" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="ka-label">Tipo de Acesso</label>
              <select className="ka-input" value={course.paymentType} onChange={e => setCourse(c => ({ ...c, paymentType: e.target.value as "ONE_TIME" | "MONTHLY" }))} style={{ cursor: "pointer", appearance: "none" }}>
                <option value="ONE_TIME" style={{ background: "#0F1A3D" }}>Pagamento Único</option>
                <option value="MONTHLY" style={{ background: "#0F1A3D" }}>Mensalidade (30 dias)</option>
              </select>
            </div>
          </div>

          <div style={{ ...S.field, flexDirection: "row", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(201,169,122,0.05)", borderRadius: 14, border: "1px solid rgba(201,169,122,0.15)" }}>
            <input type="checkbox" id="hasCertificate" checked={course.hasCertificate} onChange={e => setCourse(c => ({ ...c, hasCertificate: e.target.checked }))} style={{ width: 18, height: 18, cursor: "pointer", accentColor: "var(--gold)" }} />
            <div>
              <label htmlFor="hasCertificate" style={{ ...S.label, cursor: "pointer", fontSize: 11, display: "block", marginBottom: 2 }}>Oferecer Certificado de Conclusão</label>
              <p style={{ fontSize: 9, color: "var(--text-muted)", margin: 0 }}>Válido apenas para cursos de pagamento único com 100% de progresso.</p>
            </div>
          </div>

          {course.hasCertificate && (
            <div style={{ ...S.field, padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: 14, border: "1px solid rgba(201,169,122,0.1)", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Pencil size={14} color="var(--gold)" />
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)" }}>Personalizar Certificado</span>
              </div>

              <div style={S.field}>
                <label style={S.label}>URL da Imagem de Fundo (Opcional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={course.certificateBg ?? ""}
                  onChange={e => setCourse(c => ({ ...c, certificateBg: e.target.value }))}
                  style={S.input}
                />
                <p style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4 }}>Recomendado: 1000x1414px (Proporção A4 Deitada)</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={S.field}>
                  <label style={S.label}>Cor Principal (Títulos)</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      type="color"
                      value={course.certificatePrimaryColor ?? "#C9A97A"}
                      onChange={e => setCourse(c => ({ ...c, certificatePrimaryColor: e.target.value }))}
                      style={{ width: 40, height: 40, padding: 0, border: "none", background: "none", cursor: "pointer" }}
                    />
                    <input
                      type="text"
                      value={course.certificatePrimaryColor ?? "#C9A97A"}
                      onChange={e => setCourse(c => ({ ...c, certificatePrimaryColor: e.target.value }))}
                      style={S.input}
                    />
                  </div>
                </div>
                <div style={S.field}>
                  <label style={S.label}>Cor Secundária (Bordas/Ícones)</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      type="color"
                      value={course.certificateSecondaryColor ?? "#E8D5A8"}
                      onChange={e => setCourse(c => ({ ...c, certificateSecondaryColor: e.target.value }))}
                      style={{ width: 40, height: 40, padding: 0, border: "none", background: "none", cursor: "pointer" }}
                    />
                    <input
                      type="text"
                      value={course.certificateSecondaryColor ?? "#E8D5A8"}
                      onChange={e => setCourse(c => ({ ...c, certificateSecondaryColor: e.target.value }))}
                      style={S.input}
                    />
                  </div>
                </div>
              </div>

              <div style={S.field}>
                <label style={S.label}>Texto Customizado (Opcional)</label>
                <textarea
                  placeholder="Ex: concluiu com aproveitamento total o treinamento de..."
                  rows={2}
                  value={course.certificateCustomText ?? ""}
                  onChange={e => setCourse(c => ({ ...c, certificateCustomText: e.target.value }))}
                  className={textareaClass}
                />
                <p style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4 }}>Substitui o texto padrão "concluiu com aproveitamento o curso de formação em"</p>
              </div>
            </div>
          )}

          {/* Affiliate Percentage */}
          {isAdmin && (
            <div style={S.field}>
              <label style={S.label}>Comissão de Afiliado (%)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={course.affiliatePercentage ?? 0}
                  onChange={e => setCourse(c => ({ ...c, affiliatePercentage: parseFloat(e.target.value) || 0 }))}
                  style={{ ...S.input, width: 100, textAlign: "center" as const }}
                />
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>% do valor do curso para quem indicar</span>
              </div>
            </div>
          )}

          {isAdmin && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="ka-field">
                <label className="ka-label">Professores e Comissões</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {allTeachers.map(t => {
                    const assoc = course.teachers.find(ct => ct.teacherId === t.id);
                    const isSelected = !!assoc;
                    return (
                      <div key={t.id} style={{ 
                        display: "flex", alignItems: "center", gap: 16, padding: "12px 16px",
                        background: isSelected ? "rgba(201,169,122,0.08)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${isSelected ? "var(--gold-35)" : "rgba(255,255,255,0.05)"}`,
                        borderRadius: 14, transition: "all 0.2s"
                      }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flex: 1, fontSize: 13, color: isSelected ? "var(--gold)" : "rgba(255,255,255,0.6)" }}>
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={e => {
                              const checked = e.target.checked;
                              setCourse(c => ({
                                ...c,
                                teachers: checked 
                                  ? [...c.teachers, { teacherId: t.id, commissionPercentage: 0, teacher: t }]
                                  : c.teachers.filter(ct => ct.teacherId !== t.id)
                              }));
                            }}
                            style={{ width: 16, height: 16, accentColor: "var(--gold)" }}
                          />
                          {t.name}
                        </label>
                        
                        {isSelected && (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Comissão:</span>
                            <div style={{ position: "relative", width: 80 }}>
                              <input 
                                type="number" min="0" max="100" 
                                value={assoc.commissionPercentage} 
                                onChange={e => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setCourse(c => ({
                                    ...c,
                                    teachers: c.teachers.map(ct => ct.teacherId === t.id ? { ...ct, commissionPercentage: val } : ct)
                                  }));
                                }}
                                className="ka-input"
                                style={{ padding: "6px 28px 6px 10px", textAlign: "right", fontSize: 12 }} 
                              />
                              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "var(--gold)", pointerEvents: "none" }}>%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Página de Vendas ── */}
      <div style={{ ...S.card, padding: 28, marginBottom: 24 }}>
        <div style={{ ...S.sectionHeader, marginBottom: 20 }}>
          <div style={S.goldBar} />
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "var(--gold)" }}>
            Página de Vendas
          </span>
          <a href={`/curso/${course.slug}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: "auto", fontSize: 10, color: "var(--gold)", fontFamily: "'Cinzel',serif", letterSpacing: 2, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Ver página
          </a>
        </div>

        <div style={{ display: "grid", gap: 24 }}>
          <div style={S.field}>
            <label style={S.label}>Headline Principal</label>
            <input
              style={S.input}
              value={course.salesHeadline ?? ""}
              onChange={e => setCourse(c => ({ ...c, salesHeadline: e.target.value || null }))}
              placeholder="Ex: Formação Teológica Completa para Líderes"
            />
            <p style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2 }}>Aparece no hero da página. Se vazio, usa o título do curso.</p>
          </div>

          <div style={S.field}>
            <label style={S.label}>Para quem é este curso</label>
            <textarea
              style={S.textarea}
              rows={3}
              value={course.targetAudience ?? ""}
              onChange={e => setCourse(c => ({ ...c, targetAudience: e.target.value || null }))}
              placeholder="Ex: Este curso é para pastores, líderes e estudiosos que desejam..."
            />
          </div>

          <div style={S.field}>
            <label style={S.label}>Bio do Professor (exibida na página)</label>
            <textarea
              style={S.textarea}
              rows={3}
              value={course.teacherBio ?? ""}
              onChange={e => setCourse(c => ({ ...c, teacherBio: e.target.value || null }))}
              placeholder="Ex: Teólogo formado pela... com mais de 20 anos de ministério..."
            />
          </div>

          <div style={S.field}>
            <label style={S.label}>O que você vai aprender</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(course.learningOutcomes ?? []).map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    style={{ ...S.input, flex: 1, width: "auto" }}
                    value={item}
                    onChange={e => {
                      const arr = [...(course.learningOutcomes ?? [])];
                      arr[i] = e.target.value;
                      setCourse(c => ({ ...c, learningOutcomes: arr }));
                    }}
                    placeholder={`Tópico ${i + 1}`}
                  />
                  <button
                    onClick={() => setCourse(c => ({ ...c, learningOutcomes: (c.learningOutcomes ?? []).filter((_, j) => j !== i) }))}
                    style={{ padding: "8px", background: "none", border: "none", cursor: "pointer", color: "rgba(255,100,100,0.6)", flexShrink: 0 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => setCourse(c => ({ ...c, learningOutcomes: [...(c.learningOutcomes ?? []), ""] }))}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "rgba(201,169,122,0.06)", border: "1px dashed rgba(201,169,122,0.25)", color: "var(--gold)", fontSize: 11, fontFamily: "'Cinzel',serif", letterSpacing: 1, cursor: "pointer", width: "fit-content" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Adicionar tópico
              </button>
            </div>
          </div>
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
          <p className="ka-label">Novo Módulo</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} placeholder="Nome do módulo" className="ka-input" />
            <input value={newModuleThumbnail} onChange={e => setNewModuleThumbnail(e.target.value)} placeholder="URL da capa" className="ka-input" />
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
              <input type="checkbox" id="newModBonus" checked={newModuleIsBonus} onChange={e => setNewModuleIsBonus(e.target.checked)} style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--gold)" }} />
              <label htmlFor="newModBonus" className="ka-label" style={{ margin: 0, cursor: "pointer", textTransform: "none", fontSize: 12 }}>Este é um módulo bônus (não conta para progresso)</label>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ka-btn-gold" onClick={addModule}>Adicionar</button>
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
              
              {editingModule === mod.id ? (
                <div style={{ flex: 1, display: "flex", gap: 8, alignItems: "center" }} onClick={e => e.stopPropagation()}>
                  <input 
                    className="ka-input"
                    style={{ padding: "4px 12px", fontSize: 14 }} 
                    value={editModuleTitle} 
                    onChange={e => setEditModuleTitle(e.target.value)} 
                    onKeyDown={e => {
                      if (e.key === "Enter") saveEditModule(mod.id);
                      if (e.key === "Escape") setEditingModule(null);
                    }}
                    autoFocus 
                  />
                  <button onClick={() => saveEditModule(mod.id)} style={{ ...S.btnEdit, color: "#6ee7b7" }}><Check size={16} /></button>
                  <button onClick={() => setEditingModule(null)} style={{ ...S.btnEdit, color: "#fca5a5" }}><X size={16} /></button>
                </div>
              ) : (
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 14 }}>{mod.title}</span>
                  {mod.isBonus && (
                    <span style={{ 
                      fontSize: 8, fontWeight: 800, color: "var(--navy-darkest)", 
                      background: "var(--gold)", padding: "2px 6px", borderRadius: 4, 
                      letterSpacing: 1, textTransform: "uppercase" 
                    }}>Bônus</span>
                  )}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button onClick={e => { e.stopPropagation(); moveModule(mi, 'up'); }} style={{ ...S.btnEdit, opacity: mi === 0 ? 0.2 : 0.6 }} title="Subir"><ChevronDown size={14} style={{ transform: "rotate(180deg)" }} /></button>
                <button onClick={e => { e.stopPropagation(); moveModule(mi, 'down'); }} style={{ ...S.btnEdit, opacity: mi === course.modules.length - 1 ? 0.2 : 0.6 }} title="Descer"><ChevronDown size={14} /></button>
                <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)", margin: "0 4px" }} />
                <button onClick={e => { e.stopPropagation(); setEditingModule(mod.id); setEditModuleTitle(mod.title); }} style={S.btnEdit}><Pencil size={13} /></button>
                <button onClick={e => { e.stopPropagation(); deleteModule(mod.id); }} style={S.btnRed}><Trash2 size={13} /></button>
              </div>
            </div>

            {openModules[mod.id] && (
              <div style={{ borderTop: "1px solid rgba(201,169,122,0.08)", padding: 20 }}>
                {/* Configurações do Módulo */}
                <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input 
                      type="checkbox" 
                      id={`bonus-${mod.id}`} 
                      checked={mod.isBonus} 
                      onChange={async e => {
                        const val = e.target.checked;
                        await fetch(`/api/courses/${course.id}/modules/${mod.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isBonus: val }) });
                        setCourse(c => ({ ...c, modules: c.modules.map(m => m.id === mod.id ? { ...m, isBonus: val } : m) }));
                      }} 
                      style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--gold)" }} 
                    />
                    <label htmlFor={`bonus-${mod.id}`} className="ka-label" style={{ margin: 0, cursor: "pointer", textTransform: "none", fontSize: 11 }}>Módulo Bônus</label>
                  </div>
                </div>

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

                {/* Descrição do Módulo */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: 10, color: "rgba(201,169,122,0.5)", fontFamily: "'Cinzel',serif", letterSpacing: 2, textTransform: "uppercase" }}>Descrição</span>
                  <textarea defaultValue={mod.description ?? ""} placeholder="Breve descrição do módulo..."
                    onBlur={async e => {
                      const val = e.target.value.trim();
                      if (val === (mod.description ?? "")) return;
                      await fetch(`/api/courses/${course.id}/modules/${mod.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description: val || null }) });
                      setCourse(c => ({ ...c, modules: c.modules.map(m => m.id === mod.id ? { ...m, description: val || null } : m) }));
                    }}
                    style={{ ...S.textarea, background: "transparent", border: "1px solid rgba(201,169,122,0.1)", minHeight: 60, fontSize: 12 }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                  {mod.lessons.map((lesson, li) => (
                    <div key={lesson.id}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", transition: "all 0.2s" }} className="lesson-row">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: editingLesson === lesson.id ? "var(--gold-light)" : "#fff" }}>{li + 1}. {lesson.title}</p>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                             {lesson.duration && <span style={{ fontSize: 10, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><Clock size={10} /> {lesson.duration}</span>}
                             {lesson.attachments && Array.isArray(lesson.attachments) && lesson.attachments.length > 0 && (
                               <span style={{ fontSize: 9, color: "var(--gold-light)", background: "rgba(201,169,122,0.1)", padding: "2px 6px", borderRadius: 4 }}>{lesson.attachments.length} anexo(s)</span>
                             )}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <button onClick={() => moveLesson(mod.id, li, 'up')} style={{ ...S.btnEdit, opacity: li === 0 ? 0.2 : 0.6 }} title="Subir"><ChevronDown size={14} style={{ transform: "rotate(180deg)" }} /></button>
                          <button onClick={() => moveLesson(mod.id, li, 'down')} style={{ ...S.btnEdit, opacity: li === mod.lessons.length - 1 ? 0.2 : 0.6 }} title="Descer"><ChevronDown size={14} /></button>

                          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)", margin: "0 4px" }} />
                          
                          <button onClick={() => startEditLesson(lesson)} style={{ ...S.btnEdit, color: editingLesson === lesson.id ? "var(--gold)" : "rgba(255,255,255,0.4)" }}><Pencil size={13} /></button>
                          <button onClick={() => deleteLesson(mod.id, lesson.id)} style={S.btnRed}><Trash2 size={13} /></button>
                        </div>
                      </div>

                      {editingLesson === lesson.id && (
                        <div style={{ background: "rgba(6,13,31,0.95)", border: "1px solid var(--gold)", borderRadius: 16, padding: 20, margin: "8px 0 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                          <p style={{ ...S.label, color: "var(--gold)" }}>Editando Aula: {lesson.title}</p>
                          <div style={{ display: "grid", gap: 12 }}>
                        <div className="ka-field" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <label className="ka-label">Título</label>
                          <input className="ka-input" value={editLesson.title} onChange={e => setEditLesson(l => ({ ...l, title: e.target.value }))} />
                        </div>
                        <div className="ka-field" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <label className="ka-label">URL YouTube</label>
                          <input className="ka-input" value={editLesson.youtubeUrl} onChange={e => setEditLesson(l => ({ ...l, youtubeUrl: e.target.value }))} />
                        </div>
                        <div className="ka-field" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <label className="ka-label">Conteúdo (HTML)</label>
                          <textarea className="ka-textarea" value={editLesson.content || ""} onChange={e => setEditLesson(l => ({ ...l, content: e.target.value }))} rows={4} placeholder="HTML da apostila" />
                        </div>
                            
                            {/* Anexos */}
                            <div style={{ padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(201,169,122,0.15)" }}>
                              <p className="ka-label" style={{ fontSize: 9, marginBottom: 12 }}>Materiais de Apoio (Anexos)</p>
                              {editLesson.attachments.map((at, i) => (
                                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                  <input className="ka-input" style={{ flex: 1 }} value={at.title} onChange={e => setEditLesson(l => ({ ...l, attachments: l.attachments.map((a, j) => i === j ? { ...a, title: e.target.value } : a) }))} placeholder="Título do arquivo" />
                                  <input className="ka-input" style={{ flex: 2 }} value={at.url} onChange={e => setEditLesson(l => ({ ...l, attachments: l.attachments.map((a, j) => i === j ? { ...a, url: e.target.value } : a) }))} placeholder="URL do arquivo" />
                                  <button onClick={() => setEditLesson(l => ({ ...l, attachments: l.attachments.filter((_, j) => i !== j) }))} style={S.btnRed}><Trash2 size={13} /></button>
                                </div>
                              ))}
                              <button onClick={() => setEditLesson(l => ({ ...l, attachments: [...l.attachments, { title: "", url: "" }] }))} className="ka-btn-gold" style={{ width: "100%", marginTop: 4 }}>+ Adicionar Anexo</button>
                            </div>

                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                              <button className="ka-btn-gold" onClick={() => saveEditLesson(mod.id, editingLesson)}>Salvar Alterações</button>
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
                    <p className="ka-label">Nova Aula</p>
                    <div style={{ display: "grid", gap: 12 }}>
                      <input className="ka-input" value={newLesson.title} onChange={e => setNewLesson(l => ({ ...l, title: e.target.value }))} placeholder="Título" />
                      <input className="ka-input" value={newLesson.youtubeUrl} onChange={e => setNewLesson(l => ({ ...l, youtubeUrl: e.target.value }))} placeholder="Link YouTube" />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="ka-btn-gold" onClick={() => addLesson(mod.id)}>Adicionar</button>
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
