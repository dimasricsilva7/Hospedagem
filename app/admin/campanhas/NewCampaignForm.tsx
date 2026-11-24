"use client";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { createCampaign, type CampaignState } from "./actions";

const input = "w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-slate-900";
const label = "mb-1 block text-sm font-medium";

export function NewCampaignForm({ hotels }: { hotels: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<CampaignState, FormData>(createCampaign, {});
  return (
    <form action={action} className="max-w-xl space-y-5">
      <label className="block">
        <span className={label}>Hotel *</span>
        <select name="hotelId" required className={input} defaultValue={hotels[0]?.id}>
          {hotels.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          <span className={label}>Nome da campanha *</span>
          <input name="name" required placeholder="Black Friday 2026" className={input} />
        </label>
        <label>
          <span className={label}>Slug (URL) *</span>
          <input name="slug" required placeholder="black-friday" className={input} />
        </label>
        <label>
          <span className={label}>Início (opcional)</span>
          <input name="startsAt" type="datetime-local" className={input} />
        </label>
        <label>
          <span className={label}>Término (opcional)</span>
          <input name="endsAt" type="datetime-local" className={input} />
        </label>
      </div>
      {state.error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className="flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white disabled:opacity-60">
        {pending && <Loader2 className="size-4 animate-spin" />} Criar e editar conteúdo
      </button>
    </form>
  );
}
