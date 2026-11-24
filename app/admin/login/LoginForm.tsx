"use client";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { loginAction, type LoginState } from "./actions";

const initial: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">E-mail</span>
        <input name="email" type="email" required autoComplete="username" className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Senha</span>
        <input name="password" type="password" required autoComplete="current-password" className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900" />
      </label>
      {state.error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60">
        {pending && <Loader2 className="size-4 animate-spin" />} Entrar
      </button>
    </form>
  );
}
