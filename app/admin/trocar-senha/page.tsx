"use client";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { changePasswordAction, type ChangeState } from "./actions";

const initial: ChangeState = {};

export default function TrocarSenhaPage() {
  const [state, action, pending] = useActionState(changePasswordAction, initial);
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="font-display text-xl font-bold">Defina uma nova senha</p>
        <p className="mb-6 mt-1 text-sm text-slate-500">Por segurança, troque a senha inicial antes de continuar.</p>
        <form action={action} className="space-y-4">
          <input name="current" type="password" required placeholder="Senha atual" autoComplete="current-password" className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900" />
          <input name="next" type="password" required placeholder="Nova senha (mín. 8 caracteres)" autoComplete="new-password" className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900" />
          <input name="confirm" type="password" required placeholder="Confirme a nova senha" autoComplete="new-password" className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900" />
          {state.error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</p>}
          <button disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60">
            {pending && <Loader2 className="size-4 animate-spin" />} Salvar e entrar
          </button>
        </form>
      </div>
    </div>
  );
}
