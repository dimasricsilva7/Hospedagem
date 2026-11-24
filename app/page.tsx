import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[color:var(--color-night)] text-white">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">Plataforma Hospedagem</p>
        <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-6xl">
          Landing pages de alta conversão para hotéis e resorts.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-white/80">
          Crie campanhas promocionais independentes por hotel — com countdown, captura de leads, tracking e um
          painel administrativo para gerenciar tudo sem tocar em código.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/resort-exemplo/black-friday" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-4 font-semibold text-[color:var(--color-night)]">
            Ver campanha demonstrativa <ArrowRight className="size-5" />
          </Link>
          <Link href="/admin" className="inline-flex items-center gap-2 rounded-xl px-6 py-4 font-semibold ring-1 ring-white/30">
            <LayoutDashboard className="size-5" /> Painel administrativo
          </Link>
        </div>
        <p className="mt-10 text-sm text-white/50">
          A campanha de demonstração usa conteúdo fictício, claramente identificado, apenas para mostrar o potencial visual.
        </p>
      </div>
    </main>
  );
}
