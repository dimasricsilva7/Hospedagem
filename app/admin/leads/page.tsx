import Link from "next/link";
import { Download } from "lucide-react";
import { requireAdmin } from "@/app/server/auth";
import { db } from "@/app/lib/db";
import { listLeads, type LeadFilters } from "@/app/server/leads";
import { formatDateTime } from "@/app/lib/format";
import { normalizePhoneIntl } from "@/app/lib/reservation";
import { DeleteButton } from "@/app/admin/DeleteButton";
import { deleteLeadAction } from "./actions";
import { MessageCircle } from "lucide-react";
import type { LeadStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<LeadStatus, string> = {
  NOVO: "Novo",
  CONTATADO: "Contatado",
  NEGOCIACAO: "Em negociação",
  CONVERTIDO: "Convertido",
  DESCARTADO: "Descartado",
};
const STATUS_STYLE: Record<LeadStatus, string> = {
  NOVO: "bg-blue-100 text-blue-700",
  CONTATADO: "bg-amber-100 text-amber-700",
  NEGOCIACAO: "bg-purple-100 text-purple-700",
  CONVERTIDO: "bg-green-100 text-green-700",
  DESCARTADO: "bg-slate-100 text-slate-500",
};

const inputCls = "rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900";

type SP = { q?: string; hotelId?: string; campaignId?: string; status?: string; from?: string; to?: string; page?: string };

export default async function LeadsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin();
  const sp = await searchParams;
  const filters: LeadFilters = {
    q: sp.q,
    hotelId: sp.hotelId || undefined,
    campaignId: sp.campaignId || undefined,
    status: (sp.status as LeadStatus) || undefined,
    from: sp.from || undefined,
    to: sp.to || undefined,
  };
  const page = Math.max(1, Number(sp.page) || 1);

  const [{ items, total, pages }, hotels, campaigns] = await Promise.all([
    listLeads(filters, page),
    db.hotel.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.campaign.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v && k !== "page") qs.set(k, String(v));
  const pageLink = (p: number) => {
    const q = new URLSearchParams(qs);
    q.set("page", String(p));
    return `/admin/leads?${q}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Leads <span className="text-base font-normal text-slate-400">({total})</span></h1>
        <a href={`/admin/leads/export?${qs}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50">
          <Download className="size-4" /> Exportar CSV
        </a>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <input name="q" defaultValue={sp.q} placeholder="Nome, e-mail ou telefone" className={`${inputCls} min-w-56 flex-1`} />
        <select name="hotelId" defaultValue={sp.hotelId ?? ""} className={inputCls}><option value="">Todos os hotéis</option>{hotels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}</select>
        <select name="campaignId" defaultValue={sp.campaignId ?? ""} className={inputCls}><option value="">Todas as campanhas</option>{campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select name="status" defaultValue={sp.status ?? ""} className={inputCls}><option value="">Todos os status</option>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <input name="from" type="date" defaultValue={sp.from} className={inputCls} />
        <input name="to" type="date" defaultValue={sp.to} className={inputCls} />
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Filtrar</button>
        <Link href="/admin/leads" className="px-2 py-2 text-sm text-slate-500 hover:underline">Limpar</Link>
      </form>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">Nenhum lead encontrado.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Contato</th>
                  <th className="px-4 py-3 font-medium">Campanha</th>
                  <th className="px-4 py-3 font-medium">Origem</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3"><Link href={`/admin/leads/${l.id}`} className="font-medium text-slate-900 hover:underline">{l.name}</Link></td>
                    <td className="px-4 py-3 text-slate-500">{l.email}{l.email && l.phone ? " · " : ""}{l.phone}</td>
                    <td className="px-4 py-3 text-slate-500">{l.campaign?.name ?? l.hotel?.name}</td>
                    <td className="px-4 py-3 text-slate-500">{l.utmSource ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDateTime(l.createdAt)}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLE[l.status]}`}>{STATUS_LABEL[l.status]}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {l.phone ? (
                          <a href={`https://wa.me/${normalizePhoneIntl(l.phone)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-green-700 transition hover:bg-green-50" aria-label="Abrir WhatsApp do cliente">
                            <MessageCircle className="size-3.5" /> WhatsApp
                          </a>
                        ) : null}
                        <DeleteButton id={l.id} action={deleteLeadAction} confirmText={`Excluir o lead "${l.name}"? Esta ação não pode ser desfeita.`} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-4 text-sm">
              {page > 1 ? <Link href={pageLink(page - 1)} className="rounded-lg border border-slate-300 px-3 py-1.5">Anterior</Link> : <span className="px-3 py-1.5 text-slate-300">Anterior</span>}
              <span className="text-slate-500">Página {page} de {pages}</span>
              {page < pages ? <Link href={pageLink(page + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5">Próxima</Link> : <span className="px-3 py-1.5 text-slate-300">Próxima</span>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
