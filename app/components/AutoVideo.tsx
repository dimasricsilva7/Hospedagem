"use client";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

// Vídeo vertical (9:16) que toca automático, sem som, quando entra na tela.
// Sem bordas pretas (object-cover preenche). Botão para o visitante ativar o som.
export function AutoVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black shadow-sm ring-1 ring-black/10">
      <video ref={ref} src={src} muted={muted} loop playsInline preload="metadata" className="aspect-[9/16] w-full object-cover" />
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Ativar som" : "Desativar som"}
        className="absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75"
      >
        {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
      </button>
    </div>
  );
}
