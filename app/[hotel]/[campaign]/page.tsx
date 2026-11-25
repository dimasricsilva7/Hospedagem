import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/app/lib/db";
import { getSession } from "@/app/server/auth";
import { normalizeContent, normalizeForm, normalizeTracking, type SectionKey } from "@/app/lib/content";
import { Tracking } from "@/app/components/Tracking";
import { VideoSection } from "@/app/components/VideoSection";
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

  const render = (k: SectionKey) => {
    switch (k) {
      case "promo":
        return null; // renderizada no topo, fora do fluxo
      case "countdown":
        return null; // consumida pelo hero
      case "hero":
        return [
          <S.Hero key="hero" data={content.hero} countdown={content.countdown} showCountdown={showCountdown} hotel={hotelInfo} accent={accent} trust={trust} reservarPath={`/${hotel}/${campaign}/reservar`} />,
          <S.UrgencyBand key="urgency" brand={brand} accent={accent} reservarPath={`/${hotel}/${campaign}/reservar`} image={content.offerBg} />,
        ];
      case "form":
        return <S.FormSection key={k} form={form} campaignId={c.id} brand={brand} hero={content.hero} reservarPath={`/${hotel}/${campaign}/reservar`} />;
      case "benefits":
        return <S.Benefits key={k} data={content.benefits} />;
      case "about":
        return <S.About key={k} data={content.about} brand={brand} accent={accent} />;
      case "gallery":
        return <S.GallerySection key={k} data={content.gallery} brand={brand} />;
      case "accommodations":
        return <S.Accommodations key={k} data={content.accommodations} brand={brand} />;
      case "destination":
        return <S.Destination key={k} data={content.destination} brand={brand} accent={accent} />;
      case "testimonials":
        return <S.Testimonials key={k} data={content.testimonials} brand={brand} accent={accent} />;
      case "faq":
        return <S.FaqSection key={k} data={content.faq} brand={brand} />;
      case "finalCta":
        return <S.FinalCta key={k} data={content.finalCta} brand={brand} reservarPath={`/${hotel}/${campaign}/reservar`} />;
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
