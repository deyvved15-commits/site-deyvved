import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LandingHeader from "@/components/landing/landing-header";
import CoursesSection from "@/components/landing/courses-section";

async function getData() {
  const [courses, studentCount] = await Promise.all([
    prisma.course.findMany({
      where: { published: true },
      orderBy: { createdAt: "asc" },
      select: {
        id: true, title: true, slug: true, description: true,
        thumbnail: true, price: true,
        _count: { select: { enrollments: true, modules: true } },
        modules: {
          orderBy: { order: "asc" },
          select: { id: true, title: true, _count: { select: { lessons: true } } },
        },
        teachers: { select: { teacher: { select: { name: true } } } },
      },
    }),
    prisma.user.count({ where: { role: "STUDENT" } }),
  ]);
  return { courses, studentCount };
}

export default async function LandingPage() {
  const { courses, studentCount } = await getData();
  const totalLessons = courses.reduce(
    (sum, c) => sum + c.modules.reduce((s, m) => s + m._count.lessons, 0),
    0
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--navy-darkest)", color: "#fff", fontFamily: "var(--font-poppins)" }}>
      <LandingHeader />

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden", padding: "120px 24px 80px",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,169,122,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 80% at 20% 80%, rgba(15,26,61,0.6) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(201,169,122,0.15) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none", opacity: 0.5 }} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 800 }}>
          <div style={{ marginBottom: 32, display: "inline-block" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-nova.png" alt="Kadima Academy" style={{
              width: 100, height: 100, objectFit: "contain",
              filter: "drop-shadow(0 0 24px rgba(201,169,122,0.55)) drop-shadow(0 0 48px rgba(201,169,122,0.25))",
            }} />
          </div>

          <div style={{ fontSize: 10, fontFamily: "var(--font-cinzel)", letterSpacing: 6, textTransform: "uppercase", color: "var(--gold)", marginBottom: 20 }}>
            Formação Teológica Online
          </div>

          <h1 style={{ fontFamily: "var(--font-cinzel)", fontWeight: 900, fontSize: "clamp(36px, 7vw, 72px)", letterSpacing: 3, lineHeight: 1.05, color: "#fff", marginBottom: 24 }}>
            KADIMA<br />
            <span style={{ color: "var(--gold)", fontSize: "0.65em", letterSpacing: 6 }}>ACADEMY</span>
          </h1>

          <div style={{ width: 80, height: 2, background: "linear-gradient(90deg, transparent, var(--gold), transparent)", margin: "0 auto 28px" }} />

          <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "rgba(255,255,255,0.6)", lineHeight: 1.8, maxWidth: 580, margin: "0 auto 44px" }}>
            Construindo líderes íntegros através da Palavra. Educação teológica com profundidade bíblica e excelência acadêmica — acessível de qualquer lugar do mundo.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#cursos" style={{
              padding: "15px 36px", borderRadius: 12, textDecoration: "none",
              background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
              color: "var(--navy-darkest)", fontFamily: "var(--font-cinzel)",
              fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: "uppercase",
              boxShadow: "0 6px 24px rgba(201,169,122,0.40)",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}>
              Ver Cursos
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <Link href="/login" style={{
              padding: "15px 36px", borderRadius: 12, textDecoration: "none",
              border: "1px solid rgba(201,169,122,0.35)", color: "var(--gold)",
              fontFamily: "var(--font-cinzel)", fontWeight: 600, fontSize: 12,
              letterSpacing: 2, textTransform: "uppercase",
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(201,169,122,0.04)",
            }}>
              Área de Membros
            </Link>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 9, letterSpacing: 4, textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>Rolar</span>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, rgba(201,169,122,0.4), transparent)" }} />
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ borderTop: "1px solid rgba(201,169,122,0.10)", borderBottom: "1px solid rgba(201,169,122,0.10)", background: "rgba(15,26,61,0.40)", backdropFilter: "blur(10px)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 40px", display: "flex", justifyContent: "center", gap: "clamp(32px, 8vw, 100px)", flexWrap: "wrap" }}>
          {[
            { value: studentCount > 0 ? `${studentCount}+` : "∞", label: "Alunos Formados" },
            { value: `${courses.length}`, label: courses.length === 1 ? "Curso Disponível" : "Cursos Disponíveis" },
            { value: `${totalLessons}+`, label: "Aulas Online" },
            { value: "100%", label: "Online e Flexível" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-cinzel)", fontWeight: 700, fontSize: "clamp(28px, 4vw, 42px)", color: "var(--gold)", lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", letterSpacing: 2, textTransform: "uppercase", marginTop: 8 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COURSES SECTION ── */}
      <Suspense fallback={null}>
        <CoursesSection courses={courses} />
      </Suspense>

      {/* ── ABOUT / MISSION ── */}
      <section id="sobre" style={{ padding: "100px 40px", background: "linear-gradient(180deg, var(--navy-darkest) 0%, rgba(15,26,61,0.3) 50%, var(--navy-darkest) 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 600, height: 600, border: "1px solid rgba(201,169,122,0.04)", borderRadius: "50%", top: "50%", right: -200, transform: "translateY(-50%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 300, height: 300, border: "1px solid rgba(201,169,122,0.06)", borderRadius: "50%", top: "50%", right: -50, transform: "translateY(-50%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, fontFamily: "var(--font-cinzel)", letterSpacing: 5, textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>
              Nossa Missão
            </div>
            <h2 style={{ fontFamily: "var(--font-cinzel)", fontWeight: 700, fontSize: "clamp(26px, 3.5vw, 40px)", letterSpacing: 1.5, color: "#fff", marginBottom: 24, lineHeight: 1.2 }}>
              Formando Líderes<br />
              <span style={{ color: "var(--gold)" }}>com a Palavra</span>
            </h2>
            <div style={{ width: 50, height: 2, background: "linear-gradient(90deg, var(--gold), transparent)", marginBottom: 28 }} />
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.9, marginBottom: 20 }}>
              A Kadima Academy nasceu do compromisso de tornar a educação teológica acessível, profunda e transformadora. Nosso nome, "Kadima" (קדימה), significa "em frente" em hebraico — refletindo nossa visão de avançar no conhecimento da Palavra.
            </p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.9, marginBottom: 36 }}>
              Cada curso é desenvolvido por mestres e doutores comprometidos com a excelência bíblica e teológica, formando líderes íntegros para a Igreja e o mundo.
            </p>
            <Link href="/login" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "13px 28px", borderRadius: 10, textDecoration: "none",
              background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
              color: "var(--navy-darkest)", fontFamily: "var(--font-cinzel)",
              fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
              boxShadow: "0 4px 20px rgba(201,169,122,0.30)",
            }}>
              Começar Agora
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { icon: "📖", title: "Profundidade Bíblica", desc: "Ensino fundamentado nas Escrituras, com rigor exegético e hermenêutico." },
              { icon: "🎓", title: "Excelência Acadêmica", desc: "Corpo docente altamente qualificado, materiais de estudo completos." },
              { icon: "🌍", title: "100% Online", desc: "Estude no seu ritmo, de qualquer lugar, com acesso vitalício ao conteúdo." },
              { icon: "✝️", title: "Fé e Razão", desc: "Integrando fé, teologia e vida prática para uma formação integral." },
            ].map(p => (
              <div key={p.title} style={{
                display: "flex", gap: 16, padding: "18px 20px", borderRadius: 14,
                background: "rgba(15,26,61,0.50)", border: "1px solid rgba(201,169,122,0.10)",
                alignItems: "flex-start",
              }}>
                <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{p.icon}</div>
                <div>
                  <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 6 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            #sobre > div { grid-template-columns: 1fr !important; gap: 48px !important; }
          }
        `}</style>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: "80px 40px", background: "linear-gradient(135deg, rgba(15,26,61,0.8) 0%, rgba(10,18,45,0.9) 100%)", borderTop: "1px solid rgba(201,169,122,0.10)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 100% at 50% 50%, rgba(201,169,122,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 680, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontFamily: "var(--font-cinzel)", letterSpacing: 5, textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>
            Comece Hoje
          </div>
          <h2 style={{ fontFamily: "var(--font-cinzel)", fontWeight: 700, fontSize: "clamp(26px, 4vw, 40px)", letterSpacing: 2, color: "#fff", marginBottom: 18, lineHeight: 1.2 }}>
            Sua Jornada Teológica<br />
            <span style={{ color: "var(--gold)" }}>começa aqui</span>
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.50)", lineHeight: 1.8, marginBottom: 36, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
            Junte-se a centenas de alunos que estão sendo transformados pelo conhecimento profundo da Palavra de Deus.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#cursos" style={{
              padding: "15px 40px", borderRadius: 12, textDecoration: "none",
              background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
              color: "var(--navy-darkest)", fontFamily: "var(--font-cinzel)",
              fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: "uppercase",
              boxShadow: "0 6px 24px rgba(201,169,122,0.40)",
            }}>
              Explorar Cursos
            </a>
            <Link href="/login" style={{
              padding: "15px 40px", borderRadius: 12, textDecoration: "none",
              border: "1px solid rgba(201,169,122,0.35)", color: "var(--gold)",
              fontFamily: "var(--font-cinzel)", fontWeight: 600, fontSize: 12,
              letterSpacing: 2, textTransform: "uppercase",
              background: "transparent",
            }}>
              Já sou Aluno
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(201,169,122,0.10)", padding: "48px 40px 32px", background: "var(--navy-darkest)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 40, flexWrap: "wrap", marginBottom: 48 }}>
            <div style={{ maxWidth: 280 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-nova.png" alt="Kadima Academy" style={{ width: 32, height: 32, objectFit: "contain", filter: "drop-shadow(0 0 6px rgba(201,169,122,0.5))" }} />
                <div>
                  <div style={{ fontFamily: "var(--font-cinzel)", fontWeight: 700, fontSize: 13, letterSpacing: 4, color: "#fff" }}>KADIMA</div>
                  <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 8, letterSpacing: 5, color: "var(--gold)" }}>ACADEMY</div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.8 }}>
                Formação teológica online de excelência, construindo líderes para a Igreja e o mundo.
              </p>
            </div>

            <div style={{ display: "flex", gap: 60, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 10, fontFamily: "var(--font-cinzel)", letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>Navegação</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { href: "#cursos", label: "Cursos" },
                    { href: "#sobre", label: "Sobre" },
                    { href: "/login", label: "Área de Membros" },
                  ].map(l => (
                    <a key={l.label} href={l.href} style={{ fontSize: 13, color: "rgba(255,255,255,0.40)", textDecoration: "none" }}>{l.label}</a>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontFamily: "var(--font-cinzel)", letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>Formação</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {courses.slice(0, 4).map(c => (
                    <a key={c.id} href={`/curso/${c.slug}`} style={{ fontSize: 13, color: "rgba(255,255,255,0.40)", textDecoration: "none" }}>{c.title}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: "rgba(201,169,122,0.08)", marginBottom: 24 }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
              © {new Date().getFullYear()} Kadima Academy. Todos os direitos reservados.
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.20)", fontFamily: "var(--font-cinzel)", letterSpacing: 2 }}>
              קדימה · EM FRENTE
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
