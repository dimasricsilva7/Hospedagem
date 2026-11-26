import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/app/lib/db";
import { getSession } from "@/app/server/auth";
import { normalizeContent, normalizeForm, normalizeTracking, normalizeReservation, type SectionKey } from "@/app/lib/content";
import { Tracking } from "@/app/components/Tracking";
import { VideoSection } from "@/app/components/VideoSection";
import { listActiveRooms } from "@/app/server/reservations";
import { applyDiscount, discountPercent } from "@/app/lib/reservation";
import { ReservaFlow, type RoomDTO } from "./reservar/ReservaFlow";
import * as S from "./sections";

export const dynamic = "force-dynamic";

type Params = { hotel: string; campaign: string };

async function load(hotelSlug: string, campaignSlug: string, allowDraft: boolean) {
  const campaign = await db.campaign
    .findFirst({ where: { slug: campaignSlug, hotel: { slug: hotelSlug } }, include: { hotel: true } })
    .catch(() => null);
  if (!campaign) return null;
  if (campaign.status !== "PUBLISHED" && !allowDraft) return null;
  return campaign;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { hotel, campaign } = await params;
  const c = await load(hotel, campaign, false);
  if (!c) return { title: "Campanha não encontrada" };
  const content = normalizeContent(c.content);
  const title = `${content.hero.title} — ${c.hotel.name}`;
  const description = content.hero.subtitle || c.hotel.description || `Campanha ${c.name} do ${c.hotel.name}.`;
  const image = content.hero.bgDesktop || content.finalCta.bg || c.hotel.logoUrl || undefined;
  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: `/${hotel}/${campaign}` },
    openGraph: { title, description, type: "website", images: image ? [image] : undefined },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function LandingPage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<{ preview?: string }> }) {
  const { hotel, campaign } = await params;
  const { preview } = await searchParams;

  // Preview: admin autenticado pode ver rascunho/agendada antes de publicar.
  const admin = preview ? await getSession() : null;
  const c = await load(hotel, campaign, Boolean(admin));
  if (!c) notFound();

  const content = normalizeContent(c.content);
  const form = normalizeForm(c.formConfig);
  const tracking = normalizeTracking(c.trackingConfig);
  const brand = content.theme.brand;
  const accent = content.theme.accent;
  const trust = content.benefits.items.map((b) => b.title).filter(Boolean).slice(0, 4);
  const hotelInfo: S.HotelInfo = c.hotel;

  const visible = (k: SectionKey) => content.order.includes(k) && !content.hidden.includes(k);
  const showCountdown = visible("countdown") && Boolean(content.countdown.endsAt);

  // Reserva rápida embutida na landing (mesmo fluxo da página /reservar).
  const cfg = normalizeReservation(c.reservationConfig);
  const whatsappSet = Boolean((cfg.whatsapp || c.hotel.whatsapp || "").trim());
  const rooms = await listActiveRooms(c.hotelId).catch(() => []);
  const roomDTOs: RoomDTO[] = rooms.map((r) => {
    const promo = applyDiscount(r.priceOriginalCents, r.pricePromoCents, cfg.discountPercent);
    return {
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
      pricePromoCents: promo,
      discountPercent: discountPercent(r.priceOriginalCents, promo),
      badgeCount: r.badgeCount ?? null,
    };
  });
  const canReserve = cfg.enabled && whatsappSet && roomDTOs.length > 0;
  const reservarFull = `/${hotel}/${campaign}/reservar`;
  const reserveHref = canReserve ? "#reservar" : reservarFull; // CTAs rolam até a seção embutida

  const reservaSection = canReserve ? (
    <section key="reservar" id="reservar" className="scroll-mt-16 border-y border-[color:var(--color-line)] bg-[color:var(--color-sand)]/85 px-5 py-16">
      <div className="mx-auto mb-8 max-w-6xl text-center">
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="h-px w-8" style={{ backgroundColor: brand }} />
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: brand }}>Reserve agora</p>
          <span className="h-px w-8" style={{ backgroundColor: brand }} />
        </div>
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">Faça sua reserva em poucos passos</h2>
        <p className="mt-3 text-[color:var(--color-mute)]">Escolha as datas, os hóspedes e a acomodação — enviamos tudo pronto para o WhatsApp do resort.</p>
      </div>
      <ReservaFlow
        embedded
        brand={brand}
        hotelName={c.hotel.name}
        campaignId={c.id}
        campaignName={c.name}
        rooms={roomDTOs}
        config={{ checkInMin: cfg.checkInMin, checkInMax: cfg.checkInMax, checkOutMax: cfg.checkOutMax, checkOutDefault: cfg.checkOutDefault, timeStepMin: cfg.timeStepMin, minNights: cfg.minNights, maxNights: cfg.maxNights, maxGuests: cfg.maxGuests, buttonLabel: cfg.buttonLabel, rules: cfg.rules }}
        lead={null}
      />
    </section>
  ) : null;

  const render = (k: SectionKey) => {
    switch (k) {
      case "promo":
        return null; // renderizada no topo, fora do fluxo
      case "countdown":
        return null; // consumida pelo hero
      case "hero":
        return [
          <S.Hero key="hero" data={content.hero} countdown={content.countdown} showCountdown={showCountdown} hotel={hotelInfo} accent={accent} trust={trust} reservarPath={reserveHref} />,
          <S.TrustBadges key="badges" brand={brand} />,
          <S.UrgencyBand key="urgency" brand={brand} accent={accent} reservarPath={reserveHref} image={content.offerBg} />,
        ];
      case "form":
        return <S.FormSection key={k} form={form} campaignId={c.id} brand={brand} hero={content.hero} reservarPath={reservarFull} />;
      case "benefits":
        return <S.Benefits key={k} data={content.benefits} />;
      case "about":
        return <S.About key={k} data={content.about} brand={brand} accent={accent} />;
      case "gallery":
        return <S.GallerySection key={k} data={content.gallery} brand={brand} />;
      case "accommodations":
        return [<S.Accommodations key={k} data={content.accommodations} brand={brand} rooms={roomDTOs} />, reservaSection];
      case "destination":
        return <S.Destination key={k} data={content.destination} brand={brand} accent={accent} />;
      case "testimonials":
        return <S.Testimonials key={k} data={content.testimonials} brand={brand} accent={accent} />;
      case "faq":
        return <S.FaqSection key={k} data={content.faq} brand={brand} />;
      case "finalCta":
        return <S.FinalCta key={k} data={content.finalCta} brand={brand} reservarPath={reserveHref} />;
    }
  };

  return (
    <main style={{ ["--color-brand" as string]: brand }}>
      {admin && (
        <div className="bg-amber-500 px-4 py-2 text-center text-sm font-medium text-black">
          Pré-visualização — campanha “{c.name}” ({c.status}). Esta barra não aparece para visitantes.
        </div>
      )}
      {visible("promo") && <S.PromoBar data={content.promo} brand={brand} />}
      {content.order.map((k) => render(k))}
      <VideoSection videos={content.videos} brand={brand} />
      <S.TrustStrip brand={brand} accent={accent} />
      <S.Footer hotel={hotelInfo} />
      <Tracking tracking={tracking} />
    </main>
  );
}
