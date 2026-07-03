import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EntregasClient from "./entregas-client";

export default async function AdminEntregasPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/dashboard");

  const orders = await prisma.productPurchase.findMany({
    where: { shippingCep: { not: null } },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { title: true, weightG: true, heightCm: true, widthCm: true, lengthCm: true } },
    },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Cinzel',serif" }}>
            Gestão de <span className="text-[var(--gold)]">Entregas</span>
          </h1>
          <p className="text-slate-400">Gerencie envios, imprima etiquetas e atualize rastreios.</p>
        </div>
      </div>

      <EntregasClient initialOrders={orders as any} />
    </div>
  );
}
