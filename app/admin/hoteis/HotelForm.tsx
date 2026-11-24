"use client";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { saveHotel, type HotelState } from "./actions";

type Values = Partial<{
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  whatsapp: string;
  email: string;
  instagram: string;
  facebook: string;
  city: string;
  isActive: boolean;
}>;

const input = "w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-slate-900";
const label = "mb-1 block text-sm font-medium";

export function HotelForm({ values = {} }: { values?: Values }) {
  const [state, action, pending] = useActionState<HotelState, FormData>(saveHotel, {});
  const v = values;
  return (
    <form action={action} className="max-w-2xl space-y-5">
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          <span className={label}>Nome do hotel *</span>
          <input name="name" required defaultValue={v.name} className={input} />
        </label>
        <label>
          <span className={label}>Slug (URL) *</span>
          <input name="slug" required defaultValue={v.slug} placeholder="resort-exemplo" className={input} />
        </label>
      </div>
      <label className="block">
        <span className={label}>Descrição</span>
        <textarea name="description" rows={3} defaultValue={v.description} className={input} />
      </label>
      <label className="block">
        <span className={label}>URL do logotipo</span>
        <input name="logoUrl" type="url" defaultValue={v.logoUrl} placeholder="https://..." className={input} />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          <span className={label}>Cor primária</span>
          <input name="primaryColor" type="color" defaultValue={v.primaryColor || "#0e7490"} className="h-11 w-full rounded-lg border border-slate-300" />
        </label>
        <label>
          <span className={label}>Cor secundária</span>
          <input name="secondaryColor" type="color" defaultValue={v.secondaryColor || "#f59e0b"} className="h-11 w-full rounded-lg border border-slate-300" />
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          <span className={label}>WhatsApp</span>
          <input name="whatsapp" defaultValue={v.whatsapp} placeholder="5511999999999" className={input} />
        </label>
        <label>
          <span className={label}>E-mail</span>
          <input name="email" type="email" defaultValue={v.email} className={input} />
        </label>
        <label>
          <span className={label}>Instagram (URL)</span>
          <input name="instagram" defaultValue={v.instagram} className={input} />
        </label>
        <label>
          <span className={label}>Facebook (URL)</span>
          <input name="facebook" defaultValue={v.facebook} className={input} />
        </label>
        <label>
          <span className={label}>Cidade</span>
          <input name="city" defaultValue={v.city} className={input} />
        </label>
      </div>
      <label className="flex items-center gap-3">
        <input type="checkbox" name="isActive" defaultChecked={v.isActive ?? true} className="size-4" />
        <span className="text-sm">Hotel ativo</span>
      </label>

      {state.error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className="flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white disabled:opacity-60">
        {pending && <Loader2 className="size-4 animate-spin" />} Salvar hotel
      </button>
    </form>
  );
}
