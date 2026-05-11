import { auth } from "@/lib/auth";
import Link from "next/link";
import { BookOpen, Home, LogOut, MessageSquare, Users } from "lucide-react";
import { signOut } from "@/lib/auth";

export default function ProfessorSidebar({ user }: { user: any }) {
  const menuItems = [
    { label: "Dashboard", href: "/professor", icon: <Home size={18} /> },
    { label: "Meus Cursos", href: "/professor/cursos", icon: <BookOpen size={18} /> },
    { label: "Comentários", href: "/professor/comentarios", icon: <MessageSquare size={18} /> },
  ];

  return (
    <aside className="ka-sidebar">
      <div className="ka-sidebar-brand">
        <img src="/logo-nova.png" alt="Kadima Academy" className="ka-sidebar-logo" />
      </div>

      <div className="ka-sidebar-user">
        <div className="ka-sidebar-avatar">{user.name?.[0]}</div>
        <div className="ka-sidebar-info">
          <p className="ka-sidebar-name">{user.name}</p>
          <p className="ka-sidebar-role">Professor</p>
        </div>
      </div>

      <nav className="ka-sidebar-nav">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} className="ka-sidebar-link">
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="ka-sidebar-footer">
        <form action={async () => { "use server"; await signOut(); }}>
          <button className="ka-sidebar-logout">
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
