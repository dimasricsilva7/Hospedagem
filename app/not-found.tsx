import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display text-6xl font-bold text-[color:var(--color-ink)]">404</p>
      <h1 className="text-xl font-medium">Campanha não encontrada</h1>
      <p className="max-w-md text-[color:var(--color-mute)]">O endereço acessado não existe, está despublicado ou foi encerrado.</p>
      <Link href="/" className="mt-2 rounded-xl bg-[color:var(--color-ink)] px-5 py-3 text-sm font-medium text-white">
        Voltar ao início
      </Link>
    </main>
  );
}
