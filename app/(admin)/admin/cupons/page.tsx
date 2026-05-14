import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CouponList from "@/components/admin/coupon-list";

export default async function AdminCouponsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%)" }}>
      <div className="ka-page-header">
        <div className="ka-page-eyebrow">Gestão</div>
        <h1 className="ka-page-title">Cupons de <span>Desconto</span></h1>
        <p className="ka-page-subtitle">Crie e gerencie cupons para suas campanhas de vendas.</p>
      </div>

      <div className="ka-section" style={{ padding: "0 44px 44px" }}>
        <CouponList initialCoupons={coupons} />
      </div>
    </div>
  );
}
