import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/sidebar";

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#060D1F" }}>
      <AdminSidebar user={session.user} />
      <main className="flex-1 overflow-y-auto ka-main">
        {children}
      </main>
    </div>
  );
}
