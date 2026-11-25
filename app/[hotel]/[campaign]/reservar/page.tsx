import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/app/lib/db";
import { normalizeContent, normalizeReservation } from "@/app/lib/content";
import { listActiveRooms } from "@/app/server/reservations";
import { discountPercent } from "@/app/lib/reservation";
import { ReservaFlow, type RoomDTO } from "./ReservaFlow";

export const dynamic = "force-dynamic";

type Params = { hotel: string; campaign: string };

export const metadata: Metadata = { robots: { index: false, follow: true } }; // etapa de funil: não indexar

export default async function ReservarPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ lead?: string }>;
}) {
  const { hotel, campaign } = await params;
  const { lead: leadId } = await searchParams;

  const c = await db.campaign
    .findFirst({ where: { slug: campaign, hotel: { slug: hotel } }, include: { hotel: true } })
    .catch(() => null);
  if (!c || c.status !== "PUBLISHED") notFound();

  const cfg = normalizeReservation(c.reservationConfig);
  const content = normalizeContent(c.content);
  const brand = content.theme.brand;
  const whatsappSet = Boolean((cfg.whatsapp || c.hotel.whatsapp || "").trim());

  const rooms = await listActiveRooms(c.hotelId);
  const roomDTOs: RoomDTO[] = rooms.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description || "",
    mainImage: r.mainImage || "",
    images: Array.isArray(r.images) ? (r.images as string[]) : [],
    amenities: Array.isArray(r.amenities) ? (r.amenities as string[]) : [],
    beds: r.beds || "",
    maxAdults: r.maxAdults,
    maxChildren: r.maxChildren,
    priceOriginalCents: r.priceOriginalCents,
    pricePromoCents: r.pricePromoCents,
    discountPercent: discountPercent(r.priceOriginalCents, r.pricePromoCents),
    badgeCount: r.badgeCount ?? null,
  }));

  const lead = leadId
    ? await db.lead.findUnique({ where: { id: leadId }, select: { id: true, name: true, phone: true, email: true } }).catch(() => null)
    : null;

  const canReserve = cfg.enabled && whatsappSet && roomDTOs.length > 0;

  return (
    <main className="min-h-screen bg-[color:var(--color-sand)] text-[color:var(--color-ink)]" style={{ ["--color-brand" as string]: brand }}>
      <header className="sticky top-0 z-30 border-b border-[color:var(--color-line)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <Link href={`/${hotel}/${campaign}`} className="text-sm text-[color:var(--color-mute)] transition hover:text-[color:var(--color-ink)]">
            ← Voltar
          </Link>
          <span className="font-display text-base font-semibold tracking-tight">{c.hotel.name}</span>
        </div>
      </header>

      {!canReserve ? (
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-semibold">Reservas indisponíveis</h1>
          <p className="mt-3 text-[color:var(--color-mute)]">
            {roomDTOs.length === 0
              ? "As acomodações desta campanha ainda não foram configuradas."
              : "O canal de reservas está temporariamente indisponível."}
          </p>
          <Link href={`/${hotel}/${campaign}`} className="mt-8 inline-block rounded-full px-6 py-3 font-semibold text-white" style={{ backgroundColor: brand }}>
            Voltar
          </Link>
        </div>
      ) : (
        <ReservaFlow
          brand={brand}
          hotelName={c.hotel.name}
          campaignId={c.id}
          campaignName={c.name}
          rooms={roomDTOs}
          config={{
            checkInMin: cfg.checkInMin,
            checkInMax: cfg.checkInMax,
            checkOutMax: cfg.checkOutMax,
            checkOutDefault: cfg.checkOutDefault,
            timeStepMin: cfg.timeStepMin,
            minNights: cfg.minNights,
            maxNights: cfg.maxNights,
            maxGuests: cfg.maxGuests,
            buttonLabel: cfg.buttonLabel,
            rules: cfg.rules,
          }}
          lead={lead ? { id: lead.id, name: lead.name, phone: lead.phone || "", email: lead.email || "" } : null}
        />
      )}
    </main>
  );
}
