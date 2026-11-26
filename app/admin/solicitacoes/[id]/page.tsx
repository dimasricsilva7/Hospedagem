import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/app/server/auth";
import { db } from "@/app/lib/db";
import { centsToBRL, slugify } from "@/app/lib/reservation";
import { formatDateTime, formatIsoDate } from "@/app/lib/format";
import type { ReservationStatus } from "@prisma/client";
import { updateReservationAction } from "../actions";
import { STATUS_LABEL } from "../page";

export const dynamic = "force-dynamic";

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-900">{value || "—"}</dd>
    </div>
  );
}

export default async function ReservationDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { saved } = await searchParams;
  const r = await db.reservationRequest.findUnique({ where: { id }, include: { hotel: { select: { name: true } }, campaign: { select: { name: true } } } });
  if (!r) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin/solicitacoes" className="text-sm text-slate-500 hover:underline">← Voltar</Link>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl font-bold">
          Solicitação <span className="font-mono text-lg text-slate-500">{r.code}</span>
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{STATUS_LABEL[r.status]}</span>
          <Link href={`/voucher/${r.id}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Pré-reserva (PDF)
          </Link>
          <Link
            href={`/comprovante/${encodeURIComponent(r.code)}/${slugify(r.guestName)}`}
            target="_blank"
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white ${r.status === "CONFIRMADA" ? "bg-green-700 hover:brightness-110" : "bg-slate-400"}`}
            title={r.status === "CONFIRMADA" ? "Voucher validado do cliente" : "Disponível após marcar como Confirmada"}
          >
            Voucher do cliente
          </Link>
        </div>
      </div>

      {saved && <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">Alterações salvas.</p>}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <dl className="grid gap-5 sm:grid-cols-2">
          <Item label="Cliente" value={r.guestName} />
          <Item label="Contato" value={[r.guestPhone, r.guestEmail].filter(Boolean).join(" · ")} />
          <Item label="Hotel" value={r.hotel?.name} />
          <Item label="Campanha" value={r.campaign?.name} />
          <Item label="Acomodação" value={`${r.roomName} (${r.rooms} quarto${r.rooms > 1 ? "s" : ""})`} />
          <Item label="Hóspedes" value={`${r.adults} adulto(s)${r.children ? ` · ${r.children} criança(s)` : ""}`} />
          <Item label="Check-in" value={`${formatIsoDate(r.checkIn)} · ${r.checkInTime}`} />
          <Item label="Check-out" value={`${formatIsoDate(r.checkOut)} · ${r.checkOutTime}`} />
          <Item label="Diárias" value={String(r.nights)} />
          <Item label="Solicitada em" value={formatDateTime(r.createdAt)} />
        </dl>

        <div className="mt-6 rounded-xl bg-slate-50 p-5">
          <h2 className="mb-3 font-semibold">Valores (snapshot do pedido)</h2>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <Item label="Diária original" value={centsToBRL(r.priceOriginalCents)} />
            <Item label="Diária promocional" value={centsToBRL(r.pricePromoCents)} />
            <Item label="Total original" value={centsToBRL(r.totalOriginalCents)} />
            <Item label="Desconto" value={`${r.discountPercent}%`} />
          </dl>
          <p className="mt-3 text-lg font-bold">Total: {centsToBRL(r.totalPromoCents)}</p>
        </div>
      </section>

      <form action={updateReservationAction} className="rounded-2xl border border-slate-200 bg-white p-6">
        <input type="hidden" name="id" value={r.id} />
        <div className="grid gap-4 sm:grid-cols-[200px_1fr] sm:items-start">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Status</span>
            <select name="status" defaultValue={r.status} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900">
              {(Object.keys(STATUS_LABEL) as ReservationStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Observações internas</span>
            <textarea name="notes" defaultValue={r.notes ?? ""} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900" />
          </label>
        </div>
        <button className="mt-4 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">Salvar</button>
      </form>
    </div>
  );
}
