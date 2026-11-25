"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { saveCampaign, type CampaignState } from "./actions";
import { ObjRepeater, StrRepeater } from "./Repeater";
import { SECTION_LABELS, type CampaignContent, type FormConfig, type SectionKey, type TrackingConfig } from "@/app/lib/content";

type Meta = { id: string; hotelId: string; name: string; slug: string; startsAt: string; endsAt: string; timezone: string; status: string; previewUrl: string };

const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900";
const lbl = "mb-1 block text-xs font-medium text-slate-500";

function Panel({ title, children, open }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group rounded-xl border border-slate-200 bg-white">
      <summary className="cursor-pointer list-none px-4 py-3 font-semibold marker:content-none">{title}</summary>
      <div className="border-t border-slate-100 p-4">{children}</div>
    </details>
  );
}

export function CampaignEditor({ meta, hotels, content: c0, form: f0, tracking: t0 }: { meta: Meta; hotels: { id: string; name: string }[]; content: CampaignContent; form: FormConfig; tracking: TrackingConfig }) {
  const [state, action, pending] = useActionState<CampaignState, FormData>(saveCampaign, {});
  const [c, setC] = useState<CampaignContent>(c0);
  const [f, setF] = useState<FormConfig>(f0);
  const [t, setT] = useState<TrackingConfig>(t0);

  const visible = (k: SectionKey) => !c.hidden.includes(k);
  const toggle = (k: SectionKey) => setC((p) => ({ ...p, hidden: p.hidden.includes(k) ? p.hidden.filter((x) => x !== k) : [...p.hidden, k] }));
  const moveSection = (i: number, dir: -1 | 1) => {
    const to = i + dir;
    if (to < 0 || to >= c.order.length) return;
    const order = [...c.order];
    [order[i], order[to]] = [order[to], order[i]];
    setC((p) => ({ ...p, order }));
  };

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={meta.id} />
      <input type="hidden" name="content" value={JSON.stringify(c)} readOnly />
      <input type="hidden" name="formConfig" value={JSON.stringify(f)} readOnly />
      <input type="hidden" name="trackingConfig" value={JSON.stringify(t)} readOnly />

      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/90 p-3 backdrop-blur">
        <div className="flex items-center gap-3 text-sm">
          <Link href="/admin/campanhas" className="text-slate-500 hover:underline">← Campanhas</Link>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{meta.status}</span>
        </div>
        <div className="flex items-center gap-3">
          {state.saved && !pending && <span className="inline-flex items-center gap-1 text-sm text-green-600"><Check className="size-4" /> Salvo</span>}
          {state.error && <span className="text-sm text-red-600">{state.error}</span>}
          <a href={meta.previewUrl} target="_blank" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"><ExternalLink className="size-4" /> Preview</a>
          <button disabled={pending} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {pending && <Loader2 className="size-4 animate-spin" />} Salvar
          </button>
        </div>
      </div>

      <Panel title="Dados da campanha" open>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className={lbl}>Hotel</span>
            <select name="hotelId" defaultValue={meta.hotelId} className={input}>{hotels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}</select>
          </label>
          <label><span className={lbl}>Nome</span><input name="name" defaultValue={meta.name} className={input} /></label>
          <label><span className={lbl}>Slug (URL)</span><input name="slug" defaultValue={meta.slug} className={input} /></label>
          <label><span className={lbl}>Fuso horário</span><input name="timezone" defaultValue={meta.timezone} className={input} /></label>
          <label><span className={lbl}>Início (opcional)</span><input name="startsAt" type="datetime-local" defaultValue={meta.startsAt} className={input} /></label>
          <label><span className={lbl}>Término (opcional)</span><input name="endsAt" type="datetime-local" defaultValue={meta.endsAt} className={input} /></label>
        </div>
      </Panel>

      <Panel title="Tema">
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className={lbl}>Cor principal</span><input type="color" value={c.theme.brand} onChange={(e) => setC((p) => ({ ...p, theme: { ...p.theme, brand: e.target.value } }))} className="h-10 w-full rounded-lg border border-slate-300" /></label>
          <label><span className={lbl}>Cor de destaque</span><input type="color" value={c.theme.accent} onChange={(e) => setC((p) => ({ ...p, theme: { ...p.theme, accent: e.target.value } }))} className="h-10 w-full rounded-lg border border-slate-300" /></label>
        </div>
      </Panel>

      <Panel title="Seções (ordem e visibilidade)">
        <ul className="space-y-2">
          {c.order.map((k, i) => (
            <li key={k} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={visible(k)} onChange={() => toggle(k)} className="size-4" /> {SECTION_LABELS[k]}
              </label>
              <div className="flex gap-1">
                <button type="button" onClick={() => moveSection(i, -1)} className="rounded px-2 py-1 text-xs hover:bg-slate-100">↑</button>
                <button type="button" onClick={() => moveSection(i, 1)} className="rounded px-2 py-1 text-xs hover:bg-slate-100">↓</button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Barra promocional">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="sm:col-span-3"><span className={lbl}>Texto</span><input value={c.promo.text} onChange={(e) => setC((p) => ({ ...p, promo: { ...p.promo, text: e.target.value } }))} className={input} /></label>
          <label><span className={lbl}>Rótulo do link</span><input value={c.promo.cta ?? ""} onChange={(e) => setC((p) => ({ ...p, promo: { ...p.promo, cta: e.target.value } }))} className={input} /></label>
          <label className="sm:col-span-2"><span className={lbl}>Destino do link</span><input value={c.promo.ctaHref ?? ""} onChange={(e) => setC((p) => ({ ...p, promo: { ...p.promo, ctaHref: e.target.value } }))} placeholder="#form" className={input} /></label>
          <label className="sm:col-span-3"><span className={lbl}>Imagem de fundo do aviso “ofertas no ar” (abaixo do hero) — URL</span><input value={c.offerBg ?? ""} onChange={(e) => setC((p) => ({ ...p, offerBg: e.target.value }))} placeholder="https://..." className={input} /></label>
        </div>
      </Panel>

      <Panel title="Hero (destaque principal)">
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className={lbl}>Chapéu (kicker)</span><input value={c.hero.kicker ?? ""} onChange={(e) => setC((p) => ({ ...p, hero: { ...p.hero, kicker: e.target.value } }))} className={input} /></label>
          <label><span className={lbl}>Oferta (selo)</span><input value={c.hero.offer ?? ""} onChange={(e) => setC((p) => ({ ...p, hero: { ...p.hero, offer: e.target.value } }))} className={input} /></label>
          <label className="sm:col-span-2"><span className={lbl}>Título</span><input value={c.hero.title} onChange={(e) => setC((p) => ({ ...p, hero: { ...p.hero, title: e.target.value } }))} className={input} /></label>
          <label className="sm:col-span-2"><span className={lbl}>Subtítulo</span><textarea rows={2} value={c.hero.subtitle ?? ""} onChange={(e) => setC((p) => ({ ...p, hero: { ...p.hero, subtitle: e.target.value } }))} className={input} /></label>
          <label><span className={lbl}>Imagem de fundo (desktop) — URL</span><input value={c.hero.bgDesktop ?? ""} onChange={(e) => setC((p) => ({ ...p, hero: { ...p.hero, bgDesktop: e.target.value } }))} className={input} /></label>
          <label><span className={lbl}>Imagem de fundo (mobile) — URL</span><input value={c.hero.bgMobile ?? ""} onChange={(e) => setC((p) => ({ ...p, hero: { ...p.hero, bgMobile: e.target.value } }))} className={input} /></label>
          <label><span className={lbl}>Vídeo de fundo (URL, opcional)</span><input value={c.hero.videoUrl ?? ""} onChange={(e) => setC((p) => ({ ...p, hero: { ...p.hero, videoUrl: e.target.value } }))} className={input} /></label>
          <div className="sm:col-span-2"><span className={lbl}>Imagens rotativas do hero (troca a cada 3s; tem prioridade sobre a imagem de fundo)</span>
            <StrRepeater items={c.hero.images ?? []} placeholder="https://..." addLabel="Adicionar imagem do hero" onChange={(v) => setC((p) => ({ ...p, hero: { ...p.hero, images: v } }))} />
          </div>
          <label><span className={lbl}>Rótulo do botão</span><input value={c.hero.ctaLabel} onChange={(e) => setC((p) => ({ ...p, hero: { ...p.hero, ctaLabel: e.target.value } }))} className={input} /></label>
          <label><span className={lbl}>Altura</span>
            <select value={c.hero.height} onChange={(e) => setC((p) => ({ ...p, hero: { ...p.hero, height: e.target.value as CampaignContent["hero"]["height"] } }))} className={input}>
              <option value="medium">Média</option><option value="tall">Alta</option><option value="full">Tela cheia</option>
            </select>
          </label>
          <label><span className={lbl}>Alinhamento</span>
            <select value={c.hero.align} onChange={(e) => setC((p) => ({ ...p, hero: { ...p.hero, align: e.target.value as CampaignContent["hero"]["align"] } }))} className={input}>
              <option value="center">Centralizado</option><option value="left">À esquerda</option>
            </select>
          </label>
          <label><span className={lbl}>Intensidade do overlay: {Math.round(c.hero.overlay * 100)}%</span>
            <input type="range" min={0} max={0.9} step={0.05} value={c.hero.overlay} onChange={(e) => setC((p) => ({ ...p, hero: { ...p.hero, overlay: Number(e.target.value) } }))} className="w-full" />
          </label>
        </div>
      </Panel>

      <Panel title="Contagem regressiva">
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className={lbl}>Término (data e hora)</span><input type="datetime-local" value={c.countdown.endsAt ? c.countdown.endsAt.slice(0, 16) : ""} onChange={(e) => setC((p) => ({ ...p, countdown: { ...p.countdown, endsAt: e.target.value ? new Date(e.target.value).toISOString() : "" } }))} className={input} /></label>
          <label><span className={lbl}>Mensagem ao encerrar</span><input value={c.countdown.finishedMessage} onChange={(e) => setC((p) => ({ ...p, countdown: { ...p.countdown, finishedMessage: e.target.value } }))} className={input} /></label>
        </div>
        <p className="mt-2 text-xs text-slate-400">A contagem aparece no hero quando a seção “Contagem regressiva” está visível e há data definida.</p>
      </Panel>

      <Panel title="Benefícios">
        <label><span className={lbl}>Título da seção</span><input value={c.benefits.title ?? ""} onChange={(e) => setC((p) => ({ ...p, benefits: { ...p.benefits, title: e.target.value } }))} className={`${input} mb-3`} /></label>
        <ObjRepeater items={c.benefits.items} fields={[{ key: "title", label: "Título" }, { key: "text", label: "Descrição", type: "textarea" }]} newItem={() => ({ title: "", text: "" })} addLabel="Adicionar benefício" onChange={(v) => setC((p) => ({ ...p, benefits: { ...p.benefits, items: v as CampaignContent["benefits"]["items"] } }))} />
      </Panel>

      <Panel title="Apresentação do hotel">
        <div className="grid gap-4">
          <label><span className={lbl}>Título</span><input value={c.about.title} onChange={(e) => setC((p) => ({ ...p, about: { ...p.about, title: e.target.value } }))} className={input} /></label>
          <label><span className={lbl}>Texto</span><textarea rows={4} value={c.about.text} onChange={(e) => setC((p) => ({ ...p, about: { ...p.about, text: e.target.value } }))} className={input} /></label>
          <div><span className={lbl}>Imagens (URLs)</span><StrRepeater items={c.about.images} placeholder="https://..." addLabel="Adicionar imagem" onChange={(v) => setC((p) => ({ ...p, about: { ...p.about, images: v } }))} /></div>
          <div><span className={lbl}>Diferenciais</span><StrRepeater items={c.about.highlights} addLabel="Adicionar diferencial" onChange={(v) => setC((p) => ({ ...p, about: { ...p.about, highlights: v } }))} /></div>
        </div>
      </Panel>

      <Panel title="Galeria">
        <label><span className={lbl}>Título da seção</span><input value={c.gallery.title ?? ""} onChange={(e) => setC((p) => ({ ...p, gallery: { ...p.gallery, title: e.target.value } }))} className={`${input} mb-3`} /></label>
        <ObjRepeater items={c.gallery.images} fields={[{ key: "url", label: "URL da imagem" }, { key: "caption", label: "Legenda" }]} newItem={() => ({ url: "", caption: "" })} addLabel="Adicionar foto" onChange={(v) => setC((p) => ({ ...p, gallery: { ...p.gallery, images: v as CampaignContent["gallery"]["images"] } }))} />
      </Panel>

      <Panel title="Acomodações">
        <label><span className={lbl}>Título da seção</span><input value={c.accommodations.title ?? ""} onChange={(e) => setC((p) => ({ ...p, accommodations: { ...p.accommodations, title: e.target.value } }))} className={`${input} mb-3`} /></label>
        <ObjRepeater
          items={c.accommodations.items}
          fields={[
            { key: "name", label: "Nome" },
            { key: "capacity", label: "Capacidade", placeholder: "Até 4 pessoas" },
            { key: "description", label: "Descrição", type: "textarea" },
            { key: "image", label: "Imagem (URL)" },
            { key: "features", label: "Diferenciais (separados por vírgula)", type: "csv" },
            { key: "ctaLabel", label: "Rótulo do botão" },
            { key: "ctaHref", label: "Link do botão" },
          ]}
          newItem={() => ({ name: "", description: "", image: "", capacity: "", features: [], ctaLabel: "", ctaHref: "" })}
          addLabel="Adicionar acomodação"
          onChange={(v) => setC((p) => ({ ...p, accommodations: { ...p.accommodations, items: v as CampaignContent["accommodations"]["items"] } }))}
        />
      </Panel>

      <Panel title="Sobre o destino">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className={lbl}>Título</span><input value={c.destination.title} onChange={(e) => setC((p) => ({ ...p, destination: { ...p.destination, title: e.target.value } }))} className={input} /></label>
          <label className="sm:col-span-2"><span className={lbl}>Texto</span><textarea rows={3} value={c.destination.text} onChange={(e) => setC((p) => ({ ...p, destination: { ...p.destination, text: e.target.value } }))} className={input} /></label>
          <label><span className={lbl}>Distância do aeroporto</span><input value={c.destination.airportDistance ?? ""} onChange={(e) => setC((p) => ({ ...p, destination: { ...p.destination, airportDistance: e.target.value } }))} className={input} /></label>
          <label><span className={lbl}>Distância do centro</span><input value={c.destination.centerDistance ?? ""} onChange={(e) => setC((p) => ({ ...p, destination: { ...p.destination, centerDistance: e.target.value } }))} className={input} /></label>
          <label className="sm:col-span-2"><span className={lbl}>Imagem (URL)</span><input value={c.destination.images[0] ?? ""} onChange={(e) => setC((p) => ({ ...p, destination: { ...p.destination, images: e.target.value ? [e.target.value] : [] } }))} className={input} /></label>
          <label className="sm:col-span-2"><span className={lbl}>Mapa (URL de incorporação)</span><input value={c.destination.mapEmbed ?? ""} onChange={(e) => setC((p) => ({ ...p, destination: { ...p.destination, mapEmbed: e.target.value } }))} className={input} /></label>
        </div>
      </Panel>

      <Panel title="Depoimentos">
        <p className="mb-3 text-xs text-slate-400">Cadastre apenas avaliações reais. Marque “Demonstrativo” enquanto usar conteúdo de exemplo.</p>
        <ObjRepeater
          items={c.testimonials.items}
          fields={[
            { key: "name", label: "Nome" },
            { key: "rating", label: "Nota (0-5)", type: "number" },
            { key: "text", label: "Depoimento", type: "textarea" },
            { key: "source", label: "Origem (ex.: Google)" },
            { key: "date", label: "Data" },
            { key: "demo", label: "Demonstrativo", type: "checkbox" },
          ]}
          newItem={() => ({ name: "", text: "", rating: 5, source: "", date: "", demo: true })}
          addLabel="Adicionar depoimento"
          onChange={(v) => setC((p) => ({ ...p, testimonials: { ...p.testimonials, items: v as CampaignContent["testimonials"]["items"] } }))}
        />
      </Panel>

      <Panel title="Perguntas frequentes">
        <ObjRepeater items={c.faq.items} fields={[{ key: "q", label: "Pergunta" }, { key: "a", label: "Resposta", type: "textarea" }]} newItem={() => ({ q: "", a: "" })} addLabel="Adicionar pergunta" onChange={(v) => setC((p) => ({ ...p, faq: { ...p.faq, items: v as CampaignContent["faq"]["items"] } }))} />
      </Panel>

      <Panel title="Vídeos">
        <p className="mb-3 text-xs text-slate-400">Cole links do Instagram (reel/post) ou YouTube. Cada link vira um vídeo incorporado na seção “O NANNAI em movimento”.</p>
        <StrRepeater items={c.videos} placeholder="https://www.instagram.com/reel/..." addLabel="Adicionar vídeo" onChange={(v) => setC((p) => ({ ...p, videos: v }))} />
      </Panel>

      <Panel title="CTA final">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className={lbl}>Título</span><input value={c.finalCta.title} onChange={(e) => setC((p) => ({ ...p, finalCta: { ...p.finalCta, title: e.target.value } }))} className={input} /></label>
          <label className="sm:col-span-2"><span className={lbl}>Subtítulo</span><input value={c.finalCta.subtitle ?? ""} onChange={(e) => setC((p) => ({ ...p, finalCta: { ...p.finalCta, subtitle: e.target.value } }))} className={input} /></label>
          <label><span className={lbl}>Imagem de fundo (URL)</span><input value={c.finalCta.bg ?? ""} onChange={(e) => setC((p) => ({ ...p, finalCta: { ...p.finalCta, bg: e.target.value } }))} className={input} /></label>
          <label><span className={lbl}>Rótulo do botão</span><input value={c.finalCta.ctaLabel} onChange={(e) => setC((p) => ({ ...p, finalCta: { ...p.finalCta, ctaLabel: e.target.value } }))} className={input} /></label>
        </div>
      </Panel>

      <Panel title="Formulário / Lista VIP">
        <div className="space-y-3">
          {f.fields.map((field, i) => (
            <div key={field.key} className="grid items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 sm:grid-cols-[1fr_auto_auto]">
              <input value={field.label} onChange={(e) => setF((p) => ({ ...p, fields: p.fields.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) }))} className={input} />
              <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={field.enabled} onChange={(e) => setF((p) => ({ ...p, fields: p.fields.map((x, j) => (j === i ? { ...x, enabled: e.target.checked } : x)) }))} className="size-4" /> Exibir</label>
              <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={field.required} onChange={(e) => setF((p) => ({ ...p, fields: p.fields.map((x, j) => (j === i ? { ...x, required: e.target.checked } : x)) }))} className="size-4" /> Obrigatório</label>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label><span className={lbl}>Rótulo do botão</span><input value={f.buttonLabel} onChange={(e) => setF((p) => ({ ...p, buttonLabel: e.target.value }))} className={input} /></label>
          <label><span className={lbl}>Redirecionamento após envio (opcional)</span><input value={f.redirectUrl ?? ""} onChange={(e) => setF((p) => ({ ...p, redirectUrl: e.target.value }))} className={input} /></label>
          <label className="sm:col-span-2"><span className={lbl}>Mensagem de sucesso</span><input value={f.successMessage} onChange={(e) => setF((p) => ({ ...p, successMessage: e.target.value }))} className={input} /></label>
          <label className="sm:col-span-2"><span className={lbl}>Texto do consentimento de marketing</span><input value={f.consentText} onChange={(e) => setF((p) => ({ ...p, consentText: e.target.value }))} className={input} /></label>
        </div>
      </Panel>

      <Panel title="Tracking (pixels)">
        <div className="grid gap-4 sm:grid-cols-3">
          <label><span className={lbl}>Meta Pixel ID</span><input value={t.metaPixelId ?? ""} onChange={(e) => setT((p) => ({ ...p, metaPixelId: e.target.value }))} className={input} /></label>
          <label><span className={lbl}>Google Analytics 4 (G-...)</span><input value={t.ga4Id ?? ""} onChange={(e) => setT((p) => ({ ...p, ga4Id: e.target.value }))} className={input} /></label>
          <label><span className={lbl}>Google Tag Manager (GTM-...)</span><input value={t.gtmId ?? ""} onChange={(e) => setT((p) => ({ ...p, gtmId: e.target.value }))} className={input} /></label>
        </div>
        <p className="mt-2 text-xs text-slate-400">Os pixels carregam só após o consentimento do visitante. O evento Lead dispara após o backend confirmar o cadastro.</p>
      </Panel>
    </form>
  );
}
