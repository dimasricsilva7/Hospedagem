import { requireAdmin } from "@/app/server/auth";
import { getPublicBaseUrl, getPublicDomainRaw } from "@/app/server/settings";
import { PasswordForm } from "./PasswordForm";
import { saveDomainAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function Configuracoes({ searchParams }: { searchParams: Promise<{ domain?: string }> }) {
  const user = await requireAdmin();
  const { domain: domainSaved } = await searchParams;
  const [baseUrl, domainRaw] = await Promise.all([getPublicBaseUrl(), getPublicDomainRaw()]);
  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="font-display text-2xl font-bold">Configurações</h1>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-1 font-semibold">Domínio público</h2>
        <p className="mb-4 text-sm text-slate-500">
          Usado nos links e QR Codes enviados ao cliente (comprovante, consulta de reserva). Quando você apontar seu domínio
          próprio, coloque-o aqui — ex.: <code className="rounded bg-slate-100 px-1">nannaimuroalto.com.br</code>. Vazio = usa a URL atual da Vercel.
        </p>
        <form action={saveDomainAction} className="flex flex-wrap items-end gap-3">
          <label className="flex-1">
            <span className="mb-1 block text-sm font-medium">Domínio</span>
            <input name="domain" defaultValue={domainRaw} placeholder="nannaimuroalto.com.br" className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-slate-900" />
          </label>
          <button className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">Salvar</button>
        </form>
        <p className="mt-2 text-xs text-slate-500">Em uso agora: <span className="font-mono">{baseUrl}</span></p>
        {domainSaved && <p className="mt-2 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">Domínio salvo. Os novos links já usam esse endereço.</p>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-semibold">Alterar senha</h2>
        <PasswordForm />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 font-semibold">Conta</h2>
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between"><dt className="text-slate-500">E-mail</dt><dd>{user.email}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">Papel</dt><dd>{user.role}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">URL pública</dt><dd className="truncate">{baseUrl}</dd></div>
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
