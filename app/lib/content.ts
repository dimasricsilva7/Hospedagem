// Modelo de conteúdo de uma campanha. É o único ponto de verdade das seções da landing:
// dados, ordem e visibilidade. O renderer (app/[hotel]/[campaign]) e o editor (admin) leem daqui.

export const SECTION_KEYS = [
  "promo",
  "hero",
  "countdown",
  "form",
  "benefits",
  "about",
  "gallery",
  "accommodations",
  "destination",
  "testimonials",
  "faq",
  "finalCta",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
  promo: "Barra promocional",
  hero: "Hero principal",
  countdown: "Contagem regressiva",
  form: "Formulário / Lista VIP",
  benefits: "Benefícios",
  about: "Apresentação do hotel",
  gallery: "Galeria",
  accommodations: "Acomodações",
  destination: "Sobre o destino",
  testimonials: "Depoimentos",
  faq: "Perguntas frequentes",
  finalCta: "CTA final",
};

export type Benefit = { icon?: string; title: string; text?: string };
export type GalleryImage = { url: string; caption?: string };
export type Accommodation = { name: string; description?: string; image?: string; capacity?: string; features?: string[]; ctaLabel?: string; ctaHref?: string };
export type Testimonial = { name: string; text: string; rating?: number; source?: string; date?: string; photo?: string; demo?: boolean };
export type Faq = { q: string; a: string };

export type CampaignContent = {
  theme: { brand: string; accent: string };
  order: SectionKey[];
  hidden: SectionKey[];
  promo: { text: string; cta?: string; ctaHref?: string };
  hero: {
    kicker?: string;
    title: string;
    subtitle?: string;
    offer?: string;
    bgDesktop?: string;
    bgMobile?: string;
    images?: string[]; // fundos rotativos (troca a cada 3s); tem prioridade sobre bgDesktop
    videoUrl?: string;
    overlay: number; // 0..1
    align: "left" | "center";
    height: "medium" | "tall" | "full";
    ctaLabel: string;
  };
  countdown: { endsAt: string; finishedMessage: string };
  benefits: { title?: string; items: Benefit[] };
  about: { title: string; text: string; images: string[]; highlights: string[] };
  gallery: { title?: string; images: GalleryImage[]; autoplay?: boolean };
  accommodations: { title?: string; items: Accommodation[] };
  destination: { title: string; text: string; images: string[]; airportDistance?: string; centerDistance?: string; mapEmbed?: string };
  testimonials: { title?: string; items: Testimonial[] };
  faq: { title?: string; items: Faq[] };
  finalCta: { title: string; subtitle?: string; bg?: string; ctaLabel: string };
  videos: string[]; // URLs de vídeos (mp4/YouTube/Instagram) para a seção de vídeos
  offerBg?: string; // imagem de fundo da faixa "ofertas no ar" (abaixo do hero)
};

export type FormField = { key: string; label: string; type: "text" | "email" | "tel" | "cpf" | "number"; enabled: boolean; required: boolean };

export type FormConfig = {
  fields: FormField[];
  buttonLabel: string;
  successMessage: string;
  redirectUrl?: string;
  consentText: string; // consentimento de comunicação (marketing), separado, não pré-marcado
};

export type TrackingConfig = { metaPixelId?: string; ga4Id?: string; gtmId?: string };

// Configuração do funil de reservas (WhatsApp). whatsapp vazio = usa o do hotel.
export type ReservationConfig = {
  enabled: boolean;
  whatsapp: string;
  checkInMin: string; // "07:00"
  checkInMax: string; // "15:00"
  checkOutMax: string; // "12:00"
  checkOutDefault: string; // "12:00"
  timeStepMin: number; // intervalo dos horários (min)
  minNights: number;
  maxNights: number;
  maxGuests: number;
  buttonLabel: string;
  rules: string; // regras/observações da hospedagem
};

// ── Defaults ────────────────────────────────────────────────────────────────

export function defaultContent(): CampaignContent {
  return {
    theme: { brand: "#0e7490", accent: "#f59e0b" },
    order: [...SECTION_KEYS],
    hidden: [],
    promo: { text: "Oferta por tempo limitado — garanta as melhores condições." },
    hero: {
      kicker: "Campanha especial",
      title: "Sua próxima viagem começa aqui",
      subtitle: "Experiências exclusivas à beira-mar com condições que não se repetem.",
      offer: "",
      overlay: 0.45,
      align: "center",
      height: "full",
      ctaLabel: "Quero acessar as ofertas",
    },
    countdown: { endsAt: "", finishedMessage: "As inscrições para esta oferta foram encerradas." },
    benefits: { title: "Vantagens da campanha", items: [] },
    about: { title: "Conheça o resort", text: "", images: [], highlights: [] },
    gallery: { title: "Experiências", images: [], autoplay: false },
    accommodations: { title: "Acomodações", items: [] },
    destination: { title: "Sobre o destino", text: "", images: [] },
    testimonials: { title: "O que dizem os hóspedes", items: [] },
    faq: { title: "Perguntas frequentes", items: [] },
    finalCta: { title: "Não perca esta oportunidade", ctaLabel: "Quero garantir meu acesso" },
    videos: [],
  };
}

export function defaultFormConfig(): FormConfig {
  return {
    fields: [
      { key: "name", label: "Nome completo", type: "text", enabled: true, required: true },
      { key: "email", label: "E-mail", type: "email", enabled: true, required: true },
      { key: "phone", label: "WhatsApp (com DDD)", type: "tel", enabled: true, required: true },
      { key: "cpf", label: "CPF", type: "cpf", enabled: false, required: false },
      { key: "city", label: "Cidade", type: "text", enabled: false, required: false },
      { key: "adults", label: "Adultos", type: "number", enabled: false, required: false },
      { key: "children", label: "Crianças", type: "number", enabled: false, required: false },
    ],
    buttonLabel: "Quero acessar as ofertas",
    successMessage: "Cadastro confirmado! Em breve enviaremos as condições exclusivas no seu WhatsApp.",
    consentText: "Aceito receber comunicações promocionais por e-mail e WhatsApp.",
  };
}

export function defaultTracking(): TrackingConfig {
  return {};
}

export function defaultReservation(): ReservationConfig {
  return {
    enabled: true,
    whatsapp: "",
    checkInMin: "07:00",
    checkInMax: "15:00",
    checkOutMax: "12:00",
    checkOutDefault: "12:00",
    timeStepMin: 30,
    minNights: 1,
    maxNights: 30,
    maxGuests: 10,
    buttonLabel: "Solicitar reserva pelo WhatsApp",
    rules: "",
  };
}

// Mescla o JSON salvo com os defaults para o renderer nunca quebrar por chave ausente.
export function normalizeContent(raw: unknown): CampaignContent {
  const d = defaultContent();
  const c = (raw ?? {}) as Partial<CampaignContent>;
  const order = Array.isArray(c.order) && c.order.length ? c.order.filter((k): k is SectionKey => (SECTION_KEYS as readonly string[]).includes(k)) : d.order;
  return {
    theme: { ...d.theme, ...c.theme },
    order,
    hidden: Array.isArray(c.hidden) ? c.hidden.filter((k): k is SectionKey => (SECTION_KEYS as readonly string[]).includes(k)) : [],
    promo: { ...d.promo, ...c.promo },
    hero: { ...d.hero, ...c.hero, images: Array.isArray(c.hero?.images) ? c.hero.images.filter(Boolean) : [] },
    countdown: { ...d.countdown, ...c.countdown },
    benefits: { ...d.benefits, ...c.benefits, items: c.benefits?.items ?? [] },
    about: { ...d.about, ...c.about, images: c.about?.images ?? [], highlights: c.about?.highlights ?? [] },
    gallery: { ...d.gallery, ...c.gallery, images: c.gallery?.images ?? [] },
    accommodations: { ...d.accommodations, ...c.accommodations, items: c.accommodations?.items ?? [] },
    destination: { ...d.destination, ...c.destination, images: c.destination?.images ?? [] },
    testimonials: { ...d.testimonials, ...c.testimonials, items: c.testimonials?.items ?? [] },
    faq: { ...d.faq, ...c.faq, items: c.faq?.items ?? [] },
    finalCta: { ...d.finalCta, ...c.finalCta },
    videos: Array.isArray(c.videos) ? c.videos.filter(Boolean) : [],
    offerBg: typeof c.offerBg === "string" ? c.offerBg : "",
  };
}

export function normalizeForm(raw: unknown): FormConfig {
  const d = defaultFormConfig();
  const c = (raw ?? {}) as Partial<FormConfig>;
  return {
    fields: Array.isArray(c.fields) && c.fields.length ? c.fields : d.fields,
    buttonLabel: c.buttonLabel || d.buttonLabel,
    successMessage: c.successMessage || d.successMessage,
    redirectUrl: c.redirectUrl || undefined,
    consentText: c.consentText || d.consentText,
  };
}

export function normalizeTracking(raw: unknown): TrackingConfig {
  const c = (raw ?? {}) as Partial<TrackingConfig>;
  return { metaPixelId: c.metaPixelId || undefined, ga4Id: c.ga4Id || undefined, gtmId: c.gtmId || undefined };
}

export function normalizeReservation(raw: unknown): ReservationConfig {
  const d = defaultReservation();
  const c = (raw ?? {}) as Partial<ReservationConfig>;
  return {
    enabled: c.enabled ?? d.enabled,
    whatsapp: c.whatsapp ?? d.whatsapp,
    checkInMin: c.checkInMin || d.checkInMin,
    checkInMax: c.checkInMax || d.checkInMax,
    checkOutMax: c.checkOutMax || d.checkOutMax,
    checkOutDefault: c.checkOutDefault || d.checkOutDefault,
    timeStepMin: Number(c.timeStepMin) > 0 ? Number(c.timeStepMin) : d.timeStepMin,
    minNights: Number(c.minNights) > 0 ? Number(c.minNights) : d.minNights,
    maxNights: Number(c.maxNights) > 0 ? Number(c.maxNights) : d.maxNights,
    maxGuests: Number(c.maxGuests) > 0 ? Number(c.maxGuests) : d.maxGuests,
    buttonLabel: c.buttonLabel || d.buttonLabel,
    rules: c.rules ?? d.rules,
  };
}
