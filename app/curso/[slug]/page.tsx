import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getGoogleDriveImageUrl } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug, published: true }, select: { title: true, description: true, salesHeadline: true, thumbnail: true } });
  if (!course) return {};
  return {
    title: `${course.salesHeadline || course.title} — Kadima Academy`,
    description: course.description ?? undefined,
    openGraph: { title: course.salesHeadline || course.title, description: course.description ?? undefined, images: course.thumbnail ? [course.thumbnail] : [] },
  };
}

export default async function CursoPublicoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth().catch(() => null);

  const course = await prisma.course.findUnique({
    where: { slug, published: true },
    include: {
      teachers: { include: { teacher: { select: { name: true, avatar: true } } } },
      modules: {
        orderBy: { order: "asc" },
        include: { _count: { select: { lessons: true } } },
      },
      _count: { select: { enrollments: true } },
    },
  });
  if (!course) notFound();

  const totalLessons = course.modules.reduce((a, m) => a + m._count.lessons, 0);
  const totalHours = course.modules.reduce((a) => a, 0);
  const thumbUrl = course.thumbnail?.includes("drive.google.com")
    ? getGoogleDriveImageUrl(course.thumbnail)
    : course.thumbnail;

  const enrollment = session
    ? await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
      })
    : null;

  const ctaHref = enrollment ? `/cursos/${slug}` : `/checkout/${course.id}`;
  const ctaLabel = enrollment ? "Continuar Estudando" : course.price ? `Matricular-se · R$ ${course.price.toFixed(2).replace(".", ",")}` : "Acessar Gratuitamente";

  const teacherNames = course.teachers.map(ct => ct.teacher.name).join(", ");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #060D1F; color: #fff; font-family: 'Poppins', sans-serif; overflow-x: hidden; }
        a { text-decoration: none; color: inherit; }
        .sp-section { max-width: 1080px; margin: 0 auto; padding: 72px 40px; }
        .sp-grid { display: grid; grid-template-columns: 1fr 360px; gap: 56px; align-items: start; }
        .sp-sticky { position: sticky; top: 80px; }
        .sp-divider { width: 48px; height: 3px; background: linear-gradient(90deg, #C9A97A, #A07840); border-radius: 2px; margin-bottom: 20px; }
        .sp-tag { display: inline-block; padding: 4px 14px; border-radius: 999px; background: rgba(201,169,122,0.10); border: 1px solid rgba(201,169,122,0.25); color: #C9A97A; font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; font-family: 'Cinzel', serif; }
        .sp-cta-btn { display: block; width: 100%; padding: 16px 24px; border-radius: 14px; background: linear-gradient(135deg, #C9A97A, #A07840); color: #060D1F; font-family: 'Cinzel', serif; font-weight: 700; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; text-align: center; box-shadow: 0 8px 32px rgba(201,169,122,0.40); transition: transform 0.2s, box-shadow 0.2s; border: none; cursor: pointer; }
        .sp-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(201,169,122,0.55); }
        .sp-module { padding: 18px 24px; border-radius: 14px; background: rgba(15,26,61,0.60); border: 1px solid rgba(201,169,122,0.08); display: flex; align-items: center; gap: 16px; margin-bottom: 8px; }
        .sp-outcome-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; font-size: 14px; color: rgba(255,255,255,0.75); line-height: 1.6; }
        .sp-stat { text-align: center; padding: 20px; border-radius: 16px; background: rgba(15,26,61,0.60); border: 1px solid rgba(201,169,122,0.10); }
        @media (max-width: 900px) {
          .sp-grid { grid-template-columns: 1fr; }
          .sp-sticky { position: static; }
          .sp-section { padding: 48px 20px; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(6,13,31,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(201,169,122,0.10)", padding: "14px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 15, letterSpacing: 4, color: "#C9A97A" }}>
          KADIMA <span style={{ fontSize: 10, letterSpacing: 6, color: "#E8D5A8" }}>ACADEMY</span>
        </Link>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {session ? (
            <Link href="/dashboard" style={{ padding: "8px 18px", borderRadius: 10, background: "rgba(201,169,122,0.10)", border: "1px solid rgba(201,169,122,0.25)", color: "#C9A97A", fontSize: 12, fontWeight: 600 }}>Minha Área</Link>
          ) : (
            <>
              <Link href="/login" style={{ padding: "8px 18px", borderRadius: 10, color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 500 }}>Entrar</Link>
              <Link href="/cadastro" style={{ padding: "8px 18px", borderRadius: 10, background: "linear-gradient(135deg, #C9A97A, #A07840)", color: "#060D1F", fontSize: 12, fontWeight: 700 }}>Cadastrar</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: "linear-gradient(160deg, #060D1F 0%, #0D1A3A 50%, #060D1F 100%)", borderBottom: "1px solid rgba(201,169,122,0.08)", padding: "80px 40px 0" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div className="sp-grid" style={{ alignItems: "end", paddingBottom: 0 }}>
            {/* Left */}
            <div style={{ paddingBottom: 72 }}>
              {course.category && <span className="sp-tag" style={{ marginBottom: 20, display: "inline-block" }}>{course.category}</span>}
              <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 44, letterSpacing: 1.5, color: "#fff", lineHeight: 1.15, marginBottom: 20 }}>
                {course.salesHeadline || course.title}
              </h1>
              {course.description && (
                <p style={{ fontSize: 16, fontWeight: 300, color: "rgba(255,255,255,0.60)", lineHeight: 1.85, maxWidth: 580, marginBottom: 32 }}>
                  {course.description}
                </p>
              )}

              {/* Stats row */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 36 }}>
                {[
                  { v: `${course._count.enrollments}`, l: "alunos" },
                  { v: `${course.modules.length}`, l: "módulos" },
                  { v: `${totalLessons}`, l: "aulas" },
                  ...(course.hasCertificate ? [{ v: "✓", l: "certificado" }] : []),
                ].map(({ v, l }) => (
                  <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 20px", borderRadius: 12, background: "rgba(201,169,122,0.06)", border: "1px solid rgba(201,169,122,0.14)" }}>
                    <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 22, color: "#E8D5A8" }}>{v}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.40)", textTransform: "uppercase", letterSpacing: 2, marginTop: 2 }}>{l}</span>
                  </div>
                ))}
              </div>

              {teacherNames && (
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.40)" }}>
                  Com <span style={{ color: "#C9A97A", fontWeight: 600 }}>{teacherNames}</span>
                </p>
              )}
            </div>

            {/* Right — thumbnail floats into hero bottom */}
            {thumbUrl && (
              <div style={{ paddingBottom: 0, display: "flex", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: 340, borderRadius: "20px 20px 0 0", overflow: "hidden", border: "1px solid rgba(201,169,122,0.18)", borderBottom: "none", boxShadow: "0 -8px 60px rgba(0,0,0,0.60)", background: "#080E22" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbUrl} alt={course.title} style={{ width: "100%", aspectRatio: "4/3", objectFit: "contain", display: "block" }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <div className="sp-section">
        <div className="sp-grid">

          {/* ── LEFT COLUMN ── */}
          <div>

            {/* O que você vai aprender */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <div style={{ marginBottom: 64, padding: "32px 36px", borderRadius: 20, background: "rgba(15,26,61,0.50)", border: "1px solid rgba(201,169,122,0.12)" }}>
                <div className="sp-divider" />
                <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 20, color: "#fff", marginBottom: 28, letterSpacing: 1.5 }}>
                  O que você vai <span style={{ color: "#C9A97A" }}>aprender</span>
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "4px 24px" }}>
                  {course.learningOutcomes.map((item, i) => (
                    <div key={i} className="sp-outcome-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A97A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Para quem é */}
            {course.targetAudience && (
              <div style={{ marginBottom: 64 }}>
                <div className="sp-divider" />
                <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 20, color: "#fff", marginBottom: 20, letterSpacing: 1.5 }}>
                  Para <span style={{ color: "#C9A97A" }}>quem é</span> este curso
                </h2>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.85, whiteSpace: "pre-line" }}>
                  {course.targetAudience}
                </p>
              </div>
            )}

            {/* Conteúdo do curso */}
            <div style={{ marginBottom: 64 }}>
              <div className="sp-divider" />
              <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 20, color: "#fff", marginBottom: 28, letterSpacing: 1.5 }}>
                Conteúdo do <span style={{ color: "#C9A97A" }}>Curso</span>
              </h2>
              <div>
                {course.modules.map((mod, i) => (
                  <div key={mod.id} className="sp-module">
                    <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: "rgba(201,169,122,0.08)", border: "1px solid rgba(201,169,122,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 13, color: "#C9A97A" }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 14, color: "#fff", marginBottom: 3 }}>{mod.title}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{mod._count.lessons} aula{mod._count.lessons !== 1 ? "s" : ""}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,122,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                ))}
              </div>
            </div>

            {/* Professor */}
            {course.teachers.length > 0 && (
              <div style={{ marginBottom: 64 }}>
                <div className="sp-divider" />
                <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 20, color: "#fff", marginBottom: 28, letterSpacing: 1.5 }}>
                  {course.teachers.length === 1 ? "Seu" : "Seus"} <span style={{ color: "#C9A97A" }}>professor{course.teachers.length !== 1 ? "es" : ""}</span>
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {course.teachers.map(ct => (
                    <div key={ct.teacher.name} style={{ display: "flex", gap: 20, alignItems: "flex-start", padding: "24px", borderRadius: 20, background: "rgba(15,26,61,0.50)", border: "1px solid rgba(201,169,122,0.10)" }}>
                      <div style={{ width: 60, height: 60, borderRadius: "50%", flexShrink: 0, background: "radial-gradient(circle at 30% 30%, #E8D5A8, #C9A97A 50%, #A07840)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 20, color: "#060D1F", boxShadow: "0 0 20px rgba(201,169,122,0.30)" }}>
                        {ct.teacher.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 6 }}>{ct.teacher.name}</p>
                        {course.teacherBio && (
                          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.75 }}>{course.teacherBio}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN — sticky card ── */}
          <div className="sp-sticky">
            <div style={{ borderRadius: 24, overflow: "hidden", background: "linear-gradient(160deg, #0D1A3A 0%, #0A1129 100%)", border: "1px solid rgba(201,169,122,0.18)", boxShadow: "0 24px 80px rgba(0,0,0,0.60)" }}>
              {thumbUrl && (
                <div style={{ height: 190, overflow: "hidden", background: "#080E22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbUrl} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
              )}
              <div style={{ padding: "28px 28px 32px" }}>
                {course.price && !enrollment ? (
                  <>
                    <p style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 36, color: "#E8D5A8", marginBottom: 4 }}>
                      R$ {course.price.toFixed(2).replace(".", ",")}
                    </p>
                    {course.paymentType === "MONTHLY" && (
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>por mês · acesso por 30 dias</p>
                    )}
                  </>
                ) : enrollment ? (
                  <p style={{ fontSize: 12, color: "#6ee7b7", fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Você já está matriculado
                  </p>
                ) : null}

                <Link href={ctaHref} className="sp-cta-btn" style={{ marginBottom: 16, display: "block" }}>
                  {ctaLabel}
                </Link>

                {!enrollment && (
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.30)", textAlign: "center", lineHeight: 1.7 }}>
                    Pagamento 100% seguro via Mercado Pago<br />Acesso liberado imediatamente após confirmação
                  </p>
                )}

                <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { icon: "M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5a2.5 2.5 0 0 0 0 5H20", text: `${course.modules.length} módulos · ${totalLessons} aulas` },
                    { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", text: "Acesso vitalício" },
                    ...(course.hasCertificate ? [{ icon: "M12 15l-2 5-1-2-6 2 2-6-5-2 5-2-2-6 6 2 1-6 2 5 5-2-2 6z", text: "Certificado de conclusão" }] : []),
                  ].map(({ icon, text }) => (
                    <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "rgba(255,255,255,0.50)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A97A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d={icon}/>
                      </svg>
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── CTA FINAL ── */}
        {!enrollment && (
          <div style={{ marginTop: 40, textAlign: "center", padding: "60px 40px", borderRadius: 24, background: "linear-gradient(135deg, rgba(201,169,122,0.07) 0%, rgba(201,169,122,0.02) 100%)", border: "1px solid rgba(201,169,122,0.14)" }}>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 4, color: "#C9A97A", textTransform: "uppercase", marginBottom: 16 }}>Pronto para começar?</p>
            <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 28, color: "#fff", marginBottom: 12 }}>
              Junte-se a <span style={{ color: "#C9A97A" }}>{course._count.enrollments} aluno{course._count.enrollments !== 1 ? "s" : ""}</span>
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 32 }}>
              Transforme seu estudo teológico com a Kadima Academy
            </p>
            <Link href={ctaHref} className="sp-cta-btn" style={{ display: "inline-flex", width: "auto", padding: "16px 48px", alignItems: "center", gap: 10 }}>
              {ctaLabel}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(201,169,122,0.08)", padding: "32px 40px", textAlign: "center" }}>
        <Link href="/" style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 14, letterSpacing: 4, color: "#C9A97A" }}>
          KADIMA <span style={{ fontSize: 10, letterSpacing: 6, color: "rgba(201,169,122,0.50)" }}>ACADEMY</span>
        </Link>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.20)", marginTop: 8 }}>© {new Date().getFullYear()} Kadima Academy · Todos os direitos reservados</p>
      </footer>
    </>
  );
}
