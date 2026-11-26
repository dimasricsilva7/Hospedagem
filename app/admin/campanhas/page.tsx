import Link from "next/link";
import { Plus, Pencil, ExternalLink, Copy } from "lucide-react";
import { requireAdmin } from "@/app/server/auth";
import { db } from "@/app/lib/db";
import { setStatus, duplicateCampaign, deleteCampaign } from "./actions";

export const dynamic = "force-dynamic";

const statusBadge: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  DRAFT: "bg-slate-100 text-slate-500",
  SCHEDULED: "bg-amber-100 text-amber-700",
};

export default async function CampanhasPage() {
  await requireAdmin();
  const [campaigns, hotelCount] = await Promise.all([
    db.campaign.findMany({ orderBy: { createdAt: "desc" }, include: { hotel: { select: { name: true, slug: true } }, _count: { select: { leads: true } } } }),
    db.hotel.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Campanhas</h1>
        {hotelCount > 0 && (
          <Link href="/admin/campanhas/nova" className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
            <Plus className="size-4" /> Nova campanha
          </Link>
        )}
      </div>

      {hotelCount === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          Cadastre um hotel antes de criar campanhas. <Link href="/admin/hoteis/novo" className="font-medium text-slate-900 underline">Cadastrar hotel</Link>
        </p>
      ) : campaigns.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">Nenhuma campanha ainda.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Campanha</th>
                <th className="px-4 py-3 font-medium">Hotel</th>
                <th className="px-4 py-3 font-medium">URL</th>
                <th className="px-4 py-3 font-medium">Leads</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((c) => {
                const url = `/${c.hotel.slug}/${c.slug}`;
                return (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-slate-500">{c.hotel.name}</td>
                    <td className="px-4 py-3 text-slate-500">{url}</td>
                    <td className="px-4 py-3 tabular-nums">{c._count.leads}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${statusBadge[c.status]}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-3">
                        <Link href={`/admin/campanhas/${c.id}`} className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"><Pencil className="size-4" /> Editar</Link>
                        <Link href={`/admin/campanhas/${c.id}/reservas`} className="text-slate-600 hover:text-slate-900">Reservas &amp; desconto %</Link>
                        <a href={`${url}?preview=1`} target="_blank" className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"><ExternalLink className="size-4" /> Preview</a>
                        <form action={setStatus}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="status" value={c.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"} />
                          <button className="font-medium text-slate-900 hover:underline">{c.status === "PUBLISHED" ? "Despublicar" : "Publicar"}</button>
                        </form>
                        <form action={duplicateCampaign}>
                          <input type="hidden" name="id" value={c.id} />
                          <button className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"><Copy className="size-4" /> Duplicar</button>
                        </form>
                        <form action={deleteCampaign}>
                          <input type="hidden" name="id" value={c.id} />
                          <button className="text-red-600 hover:underline">Excluir</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
