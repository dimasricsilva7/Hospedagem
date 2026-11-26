"use client";
import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { saveRoom, type RoomState } from "./actions";
import { reaisToCents, centsToBRL } from "@/app/lib/reservation";

type Values = Partial<{
  id: string;
  name: string;
  description: string;
  mainImage: string;
  images: string[];
  amenities: string[];
  beds: string;
  maxAdults: number;
  maxChildren: number;
  priceOriginal: string;
  pricePromo: string;
  badgeCount: number | null;
  active: boolean;
  sortOrder: number;
}>;

const input = "w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-slate-900";
const label = "mb-1 block text-sm font-medium";

export function RoomForm({ hotelId, values = {}, discountPercent = 0 }: { hotelId: string; values?: Values; discountPercent?: number }) {
  const [state, action, pending] = useActionState<RoomState, FormData>(saveRoom, {});
  const v = values;
  const useGlobal = discountPercent > 0;
  const [orig, setOrig] = useState(v.priceOriginal ?? "");
  // Promo derivado do preço cheio × (1 − desconto global), igual ao applyDiscount do servidor.
  const promoCents = Math.round((reaisToCents(orig) * (100 - discountPercent)) / 100);
  const autoPromo = useGlobal ? (reaisToCents(orig) > 0 ? centsToBRL(promoCents) : "") : "";
  return (
    <form action={action} className="max-w-2xl space-y-5">
      <input type="hidden" name="hotelId" value={hotelId} />
      {v.id && <input type="hidden" name="id" value={v.id} />}

      <label className="block">
        <span className={label}>Nome do quarto *</span>
        <input name="name" required defaultValue={v.name} placeholder="Suíte Vista Mar" className={input} />
      </label>
      <label className="block">
        <span className={label}>Descrição</span>
        <textarea name="description" rows={3} defaultValue={v.description} className={input} />
      </label>

      <label className="block">
        <span className={label}>Imagem principal (URL)</span>
        <input name="mainImage" type="url" defaultValue={v.mainImage} placeholder="https://..." className={input} />
      </label>
      <label className="block">
        <span className={label}>Galeria — uma URL por linha</span>
        <textarea name="images" rows={3} defaultValue={v.images?.join("\n")} placeholder={"https://...\nhttps://..."} className={input} />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          <span className={label}>Camas</span>
          <input name="beds" defaultValue={v.beds} placeholder="1 cama de casal" className={input} />
        </label>
        <label>
          <span className={label}>Comodidades (separe por vírgula)</span>
          <input name="amenities" defaultValue={v.amenities?.join(", ")} placeholder="Ar-condicionado, Vista mar" className={input} />
        </label>
        <label>
          <span className={label}>Máx. adultos</span>
          <input name="maxAdults" type="number" min={1} defaultValue={v.maxAdults ?? 2} className={input} />
        </label>
        <label>
          <span className={label}>Máx. crianças</span>
          <input name="maxChildren" type="number" min={0} defaultValue={v.maxChildren ?? 0} className={input} />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          <span className={label}>Preço original / diária (R$) *</span>
          <input name="priceOriginal" required value={orig} onChange={(e) => setOrig(e.target.value)} placeholder="950,00" className={input} />
        </label>
        <label>
          <span className={label}>{useGlobal ? "Preço com desconto / diária" : "Preço promocional / diária (R$) *"}</span>
          {useGlobal ? (
            <>
              <input value={autoPromo} readOnly placeholder="—" className={`${input} bg-slate-50 font-semibold`} />
              {/* Promo enviado = valor calculado; servidor recalcula com o mesmo desconto global. */}
              <input type="hidden" name="pricePromo" value={autoPromo || orig} />
            </>
          ) : (
            <input name="pricePromo" required defaultValue={v.pricePromo} placeholder="608,00" className={input} />
          )}
        </label>
      </div>
      {useGlobal ? (
        <p className="-mt-2 text-xs text-slate-500">
          Desconto em massa ativo: <strong>{discountPercent}% OFF</strong> em todos os quartos. O preço com desconto é calculado automaticamente a partir do preço original. Para mudar o percentual, vá em <strong>Campanhas › sua campanha › Reservas › “Desconto global (%)”</strong>.
        </p>
      ) : (
        <p className="-mt-2 text-xs text-slate-500">O desconto (% OFF) é calculado automaticamente a partir dos dois preços. Para aplicar um desconto único a todos os quartos, defina o <strong>“Desconto global (%)”</strong> em Campanhas › Reservas.</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          <span className={label}>“Restam apenas N” (indicador comercial)</span>
          <input name="badgeCount" type="number" min={0} max={99} defaultValue={v.badgeCount ?? 0} className={input} />
          <span className="mt-1 block text-xs text-slate-500">0 = não exibir. Não é estoque real — apenas urgência comercial.</span>
        </label>
        <label>
          <span className={label}>Ordem de exibição</span>
          <input name="sortOrder" type="number" min={0} defaultValue={v.sortOrder ?? 0} className={input} />
        </label>
      </div>

      <label className="flex items-center gap-3">
        <input type="checkbox" name="active" defaultChecked={v.active ?? true} className="size-4" />
        <span className="text-sm">Quarto ativo (aparece no site)</span>
      </label>

      {state.error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className="flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white disabled:opacity-60">
        {pending && <Loader2 className="size-4 animate-spin" />} Salvar quarto
      </button>
    </form>
  );
}
