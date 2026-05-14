import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminProductsClient from "./products-client";

export default async function AdminProductsPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/dashboard");

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { purchases: true } } }
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Cinzel',serif" }}>
            Gestão de <span className="text-[var(--gold)]">Produtos</span>
          </h1>
          <p className="text-slate-400">Crie e gerencie ebooks, arquivos e recursos da loja.</p>
        </div>
      </div>

      <AdminProductsClient initialProducts={products as any} />
    </div>
  );
}
