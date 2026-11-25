import Image from "next/image";
import Link from "next/link";
import {
  Check, Plane, Building2, ChevronRight, CalendarDays, ShieldCheck, MessageCircle, Lock,
  Martini, ChevronsDown, Palmtree, Waves, Award, Sun, CreditCard, DoorOpen, Utensils, Sparkles,
  Bath, BedDouble, Trees, Eye, Maximize2, Bell, BadgePercent, CalendarCheck, type LucideIcon,
} from "lucide-react";
import type { CampaignContent, FormConfig } from "@/app/lib/content";
import { Reveal } from "@/app/components/Reveal";
import { Countdown } from "@/app/components/Countdown";
import { LeadForm } from "@/app/components/LeadForm";
import { Gallery } from "@/app/components/Gallery";
import { TestimonialRotator } from "@/app/components/TestimonialRotator";
import { HeroBg } from "@/app/components/HeroBg";
import { DSun, DPalm, DShell, DWave, DHibiscus, DMonstera, DStar, DLeaves } from "@/app/components/Doodles";
import { Faq } from "@/app/components/Faq";

export type HotelInfo = {
  name: string;
  logoUrl?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  instagram?: string | null;
  facebook?: string | null;
};

const SectionTitle = ({ kicker, title, brand, light }: { kicker?: string; title?: string; brand: string; light?: boolean }) => (
  <div className="mb-12 text-center">
    <div className="mb-4 flex items-center justify-center gap-3">
      <span className="h-px w-8" style={{ backgroundColor: brand }} />
      <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: brand }}>
        {kicker || "Black Friday"}
      </p>
      <span className="h-px w-8" style={{ backgroundColor: brand }} />
    </div>
    {title && <h2 className={`font-display text-3xl font-semibold tracking-tight sm:text-5xl ${light ? "text-white" : "text-[color:var(--color-ink)]"}`}>{title}</h2>}
  </div>
);

// ── Barra promocional ─────────────────────────────────────────────────────────
export function PromoBar({ data }: { data: CampaignContent["promo"]; brand: string }) {
  if (!data.text) return null;
  return (
    <div className="sticky top-0 z-40 bg-black px-4 py-2.5 text-center text-[13px] font-medium tracking-wide text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-2">
        <span className="inline-block size-1.5 rounded-full bg-[#facc15]" />
        <span>{data.text}</span>
        {data.cta && data.ctaHref && (
          <a href={data.ctaHref} className="ml-1 inline-flex items-center gap-0.5 font-bold text-[#facc15] underline-offset-2 hover:underline">
            {data.cta} <ChevronRight className="size-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────────
export function Hero({
  data,
  countdown,
  showCountdown,
  hotel,
  accent,
  trust,
  reservarPath,
}: {
  data: CampaignContent["hero"];
  countdown: CampaignContent["countdown"];
  showCountdown: boolean;
  hotel: HotelInfo;
  accent: string;
  trust: string[];
  reservarPath?: string;
}) {
  const endLabel = countdown.endsAt ? shortDate(countdown.endsAt) : "";
  return (
    <section className="relative flex min-h-[94vh] flex-col overflow-hidden text-white">
      <div className="absolute inset-0">
        <HeroBg images={data.images ?? []} bgDesktop={data.bgDesktop} bgMobile={data.bgMobile} videoUrl={data.videoUrl} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
      <div className="absolute inset-0 bg-black" style={{ opacity: data.overlay * 0.4 }} />

      {/* Barra superior: logo + CADASTRE-SE */}
      <div className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
        {hotel.logoUrl ? (
          <Image src={hotel.logoUrl} alt={hotel.name} width={150} height={48} className="h-9 w-auto object-contain drop-shadow sm:h-11" />
        ) : (
          <span className="font-display text-lg font-semibold tracking-tight drop-shadow sm:text-xl">{hotel.name}</span>
        )}
        <a href="#form" className="rounded-md px-4 py-2 text-sm font-bold uppercase tracking-wide text-black shadow-lg transition hover:brightness-110" style={{ backgroundColor: accent }}>
          Cadastre-se
        </a>
      </div>

      {/* Centro: lockup Black Friday + selos */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-8 text-center">
        <Reveal>
          <div className="flex flex-col items-center gap-4">
            <Martini className="size-8 drop-shadow" style={{ color: accent }} />
            <h1 className="mx-auto max-w-[15ch] text-balance font-display text-4xl font-semibold leading-[1.08] drop-shadow-lg sm:text-6xl sm:leading-[1.05] lg:text-7xl">
              {data.title}
            </h1>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/85 sm:text-sm sm:tracking-[0.4em]">{hotel.name}</p>

            {/* selos laterais: data + oferta */}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              {endLabel && (
                <span className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold uppercase tracking-wide backdrop-blur" style={{ borderColor: `${accent}80`, backgroundColor: "rgba(0,0,0,.35)" }}>
                  <CalendarDays className="size-4" style={{ color: accent }} /> Até {endLabel}
                </span>
              )}
              {data.offer && (
                <span className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold uppercase tracking-wide backdrop-blur" style={{ borderColor: `${accent}80`, backgroundColor: "rgba(0,0,0,.35)" }}>
                  <ChevronsDown className="size-4" style={{ color: accent }} /> {data.offer}
                </span>
              )}
            </div>

            {data.subtitle && <p className="mt-2 max-w-2xl text-base text-white/90 sm:text-lg">{data.subtitle}</p>}
          </div>
        </Reveal>

        {/* contador grande */}
        {showCountdown && countdown.endsAt && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-white/80">Faltam</span>
            <Countdown endsAt={countdown.endsAt} finishedMessage={countdown.finishedMessage} accent={accent} />
          </div>
        )}

        {/* CTAs */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="#form" className="inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-semibold text-black shadow-xl transition hover:-translate-y-0.5 hover:brightness-110" style={{ backgroundColor: accent }}>
            {data.ctaLabel}
          </a>
          {reservarPath && (
            <a href={reservarPath} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/50 bg-white/5 px-7 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/15">
              <CalendarDays className="size-5" /> Reservar agora
            </a>
          )}
        </div>
        {trust.length > 0 && (
          <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-white/85">
            {trust.map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check className="size-4" style={{ color: accent }} /> {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/** "2026-12-10T..." → "10 DEZ" (sem drift, fuso Brasil). */
function shortDate(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "America/Sao_Paulo" }).format(d).replace(".", "").toUpperCase();
}

// ── Aviso de urgência (abaixo do hero) ────────────────────────────────────────
export function UrgencyBand({ brand, accent, reservarPath, image }: { brand: string; accent: string; reservarPath?: string; image?: string }) {
  return (
    <section className="relative overflow-hidden px-5 py-20 text-center text-white" style={image ? undefined : { background: `linear-gradient(120deg, color-mix(in srgb, ${brand} 80%, #000), ${brand})` }}>
      {image && (
        <>
          <div className="absolute inset-0">
            <HeroBg images={[]} bgDesktop={image} />
          </div>
          <div className="absolute inset-0" style={{ background: `linear-gradient(120deg, color-mix(in srgb, ${brand} 85%, transparent), rgba(0,0,0,.7))` }} />
        </>
      )}
      <DHibiscus className="sway absolute right-3 top-5 z-10 size-12 opacity-95 sm:right-16 sm:size-20" />
      <DStar className="pulse-soft absolute left-4 top-1/3 z-10 hidden size-11 opacity-90 sm:block sm:left-14 sm:size-14" />
      <DShell className="bob absolute bottom-8 left-1/2 z-10 hidden size-12 -translate-x-1/2 opacity-80 sm:block" />
      <Reveal>
        <div className="relative z-10 mx-auto max-w-3xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] ring-1 ring-white/20">
            <Sparkles className="size-4" style={{ color: accent }} /> Natal &amp; Ano Novo
          </p>
          <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            Passe o <span style={{ color: accent }}>Natal e o Ano Novo</span> no melhor hotel do Brasil
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">
            A Black Friday já começou — garanta as melhores datas de dezembro e janeiro antes que as acomodações se esgotem.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="#form" className="inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-semibold text-black shadow-xl transition hover:-translate-y-0.5 hover:brightness-110" style={{ backgroundColor: accent }}>
              Quero as ofertas
            </a>
            {reservarPath && (
              <a href={reservarPath} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-4 text-base font-semibold text-white transition hover:bg-white/10">
                <CalendarDays className="size-5" /> Montar minha reserva
              </a>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ── Selos de confiança (logo abaixo do hero) ──────────────────────────────────
export function TrustBadges({ brand }: { brand: string }) {
  const items = [
    { icon: CreditCard, title: "10x sem juros", text: "Parcele no cartão em até 10x sem juros." },
    { icon: BadgePercent, title: "5% de desconto no Pix", text: "Pague à vista no Pix e economize 5%." },
    { icon: Utensils, title: "All inclusive", text: "Gastronomia e experiências em regime all inclusive." },
    { icon: CalendarCheck, title: "Cancelamento grátis", text: "Flexibilidade para remarcar ou cancelar conforme as regras." },
  ];
  return (
    <section className="border-b border-[color:var(--color-line)] bg-white px-5 py-10">
      <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <Reveal key={it.title}>
            <div className="flex h-full items-start gap-3 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-sand)]/60 p-4 ring-1 ring-black/5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm" style={{ backgroundColor: brand }}>
                <it.icon className="size-5" strokeWidth={1.9} />
              </div>
              <div>
                <p className="text-[15px] font-bold tracking-tight text-[color:var(--color-ink)]">{it.title}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-[color:var(--color-mute)]">{it.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mx-auto mt-5 max-w-6xl text-center text-xs text-[color:var(--color-mute)]">
        Condições sujeitas à categoria de acomodação e à tarifa. Confirme as regras com o atendimento ao solicitar sua reserva.
      </p>
    </section>
  );
}

// ── Formulário / Lista VIP ──────────────────────────────────────────────────────
export function FormSection({ form, campaignId, brand, hero, reservarPath }: { form: FormConfig; campaignId: string; brand: string; hero: CampaignContent["hero"]; reservarPath?: string }) {
  return (
    <section id="form" className="bg-[color:var(--color-sand)]/85 px-5 py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: brand }}>
            Acesso exclusivo
          </p>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">{hero.title}</h2>
          <p className="mt-4 text-lg text-[color:var(--color-mute)]">
            Preencha seus dados e seja o primeiro a receber as condições especiais desta campanha, direto no seu WhatsApp.
          </p>
          <p className="mt-3 text-sm text-[color:var(--color-mute)]">
            <strong className="text-[color:var(--color-ink)]">A reserva é realizada e confirmada diretamente pelo WhatsApp do resort</strong>, com a validação da reserva e o pagamento. O envio do formulário é apenas uma solicitação.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <LeadForm campaignId={campaignId} form={form} brand={brand} reservarPath={reservarPath} />
        </Reveal>
      </div>
    </section>
  );
}

// ── Benefícios ──────────────────────────────────────────────────────────────────
const HEX = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";

// Mapeia a palavra-chave do benefício (campo icon) ou o título para um ícone original.
function emblemIcon(keyword: string | undefined, title: string): LucideIcon {
  const s = `${keyword ?? ""} ${title}`.toLowerCase();
  if (/mar|praia|beira|frente/.test(s)) return Palmtree;
  if (/estrutura|piscina|lazer|completa/.test(s)) return Waves;
  if (/all.?inclusive|bebida|drink|premium/.test(s)) return Martini;
  if (/gastronom|refei|restaurante/.test(s)) return Utensils;
  if (/melhor|premi|resort|n.?1|número 1|estrela/.test(s)) return Award;
  if (/destino|para[íi]|paisag|sol|natureza/.test(s)) return Sun;
  if (/parcel|juros|10x|pagamento|cart[ãa]o/.test(s)) return CreditCard;
  if (/cancel|flex[íi]vel|gr[áa]tis/.test(s)) return DoorOpen;
  return Sparkles;
}

// Ícone por comodidade (substitui o "check" genérico por algo coerente com a frase).
function featureIcon(text: string): LucideIcon {
  const s = text.toLowerCase();
  if (/piscina|hidro|espelho|climatizada/.test(s)) return Waves;
  if (/vista|mar|praia|paisag|muro alto/.test(s)) return Eye;
  if (/varanda|gazebo|jardim|ajardinada/.test(s)) return Trees;
  if (/banheira|imersão/.test(s)) return Bath;
  if (/cama|king|duplex|super/.test(s)) return BedDouble;
  if (/mordomia|serviço|atend/.test(s)) return Bell;
  if (/m²|área|unidade/.test(s)) return Maximize2;
  return Check;
}

// Seção "Motivos" como faixa de emblemas hexagonais (editável no painel via Benefícios).
export function Benefits({ data }: { data: CampaignContent["benefits"] }) {
  if (!data.items.length) return null;
  const mid = Math.floor(data.items.length / 2);
  const line = "#2ecc71"; // verde natureza vivo (estilo do print)
  return (
    <section className="bg-black px-5 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionTitle kicker="Por que escolher" title={data.title} brand={line} light />
        </Reveal>
        <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-9 sm:gap-x-9">
          {data.items.map((b, i) => {
            const Icon = emblemIcon(b.icon, b.title);
            const big = i === mid;
            const size = big ? "size-40 sm:size-48" : "size-36 sm:size-40";
            return (
              <Reveal key={i} delay={i * 0.04}>
                <figure className="flex w-36 flex-col items-center text-center sm:w-40">
                  {/* contorno duplo teal com brilho, sobre preto (estilo do print) */}
                  <div className={`relative ${size} drop-shadow-[0_0_12px_rgba(46,204,113,0.55)]`} style={{ clipPath: HEX, background: line }}>
                    <div className="absolute inset-[3px]" style={{ clipPath: HEX, background: "#000" }}>
                      <div className="absolute inset-[6px]" style={{ clipPath: HEX, background: line }}>
                        <div className="absolute inset-[2px] flex flex-col items-center justify-center gap-2" style={{ clipPath: HEX, background: big ? "#06201d" : "#000" }}>
                          <Icon className={big ? "size-9" : "size-7"} style={{ color: big ? line : "#ffffff" }} strokeWidth={1.6} />
                          <figcaption className="mx-auto max-w-[62%] text-[9.5px] font-bold uppercase leading-[1.12] tracking-wide text-white">{b.title}</figcaption>
                        </div>
                      </div>
                    </div>
                  </div>
                </figure>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Apresentação do hotel ─────────────────────────────────────────────────────
export function About({ data, brand, accent }: { data: CampaignContent["about"]; brand: string; accent: string }) {
  if (!data.text && !data.images.length) return null;
  return (
    <section className="relative overflow-hidden bg-[color:var(--color-sand)]/85 px-5 py-24">
      <DMonstera className="sway absolute right-2 top-1/4 z-10 hidden size-16 opacity-70 sm:block sm:right-10 sm:size-24" />
      <DStar className="pulse-soft absolute bottom-16 left-6 z-10 hidden size-12 opacity-70 sm:block sm:size-16" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          {data.images[0] && (
            <div className="relative">
              <span className="pointer-events-none absolute -bottom-5 -right-5 hidden h-full w-full border lg:block" style={{ borderColor: accent }} />
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5 lg:rounded-none">
                <Image src={data.images[0]} alt={data.title} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
              </div>
            </div>
          )}
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-10" style={{ backgroundColor: accent }} />
            <span className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: brand }}>O resort</span>
          </div>
          <h2 className="font-display text-3xl font-semibold leading-tight sm:text-[2.6rem]">{data.title}</h2>
          {data.text && <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-[color:var(--color-mute)]">{data.text}</p>}
          {data.highlights.length > 0 && (
            <ul className="mt-7 grid gap-4 sm:grid-cols-2">
              {data.highlights.map((h, i) => {
                const Icon = emblemIcon(undefined, h);
                return (
                  <li key={i} className="flex items-center gap-3 text-[color:var(--color-ink)]">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full ring-1" style={{ color: brand, borderColor: accent, backgroundColor: `${brand}0d` }}>
                      <Icon className="size-5" strokeWidth={1.75} />
                    </span>
                    <span className="text-[15px]">{h}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Reveal>
      </div>
    </section>
  );
}

// ── Galeria ──────────────────────────────────────────────────────────────────
export function GallerySection({ data, brand }: { data: CampaignContent["gallery"]; brand: string }) {
  if (!data.images.length) return null;
  return (
    <section className="relative overflow-hidden bg-[color:var(--color-sand)]/85 px-5 py-24">
      {/* acentos tropicais (decorativos) */}
      <DSun className="spin-slow absolute left-3 top-5 size-10 opacity-80 sm:left-10 sm:top-20 sm:size-14" />
      <DPalm className="sway absolute right-4 top-1/3 hidden size-12 opacity-80 sm:block sm:right-14 sm:size-16" />
      <DWave className="floaty absolute left-1/4 top-1/2 hidden h-8 w-12 opacity-70 sm:block sm:h-12 sm:w-20" />
      <DShell className="bob absolute bottom-8 right-4 size-9 opacity-75 sm:bottom-16 sm:right-20 sm:size-12" />
      <DHibiscus className="pulse-soft absolute bottom-10 left-6 hidden size-11 opacity-80 sm:block sm:size-14" />
      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <SectionTitle kicker="Momentos" title={data.title} brand={brand} />
        </Reveal>
        <Gallery images={data.images} />
      </div>
    </section>
  );
}

// ── Acomodações ────────────────────────────────────────────────────────────────
export function Accommodations({ data, brand }: { data: CampaignContent["accommodations"]; brand: string }) {
  if (!data.items.length) return null;
  return (
    <section className="bg-[color:var(--color-sand)]/85 px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionTitle title={data.title} brand={brand} />
        </Reveal>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((a, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition duration-300 hover:shadow-xl">
                {a.image && (
                  <div className="relative aspect-4/3 overflow-hidden">
                    <Image src={a.image} alt={a.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl font-semibold">{a.name}</h3>
                  {a.capacity && <p className="mt-1 text-sm text-[color:var(--color-mute)]">{a.capacity}</p>}
                  {a.description && <p className="mt-2 text-[color:var(--color-mute)]">{a.description}</p>}
                  {a.features && a.features.length > 0 && (
                    <ul className="mt-3 space-y-1 text-sm text-[color:var(--color-mute)]">
                      {a.features.map((f, j) => {
                        const FIcon = featureIcon(f);
                        return (
                          <li key={j} className="flex items-center gap-2">
                            <FIcon className="size-4 shrink-0" style={{ color: brand }} strokeWidth={1.75} /> {f}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {a.price && (
                    <p className="mt-4 text-xs uppercase tracking-wide text-[color:var(--color-mute)]">
                      Diária a partir de
                      <span className="mt-0.5 block text-xl font-bold normal-case tracking-normal" style={{ color: brand }}>
                        {a.price} <span className="font-normal text-[color:var(--color-mute)]">/ noite</span>
                      </span>
                    </p>
                  )}
                  {a.ctaLabel && a.ctaHref && (
                    <a href={a.ctaHref} className="mt-auto pt-4 font-medium" style={{ color: brand }}>
                      {a.ctaLabel} →
                    </a>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Sobre o destino ──────────────────────────────────────────────────────────
export function Destination({ data, brand, accent }: { data: CampaignContent["destination"]; brand: string; accent: string }) {
  if (!data.text && !data.images.length) return null;
  return (
    <section className="relative overflow-hidden px-5 py-24">
      <DLeaves className="bob absolute left-2 top-1/4 z-10 hidden size-16 opacity-70 sm:block sm:left-10 sm:size-24" />
      <DShell className="floaty absolute right-6 top-1/2 z-10 hidden size-12 opacity-70 sm:block sm:size-16" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal delay={0.1} className="order-2 lg:order-1">
          {data.images[0] && (
            <div className="relative">
              <span className="pointer-events-none absolute -bottom-5 -left-5 hidden h-full w-full border lg:block" style={{ borderColor: accent }} />
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5 lg:rounded-none">
                <Image src={data.images[0]} alt={data.title} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
              </div>
            </div>
          )}
        </Reveal>
        <Reveal className="order-1 lg:order-2">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-10" style={{ backgroundColor: accent }} />
            <span className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: brand }}>O destino</span>
          </div>
          <h2 className="font-display text-3xl font-semibold leading-tight sm:text-[2.6rem]">{data.title}</h2>
          {data.text && <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-[color:var(--color-mute)]">{data.text}</p>}
          <div className="mt-7 flex flex-wrap gap-6">
            {data.airportDistance && (
              <div className="flex items-center gap-2 text-[color:var(--color-ink)]">
                <Plane className="size-5" style={{ color: brand }} /> {data.airportDistance}
              </div>
            )}
            {data.centerDistance && (
              <div className="flex items-center gap-2 text-[color:var(--color-ink)]">
                <Building2 className="size-5" style={{ color: brand }} /> {data.centerDistance}
              </div>
            )}
          </div>
          {data.mapEmbed && (
            <div className="mt-6 overflow-hidden rounded-sm">
              <iframe src={data.mapEmbed} title="Mapa" loading="lazy" className="h-64 w-full border-0" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

// ── Depoimentos ────────────────────────────────────────────────────────────────
export function Testimonials({ data, brand, accent }: { data: CampaignContent["testimonials"]; brand: string; accent: string }) {
  if (!data.items.length) return null;
  const anyDemo = data.items.some((t) => t.demo);
  return (
    <section className="relative overflow-hidden bg-[color:var(--color-night)] px-5 py-24">
      <DWave className="floaty absolute left-6 top-1/4 hidden h-8 w-12 opacity-70 sm:block sm:h-12 sm:w-20" />
      <DStar className="pulse-soft absolute right-3 top-5 size-11 opacity-85 sm:right-16 sm:top-16 sm:size-16" />
      <DShell className="bob absolute bottom-12 left-1/4 hidden size-12 opacity-70 sm:block" />
      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <SectionTitle kicker="Avaliações" title={data.title} brand={brand} light />
        </Reveal>
        <TestimonialRotator items={data.items} accent={accent} />
        {anyDemo && <p className="mt-8 text-center text-xs text-white/40">Depoimentos demonstrativos — substituir por avaliações reais no painel.</p>}
      </div>
    </section>
  );
}

// ── FAQ ──────────────────────────────────────────────────────────────────────
export function FaqSection({ data, brand }: { data: CampaignContent["faq"]; brand: string }) {
  if (!data.items.length) return null;
  return (
    <section className="px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionTitle title={data.title} brand={brand} />
        </Reveal>
        <Faq items={data.items} />
      </div>
    </section>
  );
}

// ── CTA final ────────────────────────────────────────────────────────────────
export function FinalCta({ data, brand, reservarPath }: { data: CampaignContent["finalCta"]; brand: string; reservarPath?: string }) {
  return (
    <section className="relative overflow-hidden px-5 py-28 text-center">
      {data.bg ? <Image src={data.bg} alt="" fill sizes="100vw" className="object-cover" /> : <div className="absolute inset-0" style={{ backgroundColor: brand }} />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/55 to-black/60" />
      <DPalm className="sway absolute left-5 top-10 z-10 hidden size-14 opacity-85 sm:block sm:left-16 sm:size-20" />
      <DHibiscus className="pulse-soft absolute bottom-6 right-3 z-10 size-11 opacity-90 sm:right-16 sm:top-1/3 sm:size-16" />
      <DSun className="spin-slow absolute bottom-10 left-1/4 z-10 hidden size-12 opacity-80 sm:block sm:size-16" />
      <Reveal>
        <div className="relative z-10 mx-auto max-w-2xl">
          <h2 className="font-display text-4xl font-bold text-white sm:text-5xl">{data.title}</h2>
          {data.subtitle && <p className="mt-4 text-lg text-white/85">{data.subtitle}</p>}
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="#form" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold shadow-xl transition hover:-translate-y-0.5" style={{ color: brand }}>
              {data.ctaLabel}
            </a>
            {reservarPath && (
              <a href={reservarPath} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/50 px-7 py-4 text-base font-semibold text-white transition hover:bg-white/10">
                <CalendarDays className="size-5" /> Reservar agora
              </a>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ── Faixa de confiança ────────────────────────────────────────────────────────
export function TrustStrip({ brand, accent }: { brand: string; accent: string }) {
  const items = [
    { icon: MessageCircle, title: "Atendimento personalizado", text: "Receba orientação sobre acomodações e condições de hospedagem." },
    { icon: CalendarDays, title: "Consulta de disponibilidade", text: "Sua solicitação é analisada conforme as datas e a acomodação escolhida." },
    { icon: ShieldCheck, title: "Informações transparentes", text: "Conheça inclusões e condições antes de concluir a contratação." },
    { icon: Lock, title: "Proteção de dados", text: "Seus dados são tratados conforme a Política de Privacidade aplicável." },
  ];
  return (
    <section className="border-y border-[color:var(--color-line)] bg-white px-5 py-14">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <Reveal key={it.title}>
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl ring-1" style={{ backgroundColor: `${brand}10`, color: brand, borderColor: `${accent}55` }}>
                <it.icon className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-[color:var(--color-ink)]">{it.title}</p>
                <p className="mt-0.5 text-sm text-[color:var(--color-mute)]">{it.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── Rodapé ───────────────────────────────────────────────────────────────────
export function Footer({ hotel }: { hotel: HotelInfo }) {
  return (
    <footer className="border-t border-[color:var(--color-line)] bg-white px-5 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center text-sm text-[color:var(--color-mute)]">
        {hotel.logoUrl ? (
          <Image src={hotel.logoUrl} alt={hotel.name} width={140} height={46} className="h-10 w-auto object-contain" />
        ) : (
          <span className="font-display text-lg font-semibold text-[color:var(--color-ink)]">{hotel.name}</span>
        )}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {hotel.whatsapp && <a href={`https://wa.me/${hotel.whatsapp.replace(/\D/g, "")}`} className="hover:underline">WhatsApp</a>}
          {hotel.email && <a href={`mailto:${hotel.email}`} className="hover:underline">{hotel.email}</a>}
          {hotel.instagram && <a href={hotel.instagram} className="hover:underline">Instagram</a>}
          {hotel.facebook && <a href={hotel.facebook} className="hover:underline">Facebook</a>}
          <Link href="/privacidade" className="hover:underline">Política de Privacidade</Link>
        </div>
        <p>© {new Date().getFullYear()} {hotel.name}. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
