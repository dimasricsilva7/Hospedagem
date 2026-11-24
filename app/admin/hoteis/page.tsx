import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { requireAdmin } from "@/app/server/auth";
import { db } from "@/app/lib/db";
import { deleteHotel } from "./actions";

export const dynamic = "force-dynamic";

export default async function HoteisPage() {
  await requireAdmin();
  const hotels = await db.hotel.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { campaigns: true, leads: true } } } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Hotéis</h1>
        <Link href="/admin/hoteis/novo" className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
          <Plus className="size-4" /> Novo hotel
        </Link>
      </div>

      {hotels.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">Nenhum hotel cadastrado. Clique em “Novo hotel” para começar.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Hotel</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Campanhas</th>
                <th className="px-4 py-3 font-medium">Leads</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hotels.map((h) => (
                <tr key={h.id}>
                  <td className="px-4 py-3 font-medium">{h.name}</td>
                  <td className="px-4 py-3 text-slate-500">/{h.slug}</td>
                  <td className="px-4 py-3 tabular-nums">{h._count.campaigns}</td>
                  <td className="px-4 py-3 tabular-nums">{h._count.leads}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${h.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{h.isActive ? "Ativo" : "Inativo"}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/hoteis/${h.id}`} className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900">
                        <Pencil className="size-4" /> Editar
                      </Link>
                      <form action={deleteHotel}>
                        <input type="hidden" name="id" value={h.id} />
                        <button className="text-red-600 hover:underline">Excluir</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
