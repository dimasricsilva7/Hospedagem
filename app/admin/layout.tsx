import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, Hotel, Megaphone, Users, CalendarCheck, Settings, LogOut } from "lucide-react";
import { getSession } from "@/app/server/auth";
import { logoutAction } from "./actions";

export const metadata: Metadata = { title: "Painel — Hospedagem" };
export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/hoteis", label: "Hotéis", icon: Hotel },
  { href: "/admin/campanhas", label: "Campanhas", icon: Megaphone },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/solicitacoes", label: "Solicitações", icon: CalendarCheck },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  // Login e troca de senha obrigatória não usam o chrome do painel.
  if (!user || user.passwordChangeRequired) {
    return <div className="min-h-screen bg-slate-50 text-slate-900">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:grid lg:grid-cols-[256px_1fr]">
      <aside className="flex flex-col gap-1 border-r border-slate-200 bg-white p-4 lg:min-h-screen">
        <div className="mb-6 px-2 pt-2">
          <p className="font-display text-lg font-bold">Hospedagem</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
        </div>
        <nav className="flex flex-wrap gap-1 lg:flex-col">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
              <n.icon className="size-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction} className="mt-auto pt-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
            <LogOut className="size-4" /> Sair
          </button>
        </form>
      </aside>
      <main className="p-5 sm:p-8">{children}</main>
    </div>
  );
}
