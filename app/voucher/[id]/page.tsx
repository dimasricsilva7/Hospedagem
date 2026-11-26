import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { requireAdmin } from "@/app/server/auth";
import { db } from "@/app/lib/db";
import { appUrl } from "@/app/lib/env";
import { centsToBRL, normalizePhoneIntl } from "@/app/lib/reservation";
import { normalizeReservation } from "@/app/lib/content";
import { formatIsoDate } from "@/app/lib/format";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

function safe(s: string) {
  return s.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim();
}
function weekday(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  if (!Number.isFinite(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(d);
}

function VoucherCell({ label, big, sub }: { label: string; big: string; sub?: string }) {
  return (
    <div className="px-4 py-3 text-center">
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-xl font-bold leading-tight text-slate-900">{big}</p>
      {sub && <p className="text-[11px] capitalize text-slate-500">{sub}</p>}
    </div>
  );
}

export default async function VoucherPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const r = await db.reservationRequest.findUnique({
    where: { id },
    include: {
      hotel: { select: { name: true, logoUrl: true, city: true, whatsapp: true, email: true } },
      campaign: { select: { name: true, reservationConfig: true } },
    },
  });
  if (!r) notFound();

  const whatsapp = (r.hotel?.whatsapp || "").trim();
  const rules = r.campaign ? normalizeReservation(r.campaign.reservationConfig).rules : "";
  const consultUrl = `${appUrl()}/reserva/${encodeURIComponent(r.code)}`;
  const qr = await QRCode.toDataURL(consultUrl, { margin: 1, width: 200 });
  const filename = `${safe(r.guestName)} - ${safe(r.hotel?.name ?? "Reserva")} - ${r.code}`;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white print:p-0">
      {/* CSS de impressão: esconde ações e zera margens extras */}
      <style>{`@media print { .no-print { display:none !important; } @page { margin: 14mm; } body { background:#fff; } }`}</style>

      <div className="mx-auto mb-5 flex max-w-3xl items-center justify-between no-print">
        <Link href={`/admin/solicitacoes/${r.id}`} className="text-sm text-slate-500 hover:underline">← Voltar</Link>
        <PrintButton filename={filename} />
      </div>

      <article className="mx-auto max-w-3xl rounded-xl border border-slate-300 bg-white p-8 shadow-sm print:border-0 print:shadow-none">
        {/* Cabeçalho */}
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {r.hotel?.logoUrl ? <img src={r.hotel.logoUrl} alt="" className="h-12 w-auto object-contain" /> : null}
            <div>
              <h1 className="font-display text-xl font-bold text-slate-900">{r.hotel?.name}</h1>
              {r.hotel?.city && <p className="text-xs text-slate-500">{r.hotel.city}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-400">Confirmação da solicitação</p>
            <p className="text-[11px] text-slate-400">Número da reserva</p>
            <p className="font-mono text-2xl font-extrabold text-slate-900">{r.code}</p>
          </div>
        </header>

        {/* Linha resumo tipo voucher */}
        <div className="mt-5 grid grid-cols-2 divide-x divide-slate-200 rounded-lg border border-slate-200 sm:grid-cols-5">
          <VoucherCell label="Entrada" big={formatIsoDate(r.checkIn)} sub={`${weekday(r.checkIn)} · ${r.checkInTime}`} />
          <VoucherCell label="Saída" big={formatIsoDate(r.checkOut)} sub={`${weekday(r.checkOut)} · ${r.checkOutTime}`} />
          <VoucherCell label="Quartos" big={String(r.rooms)} />
          <VoucherCell label="Diárias" big={String(r.nights)} />
          <VoucherCell label="Total" big={centsToBRL(r.totalPromoCents)} sub={r.discountPercent ? `${r.discountPercent}% OFF` : undefined} />
        </div>

        {/* Hóspede + acomodação */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <section>
            <h2 className="text-sm font-bold text-slate-900">Hóspede</h2>
            <p className="mt-1 text-sm text-slate-700">{r.guestName}</p>
            {r.guestPhone && <p className="text-sm text-slate-500">{r.guestPhone}</p>}
            {r.guestEmail && <p className="text-sm text-slate-500">{r.guestEmail}</p>}
            <p className="mt-1 text-sm text-slate-500">{r.adults} adulto(s){r.children ? ` · ${r.children} criança(s)` : ""}</p>
          </section>
          <section>
            <h2 className="text-sm font-bold text-slate-900">Acomodação</h2>
            <p className="mt-1 text-sm text-slate-700">{r.roomName}</p>
            <p className="mt-2 text-xs text-slate-500">Diária: {centsToBRL(r.pricePromoCents)}{r.priceOriginalCents > r.pricePromoCents ? ` (de ${centsToBRL(r.priceOriginalCents)})` : ""}</p>
          </section>
        </div>

        {/* Políticas */}
        <section className="mt-6 rounded-lg bg-slate-50 p-5 text-sm text-slate-600">
          <h2 className="mb-2 font-bold text-slate-900">Pagamento e políticas</h2>
          <p>A reserva é <strong>realizada e confirmada diretamente pelo WhatsApp do resort</strong>, onde ocorrem a validação da reserva e o pagamento.</p>
          {rules && <p className="mt-2 whitespace-pre-line">{rules}</p>}
          {whatsapp && <p className="mt-2">Contato: <strong>{r.hotel?.whatsapp}</strong></p>}
        </section>

        {/* QR + consulta */}
        <section className="mt-6 flex items-center gap-4 border-t border-slate-200 pt-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR da consulta da reserva" className="size-24" />
          <div className="text-xs text-slate-500">
            <p className="font-semibold text-slate-700">Consulte sua reserva</p>
            <p>Aponte a câmera para o QR ou acesse:</p>
            <p className="break-all font-mono text-slate-600">{consultUrl}</p>
          </div>
        </section>

        <p className="mt-5 text-[11px] leading-relaxed text-slate-400">
          {r.code} é o identificador interno da solicitação no Faça Sua Reserva — não é um código oficial de confirmação do hotel,
          salvo quando houver confirmação real registrada. {r.campaign?.name ? `Campanha: ${r.campaign.name}.` : ""}
        </p>
      </article>

      {whatsapp && (
        <div className="mx-auto mt-5 max-w-3xl text-center no-print">
          <a href={`https://wa.me/${normalizePhoneIntl(r.guestPhone || "")}`} target="_blank" rel="noopener noreferrer" className="text-sm text-green-700 hover:underline">
            Abrir WhatsApp do cliente
          </a>
        </div>
      )}
    </main>
  );
}
