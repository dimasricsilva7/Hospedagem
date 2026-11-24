import { test } from "node:test";
import assert from "node:assert/strict";
import { nextWindow } from "../app/lib/ratelimit";
import { maskPhone, maskCpf } from "../app/lib/format";
import { toCsv } from "../app/lib/csv";
import { normalizeContent, SECTION_KEYS } from "../app/lib/content";

test("nextWindow inicia, incrementa e reinicia ao expirar", () => {
  const w1 = nextWindow(undefined, 1000, 500);
  assert.equal(w1.n, 1);
  const w2 = nextWindow(w1, 1100, 500);
  assert.equal(w2.n, 2);
  const w3 = nextWindow(w2, 2000, 500); // janela expirou
  assert.equal(w3.n, 1);
});

test("maskPhone formata celular e fixo", () => {
  assert.equal(maskPhone("11912345678"), "(11) 91234-5678");
  assert.equal(maskPhone("1123456789"), "(11) 2345-6789");
});

test("maskCpf formata", () => {
  assert.equal(maskCpf("12345678900"), "123.456.789-00");
});

test("toCsv escapa vírgula/aspas e prefixa BOM", () => {
  const csv = toCsv([["a", "b,c"], ['x"y', "z"]]);
  assert.ok(csv.startsWith("﻿"));
  assert.ok(csv.includes('"b,c"'));
  assert.ok(csv.includes('"x""y"'));
});

test("normalizeContent preenche defaults e filtra chaves de seção inválidas", () => {
  const c = normalizeContent({ order: ["hero", "invalida", "form"], hero: { title: "Oi" } });
  assert.deepEqual(c.order, ["hero", "form"]);
  assert.equal(c.hero.title, "Oi");
  assert.equal(typeof c.countdown.finishedMessage, "string");
  assert.equal(c.benefits.items.length, 0);
  // defaultContent cobre todas as seções conhecidas
  assert.equal(normalizeContent({}).order.length, SECTION_KEYS.length);
});
