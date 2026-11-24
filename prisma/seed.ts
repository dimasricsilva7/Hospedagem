import { PrismaClient } from "@prisma/client";
import { defaultContent, defaultFormConfig, defaultTracking, type CampaignContent } from "../app/lib/content";

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
    promo: { text: "BLACK FRIDAY — condições exclusivas por tempo limitado (demonstração).", cta: "Garantir acesso", ctaHref: "#form" },
    hero: {
      kicker: "Black Friday · Demonstração",
      title: "Sua viagem dos sonhos com o melhor preço do ano",
      subtitle: "Experiência all-inclusive à beira-mar. Entre na lista VIP e receba as condições antes de todo mundo.",
      offer: "Conteúdo fictício — apenas para demonstração",
      bgDesktop: img("1507525428034-b723cf961d3e"),
      bgMobile: img("1507525428034-b723cf961d3e", 900),
      overlay: 0.5,
      align: "center",
      height: "full",
      ctaLabel: "Quero entrar na lista VIP",
    },
    countdown: { endsAt: new Date(Date.now() + 10 * 86400_000).toISOString(), finishedMessage: "As inscrições para esta oferta foram encerradas." },
    benefits: {
      title: "Vantagens da campanha",
      items: [
        { title: "Descontos exclusivos", text: "Condições especiais liberadas somente para a lista VIP." },
        { title: "Parcelamento facilitado", text: "Divida sua estadia em várias vezes." },
        { title: "Crianças com condição especial", text: "Pacotes pensados para a família toda." },
        { title: "Acesso antecipado", text: "Garanta sua reserva antes da abertura ao público." },
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
    update: {}, // não sobrescreve edições feitas no painel quando o build roda o seed de novo

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
    },
  });

  console.log("Seed concluído: /resort-exemplo/black-friday");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
