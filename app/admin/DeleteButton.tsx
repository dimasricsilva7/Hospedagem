"use client";
import { Trash2 } from "lucide-react";

// Botão de exclusão com confirmação. Recebe a server action por prop.
export function DeleteButton({ id, action, confirmText }: { id: string; action: (fd: FormData) => void | Promise<void>; confirmText: string }) {
  return (
    <form action={action} onSubmit={(e) => { if (!confirm(confirmText)) e.preventDefault(); }} className="inline">
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50" aria-label="Excluir">
        <Trash2 className="size-3.5" /> Excluir
      </button>
    </form>
  );
}
