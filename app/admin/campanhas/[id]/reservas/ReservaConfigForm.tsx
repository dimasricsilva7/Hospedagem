"use client";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import type { ReservationConfig } from "@/app/lib/content";
import { saveReservationConfig, type ReservaConfigState } from "./actions";

const input = "w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-slate-900";
const label = "mb-1 block text-sm font-medium";

export function ReservaConfigForm({ id, values, hotelWhatsapp, saved }: { id: string; values: ReservationConfig; hotelWhatsapp: string; saved?: boolean }) {
  const [state, action, pending] = useActionState<ReservaConfigState, FormData>(saveReservationConfig, {});
  const v = values;
  return (
    <form action={action} className="max-w-2xl space-y-5">
      <input type="hidden" name="id" value={id} />

      <label className="flex items-center gap-3">
        <input type="checkbox" name="enabled" defaultChecked={v.enabled} className="size-4" />
        <span className="text-sm font-medium">Reservas via WhatsApp ativadas</span>
      </label>

      <label className="block">
        <span className={label}>WhatsApp para receber solicitações</span>
        <input name="whatsapp" defaultValue={v.whatsapp} placeholder={hotelWhatsapp ? `Vazio = usa o do hotel (${hotelWhatsapp})` : "5511999999999"} className={input} />
        <span className="mt-1 block text-xs text-slate-500">Com DDI e DDD (ex.: 5511999999999). Vazio usa o WhatsApp cadastrado no hotel.</span>
      </label>

      <div className="grid gap-5 sm:grid-cols-3">
        <label><span className={label}>Check-in mínimo</span><input name="checkInMin" type="time" defaultValue={v.checkInMin} className={input} /></label>
        <label><span className={label}>Check-in máximo</span><input name="checkInMax" type="time" defaultValue={v.checkInMax} className={input} /></label>
        <label><span className={label}>Intervalo (min)</span><input name="timeStepMin" type="number" min={5} max={120} defaultValue={v.timeStepMin} className={input} /></label>
        <label><span className={label}>Check-out máximo</span><input name="checkOutMax" type="time" defaultValue={v.checkOutMax} className={input} /></label>
        <label><span className={label}>Check-out padrão</span><input name="checkOutDefault" type="time" defaultValue={v.checkOutDefault} className={input} /></label>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <label><span className={label}>Mín. de diárias</span><input name="minNights" type="number" min={1} defaultValue={v.minNights} className={input} /></label>
        <label><span className={label}>Máx. de diárias</span><input name="maxNights" type="number" min={1} defaultValue={v.maxNights} className={input} /></label>
        <label><span className={label}>Máx. de hóspedes</span><input name="maxGuests" type="number" min={1} defaultValue={v.maxGuests} className={input} /></label>
      </div>

      <label className="block">
        <span className={label}>Desconto global (%) — aplicado a TODOS os quartos</span>
        <input name="discountPercent" type="number" min={0} max={95} defaultValue={v.discountPercent} className={input} />
        <span className="mt-1 block text-xs text-slate-500">Ex.: 36. Vale para todas as acomodações (cards do site e funil de reserva). 0 = usa o preço promocional cadastrado em cada quarto.</span>
      </label>

      <label className="block">
        <span className={label}>Texto do botão de reserva</span>
        <input name="buttonLabel" defaultValue={v.buttonLabel} className={input} />
      </label>

      <label className="block">
        <span className={label}>Regras e observações da hospedagem</span>
        <textarea name="rules" rows={3} defaultValue={v.rules} className={input} />
      </label>

      {state.error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</p>}
      {saved && !state.error && <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">Configurações salvas. O site publicado já usa os novos valores.</p>}
      <button disabled={pending} className="flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white disabled:opacity-60">
        {pending && <Loader2 className="size-4 animate-spin" />} Salvar configurações
      </button>
    </form>
  );
}
