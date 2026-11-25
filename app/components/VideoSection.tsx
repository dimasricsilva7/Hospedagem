import { Play } from "lucide-react";
import { AutoVideo } from "./AutoVideo";

type Kind = { type: "file"; src: string } | { type: "embed"; src: string } | { type: "instagram"; src: string };

function resolve(raw: string): Kind {
  const url = raw.trim();
  const bare = url.split("?")[0].split("#")[0];
  if (/\.(mp4|webm|mov|m4v|ogg)$/i.test(bare)) return { type: "file", src: url };
  const yt = bare.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]+)/) || url.match(/[?&]v=([A-Za-z0-9_-]+)/);
  if (yt) return { type: "embed", src: `https://www.youtube.com/embed/${yt[1]}` };
  const ig = bare.match(/instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/);
  if (ig) return { type: "instagram", src: `https://www.instagram.com/${ig[1]}/${ig[2]}/embed` };
  return { type: "embed", src: url };
}

export function VideoSection({ videos, brand }: { videos: string[]; brand: string }) {
  const list = videos.filter(Boolean);
  if (!list.length) return null;
  return (
    <section className="bg-[color:var(--color-sand)] px-5 py-20 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center sm:mb-12">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8" style={{ backgroundColor: brand }} />
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: brand }}>
              <Play className="size-3.5" /> Vídeos
            </p>
            <span className="h-px w-8" style={{ backgroundColor: brand }} />
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[color:var(--color-ink)] sm:text-5xl">O NANNAI em movimento</h2>
        </div>
        <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4 sm:gap-6">
          {list.map((raw) => {
            const v = resolve(raw);
            if (v.type === "file") return <AutoVideo key={raw} src={v.src} />;
            return (
              <div key={raw} className="overflow-hidden rounded-2xl bg-black shadow-sm ring-1 ring-black/10">
                <iframe
                  src={v.src}
                  title="Vídeo"
                  loading="lazy"
                  scrolling="no"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  className="aspect-[9/16] w-full border-0"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
