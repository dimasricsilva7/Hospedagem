import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/app/lib/db";
import { hashIp, hashPassword, randomToken, sha256, verifyPassword } from "@/app/lib/crypto";
import { rateLimit } from "@/app/server/ratelimit";

const COOKIE = "hospedagem_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 dias

export async function createSession(userId: string) {
  const token = randomToken(32);
  await db.session.create({ data: { userId, tokenHash: sha256(token), expiresAt: new Date(Date.now() + MAX_AGE_SEC * 1000) } });
  await db.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
  (await cookies()).set(COOKIE, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: MAX_AGE_SEC });
}

export async function getSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const s = await db.session.findUnique({ where: { tokenHash: sha256(token) }, include: { user: true } }).catch(() => null);
  if (!s || s.expiresAt < new Date()) return null;
  return s.user;
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: sha256(token) } }); // revoga no servidor
  jar.set(COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
}

/** Guarda de todas as rotas /admin. Redireciona ao login sem sessão e à troca de senha quando exigida. */
export async function requireAdmin(opts: { allowPasswordChange?: boolean } = {}) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") redirect("/admin/login");
  if (user.passwordChangeRequired && !opts.allowPasswordChange) redirect("/admin/trocar-senha");
  return user;
}

// ── Throttle de login por IP: 10 tentativas / 15 min ─────────────────────────
export async function loginThrottled(): Promise<boolean> {
  const h = await headers();
  const key = hashIp(h.get("x-forwarded-for")?.split(",")[0]?.trim()) ?? "unknown";
  return rateLimit(`login:${key}`, 10, 15 * 60_000);
}

/** Valida credenciais. Resposta idêntica para e-mail inexistente e senha errada (anti-enumeração). */
export async function authenticate(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } }).catch(() => null);
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  return user;
}

export async function changePassword(userId: string, current: string, next: string): Promise<{ ok: boolean; error?: string }> {
  if ((next ?? "").length < 8) return { ok: false, error: "A nova senha precisa ter ao menos 8 caracteres." };
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || !verifyPassword(current, user.passwordHash)) return { ok: false, error: "Senha atual incorreta." };
  await db.user.update({ where: { id: userId }, data: { passwordHash: hashPassword(next), passwordChangeRequired: false } });
  await db.session.deleteMany({ where: { userId, NOT: {} } }); // revoga outras sessões; a atual será recriada
  return { ok: true };
}

/**
 * Provisiona o admin inicial a partir das envs, sem gravar senha em claro em lugar nenhum.
 * Idempotente: só cria se o e-mail ainda não existe. Marca troca de senha obrigatória no 1º acesso.
 */
export async function ensureInitialAdmin(): Promise<{ created: boolean; email?: string }> {
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.env.ADMIN_INITIAL_PASSWORD || "";
  if (!email || !password) return { created: false };
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { created: false, email };
  await db.user.create({
    data: { email, passwordHash: hashPassword(password), role: "ADMIN", passwordChangeRequired: true },
  });
  return { created: true, email };
}
