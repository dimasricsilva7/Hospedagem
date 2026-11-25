import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { requireAdmin } from "@/app/server/auth";
import { db } from "@/app/lib/db";
import { listRooms } from "@/app/server/reservations";
import { centsToBRL, discountPercent } from "@/app/lib/reservation";
import { deleteRoom, toggleRoom } from "./actions";

export const dynamic = "force-dynamic";

export default async function QuartosPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const hotel = await db.hotel.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!hotel) notFound();
  const rooms = await listRooms(hotel.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/hoteis" className="text-sm text-slate-500 hover:underline">← Hotéis</Link>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Quartos — {hotel.name}</h1>
          <Link href={`/admin/hoteis/${hotel.id}/quartos/novo`} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
            <Plus className="size-4" /> Novo quarto
          </Link>
        </div>
      </div>

      {rooms.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">Nenhum quarto cadastrado. Os quartos aparecem na página de reserva da campanha.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Quarto</th>
                <th className="px-4 py-3 font-medium">Capacidade</th>
                <th className="px-4 py-3 font-medium">Original</th>
                <th className="px-4 py-3 font-medium">Promo</th>
                <th className="px-4 py-3 font-medium">Desconto</th>
                <th className="px-4 py-3 font-medium">Badge</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-slate-500">{r.maxAdults + r.maxChildren} hóspedes</td>
                  <td className="px-4 py-3 text-slate-500 line-through">{centsToBRL(r.priceOriginalCents)}</td>
                  <td className="px-4 py-3 font-medium">{centsToBRL(r.pricePromoCents)}</td>
                  <td className="px-4 py-3 text-slate-500">{discountPercent(r.priceOriginalCents, r.pricePromoCents)}%</td>
                  <td className="px-4 py-3 text-slate-500">{r.badgeCount ? `Restam ${r.badgeCount}` : "—"}</td>
                  <td className="px-4 py-3">
                    <form action={toggleRoom}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="hotelId" value={hotel.id} />
                      <input type="hidden" name="active" value={r.active ? "0" : "1"} />
                      <button className={`rounded-full px-2 py-0.5 text-xs ${r.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{r.active ? "Ativo" : "Inativo"}</button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/hoteis/${hotel.id}/quartos/${r.id}`} className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900">
                        <Pencil className="size-4" /> Editar
                      </Link>
                      <form action={deleteRoom}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="hotelId" value={hotel.id} />
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
