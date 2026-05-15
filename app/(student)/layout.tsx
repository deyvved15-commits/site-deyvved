import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StudentSidebar from "@/components/student/sidebar";
import { calcStreak } from "@/lib/streak";

export const dynamic = 'force-dynamic';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const progress = await prisma.lessonProgress.findMany({
    where: { userId: session.user.id, completed: true },
    select: { completedAt: true },
  });

  const streak = calcStreak(progress.map(p => p.completedAt));

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--navy-darkest)" }}>
      <StudentSidebar user={session.user} streak={streak} />
      <main className="flex-1 overflow-y-auto ka-main">
        {children}
      </main>
    </div>
  );
}
