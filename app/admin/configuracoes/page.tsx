import { requireAdmin } from "@/app/server/auth";
import { appUrl } from "@/app/lib/env";
import { PasswordForm } from "./PasswordForm";

export const dynamic = "force-dynamic";

export default async function Configuracoes() {
  const user = await requireAdmin();
  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="font-display text-2xl font-bold">Configurações</h1>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-semibold">Alterar senha</h2>
        <PasswordForm />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 font-semibold">Conta</h2>
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between"><dt className="text-slate-500">E-mail</dt><dd>{user.email}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">Papel</dt><dd>{user.role}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">URL da aplicação</dt><dd className="truncate">{appUrl()}</dd></div>
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-2 font-semibold">Notificações e integrações</h2>
        <p className="text-sm text-slate-500">
          Notificação de novo lead por e-mail e webhook por campanha/hotel serão configurados por variáveis de ambiente
          na próxima etapa (ver roadmap no README). As chaves nunca ficam expostas no navegador.
        </p>
      </section>
    </div>
  );
}
