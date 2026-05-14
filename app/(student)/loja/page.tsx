import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SectionHeader from "@/components/student/section-header";
import ProductCard from "@/components/student/product-card";
import CourseCard from "@/components/student/course-card";

export default async function MarketplacePage() {
  const session = await auth();
  
  let products: any[] = [];
  let availableCourses: any[] = [];
  let purchasedProductIds = new Set<string>();

  try {
    const [dbProducts, dbCourses, productPurchases] = await Promise.all([
      prisma.product.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.course.findMany({
        where: { published: true, price: { gt: 0 } },
        orderBy: { order: "asc" },
      }),
      session ? prisma.productPurchase.findMany({
        where: { userId: session.user.id },
        select: { productId: true },
      }) : Promise.resolve([])
    ]);
    products = dbProducts;
    availableCourses = dbCourses;
    purchasedProductIds = new Set(productPurchases.map(p => p.productId));
  } catch (error) {
    console.error("Erro ao carregar loja:", error);
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--navy-darkest)", color: "white", padding: 20 }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Cinzel',serif", color: "var(--gold)" }}>Sistema em Manutenção</h1>
          <p style={{ marginTop: 10 }}>Estamos preparando a loja para você. Por favor, tente novamente em instantes.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      
      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Marketplace</div>
        <h1 className="ka-page-title">Loja <span>Kadima</span></h1>
        <p className="ka-page-subtitle">Cursos, E-books e recursos exclusivos para acelerar sua jornada.</p>
      </div>

      <div className="ka-section" style={{ padding: "38px 44px 44px" }}>
        
        {/* ── Cursos Disponíveis ── */}
        {availableCourses.length > 0 && (
          <div style={{ marginBottom: 64 }}>
            <SectionHeader 
              title="Cursos" 
              highlight="Premium" 
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5a2.5 2.5 0 0 0 0 5H20"/>
                  <path d="M8 7h8M8 11h6"/>
                </svg>
              } 
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 32 }}>
              {availableCourses.map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  isEnrolled={false} 
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Produtos Digitais ── */}
        <SectionHeader 
          title="Produtos" 
          highlight="Digitais" 
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          } 
        />

        {products.length === 0 ? (
          <div style={{ 
            borderRadius: 20, padding: "56px 32px", textAlign: "center", maxWidth: 380, 
            background: "linear-gradient(160deg, var(--navy-card) 0%, var(--navy-card-2) 100%)", 
            border: "1px solid rgba(201,169,122,0.12)" 
          }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Em breve novos produtos</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>Novos recursos e arquivos exclusivos em breve.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 280px))", gap: 24 }}>
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                isPurchased={purchasedProductIds.has(product.id)} 
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
