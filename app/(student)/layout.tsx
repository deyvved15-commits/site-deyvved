import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import StudentSidebar from "@/components/student/sidebar";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#060D1F" }}>
      <StudentSidebar user={session.user} />
      <main className="flex-1 overflow-y-auto ka-main">
        {children}
      </main>
    </div>
  );
}
