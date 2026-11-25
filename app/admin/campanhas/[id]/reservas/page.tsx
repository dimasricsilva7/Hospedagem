import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/app/server/auth";
import { db } from "@/app/lib/db";
import { normalizeReservation } from "@/app/lib/content";
import { ReservaConfigForm } from "./ReservaConfigForm";

export const dynamic = "force-dynamic";

export default async function ReservasConfigPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { saved } = await searchParams;
  const campaign = await db.campaign.findUnique({ where: { id }, include: { hotel: { select: { name: true, slug: true, whatsapp: true } } } });
  if (!campaign) notFound();

  const cfg = normalizeReservation(campaign.reservationConfig);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/campanhas" className="text-sm text-slate-500 hover:underline">← Campanhas</Link>
        <h1 className="mt-2 font-display text-2xl font-bold">Configurações de reservas</h1>
        <p className="text-slate-500">
          {campaign.name} · {campaign.hotel.name} —{" "}
          <Link href={`/admin/hoteis`} className="underline">gerencie os quartos</Link> na área do hotel.
        </p>
      </div>
      <ReservaConfigForm id={campaign.id} values={cfg} hotelWhatsapp={campaign.hotel.whatsapp ?? ""} saved={Boolean(saved)} />
    </div>
  );
}
