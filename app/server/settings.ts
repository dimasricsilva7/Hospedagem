import "server-only";
import { db } from "@/app/lib/db";
import { appUrl } from "@/app/lib/env";

const KEY = "publicDomain";

/** Base pública dos links do cliente (QR, comprovante). Domínio salvo no painel ou, se vazio, a URL atual da app. */
export async function getPublicBaseUrl(): Promise<string> {
  const row = await db.setting.findUnique({ where: { key: KEY } }).catch(() => null);
  const v = typeof row?.value === "string" ? row.value.trim() : "";
  return (v || appUrl()).replace(/\/$/, "");
}

/** Valor bruto salvo (vazio se nunca configurado) — para preencher o campo no painel. */
export async function getPublicDomainRaw(): Promise<string> {
  const row = await db.setting.findUnique({ where: { key: KEY } }).catch(() => null);
  return typeof row?.value === "string" ? row.value : "";
}

/** Salva o domínio público. Aceita "exemplo.com.br" e normaliza para https://exemplo.com.br. Vazio = volta ao padrão. */
export async function setPublicDomain(raw: string): Promise<void> {
  const s = raw.trim();
  const value = s ? (/^https?:\/\//i.test(s) ? s : `https://${s}`).replace(/\/$/, "") : "";
  await db.setting.upsert({ where: { key: KEY }, update: { value }, create: { key: KEY, value } });
}
