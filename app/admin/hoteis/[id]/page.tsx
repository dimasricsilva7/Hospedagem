import { notFound } from "next/navigation";
import { requireAdmin } from "@/app/server/auth";
import { db } from "@/app/lib/db";
import { HotelForm } from "../HotelForm";

export const dynamic = "force-dynamic";

export default async function EditarHotel({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const hotel = await db.hotel.findUnique({ where: { id } });
  if (!hotel) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Editar hotel</h1>
      <HotelForm
        values={{
          id: hotel.id,
          name: hotel.name,
          slug: hotel.slug,
          shortCode: hotel.shortCode ?? "",
          description: hotel.description ?? "",
          logoUrl: hotel.logoUrl ?? "",
          primaryColor: hotel.primaryColor,
          secondaryColor: hotel.secondaryColor,
          whatsapp: hotel.whatsapp ?? "",
          email: hotel.email ?? "",
          instagram: hotel.instagram ?? "",
          facebook: hotel.facebook ?? "",
          city: hotel.city ?? "",
          isActive: hotel.isActive,
        }}
      />
    </div>
  );
}
