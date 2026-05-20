import { prisma } from "@/lib/prisma";
import { getYoutubeId } from "@/lib/utils";
import HtmlContent from "@/components/student/html-content";

export const revalidate = 0;

export default async function AulaDaSemanaPage() {
  const data = await prisma.weeklyLesson.findUnique({ where: { id: "weekly" } });
  const youtubeUrl = data?.youtubeUrl ?? "";
  const content = data?.content ?? null;
  const ytId = getYoutubeId(youtubeUrl);

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>

      {/* ── Banner cabeçalho ── */}
      <div className="ka-aula-semana-header" style={{
        margin: "0",
        padding: "28px 44px 24px",
        borderBottom: "1px solid rgba(201,169,122,0.10)",
        background: "linear-gradient(135deg, rgba(201,169,122,0.05) 0%, transparent 60%)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 20, flexWrap: "wrap",
      }}>
        <div>
          {/* Live badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 14px", borderRadius: 999,
            background: "rgba(201,169,122,0.08)",
            border: "1px solid rgba(201,169,122,0.25)",
            marginBottom: 12,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#C9A97A", boxShadow: "0 0 8px #C9A97A",
              display: "block",
            }} />
            <span style={{
              fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 700,
              letterSpacing: 2.5, textTransform: "uppercase", color: "#C9A97A",
            }}>
              Todas as Sextas · 19:30 · Ao Vivo
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Cinzel',serif", fontWeight: 700,
            fontSize: 22, letterSpacing: 2, color: "var(--text-primary)",
            lineHeight: 1.2,
          }}>
            Assista a Gravação <span style={{ color: "var(--gold-light)" }}>da Semana</span>
          </h1>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="ka-aula-semana-body" style={{ padding: "28px 44px 44px", width: "100%" }}>

        {/* Vídeo */}
        {ytId ? (
          <div style={{
            borderRadius: 16, overflow: "hidden",
            aspectRatio: "16/9",
            border: "1px solid rgba(201,169,122,0.12)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.50)",
            marginBottom: 28,
            background: "#000",
          }}>
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
              style={{ width: "100%", height: "100%", display: "block" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div style={{
            borderRadius: 16, aspectRatio: "16/9",
            border: "1px dashed rgba(201,169,122,0.15)",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 14, marginBottom: 28,
          }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,122,0.20)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Nenhuma aula disponível no momento.</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>A gravação é publicada toda sexta após o encontro ao vivo.</p>
          </div>
        )}

        {/* Material HTML */}
        {content && (
          <div style={{
            borderRadius: 16, overflow: "hidden",
            background: "rgba(15,26,61,0.5)",
            border: "1px solid rgba(201,169,122,0.12)",
          }}>
            <div style={{
              padding: "11px 20px",
              borderBottom: "1px solid rgba(201,169,122,0.08)",
              background: "rgba(201,169,122,0.03)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{ width: 3, height: 14, background: "var(--gold)", borderRadius: 2, boxShadow: "0 0 6px var(--gold)" }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)" }}>
                Material da Aula
              </span>
            </div>
            <HtmlContent html={content} className="prose-lesson" style={{ padding: "20px 24px", color: "rgba(255,255,255,0.8)", lineHeight: 1.8, fontSize: 14 }} />
          </div>
        )}
      </div>
    </div>
  );
}
