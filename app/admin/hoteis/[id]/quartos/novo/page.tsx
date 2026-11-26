import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/app/server/auth";
import { db } from "@/app/lib/db";
import { getHotelDiscountPercent } from "@/app/server/reservations";
import { RoomForm } from "../RoomForm";

export const dynamic = "force-dynamic";

export default async function NovoQuarto({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const hotel = await db.hotel.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!hotel) notFound();
  const discountPercent = await getHotelDiscountPercent(hotel.id);
  return (
    <div className="space-y-6">
      <Link href={`/admin/hoteis/${hotel.id}/quartos`} className="text-sm text-slate-500 hover:underline">← Quartos de {hotel.name}</Link>
      <h1 className="font-display text-2xl font-bold">Novo quarto</h1>
      <RoomForm hotelId={hotel.id} discountPercent={discountPercent} />
    </div>
  );
}
