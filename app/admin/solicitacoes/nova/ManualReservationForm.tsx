"use client";
import { useActionState, useMemo, useState } from "react";
import { Loader2, Check } from "lucide-react";
import { applyDiscount, centsToBRL } from "@/app/lib/reservation";
import { createManualReservationAction, type ManualState } from "./actions";

type RoomOpt = { id: string; name: string; mainImage: string | null; beds: string | null; maxAdults: number; maxChildren: number; priceOriginalCents: number; pricePromoCents: number; active: boolean };
export type HotelOpt = { id: string; name: string; discountPercent: number; rooms: RoomOpt[] };

const input = "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900";
const label = "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500";

export function ManualReservationForm({ hotels }: { hotels: HotelOpt[] }) {
  const [state, action, pending] = useActionState<ManualState, FormData>(createManualReservationAction, {});
  const [hotelId, setHotelId] = useState(hotels[0]?.id ?? "");
  const [roomId, setRoomId] = useState("");

  const hotel = useMemo(() => hotels.find((h) => h.id === hotelId) ?? hotels[0], [hotels, hotelId]);
  const rooms = hotel?.rooms ?? [];
  const disc = hotel?.discountPercent ?? 0;

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="hotelId" value={hotelId} />
      <input type="hidden" name="roomId" value={roomId} />

      {hotels.length > 1 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <label className={label}>Hotel</label>
          <select value={hotelId} onChange={(e) => { setHotelId(e.target.value); setRoomId(""); }} className={input}>
            {hotels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </section>
      )}

      {/* Grade de quartos */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-bold text-slate-900">Acomodação</h2>
        {rooms.length === 0 ? (
          <p className="text-sm text-slate-500">Este hotel não tem quartos cadastrados.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((r) => {
              const promo = applyDiscount(r.priceOriginalCents, r.pricePromoCents, disc);
              const selected = roomId === r.id;
              return (
                <button type="button" key={r.id} onClick={() => setRoomId(r.id)}
                  className={`overflow-hidden rounded-xl border text-left transition ${selected ? "border-slate-900 ring-2 ring-slate-900" : "border-slate-200 hover:border-slate-400"}`}>
                  <div className="relative aspect-[4/3] bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {r.mainImage ? <img src={r.mainImage} alt="" className="h-full w-full object-cover" /> : null}
                    {selected && <span className="absolute right-2 top-2 inline-flex size-6 items-center justify-center rounded-full bg-slate-900 text-white"><Check className="size-4" /></span>}
                    {!r.active && <span className="absolute left-2 top-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">inativo</span>}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-slate-900">{r.name}</p>
                    <p className="text-xs text-slate-500">{[r.beds, `até ${r.maxAdults + r.maxChildren} hóspedes`].filter(Boolean).join(" · ")}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{centsToBRL(promo)} <span className="text-xs font-normal text-slate-400">/ noite</span></p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Dados do hóspede */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-bold text-slate-900">Dados do hóspede</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className={label}>Nome completo *</span><input name="guestName" required className={input} placeholder="Nome do cliente" /></label>
          <label><span className={label}>CPF</span><input name="guestCpf" className={input} placeholder="000.000.000-00" inputMode="numeric" /></label>
          <label><span className={label}>Telefone (WhatsApp)</span><input name="guestPhone" className={input} placeholder="5581999999999" /></label>
          <label><span className={label}>E-mail</span><input name="guestEmail" type="email" className={input} placeholder="cliente@email.com" /></label>
        </div>
      </section>

      {/* Período e hóspedes */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-bold text-slate-900">Período e hóspedes</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label><span className={label}>Check-in *</span><input name="checkIn" type="date" required className={input} /></label>
          <label><span className={label}>Hora check-in</span><input name="checkInTime" type="time" defaultValue="14:00" className={input} /></label>
          <label><span className={label}>Diárias (quartos)</span><input name="rooms" type="number" min={1} max={20} defaultValue={1} className={input} /></label>
          <label><span className={label}>Check-out *</span><input name="checkOut" type="date" required className={input} /></label>
          <label><span className={label}>Hora check-out</span><input name="checkOutTime" type="time" defaultValue="12:00" className={input} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label><span className={label}>Adultos</span><input name="adults" type="number" min={1} max={50} defaultValue={2} className={input} /></label>
            <label><span className={label}>Crianças</span><input name="children" type="number" min={0} max={50} defaultValue={0} className={input} /></label>
          </div>
        </div>
      </section>

      {/* Status */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <label className={label}>Status inicial</label>
        <select name="status" defaultValue="PENDENTE" className={input}>
          <option value="PENDENTE">Pendente (pré-reserva)</option>
          <option value="EM_ATENDIMENTO">Em atendimento</option>
          <option value="CONFIRMADA">Confirmada (gera voucher validado)</option>
        </select>
        <p className="mt-1 text-xs text-slate-500">Marque <strong>Confirmada</strong> somente após o pagamento — aí o voucher do cliente com selo fica disponível.</p>
      </section>

      {state.error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</p>}
      <button disabled={pending || !roomId} className="flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white disabled:opacity-50">
        {pending && <Loader2 className="size-4 animate-spin" />} Criar reserva
      </button>
      {!roomId && <p className="text-xs text-slate-400">Selecione uma acomodação para continuar.</p>}
    </form>
  );
}
