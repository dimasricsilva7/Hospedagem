import { Play } from "lucide-react";

/** Converte URL do Instagram/YouTube para a URL de incorporação (iframe). */
function embedUrl(raw: string): string {
  const url = raw.trim().split("?")[0].split("#")[0];
  const ig = url.match(/instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/);
  if (ig) return `https://www.instagram.com/${ig[1]}/${ig[2]}/embed`;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  return url;
}

export function VideoSection({ videos, brand }: { videos: string[]; brand: string }) {
  const list = videos.filter(Boolean);
  if (!list.length) return null;
  return (
    <section className="bg-[color:var(--color-sand)] px-5 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8" style={{ backgroundColor: brand }} />
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: brand }}>
              <Play className="size-3.5" /> Vídeos
            </p>
            <span className="h-px w-8" style={{ backgroundColor: brand }} />
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl text-[color:var(--color-ink)]">O NANNAI em movimento</h2>
        </div>
        <div className="grid justify-center gap-6 sm:grid-cols-2">
          {list.map((v) => (
            <div key={v} className="mx-auto w-full max-w-[400px] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <iframe
                src={embedUrl(v)}
                title="Vídeo"
                loading="lazy"
                scrolling="no"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
                className="h-[560px] w-full border-0"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
