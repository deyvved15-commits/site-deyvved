import Link from "next/link";
import CourseThumbnail from "./course-thumbnail";
import { getGoogleDriveImageUrl } from "@/lib/utils";

interface CourseCardProps {
  course: any; // Using any for now to match current implementation, can be typed better later
  isEnrolled: boolean;
  expiresAt?: Date | null;
}

export default function CourseCard({ course, isEnrolled, expiresAt }: CourseCardProps) {
  const isExpired = !!expiresAt && expiresAt < new Date();
  const daysLeft = expiresAt && !isExpired
    ? Math.ceil((expiresAt.getTime() - Date.now()) / 86400000)
    : null;

  const thumbnailUrl = course.thumbnail?.includes("drive.google.com")
    ? getGoogleDriveImageUrl(course.thumbnail)
    : course.thumbnail;

  if (isEnrolled) {
    const allLessons = course.modules.flatMap((m: any) => m.lessons);
    const done = allLessons.filter((l: any) => l.progress[0]?.completed).length;
    const total = allLessons.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const nextLesson = allLessons.find((l: any) => !l.progress[0]?.completed) ?? allLessons[0];
    const label = pct > 0 && pct < 100 ? "Continuar" : pct === 100 ? "Rever" : "Começar";

    return (
      <article className="ka-card" style={isExpired ? { opacity: 0.7 } : undefined}>
        <div className="ka-thumb">
          {thumbnailUrl && <CourseThumbnail src={thumbnailUrl} alt={course.title} />}
          <div className="ka-thumb-mark">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6.5C2 5.67 2.67 5 3.5 5H8c1.66 0 3 1.34 3 3v12c0-1.1-.9-2-2-2H3.5c-.83 0-1.5-.67-1.5-1.5v-10z"/>
              <path d="M22 6.5C22 5.67 21.33 5 20.5 5H16c-1.66 0-3 1.34-3 3v12c0-1.1.9-2 2-2h5.5c.83 0 1.5-.67 1.5-1.5v-10z"/>
            </svg>
          </div>
          {!isExpired && <div className="ka-progress-badge">{pct}%</div>}
          {isExpired && (
            <div style={{ 
              position: "absolute", top: 10, right: 10, 
              background: "rgba(230,57,70,0.85)", backdropFilter: "blur(4px)", 
              borderRadius: 8, padding: "3px 10px", fontSize: 10, fontWeight: 700, 
              color: "#fff", letterSpacing: 1, textTransform: "uppercase" 
            }}>
              Expirado
            </div>
          )}
          {!isExpired && nextLesson && (
            <Link href={`/cursos/${course.slug}/aula/${nextLesson.id}`} className="ka-play-overlay">
              <div className="ka-play-circle">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </Link>
          )}
        </div>
        <div style={{ padding: "20px 22px 22px" }}>
          <h3 style={{ 
            fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 16, 
            letterSpacing: 1.5, color: "var(--text-primary)", marginBottom: 6, lineHeight: 1.3 
          }}>
            {course.title}
          </h3>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ 
              width: 4, height: 4, borderRadius: "50%", 
              background: isExpired ? "#e63946" : "var(--gold)", 
              boxShadow: `0 0 4px ${isExpired ? "#e63946" : "var(--gold)"}`, flexShrink: 0 
            }} />
            {isExpired
              ? "Acesso expirado — renove para continuar"
              : daysLeft !== null
                ? `${daysLeft} dia${daysLeft !== 1 ? "s" : ""} restante${daysLeft !== 1 ? "s" : ""}`
                : `${done}/${total} aula${total !== 1 ? "s" : ""} concluída${done !== 1 ? "s" : ""}`}
          </div>
          {!isExpired && (
            <div className="ka-progress-bar" style={{ marginBottom: 16 }}>
              <div className="ka-progress-fill" style={{ width: `${pct}%` }} />
            </div>
          )}
          {isExpired ? (
            <Link href={`/checkout/${course.id}`} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none",
              padding: "11px 16px", borderRadius: 12, width: "100%",
              background: "linear-gradient(135deg, #e63946, #c1121f)",
              color: "#fff", fontFamily: "'Cinzel',serif",
              fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase",
              boxShadow: "0 4px 16px rgba(230,57,70,0.30)",
            }}>
              Renovar Acesso
            </Link>
          ) : nextLesson ? (
            <Link href={`/cursos/${course.slug}/aula/${nextLesson.id}`} className="ka-continue-btn">
              {label} <span>→</span>
            </Link>
          ) : (
            <Link href={`/cursos/${course.slug}`} className="ka-continue-btn">Ver Curso →</Link>
          )}
        </div>
      </article>
    );
  }

  // Showcase Card (not enrolled)
  const totalLessons = course.modules?.reduce((a: number, m: any) => a + (m._count?.lessons ?? 0), 0) ?? 0;

  return (
    <article className="ka-other-card" style={{
      background: "linear-gradient(160deg, rgba(17,24,58,0.7) 0%, rgba(22,32,79,0.7) 100%)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 20, overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.30)",
      transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
      opacity: 0.85,
    }}>
      <div style={{ position: "relative", height: 345, background: "linear-gradient(140deg, #080E22, #101830)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailUrl} alt={course.title}
            style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", position: "absolute", inset: 0, filter: "brightness(0.55) saturate(0.7)" }} />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5a2.5 2.5 0 0 0 0 5H20"/>
            </svg>
          </div>
        )}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(6,13,31,0.70)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
        </div>
      </div>

      <div style={{ padding: "18px 20px 20px" }}>
        <h3 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 15, letterSpacing: 1.2, color: "var(--text-secondary)", marginBottom: 6, lineHeight: 1.3 }}>
          {course.title}
        </h3>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <span>{course._count?.modules ?? 0} módulo{course._count?.modules !== 1 ? "s" : ""}</span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--text-muted)", flexShrink: 0 }} />
          <span>{totalLessons} aula{totalLessons !== 1 ? "s" : ""}</span>
        </div>
        {course.price ? (
          <Link href={`/checkout/${course.id}`} style={{
            width: "100%", padding: "10px 14px", borderRadius: 12, textDecoration: "none",
            background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 7,
            color: "var(--navy-darkest)", fontSize: 11, fontWeight: 700,
            fontFamily: "'Cinzel',serif", letterSpacing: 1.5, textTransform: "uppercase",
            boxShadow: "0 4px 16px rgba(201,169,122,0.30)",
          }}>
            <span>Comprar Agora</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>
              R$ {course.price.toFixed(2).replace(".", ",")}
            </span>
          </Link>
        ) : (
          <div style={{
            width: "100%", padding: "10px 14px", borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            color: "var(--text-muted)", fontSize: 11, fontWeight: 600,
            fontFamily: "'Cinzel',serif", letterSpacing: 1.5, textTransform: "uppercase",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Solicitar Acesso
          </div>
        )}
      </div>
    </article>
  );
}
