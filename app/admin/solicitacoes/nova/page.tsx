import Link from "next/link";
import { requireAdmin } from "@/app/server/auth";
import { db } from "@/app/lib/db";
import { getHotelDiscountPercent } from "@/app/server/reservations";
import { ManualReservationForm, type HotelOpt } from "./ManualReservationForm";

export const dynamic = "force-dynamic";

export default async function NovaReserva() {
  await requireAdmin();
  const hotels = await db.hotel.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true, name: true,
      rooms: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { id: true, name: true, mainImage: true, beds: true, maxAdults: true, maxChildren: true, priceOriginalCents: true, pricePromoCents: true, active: true } },
    },
  });
  const discounts = await Promise.all(hotels.map((h) => getHotelDiscountPercent(h.id)));
  const data: HotelOpt[] = hotels.map((h, i) => ({ ...h, discountPercent: discounts[i] }));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/admin/solicitacoes" className="text-sm text-slate-500 hover:underline">← Solicitações</Link>
      <div>
        <h1 className="font-display text-2xl font-bold">Nova reserva (manual)</h1>
        <p className="text-slate-500">Para lançar reservas com dados coletados pelo WhatsApp. O total é recalculado no servidor com o desconto da campanha.</p>
      </div>
      {data.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">Cadastre um hotel e quartos antes de lançar reservas.</p>
      ) : (
        <ManualReservationForm hotels={data} />
      )}
    </div>
  );
}
