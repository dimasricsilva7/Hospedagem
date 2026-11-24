import Link from "next/link";
import { requireAdmin } from "@/app/server/auth";
import { db } from "@/app/lib/db";
import { formatDateTime } from "@/app/lib/format";

export const dynamic = "force-dynamic";

function since(days: number) {
  return new Date(Date.now() - days * 86400_000);
}

export default async function Dashboard() {
  await requireAdmin();

  const [hotels, campaigns, activeCampaigns, leads, leads1, leads7, leads30, recent, byCampaign] = await Promise.all([
    db.hotel.count(),
    db.campaign.count(),
    db.campaign.count({ where: { status: "PUBLISHED" } }),
    db.lead.count(),
    db.lead.count({ where: { createdAt: { gte: since(1) } } }),
    db.lead.count({ where: { createdAt: { gte: since(7) } } }),
    db.lead.count({ where: { createdAt: { gte: since(30) } } }),
    db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { hotel: { select: { name: true } }, campaign: { select: { name: true } } } }),
    db.lead.groupBy({ by: ["campaignId"], _count: { _all: true }, orderBy: { _count: { campaignId: "desc" } }, take: 6 }),
  ]);

  const campaignNames = new Map((await db.campaign.findMany({ select: { id: true, name: true } })).map((c) => [c.id, c.name]));

  const stats = [
    { label: "Hotéis", value: hotels },
    { label: "Campanhas", value: campaigns },
    { label: "Campanhas ativas", value: activeCampaigns },
    { label: "Leads (total)", value: leads },
    { label: "Leads hoje", value: leads1 },
    { label: "Leads 7 dias", value: leads7 },
    { label: "Leads 30 dias", value: leads30 },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold">Últimos cadastros</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum lead ainda.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{l.name}</p>
                    <p className="truncate text-slate-500">{l.campaign?.name ?? l.hotel?.name}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{formatDateTime(l.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/leads" className="mt-3 inline-block text-sm font-medium text-slate-900 underline">Ver todos os leads</Link>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold">Leads por campanha</h2>
          {byCampaign.length === 0 ? (
            <p className="text-sm text-slate-500">Sem dados ainda.</p>
          ) : (
            <ul className="space-y-2">
              {byCampaign.map((row) => (
                <li key={row.campaignId ?? "none"} className="flex items-center justify-between text-sm">
                  <span className="truncate">{row.campaignId ? campaignNames.get(row.campaignId) ?? "—" : "Sem campanha"}</span>
                  <span className="font-semibold tabular-nums">{row._count._all}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
