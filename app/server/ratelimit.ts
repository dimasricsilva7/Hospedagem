import "server-only";
import { db } from "@/app/lib/db";
import { nextWindow, type RlWindow } from "@/app/lib/ratelimit";

/**
 * Rate limit por janela fixa, COMPARTILHADO entre instâncias serverless (contador na tabela
 * Setting). Retorna true quando o bucket estourou o limite.
 * shortcut: read-modify-write não é atômico, então rajadas simultâneas podem deixar alguns a
 * mais passarem; suficiente para conter abuso/brute-force. Para limite rígido, usar Upstash
 * Redis ou Vercel Firewall — trocar só esta função.
 */
export async function rateLimit(bucket: string, max: number, windowMs: number): Promise<boolean> {
  const key = `rl:${bucket}`;
  const row = await db.setting.findUnique({ where: { key } }).catch(() => null);
  const next = nextWindow(row?.value as RlWindow | undefined, Date.now(), windowMs);
  await db.setting.upsert({ where: { key }, update: { value: next }, create: { key, value: next } }).catch(() => {});
  return next.n > max;
}
