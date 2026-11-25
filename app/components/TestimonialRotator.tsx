"use client";
import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Testimonial } from "@/app/lib/content";

/** Exibe 1 avaliação por vez e alterna aleatoriamente a cada 3s (todas as do painel entram no sorteio). */
export function TestimonialRotator({ items, accent }: { items: Testimonial[]; accent: string }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const n = items.length;

  useEffect(() => {
    if (reduce || n <= 1) return;
    const id = setInterval(() => {
      setI((prev) => {
        if (n <= 1) return prev;
        let next = prev;
        while (next === prev) next = Math.floor(Math.random() * n); // sorteia diferente do atual
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [reduce, n]);

  if (!n) return null;
  const t = items[Math.min(i, n - 1)];

  return (
    <div className="mx-auto max-w-2xl">
      <AnimatePresence mode="wait">
        <motion.figure
          key={i}
          initial={reduce ? {} : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? {} : { opacity: 0, y: -16 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl bg-white/5 p-8 text-center ring-1 ring-white/10 sm:p-10"
        >
          <Quote className="mx-auto mb-4 size-8" style={{ color: accent }} />
          {typeof t.rating === "number" && (
            <div className="mb-4 flex justify-center gap-0.5" style={{ color: accent }}>
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className={`size-5 ${s < t.rating! ? "fill-current" : "opacity-30"}`} />
              ))}
            </div>
          )}
          <blockquote className="font-display text-xl leading-relaxed text-white sm:text-2xl">“{t.text}”</blockquote>
          <figcaption className="mt-5 text-sm text-white/70">
            <span className="font-semibold text-white">{t.name}</span>
            {t.source && <span> · {t.source}</span>}
          </figcaption>
        </motion.figure>
      </AnimatePresence>

      {n > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Avaliação ${idx + 1}`}
              onClick={() => setI(idx)}
              className="size-2 rounded-full transition"
              style={{ backgroundColor: idx === i ? accent : "rgba(255,255,255,.25)" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
