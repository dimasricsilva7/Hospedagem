// Documento do voucher — serve tanto a PRÉ-RESERVA (admin) quanto o VOUCHER VALIDADO (cliente).
// `confirmed` troca selo, textos de pagamento e o selo holográfico de autenticação.
import { centsToBRL } from "@/app/lib/reservation";
import { formatIsoDate } from "@/app/lib/format";
import { AuthSeal } from "./AuthSeal";

export type VoucherData = {
  code: string;
  hotelName: string;
  hotelLogoUrl?: string | null;
  hotelCity?: string | null;
  hotelWhatsapp?: string | null;
  guestName: string;
  guestPhone?: string | null;
  guestEmail?: string | null;
  adults: number;
  children: number;
  checkIn: string;
  checkInTime: string;
  checkOut: string;
  checkOutTime: string;
  rooms: number;
  nights: number;
  totalPromoCents: number;
  discountPercent: number;
  pricePromoCents: number;
  priceOriginalCents: number;
  roomName: string;
  campaignName?: string | null;
  rules?: string | null;
};

function weekday(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  if (!Number.isFinite(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(d);
}

function Cell({ label, big, sub }: { label: string; big: string; sub?: string }) {
  return (
    <div className="px-4 py-3 text-center">
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-xl font-bold leading-tight text-slate-900">{big}</p>
      {sub && <p className="text-[11px] capitalize text-slate-500">{sub}</p>}
    </div>
  );
}

export function VoucherDoc({ r, confirmed, consultUrl, qr }: { r: VoucherData; confirmed: boolean; consultUrl: string; qr: string }) {
  return (
    <article className="mx-auto max-w-3xl rounded-xl border border-slate-300 bg-white p-8 shadow-sm print:border-0 print:shadow-none">
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {r.hotelLogoUrl ? <img src={r.hotelLogoUrl} alt="" className="h-14 w-auto rounded object-contain" /> : null}
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900">{r.hotelName}</h1>
            {r.hotelCity && <p className="text-xs text-slate-500">{r.hotelCity}</p>}
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${confirmed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
            {confirmed ? "Voucher confirmado" : "Pré-reserva"}
          </span>
          <p className="mt-1 text-[11px] text-slate-400">Número da reserva</p>
          <p className="font-mono text-2xl font-extrabold text-slate-900">{r.code}</p>
        </div>
      </header>

      <div className="mt-5 grid grid-cols-2 divide-x divide-slate-200 rounded-lg border border-slate-200 sm:grid-cols-5">
        <Cell label="Entrada" big={formatIsoDate(r.checkIn)} sub={`${weekday(r.checkIn)} · ${r.checkInTime}`} />
        <Cell label="Saída" big={formatIsoDate(r.checkOut)} sub={`${weekday(r.checkOut)} · ${r.checkOutTime}`} />
        <Cell label="Quartos" big={String(r.rooms)} />
        <Cell label="Diárias" big={String(r.nights)} />
        <Cell label="Total" big={centsToBRL(r.totalPromoCents)} sub={r.discountPercent ? `${r.discountPercent}% OFF` : undefined} />
      </div>

      {confirmed && (
        <div className="mt-6 flex flex-col items-center gap-4 rounded-xl border border-green-200 bg-green-50/60 p-5 sm:flex-row">
          <AuthSeal code={r.code} />
          <div className="text-center sm:text-left">
            <p className="text-sm font-bold uppercase tracking-wide text-green-800">Reserva confirmada e autenticada</p>
            <p className="mt-1 text-sm text-slate-600">
              Pagamento validado diretamente com o {r.hotelName}. Este comprovante é autêntico e vinculado ao número <strong className="font-mono">{r.code}</strong>.
            </p>
            <p className="mt-1 text-xs text-slate-500">Verifique a autenticidade pelo QR ou pelo link no final deste documento.</p>
          </div>
        </div>
      )}

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

      <section className="mt-6 rounded-lg bg-slate-50 p-5 text-sm text-slate-600">
        <h2 className="mb-2 font-bold text-slate-900">Pagamento e políticas</h2>
        {confirmed ? (
          <p><strong className="text-green-700">Pagamento confirmado.</strong> A reserva foi validada diretamente com o resort e está garantida para as datas acima.</p>
        ) : (
          <p>A reserva é <strong>realizada e confirmada diretamente pelo WhatsApp do resort</strong>, onde ocorrem a validação da reserva e o pagamento. Este documento é uma <strong>pré-reserva</strong> e só vira comprovante válido após a confirmação.</p>
        )}
        {r.rules && <p className="mt-2 whitespace-pre-line">{r.rules}</p>}
        {r.hotelWhatsapp && <p className="mt-2">Contato: <strong>{r.hotelWhatsapp}</strong></p>}
      </section>

      <section className="mt-6 flex items-center gap-4 border-t border-slate-200 pt-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt="QR da consulta da reserva" className="size-24" />
        <div className="text-xs text-slate-500">
          <p className="font-semibold text-slate-700">{confirmed ? "Verifique este comprovante" : "Acompanhe sua reserva"}</p>
          <p>Aponte a câmera para o QR ou acesse:</p>
          <p className="break-all font-mono text-slate-600">{consultUrl}</p>
        </div>
      </section>

      <p className="mt-5 text-[11px] leading-relaxed text-slate-400">
        {confirmed
          ? `${r.code} é o número desta reserva, autenticado após a confirmação com o ${r.hotelName}.`
          : `${r.code} é o identificador interno da solicitação no Faça Sua Reserva — não é um código oficial de confirmação do hotel enquanto não houver confirmação registrada.`}
        {r.campaignName ? ` Campanha: ${r.campaignName}.` : ""}
      </p>
    </article>
  );
}
