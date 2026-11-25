"use client";
import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { GalleryImage } from "@/app/lib/content";

/**
 * Showcase editorial: foto central grande com duas laterais inclinadas (desktop),
 * uma foto por vez no mobile. Troca a cada 3s, legenda abaixo. Clique amplia (lightbox).
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
  const at = (k: number) => images[((k % n) + n) % n];
  const center = at(i);

  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative mx-auto flex min-h-[260px] max-w-4xl items-center justify-center sm:min-h-[420px]">
        {/* laterais (desktop) */}
        {n > 2 && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={at(i - 1).url} alt="" aria-hidden className="absolute left-0 hidden aspect-[4/3] w-[38%] -rotate-6 rounded-2xl object-cover opacity-55 shadow-xl lg:block" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={at(i + 1).url} alt="" aria-hidden className="absolute right-0 hidden aspect-[4/3] w-[38%] rotate-6 rounded-2xl object-cover opacity-55 shadow-xl lg:block" />
          </>
        )}
        {/* central */}
        <button type="button" onClick={() => setLight(true)} className="relative z-10 block aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/10 sm:w-[72%]">
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={reduce ? {} : { opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={reduce ? {} : { opacity: 0 }} transition={{ duration: 0.55 }} className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={center.url} alt={center.caption || "Foto do resort"} className="size-full object-cover" />
            </motion.div>
          </AnimatePresence>
        </button>
      </div>

      {center.caption && <p className="mx-auto mt-6 max-w-xl text-center text-base font-medium text-[color:var(--color-ink)] sm:text-lg">{center.caption}</p>}

      {n > 1 && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {images.map((_, idx) => (
            <button key={idx} type="button" aria-label={`Foto ${idx + 1}`} onClick={() => setI(idx)} className="h-2 rounded-full transition-all" style={{ width: idx === i ? 24 : 8, backgroundColor: idx === i ? "var(--color-brand)" : "var(--color-line)" }} />
          ))}
        </div>
      )}

      {light && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setLight(false)} role="dialog" aria-modal="true">
          <button type="button" aria-label="Fechar" className="absolute right-4 top-4 text-white" onClick={() => setLight(false)}><X className="size-8" /></button>
          <button type="button" aria-label="Anterior" className="absolute left-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setI((p) => (p - 1 + n) % n); }}><ChevronLeft className="size-6" /></button>
          <button type="button" aria-label="Próxima" className="absolute right-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setI((p) => (p + 1) % n); }}><ChevronRight className="size-6" /></button>
          <div className="relative flex h-[80vh] w-full max-w-5xl items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={center.url} alt={center.caption || "Foto ampliada"} className="max-h-full max-w-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
