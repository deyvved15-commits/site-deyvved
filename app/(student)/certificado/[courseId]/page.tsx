import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function CertificadoPage({ params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: {
          lessons: {
            include: { progress: { where: { userId: session.user.id } } },
          },
        },
      },
    },
  });
  if (!course) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (!enrollment) redirect("/dashboard");

  const allLessons = course.modules.flatMap(m => m.lessons);
  const total = allLessons.length;
  const done = allLessons.filter(l => l.progress[0]?.completed).length;
  if (total === 0 || done < total) redirect(`/cursos/${course.slug}`);

  const completedAt = allLessons
    .map(l => l.progress[0]?.completedAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0];

  const dateStr = completedAt
    ? new Date(completedAt).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Poppins:wght@300;400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          background: #1a1a2e;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Poppins', sans-serif;
          padding: 24px;
        }

        .controls {
          display: flex;
          gap: 12px;
          margin-bottom: 32px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn-print {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 24px;
          background: linear-gradient(135deg, #C9A97A, #A07840);
          border: none;
          border-radius: 12px;
          color: #060D1F;
          font-family: 'Cinzel', serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(201,169,122,0.35);
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-print:hover { opacity: 0.9; transform: translateY(-1px); }

        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 24px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          color: rgba(255,255,255,0.6);
          font-family: 'Cinzel', serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-back:hover { color: #fff; border-color: rgba(255,255,255,0.25); }

        /* ── Certificate ── */
        .certificate-wrapper {
          width: 100%;
          max-width: 860px;
        }

        .certificate {
          background: #FDFAF5;
          width: 100%;
          aspect-ratio: 1.414;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 80px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.5);
          overflow: hidden;
        }

        /* Outer border */
        .certificate::before {
          content: '';
          position: absolute;
          inset: 20px;
          border: 2px solid #C9A97A;
          pointer-events: none;
        }

        /* Inner border */
        .certificate::after {
          content: '';
          position: absolute;
          inset: 26px;
          border: 1px solid rgba(201,169,122,0.35);
          pointer-events: none;
        }

        /* Corner ornaments */
        .corner {
          position: absolute;
          width: 40px;
          height: 40px;
          color: #C9A97A;
        }
        .corner svg { width: 100%; height: 100%; }
        .corner-tl { top: 12px; left: 12px; }
        .corner-tr { top: 12px; right: 12px; transform: scaleX(-1); }
        .corner-bl { bottom: 12px; left: 12px; transform: scaleY(-1); }
        .corner-br { bottom: 12px; right: 12px; transform: scale(-1); }

        /* Background watermark */
        .watermark {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.035;
          pointer-events: none;
        }
        .watermark-text {
          font-family: 'Cinzel', serif;
          font-size: 120px;
          font-weight: 900;
          color: #C9A97A;
          letter-spacing: 10px;
          user-select: none;
        }

        /* Content */
        .cert-logo-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          margin-bottom: 28px;
          position: relative;
          z-index: 1;
        }
        .cert-logo-icon {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #1a1f3a, #0d1226);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid rgba(201,169,122,0.4);
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .cert-logo-name {
          font-family: 'Cinzel', serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 5px;
          text-transform: uppercase;
          color: #1a1f3a;
        }
        .cert-logo-sub {
          font-family: 'Cinzel', serif;
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #C9A97A;
          margin-top: -4px;
        }

        .cert-divider {
          width: 120px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #C9A97A, transparent);
          margin: 4px auto 24px;
          position: relative;
          z-index: 1;
        }

        .cert-eyebrow {
          font-family: 'Cinzel', serif;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 5px;
          text-transform: uppercase;
          color: #8a7a60;
          margin-bottom: 12px;
          position: relative;
          z-index: 1;
        }

        .cert-certifica {
          font-family: 'Cinzel', serif;
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #1a1f3a;
          margin-bottom: 18px;
          position: relative;
          z-index: 1;
        }

        .cert-name {
          font-family: 'Cinzel', serif;
          font-size: 32px;
          font-weight: 700;
          color: #1a1f3a;
          letter-spacing: 2px;
          text-align: center;
          line-height: 1.2;
          margin-bottom: 8px;
          position: relative;
          z-index: 1;
        }

        .cert-name-line {
          width: 280px;
          height: 1.5px;
          background: linear-gradient(90deg, transparent, #C9A97A 30%, #C9A97A 70%, transparent);
          margin: 0 auto 20px;
          position: relative;
          z-index: 1;
        }

        .cert-body {
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
          font-weight: 300;
          color: #4a4535;
          text-align: center;
          line-height: 1.8;
          max-width: 480px;
          margin-bottom: 8px;
          position: relative;
          z-index: 1;
        }

        .cert-course {
          font-family: 'Cinzel', serif;
          font-size: 15px;
          font-weight: 700;
          color: #1a1f3a;
          text-align: center;
          letter-spacing: 1px;
          line-height: 1.4;
          margin-bottom: 28px;
          position: relative;
          z-index: 1;
        }

        .cert-footer {
          display: flex;
          align-items: flex-end;
          gap: 60px;
          position: relative;
          z-index: 1;
        }

        .cert-sign-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .cert-sign-line {
          width: 160px;
          height: 1px;
          background: rgba(30,30,50,0.3);
        }
        .cert-sign-name {
          font-family: 'Cinzel', serif;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #6a6050;
          text-align: center;
        }

        .cert-seal {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: 2px solid #C9A97A;
          background: linear-gradient(135deg, #1a1f3a, #0d1226);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 2px;
          box-shadow: 0 0 0 4px rgba(201,169,122,0.12), 0 4px 16px rgba(0,0,0,0.2);
        }
        .cert-seal-text {
          font-family: 'Cinzel', serif;
          font-size: 6px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #C9A97A;
          text-align: center;
          line-height: 1.4;
        }

        .cert-date {
          font-family: 'Poppins', sans-serif;
          font-size: 10px;
          color: #8a7a60;
          text-align: center;
          margin-top: 20px;
          position: relative;
          z-index: 1;
        }

        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            min-height: unset;
          }
          .controls { display: none !important; }
          .certificate {
            box-shadow: none !important;
            width: 100vw !important;
            max-width: 100% !important;
            aspect-ratio: unset !important;
            height: 100vh !important;
          }
          .certificate-wrapper {
            max-width: 100% !important;
            width: 100% !important;
          }
        }

        @page {
          size: A4 landscape;
          margin: 0;
        }
      `}</style>

      <div className="controls">
        <Link href={`/cursos/${course.slug}`} className="btn-back">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Voltar ao Curso
        </Link>
        <button className="btn-print" onClick={undefined}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Imprimir / Salvar PDF
        </button>
      </div>

      <div className="certificate-wrapper">
        <div className="certificate">
          {/* Watermark */}
          <div className="watermark">
            <span className="watermark-text">KADIMA</span>
          </div>

          {/* Corners */}
          {["corner-tl", "corner-tr", "corner-bl", "corner-br"].map(cls => (
            <div key={cls} className={`corner ${cls}`}>
              <svg viewBox="0 0 40 40" fill="none">
                <path d="M2 2 L2 16 M2 2 L16 2" stroke="#C9A97A" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="2" cy="2" r="2" fill="#C9A97A"/>
              </svg>
            </div>
          ))}

          {/* Logo */}
          <div className="cert-logo-area">
            <div className="cert-logo-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A97A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <span className="cert-logo-name">Kadima</span>
            <span className="cert-logo-sub">Academy</span>
          </div>

          <div className="cert-divider" />

          <p className="cert-eyebrow">Certificado de Conclusão</p>

          <h1 className="cert-certifica">Certifica que</h1>

          <h2 className="cert-name">{session.user.name}</h2>
          <div className="cert-name-line" />

          <p className="cert-body">
            concluiu com êxito o curso
          </p>

          <h3 className="cert-course">{course.title}</h3>

          <div className="cert-footer">
            <div className="cert-sign-block">
              <div className="cert-sign-line" />
              <span className="cert-sign-name">Kadima Academy<br/>Direção Acadêmica</span>
            </div>

            <div className="cert-seal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A97A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <span className="cert-seal-text">KADIMA<br/>ACADEMY</span>
            </div>

            <div className="cert-sign-block">
              <div className="cert-sign-line" />
              <span className="cert-sign-name">Data de Conclusão<br/>{dateStr}</span>
            </div>
          </div>

          <p className="cert-date">Este certificado confirma a conclusão de todas as aulas e atividades do curso.</p>
        </div>
      </div>

      <PrintScript />
    </>
  );
}

function PrintScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          document.querySelector('.btn-print')?.addEventListener('click', function() {
            window.print();
          });
        `,
      }}
    />
  );
}
