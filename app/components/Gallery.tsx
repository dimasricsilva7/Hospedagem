"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryImage } from "@/app/lib/content";

/** Carrossel com setas + swipe nativo (scroll-snap) + lightbox ao clicar. */
export function Gallery({ images }: { images: GalleryImage[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [light, setLight] = useState<number | null>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 640), behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div ref={track} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setLight(i)}
            className="relative aspect-4/3 w-[82%] shrink-0 snap-center overflow-hidden rounded-2xl sm:w-[48%] lg:w-[32%]"
          >
            <Image src={img.url} alt={img.caption || "Foto da experiência"} fill sizes="(max-width:640px) 82vw, 33vw" className="object-cover transition-transform duration-500 hover:scale-105" />
            {img.caption && <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-sm text-white">{img.caption}</span>}
          </button>
        ))}
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex justify-center gap-3">
          <button type="button" onClick={() => scrollBy(-1)} aria-label="Anterior" className="rounded-full border border-[color:var(--color-line)] bg-white p-3 hover:bg-[color:var(--color-sand)]">
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" onClick={() => scrollBy(1)} aria-label="Próxima" className="rounded-full border border-[color:var(--color-line)] bg-white p-3 hover:bg-[color:var(--color-sand)]">
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}

      {light !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setLight(null)} role="dialog" aria-modal="true">
          <button type="button" aria-label="Fechar" className="absolute right-4 top-4 text-white" onClick={() => setLight(null)}>
            <X className="size-8" />
          </button>
          <div className="relative h-[80vh] w-full max-w-5xl">
            <Image src={images[light].url} alt={images[light].caption || "Foto ampliada"} fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
