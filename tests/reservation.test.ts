import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildWhatsappMessage,
  centsToBRL,
  computeTotals,
  discountPercent,
  generateReservationCode,
  nightsBetween,
  normalizePhoneIntl,
  reaisToCents,
  whatsappUrl,
  type Ticket,
} from "../app/lib/reservation";

test("nightsBetween conta diárias e barra datas inválidas", () => {
  assert.equal(nightsBetween("2026-12-10", "2026-12-14"), 4);
  assert.equal(nightsBetween("2026-12-10", "2026-12-10"), 0); // mesmo dia
  assert.equal(nightsBetween("2026-12-14", "2026-12-10"), 0); // checkout antes
  assert.equal(nightsBetween("10/12/2026", "14/12/2026"), 0); // formato errado
});

test("discountPercent calcula a partir dos preços", () => {
  assert.equal(discountPercent(95000, 60800), 36); // exemplo do spec
  assert.equal(discountPercent(75000, 48000), 36);
  assert.equal(discountPercent(0, 48000), 0);
  assert.equal(discountPercent(48000, 48000), 0);
});

test("computeTotals bate com o exemplo do spec (Quarto Superior, 4 diárias)", () => {
  const t = computeTotals({ priceOriginalCents: 95000, pricePromoCents: 60800, nights: 4, rooms: 1 });
  assert.equal(t.totalOriginalCents, 380000); // R$ 3.800,00
  assert.equal(t.totalPromoCents, 243200); // R$ 2.432,00
  assert.equal(t.savingsCents, 136800); // R$ 1.368,00
  assert.equal(t.discountPercent, 36);
});

test("computeTotals multiplica por quartos", () => {
  const t = computeTotals({ priceOriginalCents: 50000, pricePromoCents: 40000, nights: 2, rooms: 3 });
  assert.equal(t.totalPromoCents, 240000);
});

test("reaisToCents aceita vírgula, ponto de milhar e R$", () => {
  assert.equal(reaisToCents("950,00"), 95000);
  assert.equal(reaisToCents("1.250,00"), 125000);
  assert.equal(reaisToCents("480"), 48000);
  assert.equal(reaisToCents("R$ 1.024,00"), 102400);
  assert.equal(reaisToCents(""), 0);
});

test("normalizePhoneIntl adiciona DDI 55 quando falta", () => {
  assert.equal(normalizePhoneIntl("(11) 99999-9999"), "5511999999999");
  assert.equal(normalizePhoneIntl("5511999999999"), "5511999999999");
  assert.equal(normalizePhoneIntl("1133334444"), "551133334444"); // fixo 10 dígitos
  assert.equal(normalizePhoneIntl(""), "");
});

test("buildWhatsappMessage monta o ticket com código, quarto e total", () => {
  const ticket: Ticket = {
    code: "RES-ABC123",
    hotelName: "Resort Exemplo",
    campaignName: "Black Friday",
    guestName: "João Silva",
    guestPhone: "(11) 99999-9999",
    checkInLabel: "10/12/2026",
    checkInTime: "14:00",
    checkOutLabel: "14/12/2026",
    checkOutTime: "12:00",
    roomName: "Quarto Superior",
    rooms: 1,
    adults: 2,
    children: 1,
    totals: computeTotals({ priceOriginalCents: 95000, pricePromoCents: 60800, nights: 4, rooms: 1 }),
  };
  const msg = buildWhatsappMessage(ticket);
  assert.match(msg, /RES-ABC123/);
  assert.match(msg, /Quarto Superior/);
  assert.match(msg, /Resort Exemplo/);
  assert.ok(msg.includes(centsToBRL(243200))); // total promocional
  // URL wa.me codifica a mensagem e o telefone com DDI
  const url = whatsappUrl("(11) 99999-9999", msg);
  assert.match(url, /^https:\/\/wa\.me\/5511999999999\?text=/);
});

test("generateReservationCode gera código com prefixo RES-", () => {
  const a = generateReservationCode();
  assert.match(a, /^RES-[0-9A-Z]{8}$/);
  assert.notEqual(a, generateReservationCode());
});
