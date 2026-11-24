"use client";
import { useEffect, useState } from "react";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  const s = Math.floor(ms / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60, done: ms === 0 };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Contador baseado no timestamp absoluto de término — não reinicia ao recarregar a página.
 * Renderiza só após montar para evitar divergência de hidratação (relógio do servidor ≠ cliente).
 */
export function Countdown({ endsAt, finishedMessage }: { endsAt: string; finishedMessage: string }) {
  const target = new Date(endsAt).getTime();
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    if (!Number.isFinite(target)) return;
    // Sincroniza com o relógio do cliente na montagem (evita divergência de hidratação).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!Number.isFinite(target)) return null;
  if (t?.done) return <p className="text-lg font-medium text-white/90">{finishedMessage}</p>;

  const cells: [string, number][] = t ? [["Dias", t.d], ["Horas", t.h], ["Min", t.m], ["Seg", t.s]] : [["Dias", 0], ["Horas", 0], ["Min", 0], ["Seg", 0]];
  return (
    <div className="flex gap-3 sm:gap-4" aria-live="polite">
      {cells.map(([label, value]) => (
        <div key={label} className="flex min-w-16 flex-col items-center rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm ring-1 ring-white/20 sm:min-w-20 sm:px-4 sm:py-3">
          <span className="font-display text-3xl font-bold tabular-nums text-white sm:text-4xl">{pad(value)}</span>
          <span className="mt-1 text-[11px] uppercase tracking-widest text-white/70">{label}</span>
        </div>
      ))}
    </div>
  );
}
