"use client";
import { useEffect } from "react";
import { Printer } from "lucide-react";

// Define o título da aba = nome do arquivo sugerido no "Salvar como PDF" do navegador, e imprime.
export function PrintButton({ filename }: { filename: string }) {
  useEffect(() => {
    const prev = document.title;
    document.title = filename;
    return () => { document.title = prev; };
  }, [filename]);
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-full bg-[color:var(--color-night)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
    >
      <Printer className="size-4" /> Baixar PDF
    </button>
  );
}
