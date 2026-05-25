import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MarketplaceClient from "@/app/(student)/loja/marketplace-client";
import StudentSidebar from "@/components/student/sidebar";
import { calcStreak } from "@/lib/streak";

export const dynamic = 'force-dynamic';

export default async function LojaPage() {
  const session = await auth().catch(() => null);

  const [products, courses, productPurchases] = await Promise.all([
    prisma.product.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.findMany({
      where: { published: true, price: { gt: 0 } },
      orderBy: { order: "asc" },
      include: { _count: { select: { modules: true } } },
    }),
    session
      ? prisma.productPurchase.findMany({
          where: { userId: session.user.id },
          select: { productId: true },
        })
      : Promise.resolve([]),
  ]);

  const purchasedProductIds = new Set(productPurchases.map((p) => p.productId));

  const content = (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Kadima Academy</div>
        <h1 className="ka-page-title">Loja <span>Digital</span></h1>
        <p className="ka-page-subtitle">Cursos, materiais e recursos para o seu crescimento teológico</p>
      </div>
      <MarketplaceClient
        initialProducts={products}
        initialCourses={courses}
        purchasedProductIds={purchasedProductIds}
      />
    </div>
  );

  // ── Aluno logado: exibe com sidebar ──
  if (session) {
    const progress = await prisma.lessonProgress.findMany({
      where: { userId: session.user.id, completed: true },
      select: { completedAt: true },
    });
    const streak = calcStreak(progress.map(p => p.completedAt));

    return (
      <div className="flex h-screen overflow-hidden" style={{ background: "var(--navy-darkest)" }}>
        <StudentSidebar user={session.user} streak={streak} />
        <main className="flex-1 overflow-y-auto ka-main">
          {content}
        </main>
      </div>
    );
  }

  // ── Visitante: exibe com nav pública ──
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #060D1F 0%, #0A1530 100%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Poppins:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }
      `}</style>

      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(6,13,31,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(201,169,122,0.12)",
        padding: "14px 40px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 16, letterSpacing: 4, color: "#C9A97A" }}>
          KADIMA <span style={{ fontSize: 10, letterSpacing: 6, color: "#E8D5A8" }}>ACADEMY</span>
        </Link>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/login" style={{ padding: "8px 20px", borderRadius: 10, color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 500 }}>
            Entrar
          </Link>
          <Link href="/cadastro" style={{ padding: "8px 20px", borderRadius: 10, background: "linear-gradient(135deg, #C9A97A, #A07840)", color: "#060D1F", fontSize: 12, fontWeight: 700 }}>
            Cadastrar
          </Link>
        </div>
      </nav>

      <div style={{ padding: "56px 44px 32px" }}>
        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "#C9A97A", marginBottom: 10 }}>
          Kadima Academy
        </p>
        <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 36, letterSpacing: 2, color: "#fff", marginBottom: 10 }}>
          Loja <span style={{ color: "#C9A97A" }}>Digital</span>
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.50)", fontWeight: 300 }}>
          Cursos, materiais e recursos para o seu crescimento teológico
        </p>
      </div>

      <MarketplaceClient
        initialProducts={products}
        initialCourses={courses}
        purchasedProductIds={purchasedProductIds}
      />
    </div>
  );
}
