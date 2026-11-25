import { PrismaClient } from "@prisma/client";
import { defaultContent, defaultFormConfig, defaultReservation, defaultTracking, type CampaignContent } from "../app/lib/content";

const db = new PrismaClient();

// Imagens demonstrativas do Unsplash (licença permite hotlink). Substituir pelo acervo real do hotel.
const img = (id: string, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

async function main() {
  const hotel = await db.hotel.upsert({
    where: { slug: "resort-exemplo" },
    update: {},
    create: {
      name: "Resort Exemplo",
      slug: "resort-exemplo",
      description: "Resort all-inclusive à beira-mar (conteúdo demonstrativo).",
      primaryColor: "#0e7490",
      secondaryColor: "#f59e0b",
      whatsapp: "5511999999999",
      email: "reservas@resortexemplo.com.br",
      city: "Litoral — Brasil",
      isActive: true,
    },
  });

  const content: CampaignContent = {
    ...defaultContent(),
    theme: { brand: "#0e7490", accent: "#f59e0b" },
    promo: { text: "A BLACK FRIDAY JÁ COMEÇOU — garanta antes que as melhores datas esgotem.", cta: "Garantir acesso", ctaHref: "#form" },
    hero: {
      kicker: "A Black Friday já começou",
      title: "BLACK FRIDAY",
      subtitle: "Garanta sua reserva com as melhores condições do ano, antes que as datas esgotem.",
      offer: "O menor preço do ano",
      bgDesktop: img("1540541338287-41700207dee6"),
      bgMobile: img("1540541338287-41700207dee6", 900),
      overlay: 0.5,
      align: "center",
      height: "full",
      ctaLabel: "Quero as ofertas",
    },
    // Black Friday até 10/12 (23:59, horário de Brasília). Editável no painel → Contagem regressiva.
    countdown: { endsAt: new Date("2026-12-10T23:59:00-03:00").toISOString(), finishedMessage: "As ofertas desta Black Friday foram encerradas." },
    benefits: {
      title: "Motivos para não perder",
      items: [
        { icon: "mar", title: "De frente pro mar", text: "Pé na areia, com vista para o oceano." },
        { icon: "estrutura", title: "Estrutura completa", text: "Piscinas, lazer e conforto premium." },
        { icon: "all inclusive", title: "All inclusive premium", text: "Gastronomia e bebidas inclusas." },
        { icon: "melhor", title: "Entre os melhores", text: "Experiência reconhecida pelos hóspedes." },
        { icon: "destino", title: "Destino paradisíaco", text: "Praias de águas cristalinas." },
        { icon: "parcelamento", title: "Até 10x sem juros", text: "Parcele a sua viagem com facilidade." },
        { icon: "cancelamento", title: "Cancelamento flexível", text: "Condições de cancelamento flexíveis." },
      ],
    },
    about: {
      title: "Um refúgio à beira-mar",
      text: "O Resort Exemplo combina o conforto de um resort all-inclusive com a tranquilidade de uma praia paradisíaca. Piscinas, gastronomia e experiências para todas as idades.\n\n(Texto demonstrativo — substituir pela descrição real do hotel.)",
      images: [img("1571896349842-33c89424de2d")],
      highlights: ["Gastronomia all-inclusive", "Piscinas e área de lazer", "Atividades para crianças", "Acesso direto à praia"],
    },
    gallery: {
      title: "Experiências",
      autoplay: false,
      images: [
        { url: img("1540541338287-41700207dee6"), caption: "Piscina principal" },
        { url: img("1582719478250-c89cae4dc85b"), caption: "Suítes" },
        { url: img("1519046904884-53103b34b206"), caption: "Praia" },
        { url: img("1414235077428-338989a2e8c0"), caption: "Gastronomia" },
        { url: img("1512100356356-de1b84283e18"), caption: "Pôr do sol" },
      ],
    },
    accommodations: {
      title: "Acomodações",
      items: [
        { name: "Suíte Vista Mar", capacity: "Até 3 pessoas", description: "Varanda com vista para o oceano.", image: img("1582719478250-c89cae4dc85b"), features: ["Vista mar", "Ar-condicionado", "Café da manhã"] },
        { name: "Bangalô Família", capacity: "Até 5 pessoas", description: "Espaço amplo ideal para a família.", image: img("1611892440504-42a792e24d32"), features: ["2 quartos", "Área externa", "All-inclusive"] },
        { name: "Villa Premium", capacity: "Até 4 pessoas", description: "Piscina privativa e serviço exclusivo.", image: img("1596436889106-be35e843f974"), features: ["Piscina privativa", "Serviço de quarto", "Vista panorâmica"] },
      ],
    },
    destination: {
      title: "Sobre o destino",
      text: "Praias de águas mornas, vida marinha preservada e muito sol o ano inteiro. (Conteúdo demonstrativo.)",
      images: [img("1505228395891-9a51e7e86bf6")],
      airportDistance: "A 45 min do aeroporto",
      centerDistance: "A 10 min do centro",
    },
    testimonials: {
      title: "O que dizem os hóspedes",
      items: [
        { name: "Hóspede demonstrativo", text: "Estrutura impecável e atendimento excelente. Voltaremos com certeza!", rating: 5, source: "Demonstração", demo: true },
        { name: "Hóspede demonstrativo", text: "As crianças amaram as piscinas e a gente relaxou de verdade.", rating: 5, source: "Demonstração", demo: true },
        { name: "Hóspede demonstrativo", text: "Gastronomia variada e praia linda. Recomendo!", rating: 4, source: "Demonstração", demo: true },
      ],
    },
    faq: {
      title: "Perguntas frequentes",
      items: [
        { q: "Como funciona a lista VIP?", a: "Você se cadastra e recebe as condições da campanha em primeira mão pelo WhatsApp." },
        { q: "O pacote é all-inclusive?", a: "Sim, inclui refeições e bebidas conforme a oferta vigente (conteúdo demonstrativo)." },
        { q: "Posso levar crianças?", a: "Sim, há condições especiais para famílias." },
        { q: "Qual a política de cancelamento?", a: "As condições são informadas no momento da reserva." },
      ],
    },
    finalCta: {
      title: "Garanta as melhores condições do ano",
      subtitle: "Entre na lista VIP agora — vagas e condições por tempo limitado.",
      bg: img("1519046904884-53103b34b206"),
      ctaLabel: "Quero entrar na lista VIP",
    },
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

  // Quartos demo (preços do spec, em centavos). Só cria se o hotel ainda não tem quartos.
  if ((await db.room.count({ where: { hotelId: hotel.id } })) === 0) {
    await db.room.createMany({
      data: [
        { hotelId: hotel.id, name: "Quarto Standard", description: "Conforto e ótimo custo-benefício para a sua estadia.", mainImage: img("1631049307264-da0ec9d70304"), beds: "1 cama de casal", maxAdults: 2, maxChildren: 1, priceOriginalCents: 75000, pricePromoCents: 48000, badgeCount: 6, sortOrder: 1, amenities: ["Ar-condicionado", "Wi-Fi", "Café da manhã"] },
        { hotelId: hotel.id, name: "Quarto Superior", description: "Mais espaço e vista privilegiada.", mainImage: img("1582719478250-c89cae4dc85b"), beds: "1 cama de casal + 1 solteiro", maxAdults: 3, maxChildren: 1, priceOriginalCents: 95000, pricePromoCents: 60800, badgeCount: 4, sortOrder: 2, amenities: ["Vista mar", "Ar-condicionado", "Frigobar", "Café da manhã"] },
        { hotelId: hotel.id, name: "Suíte Luxo", description: "Suíte ampla com área de estar e varanda.", mainImage: img("1591088398332-8a7791972843"), beds: "1 cama king", maxAdults: 3, maxChildren: 2, priceOriginalCents: 125000, pricePromoCents: 80000, badgeCount: 3, sortOrder: 3, amenities: ["Varanda", "Vista mar", "Banheira", "All-inclusive"] },
        { hotelId: hotel.id, name: "Suíte Premium", description: "A experiência mais exclusiva, com serviço dedicado.", mainImage: img("1596436889106-be35e843f974"), beds: "1 cama king + sofá-cama", maxAdults: 4, maxChildren: 2, priceOriginalCents: 160000, pricePromoCents: 102400, badgeCount: 2, sortOrder: 4, amenities: ["Piscina privativa", "Serviço de quarto", "Vista panorâmica", "All-inclusive"] },
      ],
    });
  }

  console.log("Seed concluído: /resort-exemplo/black-friday (landing + 4 quartos de reserva)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
