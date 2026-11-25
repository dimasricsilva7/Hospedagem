"use client";
import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryImage } from "@/app/lib/content";

// Mosaico editorial: imagens em tamanhos variados (estilo revista). Clique amplia.
const SPAN = ["col-span-2 row-span-2", "", "", "row-span-2", "", "col-span-2", "", ""];

export function Gallery({ images }: { images: GalleryImage[] }) {
  const [light, setLight] = useState<number | null>(null);
  const n = images.length;

  useEffect(() => {
    if (light === null) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLight(null);
      if (e.key === "ArrowRight") setLight((p) => (p === null ? p : (p + 1) % n));
      if (e.key === "ArrowLeft") setLight((p) => (p === null ? p : (p - 1 + n) % n));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [light, n]);

  if (!n) return null;

  return (
    <>
      <div className="grid auto-rows-[46vw] grid-cols-2 gap-3 sm:auto-rows-[200px] sm:grid-cols-4">
        {images.map((im, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setLight(i)}
            className={`group relative overflow-hidden ${SPAN[i % SPAN.length]}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={im.url} alt={im.caption || "Foto do resort"} className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 transition group-hover:opacity-100" />
            {im.caption && (
              <span className="absolute inset-x-0 bottom-0 p-3 text-left text-sm font-medium text-white sm:p-4">{im.caption}</span>
            )}
          </button>
        ))}
      </div>

      {light !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setLight(null)} role="dialog" aria-modal="true">
          <button type="button" aria-label="Fechar" className="absolute right-4 top-4 text-white" onClick={() => setLight(null)}><X className="size-8" /></button>
          {n > 1 && (
            <>
              <button type="button" aria-label="Anterior" className="absolute left-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setLight((p) => (p === null ? p : (p - 1 + n) % n)); }}><ChevronLeft className="size-6" /></button>
              <button type="button" aria-label="Próxima" className="absolute right-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setLight((p) => (p === null ? p : (p + 1) % n)); }}><ChevronRight className="size-6" /></button>
            </>
          )}
          <figure className="relative flex max-h-[85vh] w-full max-w-5xl flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[light].url} alt={images[light].caption || "Foto ampliada"} className="max-h-[80vh] max-w-full object-contain" />
            {images[light].caption && <figcaption className="mt-3 text-center text-sm text-white/80">{images[light].caption}</figcaption>}
          </figure>
        </div>
      )}
    </>
  );
}
