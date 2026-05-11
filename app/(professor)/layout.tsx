import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfessorSidebar from "@/components/professor/sidebar";

export default async function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#060D1F" }}>
      <ProfessorSidebar user={session.user} />
      <main className="flex-1 overflow-y-auto ka-main">
        {children}
      </main>
    </div>
  );
}
