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
const HERO_VIDEOS = ["https://www.instagram.com/reel/DYkDzGBmd0Z/", "https://www.instagram.com/p/DFpzQqBIIUz/"];

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
    promo: { text: "NANNAI MURO ALTO · PERNAMBUCO — fale com o atendimento e conheça as condições especiais.", cta: "Saber mais", ctaHref: "#form" },
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
      images: [img("1571896349842-33c89424de2d")], // PLACEHOLDER
      highlights: ["Piscinas privativas", "Experiências gastronômicas", "SPA by L'Occitane", "Praia de Muro Alto"],
    },
    gallery: {
      title: "Momentos que merecem ser vividos",
      autoplay: true,
      images: [
        // PLACEHOLDER — substituir pelas fotos reais do acervo (experiências NANNAI).
        { url: img("1540541338287-41700207dee6"), caption: "Piscinas privativas e paisagismo" },
        { url: img("1519046904884-53103b34b206"), caption: "Praia de Muro Alto" },
        { url: img("1414235077428-338989a2e8c0"), caption: "Experiências gastronômicas" },
        { url: img("1582719478250-c89cae4dc85b"), caption: "Bangalôs exclusivos" },
        { url: img("1512100356356-de1b84283e18"), caption: "Pôr do sol inesquecível" },
        { url: img("1544161515-4ab6ce6db874"), caption: "Bem-estar no SPA" },
        { url: img("1544551763-46a013bb70d5"), caption: "Esportes aquáticos" },
        { url: img("1468413253725-0d5181091126"), caption: "Momentos em família" },
        { url: img("1437846972679-9e6e537be46e"), caption: "Café da manhã especial" },
        { url: img("1602002418082-a4443e081dd1"), caption: "Jantares à beira da piscina" },
      ],
    },
    accommodations: {
      title: "Encontre o refúgio perfeito para sua experiência.",
      items: [
        { name: "Bangalô Jardim", capacity: "64 m² · até 3 adultos (ou 2 + 1 criança)", description: "Piscina privativa, varanda e localização em área ajardinada do resort.", image: img("1596436889106-be35e843f974"), features: ["Piscina privativa", "Varanda", "Área ajardinada"] },
        { name: "Bangalô Piscina", capacity: "64 m² · até 3 adultos (ou 2 + 1 criança)", description: "Piscina individual, varanda e integração com jardins e espelhos d'água.", image: img("1571896349842-33c89424de2d"), features: ["Piscina individual", "Varanda", "Jardins"] },
        { name: "Bangalô Beira Mar", capacity: "64 m² · até 2 adultos", description: "Vista para a praia, piscina privativa, varanda, gazebo e serviço de mordomia.", image: img("1582719478250-c89cae4dc85b"), features: ["Vista para a praia", "Piscina privativa", "Gazebo", "Mordomia"] },
        { name: "Bangalô Vista Mar", capacity: "64 m² · até 3 adultos (ou 2 + 1 criança)", description: "Vista parcial para o mar, piscina privativa, varanda e gazebo.", image: img("1512100356356-de1b84283e18"), features: ["Vista parcial para o mar", "Piscina privativa", "Gazebo"] },
        { name: "Bangalô Master", capacity: "130 m² · até 3 adultos (ou 2 + 3 crianças)", description: "Duplex, piscina interna com hidromassagem, banheira e chuveiro externo. Apenas duas unidades.", image: img("1591088398332-8a7791972843"), features: ["Duplex", "Piscina com hidromassagem", "Banheira", "Apenas 2 unidades"] },
        { name: "Suíte Villa", capacity: "90 m² · até 3 adultos e 2 crianças", description: "Piscina particular climatizada, cama super king, banheira de imersão e integração com jardim.", image: img("1618773928121-c32242e63f39"), features: ["Piscina climatizada", "Cama super king", "Banheira de imersão"] },
        { name: "Apartamento Jardim", capacity: "45 m² · até 2 adultos e 2 crianças", description: "Varanda e vista lateral para os jardins.", image: img("1631049307264-da0ec9d70304"), features: ["Varanda", "Vista para jardins"] },
        { name: "Apartamento Vista Mar", capacity: "55 m² · até 2 adultos e 2 crianças", description: "Duas varandas e vista para a paisagem de Muro Alto.", image: img("1566073771259-6a8506099945"), features: ["Duas varandas", "Vista para Muro Alto"] },
      ],
    },
    destination: {
      title: "Um cenário naturalmente extraordinário",
      text:
        "A Praia de Muro Alto, em Ipojuca, é conhecida pelas piscinas naturais formadas por arrecifes, pelo mar de águas mornas e calmas e pela orla de coqueiros. Um refúgio tropical a poucos minutos de Porto de Galinhas, no litoral sul de Pernambuco.",
      images: [img("1505228395891-9a51e7e86bf6")], // PLACEHOLDER — aérea real da praia
      airportDistance: "A cerca de 1h do Aeroporto do Recife",
      centerDistance: "Pertinho de Porto de Galinhas",
    },
    // Sem avaliações reais autorizadas → seção oculta (não inventar depoimentos).
    testimonials: { title: "Experiências que ficam na memória", items: [] },
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
      bg: img("1519046904884-53103b34b206"), // PLACEHOLDER
      ctaLabel: "Quero conhecer as condições",
    },
    videos: HERO_VIDEOS,
  };

  await db.campaign.upsert({
    where: { hotelId_slug: { hotelId: hotel.id, slug: "black-friday" } },
    // Campanha DEMO: mantida pelo seed (conteúdo atualizado a cada deploy). Campanhas reais que
    // você criar no painel nunca são tocadas pelo seed. Config de reserva fica preservada.
    update: { content, status: "PUBLISHED" },

    create: {
      hotelId: hotel.id,
      name: "Black Friday — Demonstração",
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
