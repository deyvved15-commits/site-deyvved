import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Award, ShieldCheck } from "lucide-react";
import { getGoogleDriveImageUrl } from "@/lib/utils";
import type { LayoutElement } from "@/components/admin/certificate-layout-editor";
import PrintButton from "./print-button";

function getElementValue(
  id: string,
  data: { studentName: string | null; courseTitle: string; customText: string | null; issuedDate: string; teacherNames: string; certId: string }
): string {
  switch (id) {
    case "studentName":  return (data.studentName ?? "Aluno").toUpperCase();
    case "customText":   return data.customText || "concluiu com aproveitamento o curso de formação em";
    case "courseTitle":  return data.courseTitle;
    case "date":         return data.issuedDate;
    case "teacherName":  return data.teacherNames || "Diretoria Acadêmica";
    case "certId":       return `ID: ${data.certId.slice(-8).toUpperCase()}`;
    default:             return "";
  }
}

export default async function CertificatePage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ userId?: string }>;
}) {
  const session = await auth();
  if (!session) return null;
  const { courseId } = await params;
  const { userId: queryUserId } = await searchParams;

  let targetUserId = session.user.id;
  if (queryUserId && (session.user.role === "ADMIN" || session.user.role === "TEACHER")) {
    targetUserId = queryUserId;
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: { lessons: { include: { progress: { where: { userId: targetUserId } } } } },
      },
      teachers: { include: { teacher: { select: { name: true } } } },
    },
  });

  if (!course) notFound();

  if (session.user.role === "STUDENT" && targetUserId !== session.user.id) redirect("/dashboard");
  if (!course.hasCertificate || course.paymentType !== "ONE_TIME") redirect("/dashboard");

  const allLessons = course.modules.flatMap(m => m.lessons);
  const totalDone = allLessons.filter(l => l.progress[0]?.completed).length;
  const total = allLessons.length;
  const isComplete = total > 0 && totalDone === total;

  if (!isComplete) redirect(`/cursos/${course.slug}`);

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId }, select: { name: true } });
  if (!targetUser) notFound();

  let certificate = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId: targetUserId, courseId: course.id } },
  });
  if (!certificate) {
    certificate = await prisma.certificate.create({
      data: { userId: targetUserId, courseId: course.id },
    });
  }

  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const teacherNames = course.teachers.map(ct => ct.teacher.name).join(", ");
  const primaryColor = course.certificatePrimaryColor || "#C9A97A";
  const secondaryColor = course.certificateSecondaryColor || "#E8D5A8";
  const customText = course.certificateCustomText || "concluiu com aproveitamento o curso de formação em";

  const bgUrl = course.certificateBg?.includes("drive.google.com")
    ? getGoogleDriveImageUrl(course.certificateBg)
    : course.certificateBg;

  const layout = course.certificateLayout as LayoutElement[] | null;
  const useLayout = Array.isArray(layout) && layout.length > 0;

  const certData = {
    studentName: targetUser.name,
    courseTitle: course.title,
    customText,
    issuedDate,
    teacherNames,
    certId: certificate.id,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050A1F", padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* Barra de ações */}
      <div className="no-print" style={{
        maxWidth: 800, width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 32, padding: "16px 24px",
        background: "rgba(201,169,122,0.1)", borderRadius: 16, border: "1px solid rgba(201,169,122,0.2)",
      }}>
        <div>
          <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 16, color: primaryColor, margin: 0 }}>Certificado Disponível</h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: "4px 0 0" }}>Você concluiu com êxito todos os requisitos deste curso.</p>
        </div>
        <PrintButton color={primaryColor} />
      </div>

      {/* ── CERTIFICADO ── */}
      <div className="certificate-container" style={{
        width: "100%", maxWidth: 1000, aspectRatio: "1.414/1",
        background: bgUrl ? `url('${bgUrl}') center/cover no-repeat` : "white",
        color: "#1a1a1a", position: "relative",
        boxSizing: "border-box",
        ...(useLayout
          ? { padding: 0, overflow: "hidden" }
          : { padding: 60, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }),
        borderRadius: 4,
        boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
        border: bgUrl ? "none" : "20px solid #f8f8f8",
        outline: bgUrl ? "none" : "1px solid #ddd",
      }}>

        {/* ── MODO LAYOUT CUSTOMIZADO ── */}
        {useLayout && layout.map(el => {
          if (!el.visible) return null;
          const value = getElementValue(el.id, certData);
          if (!value) return null;
          const translateX = el.align === "center" ? "-50%" : el.align === "right" ? "-100%" : "0";
          const isMultiLine = el.id === "customText" || el.id === "courseTitle";
          return (
            <div key={el.id} style={{
              position: "absolute",
              left: `${el.x}%`,
              top: `${el.y}%`,
              transform: `translate(${translateX}, -50%)`,
              fontSize: el.fontSize,
              color: el.color,
              fontFamily: el.fontFamily === "Cinzel" ? "'Cinzel', serif" : "'Poppins', sans-serif",
              fontWeight: el.bold ? 700 : 400,
              whiteSpace: isMultiLine ? "normal" : "nowrap",
              textAlign: el.align as React.CSSProperties["textAlign"],
              lineHeight: 1.35,
              maxWidth: isMultiLine ? "75%" : undefined,
            }}>
              {value}
            </div>
          );
        })}

        {/* ── MODO LAYOUT PADRÃO (sem customização) ── */}
        {!useLayout && (
          <>
            {!bgUrl && (
              <>
                <div style={{ position: "absolute", inset: 20, border: `2px solid ${primaryColor}`, pointerEvents: "none" }} />
                <div style={{ position: "absolute", inset: 28, border: `1px solid ${secondaryColor}`, pointerEvents: "none" }} />
              </>
            )}

            {/* Header */}
            <div style={{ marginBottom: 40, position: "relative", zIndex: 2 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <Award size={64} color={primaryColor} strokeWidth={1} />
              </div>
              <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 14, letterSpacing: 6, textTransform: "uppercase", color: primaryColor, margin: 0 }}>
                Kadima Academy
              </h3>
              <div style={{ width: 40, height: 2, background: primaryColor, margin: "16px auto" }} />
              <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 42, fontWeight: 700, letterSpacing: 2, margin: "20px 0 0", color: "#111" }}>
                Certificado de Conclusão
              </h1>
            </div>

            {/* Body */}
            <div style={{ flex: 1, position: "relative", zIndex: 2 }}>
              <p style={{ fontSize: 18, color: "#666", fontStyle: "italic", marginBottom: 10 }}>Certificamos que</p>
              <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 36, fontWeight: 800, margin: "0 0 20px", color: "#000", borderBottom: "2px solid #eee", display: "inline-block", padding: "0 40px 10px" }}>
                {targetUser.name?.toUpperCase()}
              </h2>
              <p style={{ fontSize: 18, color: "#666", lineHeight: 1.6, maxWidth: 600, margin: "20px auto" }}>
                {customText}
                <strong style={{ display: "block", fontSize: 24, color: "#111", marginTop: 10, fontFamily: "'Cinzel',serif" }}>
                  {course.title}
                </strong>
              </p>
            </div>

            {/* Footer */}
            <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 40, position: "relative", zIndex: 2 }}>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 11, color: "#999", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>Data de Emissão</p>
                <p style={{ fontSize: 14, fontWeight: 700, margin: "4px 0 0" }}>{issuedDate}</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 200, height: 1, background: "#ccc", marginBottom: 8 }} />
                <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{teacherNames || "Diretoria Acadêmica"}</p>
                <p style={{ fontSize: 11, color: "#999", margin: 0 }}>Instrutor Responsável</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#10b981", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                  <ShieldCheck size={16} /> Autenticidade Verificada
                </div>
                <p style={{ fontSize: 10, color: "#999", margin: "4px 0 0" }}>ID: {certificate.id.toUpperCase()}</p>
              </div>
            </div>

            {/* Cantos decorativos */}
            {!bgUrl && (
              <>
                <div style={{ position: "absolute", top: 10, left: 10, width: 60, height: 60, borderTop: `4px solid ${primaryColor}`, borderLeft: `4px solid ${primaryColor}` }} />
                <div style={{ position: "absolute", top: 10, right: 10, width: 60, height: 60, borderTop: `4px solid ${primaryColor}`, borderRight: `4px solid ${primaryColor}` }} />
                <div style={{ position: "absolute", bottom: 10, left: 10, width: 60, height: 60, borderBottom: `4px solid ${primaryColor}`, borderLeft: `4px solid ${primaryColor}` }} />
                <div style={{ position: "absolute", bottom: 10, right: 10, width: 60, height: 60, borderBottom: `4px solid ${primaryColor}`, borderRight: `4px solid ${primaryColor}` }} />
              </>
            )}
          </>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0; padding: 0; }
          .certificate-container {
            box-shadow: none !important;
            border: none !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            position: fixed !important;
            top: 0 !important; left: 0 !important;
            border-radius: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page { size: landscape; margin: 0; }
        }
      `}</style>
    </div>
  );
}
