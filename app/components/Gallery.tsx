"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { GalleryImage } from "@/app/lib/content";

/**
 * Showcase "férias dos sonhos": uma foto por vez, troca a cada 3s, com legenda abaixo.
 * Rabiscos decorativos (sol, coqueiro, picolé, estrela) desenhados à mão (SVG original).
 */
export function Gallery({ images }: { images: GalleryImage[] }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [light, setLight] = useState(false);
  const [paused, setPaused] = useState(false);
  const n = images.length;

  useEffect(() => {
    if (reduce || paused || n <= 1 || light) return;
    const id = setInterval(() => setI((p) => (p + 1) % n), 3000);
    return () => clearInterval(id);
  }, [reduce, paused, n, light]);

  if (!n) return null;
  const img = images[Math.min(i, n - 1)];

  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* rabiscos decorativos */}
      <Sun className="absolute -left-2 -top-6 hidden size-12 rotate-[-8deg] sm:block" />
      <Popsicle className="absolute -top-8 right-6 hidden size-10 rotate-12 sm:block" />
      <Starfish className="absolute -bottom-4 left-4 hidden size-11 sm:block" />
      <Palm className="absolute -bottom-6 -right-2 hidden size-14 sm:block" />

      <div className="mx-auto max-w-3xl">
        <button type="button" onClick={() => setLight(true)} className="group relative block aspect-video w-full overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/10">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={reduce ? {} : { opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? {} : { opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
            >
              <Image src={img.url} alt={img.caption || "Foto do resort"} fill priority sizes="(max-width:768px) 100vw, 768px" className="object-cover" />
            </motion.div>
          </AnimatePresence>
        </button>

        {img.caption && <p className="mt-5 text-center text-lg font-medium text-[color:var(--color-ink)]">{img.caption}</p>}

        {n > 1 && (
          <div className="mt-5 flex justify-center gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Foto ${idx + 1}`}
                onClick={() => setI(idx)}
                className="h-2 rounded-full transition-all"
                style={{ width: idx === i ? 24 : 8, backgroundColor: idx === i ? "var(--color-brand)" : "var(--color-line)" }}
              />
            ))}
          </div>
        )}
      </div>

      {light && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setLight(false)} role="dialog" aria-modal="true">
          <button type="button" aria-label="Fechar" className="absolute right-4 top-4 text-white" onClick={() => setLight(false)}>
            <X className="size-8" />
          </button>
          <div className="relative h-[80vh] w-full max-w-5xl">
            <Image src={img.url} alt={img.caption || "Foto ampliada"} fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Rabiscos originais (SVG) ──────────────────────────────────────────────────
function Sun({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden fill="none">
      <circle cx="24" cy="24" r="9" fill="#fbbf24" />
      {Array.from({ length: 8 }).map((_, k) => (
        <line key={k} x1="24" y1="24" x2={24 + 18 * Math.cos((k * Math.PI) / 4)} y2={24 + 18 * Math.sin((k * Math.PI) / 4)} stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
      ))}
    </svg>
  );
}
function Palm({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden fill="none">
      <path d="M24 44 C23 32 24 22 25 16" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M25 15 C18 10 10 11 6 16 M25 15 C31 9 40 10 44 16 M25 15 C22 8 24 4 30 2 M25 15 C28 9 36 8 41 11" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
function Popsicle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden fill="none">
      <rect x="15" y="6" width="18" height="24" rx="9" fill="#fb7185" stroke="#e11d48" strokeWidth="2" />
      <line x1="24" y1="30" x2="24" y2="44" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
function Starfish({ className }: { className?: string }) {
  const pts = Array.from({ length: 5 }).map((_, k) => {
    const a = (k * 2 * Math.PI) / 5 - Math.PI / 2;
    return `${24 + 18 * Math.cos(a)},${24 + 18 * Math.sin(a)}`;
  });
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <polygon points={pts.join(" ")} fill="#22d3ee" stroke="#0891b2" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
