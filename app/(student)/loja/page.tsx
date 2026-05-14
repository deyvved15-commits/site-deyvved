import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MarketplaceClient from "./marketplace-client";

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
        include: { _count: { select: { modules: true } } }
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

      <MarketplaceClient 
        initialProducts={products}
        initialCourses={availableCourses}
        purchasedProductIds={purchasedProductIds}
      />
    </div>
  );
}
