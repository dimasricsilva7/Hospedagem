import Image from "next/image";
import Link from "next/link";
import { Star, Check, Plane, Building2, ChevronRight, CalendarDays, ShieldCheck, MessageCircle, Lock, BadgePercent } from "lucide-react";
import type { CampaignContent, FormConfig } from "@/app/lib/content";
import { Reveal } from "@/app/components/Reveal";
import { Countdown } from "@/app/components/Countdown";
import { LeadForm } from "@/app/components/LeadForm";
import { Gallery } from "@/app/components/Gallery";
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
export function PromoBar({ data, brand }: { data: CampaignContent["promo"]; brand: string }) {
  if (!data.text) return null;
  return (
    <div
      className="sticky top-0 z-40 px-4 py-2.5 text-center text-[13px] font-medium tracking-wide text-white"
      style={{ background: `linear-gradient(90deg, ${brand}, color-mix(in srgb, ${brand} 70%, #000))` }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-2">
        <span className="inline-block size-1.5 rounded-full bg-white/80" />
        <span>{data.text}</span>
        {data.cta && data.ctaHref && (
          <a href={data.ctaHref} className="ml-1 inline-flex items-center gap-0.5 font-semibold underline-offset-2 hover:underline">
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
  brand,
  accent,
  trust,
  reservarPath,
}: {
  data: CampaignContent["hero"];
  countdown: CampaignContent["countdown"];
  showCountdown: boolean;
  hotel: HotelInfo;
  brand: string;
  accent: string;
  trust: string[];
  reservarPath?: string;
}) {
  const h = data.height === "full" ? "min-h-[92vh]" : data.height === "tall" ? "min-h-[80vh]" : "min-h-[62vh]";
  const alignSelf = data.align === "left" ? "flex-start" : "center";
  const align = data.align === "left" ? "items-start text-left" : "items-center text-center";
  return (
    <section className={`relative flex ${h} flex-col justify-center overflow-hidden`}>
      <div className="absolute inset-0 kenburns">
        {data.videoUrl ? (
          <video autoPlay muted loop playsInline poster={data.bgDesktop} className="size-full object-cover">
            <source src={data.videoUrl} />
          </video>
        ) : data.bgDesktop ? (
          <>
            <Image src={data.bgDesktop} alt="" fill priority sizes="100vw" className={`object-cover ${data.bgMobile ? "hidden sm:block" : ""}`} />
            {data.bgMobile && <Image src={data.bgMobile} alt="" fill priority sizes="100vw" className="object-cover sm:hidden" />}
          </>
        ) : (
          <div className="size-full bg-[color:var(--color-night)]" />
        )}
      </div>
      {/* Overlay cinematográfico: escurece embaixo p/ leitura + tint geral configurável. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/55" />
      <div className="absolute inset-0 bg-black" style={{ opacity: data.overlay * 0.5 }} />

      {/* Selo circular "Black Friday" (decorativo, canto superior) */}
      <div className="pointer-events-none absolute right-5 top-8 hidden md:block lg:right-10">
        <div className="flex size-28 rotate-[-8deg] flex-col items-center justify-center rounded-full text-center ring-1 ring-white/25" style={{ background: `color-mix(in srgb, ${accent} 90%, #000)` }}>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/70">Oferta</span>
          <span className="font-display text-base font-bold leading-tight text-black">Black<br />Friday</span>
        </div>
      </div>

      <Reveal>
        <div className={`relative mx-auto flex w-full max-w-4xl flex-col gap-5 px-5 py-24 ${align}`}>
          {hotel.logoUrl && (
            <Image src={hotel.logoUrl} alt={hotel.name} width={170} height={56} className="h-12 w-auto object-contain drop-shadow" style={{ alignSelf }} />
          )}
          {data.kicker && (
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/80" style={{ alignSelf }}>
              <span className="hidden h-px w-8 sm:inline-block" style={{ backgroundColor: brand }} />
              {data.kicker}
            </p>
          )}
          <h1 className="font-display text-5xl font-bold leading-[1.05] text-white drop-shadow-sm sm:text-7xl">{data.title}</h1>
          {data.subtitle && <p className="max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">{data.subtitle}</p>}
          {data.offer && (
            <p
              className="inline-flex w-fit items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white shadow-lg ring-1 ring-white/30 backdrop-blur"
              style={{ alignSelf, background: `color-mix(in srgb, ${brand} 85%, transparent)` }}
            >
              <Star className="size-4 fill-current" /> {data.offer}
            </p>
          )}
          {showCountdown && countdown.endsAt && (
            <div className={`mt-2 ${data.align === "center" ? "flex justify-center" : ""}`}>
              <Countdown endsAt={countdown.endsAt} finishedMessage={countdown.finishedMessage} accent={accent} />
            </div>
          )}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row" style={{ alignSelf }}>
            <a
              href="#form"
              className="inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-semibold text-white shadow-xl transition hover:-translate-y-0.5 hover:brightness-110"
              style={{ backgroundColor: brand }}
            >
              {data.ctaLabel}
            </a>
            {reservarPath && (
              <a
                href={reservarPath}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/5 px-7 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                <CalendarDays className="size-5" /> Reservar agora
              </a>
            )}
          </div>
          {trust.length > 0 && (
            <ul className={`mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/80 ${data.align === "center" ? "justify-center" : ""}`} style={{ alignSelf }}>
              {trust.map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="size-4" style={{ color: accent }} /> {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
        <span className="h-9 w-5 rounded-full border border-white/40">
          <span className="mx-auto mt-1.5 block size-1 animate-bounce rounded-full bg-white/70" />
        </span>
      </div>
    </section>
  );
}

// ── Formulário / Lista VIP ──────────────────────────────────────────────────────
export function FormSection({ form, campaignId, brand, hero, reservarPath }: { form: FormConfig; campaignId: string; brand: string; hero: CampaignContent["hero"]; reservarPath?: string }) {
  return (
    <section id="form" className="bg-[color:var(--color-sand)] px-5 py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: brand }}>
            Acesso exclusivo
          </p>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">{hero.title}</h2>
          <p className="mt-4 text-lg text-[color:var(--color-mute)]">
            Preencha seus dados e seja o primeiro a receber as condições especiais desta campanha, direto no seu WhatsApp.
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
export function Benefits({ data, brand, accent }: { data: CampaignContent["benefits"]; brand: string; accent: string }) {
  if (!data.items.length) return null;
  return (
    <section className="bg-[color:var(--color-sand)] px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionTitle kicker="Motivos para não perder" title={data.title} brand={brand} />
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((b, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-[color:var(--color-line)] bg-white p-8 transition duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-2xl">
                <span className="absolute -right-2 -top-4 font-display text-7xl font-bold opacity-[0.06] transition group-hover:opacity-10" style={{ color: brand }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="mb-5 flex size-12 items-center justify-center rounded-xl ring-1" style={{ backgroundColor: `${brand}10`, color: brand, borderColor: `${accent}` }}>
                  <Check className="size-6" />
                </div>
                <h3 className="font-display text-xl font-semibold">{b.title}</h3>
                {b.text && <p className="mt-2 leading-relaxed text-[color:var(--color-mute)]">{b.text}</p>}
                <span className="mt-5 block h-0.5 w-10 origin-left scale-x-0 transition duration-300 group-hover:scale-x-100" style={{ backgroundColor: accent }} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Apresentação do hotel ─────────────────────────────────────────────────────
export function About({ data, brand }: { data: CampaignContent["about"]; brand: string }) {
  if (!data.text && !data.images.length) return null;
  return (
    <section className="px-5 py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <Reveal>
          {data.images[0] && (
            <div className="relative aspect-4/5 overflow-hidden rounded-3xl">
              <Image src={data.images[0]} alt={data.title} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            </div>
          )}
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">{data.title}</h2>
          {data.text && <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-[color:var(--color-mute)]">{data.text}</p>}
          {data.highlights.length > 0 && (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {data.highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-2 text-[color:var(--color-ink)]">
                  <Check className="size-5 shrink-0" style={{ color: brand }} /> {h}
                </li>
              ))}
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
    <section className="overflow-hidden px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionTitle title={data.title} brand={brand} />
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
    <section className="bg-[color:var(--color-sand)] px-5 py-20">
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
                  {a.capacity && <p className="mt-1 text-sm" style={{ color: brand }}>{a.capacity}</p>}
                  {a.description && <p className="mt-2 text-[color:var(--color-mute)]">{a.description}</p>}
                  {a.features && a.features.length > 0 && (
                    <ul className="mt-3 space-y-1 text-sm text-[color:var(--color-mute)]">
                      {a.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2">
                          <Check className="size-4" style={{ color: brand }} /> {f}
                        </li>
                      ))}
                    </ul>
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
export function Destination({ data, brand }: { data: CampaignContent["destination"]; brand: string }) {
  if (!data.text && !data.images.length) return null;
  return (
    <section className="px-5 py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">{data.title}</h2>
          {data.text && <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-[color:var(--color-mute)]">{data.text}</p>}
          <div className="mt-6 flex flex-wrap gap-6">
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
            <div className="mt-6 overflow-hidden rounded-2xl">
              <iframe src={data.mapEmbed} title="Mapa" loading="lazy" className="h-64 w-full border-0" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          )}
        </Reveal>
        <Reveal delay={0.1}>
          {data.images[0] && (
            <div className="relative aspect-4/5 overflow-hidden rounded-3xl">
              <Image src={data.images[0]} alt={data.title} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

// ── Depoimentos ────────────────────────────────────────────────────────────────
export function Testimonials({ data, brand }: { data: CampaignContent["testimonials"]; brand: string }) {
  if (!data.items.length) return null;
  const anyDemo = data.items.some((t) => t.demo);
  return (
    <section className="bg-[color:var(--color-night)] px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionTitle title={data.title} brand={brand} light />
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((t, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <figure className="flex h-full flex-col rounded-2xl bg-white/5 p-7 ring-1 ring-white/10">
                {typeof t.rating === "number" && (
                  <div className="mb-3 flex gap-0.5" style={{ color: brand }}>
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className={`size-4 ${s < t.rating! ? "fill-current" : "opacity-30"}`} />
                    ))}
                  </div>
                )}
                <blockquote className="flex-1 text-white/90">“{t.text}”</blockquote>
                <figcaption className="mt-4 text-sm text-white/70">
                  <span className="font-medium text-white">{t.name}</span>
                  {t.source && <span> · {t.source}</span>}
                  {t.date && <span> · {t.date}</span>}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        {anyDemo && <p className="mt-6 text-center text-xs text-white/40">Depoimentos marcados como demonstrativos — substituir por avaliações reais no painel.</p>}
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
      <Reveal>
        <div className="relative mx-auto max-w-2xl">
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
    { icon: ShieldCheck, title: "Reserva sem risco", text: "Nada é cobrado aqui — você confirma tudo direto com o hotel." },
    { icon: MessageCircle, title: "Atendimento oficial", text: "Sua solicitação chega pelo WhatsApp oficial do hotel." },
    { icon: Lock, title: "Dados protegidos", text: "Tratamos suas informações conforme a LGPD." },
    { icon: BadgePercent, title: "Melhores condições", text: "Acesso às ofertas exclusivas desta campanha." },
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
