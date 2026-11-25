import { PrismaClient } from "@prisma/client";
import { defaultContent, defaultFormConfig, defaultReservation, defaultTracking, type CampaignContent } from "../app/lib/content";

const db = new PrismaClient();

// PLACEHOLDERS: imagens do Unsplash enquanto o acervo oficial do NANNAI (SharePoint) não for baixado.
// Substituir TODAS por fotos reais do resort no painel (Hotéis/Campanhas/Quartos).
const img = (id: string, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

// Logo oficial e imagens/vídeos fornecidos pelo responsável (editáveis no painel).
const LOGO = "https://static.pmweb.com.br/G89eYnF2MbTqw_3q31tfmOcju20=/https://letsimage.s3.amazonaws.com/editor/nannai/imgs/1744220222242-logo_nannai.png";
const HERO_IMAGES = [
  "https://nannai-resort-spa.hotelempernambuco.com/data/Images/OriginalPhoto/17188/1718870/1718870030/image-porto-de-galinhas-nannai-muro-alto-94.JPEG",
  "https://content.r9cdn.net/rimg/himg/8e/d5/01/ice-470279-01ccb9-973804.jpg?width=1200&height=630&crop=true",
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7s9bSnI_kZqlPkZhVFsLMnnD2TODlLRMMPKUgq2vy_wudYAlquURf4szx5zGllvYQdRjDk784d7NdDIF1AtGHRmDfxXfFgifVnRC8wUK-rqREW4iunsn8mbSOo8LwkMGRrTc-h60DEXiq/s1600/Nannai+Resort+%2526+SPA+Bangalo%25CC%2582+Beira+Mar+12.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTk5nTGjlmwq31JBEA4ToBSCWWDZ-BNSXOq5OeTAlSsmloJqx0NFrPe-Z4&s=10",
  "https://letsimage.s3.amazonaws.com/editor/nannai/imgs/1744208690918-geral_1.jpg",
];
const HERO_VIDEOS = [
  "/assets/resorts/nannai-muro-alto/videos/nannai-1.mp4",
  "/assets/resorts/nannai-muro-alto/videos/nannai-2.mp4",
];

// Fotos fornecidas pelo responsável (editáveis no painel).
const OFFER_BG = "https://cf.bstatic.com/xdata/images/hotel/max1024x768/911593854.jpg?k=48fb8f69e6ed3692e561c5af0aa0f8fd564334a4283b4b75f26925edb5f49c85&o=";
const ABOUT_IMG = "/assets/resorts/nannai-muro-alto/resort-collage.png"; // "Paraíso tropical em foco" (fornecida pelo responsável)
const DESTINO_IMG = "/assets/resorts/nannai-muro-alto/destino-collage.png"; // "Colagem de Spa Tropical à Beira-Mar"
const FINALCTA_IMG = "https://cf.bstatic.com/xdata/images/hotel/max1024x768/911613178.jpg?k=7823ab7db2e47d69f77d6ff5d52af002db751cb92aa9dc9a99b233c7653394c0&o=";
const GALLERY_IMAGES = [
  { url: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/911593179.jpg?k=31604f12030dcdb95ff4500bab8039af841ad2c0d137d36ca6254b936f97dbcc&o=", caption: "Piscinas e paisagismo tropical" },
  { url: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/475625148.jpg?k=760b84cf7e985fad504c1f5361e4513f34350d4c1b3a15b3983fcdff9613df98&o=", caption: "Vista para o mar de Muro Alto" },
  { url: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/911593855.jpg?k=ed068647329610e48382742248fd3d40320433d31e0bcb4b52a2c697e2222f57&o=", caption: "Ambientes exclusivos" },
  { url: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/911595700.jpg?k=2ef3f34a6892e485dc6505d0e7e8c583925f93347f4642fdb762c5d794320044&o=", caption: "Acomodações sofisticadas" },
  { url: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/911605129.jpg?k=55b0e3eef2a8700705d9e355c15fb150ed69f044b03d88fdf702c3db63756dbd&o=", caption: "Áreas de lazer" },
  { url: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/475622026.jpg?k=1a0d0ca583827db5895226ba650c5c04ca3e35327a4f8323a893a248f8cf4fd4&o=", caption: "Praia de águas mornas e calmas" },
  { url: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/911613180.jpg?k=7234b59b7e7f69bc67d9840a20eb1fae136e042b722b4957dabe8bef0fbab980&o=", caption: "Gastronomia diferenciada" },
  { url: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/911615003.jpg?k=1452a9c4627c58bc301d1f4441affd5f91f6ab4d2f16ca17babce8fc8085a6ff&o=", caption: "Momentos para recordar" },
];
// Avaliações reais fornecidas pelo responsável.
const REVIEWS = [
  { name: "Ana", rating: 5, source: "Brasil", demo: false, text: "Nossa experiência no Nannai Muro Alto foi simplesmente extraordinária! Tudo impecável, do início ao fim. A acomodação é maravilhosa, extremamente confortável, com uma atmosfera de tranquilidade, sofisticação e exclusividade." },
  { name: "Marina", rating: 5, source: "Brasil", demo: false, text: "Simplesmente incrível, não há palavras que descrevam tão bem esse hotel, tem que viver a experiência para entender. Levam a experiência do cliente ao nível máximo." },
  { name: "Guillermo", rating: 5, source: "Brasil", demo: false, text: "Estrutura espetacular. Staff atenciosíssimo, com destaque para o Lucas (garçom), cujo atendimento consideramos impecável durante o jantar." },
  { name: "Jeremias", rating: 5, source: "Austrália", demo: false, text: "Equipe muito bem treinada, simpática e competente. Todos os ambientes impecáveis, absolutamente nada fora do lugar. Comida maravilhosa!" },
  { name: "Andreia", rating: 5, source: "Brasil", demo: false, text: "O ponto alto foi o chá da tarde — tinha tapioca, café, vários pães e doces e até supercoffee." },
  { name: "Luiz", rating: 5, source: "Brasil", demo: false, text: "Todas as refeições de excelente qualidade e variedade também." },
  { name: "Ricardo", rating: 5, source: "Brasil", demo: false, text: "Excelente café da manhã, bom atendimento no geral nos restaurantes e piscina." },
];

async function main() {
  // slug mantido como "resort-exemplo" para preservar a URL já publicada.
  // WhatsApp/e-mail ficam vazios de propósito: configure no painel (não inventar contato do NANNAI).
  const hotel = await db.hotel.upsert({
    where: { slug: "resort-exemplo" },
    update: { name: "NANNAI Muro Alto", primaryColor: "#173e38", secondaryColor: "#a58a64", city: "Muro Alto · Ipojuca — Pernambuco", logoUrl: LOGO },
    create: {
      name: "NANNAI Muro Alto",
      slug: "resort-exemplo",
      description: "Luxo tropical à beira-mar na Praia de Muro Alto, Pernambuco.",
      logoUrl: LOGO,
      primaryColor: "#173e38",
      secondaryColor: "#a58a64",
      whatsapp: "5511999999999", // PLACEHOLDER — trocar pelo número de atendimento no painel
      email: null,
      city: "Muro Alto · Ipojuca — Pernambuco",
      isActive: true,
    },
  });

  // Conteúdo NANNAI Muro Alto. Textos verdadeiros/transparentes; SEM inventar preços, percentuais,
  // disponibilidade ou inclusões universais. Imagens são PLACEHOLDER até subir o acervo oficial.
  const content: CampaignContent = {
    ...defaultContent(),
    theme: { brand: "#173e38", accent: "#a58a64" },
    // Ordem: hero → (Natal/urgência, fixa) → O resort → Por que escolher → Momentos →
    // Refúgio (acomodações) → Destino → Acesso (form) → Avaliações → CTA → FAQ → (vídeos/confiança/rodapé, fixos)
    order: ["promo", "hero", "countdown", "about", "benefits", "gallery", "accommodations", "destination", "form", "testimonials", "finalCta", "faq"],
    promo: { text: "NATAL E ANO NOVO NO NANNAI MURO ALTO — condições especiais da Black Friday. Garanta sua data.", cta: "Saber mais", ctaHref: "#form" },
    hero: {
      kicker: "NANNAI MURO ALTO · PERNAMBUCO",
      title: "O extraordinário espera por você",
      subtitle:
        "Descubra o privilégio de viver Muro Alto. Bangalôs exclusivos, piscinas privativas, experiências gastronômicas e momentos inesquecíveis em um dos cenários mais especiais de Pernambuco.",
      offer: "Condições especiais de hospedagem",
      images: HERO_IMAGES, // rotativas a cada 3s (editáveis no painel → Hero)
      bgDesktop: HERO_IMAGES[0], // fallback
      bgMobile: HERO_IMAGES[0],
      overlay: 0.45,
      align: "center",
      height: "full",
      ctaLabel: "Conhecer condições especiais",
    },
    // Prazo da campanha editável no painel → Contagem regressiva.
    countdown: { endsAt: new Date("2026-12-10T23:59:00-03:00").toISOString(), finishedMessage: "As condições especiais desta campanha foram encerradas." },
    benefits: {
      title: "Uma experiência à altura do extraordinário",
      items: [
        { icon: "mar praia", title: "Praia de Muro Alto" },
        { icon: "piscina estrutura", title: "Piscinas privativas" },
        { icon: "gastronomia", title: "Alta gastronomia" },
        { icon: "melhor premiado", title: "Hospitalidade NANNAI" },
        { icon: "destino paraíso", title: "Destino paradisíaco" },
        { icon: "spa bem-estar", title: "SPA by L'Occitane" },
        { icon: "atendimento", title: "Atendimento dedicado" },
      ],
    },
    about: {
      title: "Mais do que uma hospedagem. Uma experiência para viver e recordar.",
      text:
        "Entre a beleza natural da Praia de Muro Alto e a sofisticação da hospitalidade NANNAI, cada detalhe convida a desacelerar e aproveitar o melhor da viagem. Descubra ambientes exclusivos, gastronomia diferenciada e experiências cuidadosamente pensadas para transformar seus dias em momentos especiais.",
      images: [ABOUT_IMG],
      highlights: ["Piscinas privativas", "Experiências gastronômicas", "SPA by L'Occitane", "Praia de Muro Alto"],
    },
    gallery: {
      title: "Momentos que merecem ser vividos",
      autoplay: true,
      images: GALLERY_IMAGES,
    },
    accommodations: {
      title: "Encontre o refúgio perfeito para sua experiência.",
      items: [
        { name: "Bangalô Jardim", capacity: "64 m² · até 3 adultos (ou 2 + 1 criança)", price: "R$ 1.725", description: "Piscina privativa, varanda e localização em área ajardinada do resort.", image: img("1596436889106-be35e843f974"), features: ["Piscina privativa", "Varanda", "Área ajardinada"] },
        { name: "Bangalô Piscina", capacity: "64 m² · até 3 adultos (ou 2 + 1 criança)", price: "R$ 1.875", description: "Piscina individual, varanda e integração com jardins e espelhos d'água.", image: img("1571896349842-33c89424de2d"), features: ["Piscina individual", "Varanda", "Jardins"] },
        { name: "Bangalô Beira Mar", capacity: "64 m² · até 2 adultos", price: "R$ 2.400", description: "Vista para a praia, piscina privativa, varanda, gazebo e serviço de mordomia.", image: img("1582719478250-c89cae4dc85b"), features: ["Vista para a praia", "Piscina privativa", "Gazebo", "Mordomia"] },
        { name: "Bangalô Vista Mar", capacity: "64 m² · até 3 adultos (ou 2 + 1 criança)", price: "R$ 2.062", description: "Vista parcial para o mar, piscina privativa, varanda e gazebo.", image: img("1512100356356-de1b84283e18"), features: ["Vista parcial para o mar", "Piscina privativa", "Gazebo"] },
        { name: "Bangalô Master", capacity: "130 m² · até 3 adultos (ou 2 + 3 crianças)", price: "R$ 3.900", description: "Duplex, piscina interna com hidromassagem, banheira e chuveiro externo. Apenas duas unidades.", image: img("1591088398332-8a7791972843"), features: ["Duplex", "Piscina com hidromassagem", "Banheira", "Apenas 2 unidades"] },
        { name: "Suíte Villa", capacity: "90 m² · até 3 adultos e 2 crianças", price: "R$ 2.700", description: "Piscina particular climatizada, cama super king, banheira de imersão e integração com jardim.", image: img("1618773928121-c32242e63f39"), features: ["Piscina climatizada", "Cama super king", "Banheira de imersão"] },
        { name: "Apartamento Jardim", capacity: "45 m² · até 2 adultos e 2 crianças", price: "R$ 899", description: "Varanda e vista lateral para os jardins.", image: img("1631049307264-da0ec9d70304"), features: ["Varanda", "Vista para jardins"] },
        { name: "Apartamento Vista Mar", capacity: "55 m² · até 2 adultos e 2 crianças", price: "R$ 1.089", description: "Duas varandas e vista para a paisagem de Muro Alto.", image: img("1566073771259-6a8506099945"), features: ["Duas varandas", "Vista para Muro Alto"] },
      ],
    },
    destination: {
      title: "Um cenário naturalmente extraordinário",
      text:
        "A Praia de Muro Alto, em Ipojuca, é conhecida pelas piscinas naturais formadas por arrecifes, pelo mar de águas mornas e calmas e pela orla de coqueiros. Um refúgio tropical a poucos minutos de Porto de Galinhas, no litoral sul de Pernambuco.",
      images: [DESTINO_IMG],
      airportDistance: "A cerca de 1h do Aeroporto do Recife",
      centerDistance: "Pertinho de Porto de Galinhas",
    },
    testimonials: { title: "Experiências que ficam na memória", items: REVIEWS },
    faq: {
      title: "Perguntas frequentes",
      items: [
        { q: "Onde fica o NANNAI Muro Alto?", a: "Na Praia de Muro Alto, em Ipojuca, litoral sul de Pernambuco, próximo a Porto de Galinhas." },
        { q: "Quais são as categorias de acomodação?", a: "Bangalôs (Jardim, Piscina, Beira Mar, Vista Mar e Master), Suíte Villa e Apartamentos (Jardim e Vista Mar)." },
        { q: "Existem bangalôs com piscina privativa?", a: "Sim, diversas categorias de bangalôs contam com piscina privativa. Confirme a configuração da categoria escolhida com o atendimento." },
        { q: "O café da manhã e o jantar estão incluídos?", a: "As inclusões variam conforme a categoria de acomodação e a tarifa contratada. Consulte as condições específicas da sua hospedagem." },
        { q: "O NANNAI é all inclusive?", a: "Não. O regime de alimentação varia conforme a categoria e a tarifa; algumas categorias incluem café da manhã e jantar. Confirme no atendimento." },
        { q: "Como solicito disponibilidade?", a: "Preencha o formulário ou envie sua solicitação pelo WhatsApp. O atendimento verifica a disponibilidade para as suas datas." },
        { q: "A solicitação confirma a reserva?", a: "Não. A solicitação não confirma a reserva: a disponibilidade, o preço e as condições são confirmados pelo atendimento antes da contratação." },
      ],
    },
    finalCta: {
      title: "Seu próximo capítulo começa em Muro Alto.",
      subtitle: "Descubra as condições especiais e permita-se viver uma experiência extraordinária no NANNAI.",
      bg: FINALCTA_IMG,
      ctaLabel: "Quero conhecer as condições",
    },
    videos: HERO_VIDEOS,
    offerBg: OFFER_BG,
  };

  await db.campaign.upsert({
    where: { hotelId_slug: { hotelId: hotel.id, slug: "black-friday" } },
    // Campanha DEMO: mantida pelo seed (conteúdo atualizado a cada deploy). Campanhas reais que
    // você criar no painel nunca são tocadas pelo seed. Config de reserva fica preservada.
    update: { content, status: "PUBLISHED", name: "Black Friday" },

    create: {
      hotelId: hotel.id,
      name: "Black Friday",
      slug: "black-friday",
      status: "PUBLISHED",
      endsAt: new Date(Date.now() + 10 * 86400_000),
      timezone: "America/Sao_Paulo",
      content,
      formConfig: defaultFormConfig(),
      trackingConfig: defaultTracking(),
      reservationConfig: defaultReservation(), // WhatsApp vazio → usa o do hotel
    },
  });

  // Catálogo NANNAI (8 categorias). Áreas/capacidades conforme o briefing (CONFERIR com a página
  // oficial antes de publicar). PREÇOS SÃO PLACEHOLDER demonstrativos — configurar no painel; não são
  // valores oficiais. Imagens são placeholder. Demo gerenciada pelo seed → recria a cada deploy.
  await db.reservationRequest.updateMany({ where: { hotel: { slug: "resort-exemplo" } }, data: { roomId: null } });
  await db.room.deleteMany({ where: { hotelId: hotel.id } });
  await db.room.createMany({
    data: [
      { hotelId: hotel.id, name: "Apartamento Jardim", description: "Varanda e vista lateral para os jardins.", mainImage: img("1631049307264-da0ec9d70304"), beds: "45 m²", maxAdults: 2, maxChildren: 2, priceOriginalCents: 120000, pricePromoCents: 89900, badgeCount: 6, sortOrder: 1, amenities: ["Varanda", "Vista para jardins"] },
      { hotelId: hotel.id, name: "Apartamento Vista Mar", description: "Duas varandas e vista para a paisagem de Muro Alto.", mainImage: img("1566073771259-6a8506099945"), beds: "55 m²", maxAdults: 2, maxChildren: 2, priceOriginalCents: 145000, pricePromoCents: 108900, badgeCount: 5, sortOrder: 2, amenities: ["Duas varandas", "Vista para Muro Alto"] },
      { hotelId: hotel.id, name: "Bangalô Jardim", description: "Piscina privativa, varanda e localização em área ajardinada do resort.", mainImage: img("1596436889106-be35e843f974"), beds: "64 m²", maxAdults: 3, maxChildren: 1, priceOriginalCents: 230000, pricePromoCents: 172500, badgeCount: 4, sortOrder: 3, amenities: ["Piscina privativa", "Varanda", "Área ajardinada"] },
      { hotelId: hotel.id, name: "Bangalô Piscina", description: "Piscina individual, varanda e integração com jardins e espelhos d'água.", mainImage: img("1571896349842-33c89424de2d"), beds: "64 m²", maxAdults: 3, maxChildren: 1, priceOriginalCents: 250000, pricePromoCents: 187500, badgeCount: 4, sortOrder: 4, amenities: ["Piscina individual", "Varanda", "Jardins"] },
      { hotelId: hotel.id, name: "Bangalô Vista Mar", description: "Vista parcial para o mar, piscina privativa, varanda e gazebo.", mainImage: img("1512100356356-de1b84283e18"), beds: "64 m²", maxAdults: 3, maxChildren: 1, priceOriginalCents: 275000, pricePromoCents: 206200, badgeCount: 3, sortOrder: 5, amenities: ["Vista parcial para o mar", "Piscina privativa", "Gazebo"] },
      { hotelId: hotel.id, name: "Bangalô Beira Mar", description: "Vista para a praia, piscina privativa, varanda, gazebo e serviço de mordomia.", mainImage: img("1582719478250-c89cae4dc85b"), beds: "64 m²", maxAdults: 2, maxChildren: 0, priceOriginalCents: 320000, pricePromoCents: 240000, badgeCount: 3, sortOrder: 6, amenities: ["Vista para a praia", "Piscina privativa", "Gazebo", "Mordomia"] },
      { hotelId: hotel.id, name: "Suíte Villa", description: "Piscina particular climatizada, cama super king, banheira de imersão e integração com jardim.", mainImage: img("1618773928121-c32242e63f39"), beds: "90 m²", maxAdults: 3, maxChildren: 2, priceOriginalCents: 360000, pricePromoCents: 270000, badgeCount: 2, sortOrder: 7, amenities: ["Piscina climatizada", "Cama super king", "Banheira de imersão", "Jardim"] },
      { hotelId: hotel.id, name: "Bangalô Master", description: "Duplex, piscina interna com hidromassagem, banheira e chuveiro externo. Apenas duas unidades.", mainImage: img("1591088398332-8a7791972843"), beds: "130 m²", maxAdults: 3, maxChildren: 3, priceOriginalCents: 520000, pricePromoCents: 390000, badgeCount: 2, sortOrder: 8, amenities: ["Duplex", "Piscina com hidromassagem", "Banheira", "Apenas 2 unidades"] },
    ],
  });

  console.log("Seed concluído: /resort-exemplo/black-friday (NANNAI — landing + 8 acomodações)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
