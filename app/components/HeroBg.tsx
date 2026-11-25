"use client";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Fundo do hero. Se houver `images`, alterna entre elas a cada 3s (cross-fade).
 * Caso contrário usa vídeo ou imagem única. Usa <img> simples porque as URLs são
 * arbitrárias (CDNs/thumbnails variados) — evita falhas do otimizador de imagem.
 */
export function HeroBg({ images, bgDesktop, bgMobile, videoUrl }: { images: string[]; bgDesktop?: string; bgMobile?: string; videoUrl?: string }) {
  const reduce = useReducedMotion();
  const list = images.length ? images : [bgDesktop || bgMobile || ""].filter(Boolean);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce || list.length <= 1) return;
    const id = setInterval(() => setI((p) => (p + 1) % list.length), 3000);
    return () => clearInterval(id);
  }, [reduce, list.length]);

  if (videoUrl) {
    return (
      <video autoPlay muted loop playsInline poster={bgDesktop} className="size-full object-cover">
        <source src={videoUrl} />
      </video>
    );
  }
  if (!list.length) return <div className="size-full bg-[color:var(--color-night)]" />;

  return (
    <div className="relative size-full">
      {list.map((src, idx) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src + idx}
          src={src}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover transition-opacity duration-[1200ms]"
          style={{ opacity: idx === i ? 1 : 0 }}
        />
      ))}
    </div>
  );
}
