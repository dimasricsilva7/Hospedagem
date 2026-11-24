import { redirect } from "next/navigation";
import { ensureInitialAdmin, getSession } from "@/app/server/auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getSession();
  if (user) redirect(user.passwordChangeRequired ? "/admin/trocar-senha" : "/admin/dashboard");
  // Provisiona o admin inicial a partir das envs (idempotente) na primeira visita.
  await ensureInitialAdmin().catch(() => {});

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="font-display text-2xl font-bold">Hospedagem</p>
        <p className="mb-6 mt-1 text-sm text-slate-500">Painel administrativo</p>
        <LoginForm />
      </div>
    </div>
  );
}
