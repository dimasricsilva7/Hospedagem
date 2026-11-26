import "server-only";
import crypto from "crypto";
import { db } from "@/app/lib/db";
import type { Prisma, ReservationStatus } from "@prisma/client";
import type { ReservationInput, RoomInput } from "@/app/lib/validators";
import { normalizeReservation } from "@/app/lib/content";
import {
  applyDiscount,
  buildWhatsappMessage,
  computeTotals,
  nightsBetween,
  reaisToCents,
  sanitizePrefix,
  whatsappUrl,
  type Ticket,
} from "@/app/lib/reservation";

/** Gera PREFIXO-NNNNNN (6 dígitos) único no banco. Tenta de novo em colisão; não reutiliza cancelados. */
async function generateUniqueReservationNumber(prefix: string): Promise<string | null> {
  for (let i = 0; i < 12; i++) {
    const n = crypto.randomInt(100000, 1000000); // 100000..999999
    const candidate = `${prefix}-${n}`;
    const exists = await db.reservationRequest.findUnique({ where: { code: candidate }, select: { id: true } });
    if (!exists) return candidate;
  }
  return null;
}
import { toCsv } from "@/app/lib/csv";
import { formatDateTime, formatIsoDate } from "@/app/lib/format";

type CreateResult = { ok: true; code: string; whatsappUrl: string } | { ok: false; error: string };

/**
 * Cria a solicitação de reserva (status PENDENTE) recalculando os valores pelo banco.
 * NUNCA confia em preço vindo do navegador. Resolve WhatsApp por campanha→hotel.
 * Retorna o código e a URL wa.me já pronta — o cliente só abre após este retorno.
 */
export async function createReservation(input: ReservationInput): Promise<CreateResult> {
  const campaign = await db.campaign.findUnique({
    where: { id: input.campaignId },
    select: { id: true, name: true, hotelId: true, status: true, reservationConfig: true, hotel: { select: { name: true, whatsapp: true, shortCode: true } } },
  });
  if (!campaign || campaign.status !== "PUBLISHED") return { ok: false, error: "Campanha indisponível." };

  const cfg = normalizeReservation(campaign.reservationConfig);
  if (!cfg.enabled) return { ok: false, error: "As reservas estão desativadas para esta campanha." };

  const whatsapp = (cfg.whatsapp || campaign.hotel.whatsapp || "").trim();
  if (!whatsapp) return { ok: false, error: "Canal de reservas indisponível no momento." };

  const room = await db.room.findFirst({ where: { id: input.roomId, hotelId: campaign.hotelId } });
  if (!room || !room.active) return { ok: false, error: "Acomodação indisponível." };

  const nights = nightsBetween(input.checkIn, input.checkOut);
  if (nights <= 0) return { ok: false, error: "O check-out precisa ser depois do check-in." };
  if (nights < cfg.minNights) return { ok: false, error: `Mínimo de ${cfg.minNights} diária(s).` };
  if (nights > cfg.maxNights) return { ok: false, error: `Máximo de ${cfg.maxNights} diárias.` };

  const guests = input.adults + input.children;
  const capacity = (room.maxAdults + room.maxChildren) * input.rooms;
  if (guests > capacity) return { ok: false, error: "A acomodação não comporta a quantidade de hóspedes selecionada." };
  if (guests > cfg.maxGuests) return { ok: false, error: `Máximo de ${cfg.maxGuests} hóspedes.` };

  const totals = computeTotals({
    priceOriginalCents: room.priceOriginalCents,
    pricePromoCents: applyDiscount(room.priceOriginalCents, room.pricePromoCents, cfg.discountPercent),
    nights,
    rooms: input.rooms,
  });

  const prefix = sanitizePrefix(campaign.hotel.shortCode || campaign.hotel.name);
  const code = await generateUniqueReservationNumber(prefix);
  if (!code) return { ok: false, error: "Não foi possível gerar o número da reserva. Tente novamente." };

  await db.reservationRequest.create({
    data: {
      code,
      hotelId: campaign.hotelId,
      campaignId: campaign.id,
      leadId: input.leadId || null,
      roomId: room.id,
      roomName: room.name,
      guestName: input.guestName,
      guestPhone: input.guestPhone || null,
      guestEmail: input.guestEmail || null,
      checkIn: input.checkIn,
      checkInTime: input.checkInTime,
      checkOut: input.checkOut,
      checkOutTime: input.checkOutTime,
      nights,
      adults: input.adults,
      children: input.children,
      childrenAges: input.childrenAges?.length ? input.childrenAges : undefined,
      rooms: input.rooms,
      priceOriginalCents: totals.priceOriginalCents,
      pricePromoCents: totals.pricePromoCents,
      discountPercent: totals.discountPercent,
      totalOriginalCents: totals.totalOriginalCents,
      totalPromoCents: totals.totalPromoCents,
    },
  });

  const ticket: Ticket = {
    code,
    hotelName: campaign.hotel.name,
    campaignName: campaign.name,
    guestName: input.guestName,
    guestPhone: input.guestPhone || undefined,
    guestEmail: input.guestEmail || undefined,
    checkInLabel: formatIsoDate(input.checkIn),
    checkInTime: input.checkInTime,
    checkOutLabel: formatIsoDate(input.checkOut),
    checkOutTime: input.checkOutTime,
    roomName: room.name,
    rooms: input.rooms,
    adults: input.adults,
    children: input.children,
    totals,
  };
  return { ok: true, code, whatsappUrl: whatsappUrl(whatsapp, buildWhatsappMessage(ticket)) };
}

// ── Gestão de solicitações (admin) ───────────────────────────────────────────

export type ReservationFilters = {
  q?: string;
  phone?: string;
  hotelId?: string;
  campaignId?: string;
  status?: ReservationStatus;
  from?: string;
  to?: string;
};

function whereFromFilters(f: ReservationFilters): Prisma.ReservationRequestWhereInput {
  const where: Prisma.ReservationRequestWhereInput = {};
  if (f.hotelId) where.hotelId = f.hotelId;
  if (f.campaignId) where.campaignId = f.campaignId;
  if (f.status) where.status = f.status;
  if (f.phone?.trim()) where.guestPhone = { contains: f.phone.trim() };
  if (f.from || f.to) {
    where.createdAt = {};
    if (f.from) where.createdAt.gte = new Date(f.from);
    if (f.to) where.createdAt.lte = new Date(`${f.to}T23:59:59`);
  }
  if (f.q?.trim()) {
    const q = f.q.trim();
    where.OR = [
      { code: { contains: q, mode: "insensitive" } },
      { guestName: { contains: q, mode: "insensitive" } },
      { guestEmail: { contains: q, mode: "insensitive" } },
    ];
  }
  return where;
}

export async function listReservations(f: ReservationFilters, page = 1, pageSize = 25) {
  const where = whereFromFilters(f);
  const [items, total] = await Promise.all([
    db.reservationRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { hotel: { select: { name: true } }, campaign: { select: { name: true } } },
    }),
    db.reservationRequest.count({ where }),
  ]);
  return { items, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function updateReservation(id: string, data: { status?: ReservationStatus; notes?: string }) {
  await db.reservationRequest.update({ where: { id }, data });
}

export async function exportReservationsCsv(f: ReservationFilters): Promise<string> {
  const rows = await db.reservationRequest.findMany({
    where: whereFromFilters(f),
    orderBy: { createdAt: "desc" },
    include: { hotel: { select: { name: true } }, campaign: { select: { name: true } } },
  });
  const header = ["Código", "Data", "Cliente", "Telefone", "E-mail", "Hotel", "Campanha", "Quarto", "Check-in", "Check-out", "Diárias", "Adultos", "Crianças", "Quartos", "Total promocional (R$)", "Status"];
  const body = rows.map((r) => [
    r.code,
    formatDateTime(r.createdAt),
    r.guestName,
    r.guestPhone,
    r.guestEmail,
    r.hotel?.name,
    r.campaign?.name,
    r.roomName,
    formatIsoDate(r.checkIn),
    formatIsoDate(r.checkOut),
    r.nights,
    r.adults,
    r.children,
    r.rooms,
    (r.totalPromoCents / 100).toFixed(2).replace(".", ","),
    r.status,
  ]);
  return toCsv([header, ...body]);
}

// ── CRUD de quartos (admin) ──────────────────────────────────────────────────

/** Converte a entrada do admin (reais em string) para o shape do banco (centavos). */
export function roomDataFromInput(input: RoomInput) {
  return {
    name: input.name,
    description: input.description || null,
    mainImage: input.mainImage || null,
    images: input.images?.length ? input.images : undefined,
    amenities: input.amenities?.length ? input.amenities : undefined,
    beds: input.beds || null,
    maxAdults: input.maxAdults,
    maxChildren: input.maxChildren,
    priceOriginalCents: reaisToCents(input.priceOriginal || "0"),
    pricePromoCents: reaisToCents(input.pricePromo || "0"),
    badgeCount: input.badgeCount && input.badgeCount > 0 ? input.badgeCount : null,
    active: input.active,
    sortOrder: input.sortOrder,
  };
}

export async function listRooms(hotelId: string) {
  return db.room.findMany({ where: { hotelId }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
}

export async function listActiveRooms(hotelId: string) {
  return db.room.findMany({ where: { hotelId, active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
}
