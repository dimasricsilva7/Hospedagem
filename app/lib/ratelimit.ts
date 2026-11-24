// Decisão pura da janela fixa de rate limit (testável sem banco).
export type RlWindow = { n: number; reset: number };

/** Avança o contador: reinicia se a janela expirou, senão incrementa. */
export function nextWindow(cur: RlWindow | undefined, now: number, windowMs: number): RlWindow {
  return !cur || cur.reset < now ? { n: 1, reset: now + windowMs } : { n: cur.n + 1, reset: cur.reset };
}
