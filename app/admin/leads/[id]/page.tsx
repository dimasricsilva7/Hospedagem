import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/app/server/auth";
import { db } from "@/app/lib/db";
import { formatDateTime } from "@/app/lib/format";
import { updateLeadAction } from "../actions";

export const dynamic = "force-dynamic";

const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900";

export default async function LeadDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { saved } = await searchParams;
  const lead = await db.lead.findUnique({ where: { id }, include: { hotel: { select: { name: true } }, campaign: { select: { name: true } } } });
  if (!lead) notFound();

  const custom = (lead.customFields as Record<string, string> | null) ?? {};
  const consent = (lead.consentData as { marketing?: boolean; lgpd?: boolean; at?: string } | null) ?? {};
  const rows: [string, string | null | undefined][] = [
    ["E-mail", lead.email],
    ["Telefone", lead.phone],
    ["Hotel", lead.hotel?.name],
    ["Campanha", lead.campaign?.name],
    ["Cadastro", formatDateTime(lead.createdAt)],
    ["UTM source", lead.utmSource],
    ["UTM medium", lead.utmMedium],
    ["UTM campaign", lead.utmCampaign],
    ["UTM content", lead.utmContent],
    ["UTM term", lead.utmTerm],
    ["fbclid", lead.fbclid],
    ["gclid", lead.gclid],
    ["Página", lead.landingPage],
    ["Consentimento marketing", consent.marketing ? "Sim" : "Não"],
    ["Consentimento LGPD", consent.lgpd ? `Sim (${consent.at ? formatDateTime(consent.at) : ""})` : "—"],
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/leads" className="text-sm text-slate-500 hover:underline">← Voltar aos leads</Link>
      <h1 className="font-display text-2xl font-bold">{lead.name}</h1>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {rows.filter(([, v]) => v).map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-slate-400">{k}</dt>
              <dd className="break-words text-sm">{v}</dd>
            </div>
          ))}
          {Object.entries(custom).map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-slate-400">{k}</dt>
              <dd className="text-sm">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <form action={updateLeadAction} className="rounded-2xl border border-slate-200 bg-white p-5">
        <input type="hidden" name="id" value={lead.id} />
        <h2 className="mb-4 font-semibold">Atualizar</h2>
        {saved && <p className="mb-3 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">Alterações salvas.</p>}
        <div className="grid gap-4">
          <label><span className="mb-1 block text-xs font-medium text-slate-500">Status</span>
            <select name="status" defaultValue={lead.status} className={input}>
              <option value="NOVO">Novo</option>
              <option value="CONTATADO">Contatado</option>
              <option value="NEGOCIACAO">Em negociação</option>
              <option value="CONVERTIDO">Convertido</option>
              <option value="DESCARTADO">Descartado</option>
            </select>
          </label>
          <label><span className="mb-1 block text-xs font-medium text-slate-500">Observações</span>
            <textarea name="notes" rows={4} defaultValue={lead.notes ?? ""} className={input} />
          </label>
        </div>
        <button className="mt-4 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white">Salvar</button>
      </form>
    </div>
  );
}
