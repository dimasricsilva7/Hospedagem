// Lógica pura de reservas (client + server safe, sem I/O). Dinheiro SEMPRE em centavos.
// O servidor recalcula tudo a partir dos preços do banco — nunca confia no que o navegador manda.

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** 123456 (centavos) → "R$ 1.234,56". */
export const centsToBRL = (cents: number) => brl.format((Number.isFinite(cents) ? cents : 0) / 100);

/** "480", "480,00", "R$ 1.250,00" → centavos (1_250_00). Aceita vírgula ou ponto decimal. */
export function reaisToCents(input: string | number): number {
  if (typeof input === "number") return Math.round(input * 100);
  const s = (input || "").replace(/[^\d,.-]/g, "").trim();
  if (!s) return 0;
  // Se tem vírgula, vírgula é o separador decimal (pt-BR); pontos são milhar.
  const normalized = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
  const n = Number(normalized);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Número de diárias entre duas datas "YYYY-MM-DD". 0 se inválido ou checkout <= checkin. */
export function nightsBetween(checkIn: string, checkOut: string): number {
  if (!DATE_RE.test(checkIn) || !DATE_RE.test(checkOut)) return 0;
  const a = Date.parse(`${checkIn}T00:00:00Z`);
  const b = Date.parse(`${checkOut}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  const diff = Math.round((b - a) / 86_400_000);
  return diff > 0 ? diff : 0;
}

/** Desconto inteiro (%) entre preço cheio e promocional. 0 se original ausente ou menor que promo. */
export function discountPercent(originalCents: number, promoCents: number): number {
  if (originalCents <= 0 || promoCents <= 0 || promoCents >= originalCents) return 0;
  return Math.round((1 - promoCents / originalCents) * 100);
}

/** Preço promocional a exibir: se houver desconto global (%), deriva do preço cheio; senão mantém o promo do quarto. */
export function applyDiscount(originalCents: number, pricePromoCents: number, discountPercent: number): number {
  if (discountPercent > 0 && discountPercent < 100 && originalCents > 0) {
    return Math.round((originalCents * (100 - discountPercent)) / 100);
  }
  return pricePromoCents;
}

export type Totals = {
  nights: number;
  rooms: number;
  priceOriginalCents: number;
  pricePromoCents: number;
  discountPercent: number;
  totalOriginalCents: number;
  totalPromoCents: number;
  savingsCents: number;
};

/** Total = diárias × preço × quantidade de quartos. */
export function computeTotals(args: {
  priceOriginalCents: number;
  pricePromoCents: number;
  nights: number;
  rooms?: number;
}): Totals {
  const rooms = Math.max(1, args.rooms ?? 1);
  const nights = Math.max(0, args.nights);
  const totalOriginalCents = args.priceOriginalCents * nights * rooms;
  const totalPromoCents = args.pricePromoCents * nights * rooms;
  return {
    nights,
    rooms,
    priceOriginalCents: args.priceOriginalCents,
    pricePromoCents: args.pricePromoCents,
    discountPercent: discountPercent(args.priceOriginalCents, args.pricePromoCents),
    totalOriginalCents,
    totalPromoCents,
    savingsCents: Math.max(0, totalOriginalCents - totalPromoCents),
  };
}

/** Telefone → só dígitos com DDI. Assume Brasil (55) quando vier sem DDI (10–11 dígitos). */
export function normalizePhoneIntl(phone: string, defaultDdi = "55"): string {
  const d = (phone || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith(defaultDdi) && d.length >= 12) return d; // já tem DDI
  if (d.length === 10 || d.length === 11) return defaultDdi + d; // DDD + número
  return d; // outro país/formato: usa como veio
}

/** Código curto p/ o atendimento localizar o pedido. Ex.: "RES-LZ4K9A". */
export function generateReservationCode(): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const time = Date.now().toString(36).slice(-4).toUpperCase();
  return `RES-${time}${rand}`;
}

export type Ticket = {
  code: string;
  hotelName: string;
  campaignName?: string;
  guestName: string;
  guestPhone?: string;
  guestEmail?: string;
  checkInLabel: string; // "10/12/2026"
  checkInTime: string;
  checkOutLabel: string;
  checkOutTime: string;
  roomName: string;
  rooms: number;
  adults: number;
  children: number;
  totals: Totals;
};

/** Mensagem formatada como ticket de reserva para o WhatsApp. */
export function buildWhatsappMessage(t: Ticket): string {
  const sep = "━━━━━━━━━━━━━━━━━━";
  const L: string[] = [];
  L.push("🏨 NOVA SOLICITAÇÃO DE RESERVA");
  L.push(`Código: ${t.code}`);
  L.push(sep);
  L.push(`🌴 HOTEL: ${t.hotelName}`);
  L.push("");
  L.push("👤 DADOS DO HÓSPEDE");
  L.push(`Nome: ${t.guestName}`);
  if (t.guestPhone) L.push(`WhatsApp: ${t.guestPhone}`);
  if (t.guestEmail) L.push(`E-mail: ${t.guestEmail}`);
  L.push(sep);
  L.push("📅 PERÍODO DA HOSPEDAGEM");
  L.push(`Check-in: ${t.checkInLabel}  •  ${t.checkInTime}`);
  L.push(`Check-out: ${t.checkOutLabel}  •  ${t.checkOutTime}`);
  L.push("");
  L.push("🛏️ ACOMODAÇÃO");
  L.push(`${t.roomName}  (${t.rooms} ${t.rooms > 1 ? "quartos" : "quarto"})`);
  L.push("");
  L.push("👨‍👩‍👧 HÓSPEDES");
  L.push(`Adultos: ${t.adults}${t.children ? `  •  Crianças: ${t.children}` : ""}`);
  L.push(sep);
  L.push("💰 RESUMO DOS VALORES");
  L.push(`Diária original: ${centsToBRL(t.totals.priceOriginalCents)}`);
  L.push(`Diária promocional: ${centsToBRL(t.totals.pricePromoCents)}`);
  L.push(`Diárias: ${t.totals.nights}`);
  L.push(`Total original: ${centsToBRL(t.totals.totalOriginalCents)}`);
  if (t.totals.discountPercent) L.push(`Desconto: ${t.totals.discountPercent}%  (economia ${centsToBRL(t.totals.savingsCents)})`);
  L.push(`TOTAL PROMOCIONAL: ${centsToBRL(t.totals.totalPromoCents)}`);
  L.push(sep);
  if (t.campaignName) L.push(`✨ Solicitação enviada pela campanha ${t.campaignName}.`);
  L.push("Gostaria de confirmar a disponibilidade e as condições para concluir minha reserva. Aguardo atendimento!");
  return L.join("\n");
}

/** URL oficial wa.me com a mensagem já preenchida (não envia sozinho). */
export function whatsappUrl(phone: string, message: string): string {
  return `https://wa.me/${normalizePhoneIntl(phone)}?text=${encodeURIComponent(message)}`;
}
