"use client";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { changeOwnPassword, type ConfigState } from "./actions";

const input = "w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900";

export function PasswordForm() {
  const [state, action, pending] = useActionState<ConfigState, FormData>(changeOwnPassword, {});
  return (
    <form action={action} className="max-w-sm space-y-4">
      <input name="current" type="password" required placeholder="Senha atual" autoComplete="current-password" className={input} />
      <input name="next" type="password" required placeholder="Nova senha (mín. 8)" autoComplete="new-password" className={input} />
      <input name="confirm" type="password" required placeholder="Confirmar nova senha" autoComplete="new-password" className={input} />
      {state.error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</p>}
      {state.saved && <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">Senha alterada.</p>}
      <button disabled={pending} className="flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
        {pending && <Loader2 className="size-4 animate-spin" />} Alterar senha
      </button>
    </form>
  );
}
