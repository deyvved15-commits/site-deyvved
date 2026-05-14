import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { getGoogleDriveImageUrl } from "@/lib/utils";
import { GraduationCap, Clock, Award } from "lucide-react";

export default async function PublicCoursesPage() {
  const session = await auth().catch(() => null);
  const courses = await prisma.course.findMany({
    where: { published: true },
    include: {
      teachers: { include: { teacher: { select: { name: true } } } },
      _count: { select: { modules: true } }
    },
    orderBy: { order: "asc" }
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--navy-darkest)", color: "white" }}>
      {/* Hero / Header */}
      <div style={{ padding: "80px 20px 40px", textAlign: "center", background: "linear-gradient(180deg, rgba(201,169,122,0.1) 0%, transparent 100%)" }}>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 42, marginBottom: 16 }}>Nossos <span style={{ color: "var(--gold)" }}>Treinamentos</span></h1>
        <p style={{ color: "var(--text-muted)", maxWidth: 600, margin: "0 auto", fontSize: 16 }}>
          Explore nossa academia e comece sua jornada de conhecimento hoje mesmo.
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 32 }}>
        {courses.map(course => (
          <Link key={course.id} href={`/curso/${course.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ 
              background: "var(--navy-card)", borderRadius: 24, border: "1px solid var(--gold-15)", 
              overflow: "hidden", transition: "transform 0.3s ease", cursor: "pointer"
            }} className="course-card-hover">
              <div style={{ aspectRatio: "16/9", position: "relative", overflow: "hidden" }}>
                <img 
                  src={getGoogleDriveImageUrl(course.thumbnail || "")} 
                  alt={course.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              
              <div style={{ padding: "24px" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 10, background: "rgba(201,169,122,0.1)", color: "var(--gold)", padding: "4px 10px", borderRadius: 20, fontWeight: 700, letterSpacing: 1 }}>
                    {course.category || "CURSO"}
                  </span>
                </div>
                
                <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, marginBottom: 16, height: 54, overflow: "hidden" }}>{course.title}</h3>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 12 }}>
                    <GraduationCap size={14} />
                    {course._count.modules} Módulos
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--gold)" }}>
                    {course.price ? `R$ ${course.price.toFixed(2).replace(".", ",")}` : "Gratuito"}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .course-card-hover:hover {
          transform: translateY(-8px);
          border-color: var(--gold-35) !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
      `}</style>
    </div>
  );
}
