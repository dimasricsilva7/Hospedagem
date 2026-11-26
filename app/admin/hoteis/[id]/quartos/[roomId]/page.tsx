import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/app/server/auth";
import { db } from "@/app/lib/db";
import { getHotelDiscountPercent } from "@/app/server/reservations";
import { RoomForm } from "../RoomForm";

export const dynamic = "force-dynamic";

const centsToInput = (c: number) => (c / 100).toFixed(2).replace(".", ",");

export default async function EditarQuarto({ params }: { params: Promise<{ id: string; roomId: string }> }) {
  await requireAdmin();
  const { id, roomId } = await params;
  const room = await db.room.findFirst({ where: { id: roomId, hotelId: id }, include: { hotel: { select: { name: true } } } });
  if (!room) notFound();
  const discountPercent = await getHotelDiscountPercent(id);

  return (
    <div className="space-y-6">
      <Link href={`/admin/hoteis/${id}/quartos`} className="text-sm text-slate-500 hover:underline">← Quartos de {room.hotel.name}</Link>
      <h1 className="font-display text-2xl font-bold">Editar quarto</h1>
      <RoomForm
        hotelId={id}
        discountPercent={discountPercent}
        values={{
          id: room.id,
          name: room.name,
          description: room.description ?? "",
          mainImage: room.mainImage ?? "",
          images: Array.isArray(room.images) ? (room.images as string[]) : [],
          amenities: Array.isArray(room.amenities) ? (room.amenities as string[]) : [],
          beds: room.beds ?? "",
          maxAdults: room.maxAdults,
          maxChildren: room.maxChildren,
          priceOriginal: centsToInput(room.priceOriginalCents),
          pricePromo: centsToInput(room.pricePromoCents),
          badgeCount: room.badgeCount,
          active: room.active,
          sortOrder: room.sortOrder,
        }}
      />
    </div>
  );
}
