// Documento de hospedagem (voucher) — layout profissional. Serve PRÉ-RESERVA (admin) e VOUCHER VALIDADO (cliente).
// `confirmed` troca selos, textos de pagamento, status financeiro e exibe o selo holográfico de autenticidade.
import { centsToBRL, maskCpf } from "@/app/lib/reservation";
import { formatIsoDate } from "@/app/lib/format";
import { normalizeReservation } from "@/app/lib/content";
import { AuthSeal } from "./AuthSeal";

type RawReservation = {
  code: string; guestName: string; guestCpf?: string | null; guestPhone?: string | null; guestEmail?: string | null;
  adults: number; children: number; checkIn: string; checkInTime: string; checkOut: string; checkOutTime: string;
  rooms: number; nights: number; totalPromoCents: number; discountPercent: number; pricePromoCents: number; priceOriginalCents: number;
  roomName: string;
  hotel?: { name: string; logoUrl: string | null; city: string | null; whatsapp: string | null } | null;
  campaign?: { name: string; reservationConfig: unknown } | null;
  room?: { mainImage: string | null; description: string | null; beds: string | null; maxAdults: number; maxChildren: number } | null;
};

/** Monta os dados do voucher a partir da reserva (com hotel/campaign/room incluídos). */
export function buildVoucherData(r: RawReservation): VoucherData {
  const cap = r.room ? `até ${r.room.maxAdults} adulto(s)${r.room.maxChildren ? ` e ${r.room.maxChildren} criança(s)` : ""}` : null;
  return {
    code: r.code, hotelName: r.hotel?.name ?? "", hotelLogoUrl: r.hotel?.logoUrl, hotelCity: r.hotel?.city, hotelWhatsapp: r.hotel?.whatsapp,
    guestName: r.guestName, guestCpf: r.guestCpf, guestPhone: r.guestPhone, guestEmail: r.guestEmail,
    adults: r.adults, children: r.children, checkIn: r.checkIn, checkInTime: r.checkInTime, checkOut: r.checkOut, checkOutTime: r.checkOutTime,
    rooms: r.rooms, nights: r.nights, totalPromoCents: r.totalPromoCents, discountPercent: r.discountPercent,
    pricePromoCents: r.pricePromoCents, priceOriginalCents: r.priceOriginalCents,
    roomName: r.roomName, roomImage: r.room?.mainImage, roomArea: r.room?.beds, roomCapacity: cap, roomDescription: r.room?.description,
    campaignName: r.campaign?.name, rules: r.campaign ? normalizeReservation(r.campaign.reservationConfig).rules : "",
  };
}

export type VoucherData = {
  code: string;
  hotelName: string;
  hotelLogoUrl?: string | null;
  hotelCity?: string | null;
  hotelWhatsapp?: string | null;
  guestName: string;
  guestCpf?: string | null;
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
  roomImage?: string | null;
  roomArea?: string | null;
  roomCapacity?: string | null;
  roomDescription?: string | null;
  mealPlan?: string | null;
  paymentMethod?: string | null;
  campaignName?: string | null;
  rules?: string | null;
};

function weekday(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  if (!Number.isFinite(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(d);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#15362f]">
      <span className="h-4 w-1 rounded-full bg-[#a58a64]" />
      {children}
    </h2>
  );
}

function Cell({ label, big, sub }: { label: string; big: string; sub?: string }) {
  return (
    <div className="px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-lg font-bold leading-tight text-[#15362f]">{big}</p>
      {sub && <p className="text-[11px] capitalize text-slate-500">{sub}</p>}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-800">{value || "—"}</p>
    </div>
  );
}

export function VoucherDoc({ r, confirmed, consultUrl, qr }: { r: VoucherData; confirmed: boolean; consultUrl: string; qr: string }) {
  const capacity = r.roomCapacity || `até ${r.adults + r.children} hóspedes`;
  const meal = r.mealPlan || "Café da manhã e jantar, conforme as condições da categoria e tarifa contratada.";
  const pay = r.paymentMethod || "PIX";
  return (
    <article className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-[#fcfaf5] shadow-sm print:border-0 print:shadow-none">
      {/* Cabeçalho verde */}
      <header className="relative overflow-hidden bg-gradient-to-r from-[#0f3a33] to-[#1c4d44] px-6 py-5 sm:px-8">
        <span className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full border-[6px] border-[#a58a64]/25" />
        <span className="pointer-events-none absolute -right-2 -top-8 size-40 rounded-full border-[3px] border-[#a58a64]/20" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {r.hotelLogoUrl ? (
              <span className="flex h-16 items-center justify-center rounded-lg bg-white px-4 py-2 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.hotelLogoUrl} alt={r.hotelName} className="h-9 w-auto object-contain sm:h-10" />
              </span>
            ) : null}
            <div className="hidden sm:block">
              <p className="text-sm font-bold uppercase tracking-wide text-white">Documento de hospedagem</p>
              <p className="text-xs text-white/70">{r.hotelName}{r.hotelCity ? ` · ${r.hotelCity}` : ""}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#d9c6a4]">Nº da reserva</p>
            <p className="font-mono text-xl font-extrabold text-white sm:text-2xl">{r.code}</p>
          </div>
        </div>
      </header>

      <div className="px-6 py-6 sm:px-8">
        {/* Título + status + QR */}
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-bold text-[#15362f]">{confirmed ? "Reserva confirmada" : "Pré-reserva"}</h1>
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${confirmed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                {confirmed ? "Pagamento registrado" : "Aguardando pagamento"}
              </span>
            </div>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              {confirmed
                ? "Documento da hospedagem confirmada, vinculado ao número da reserva acima. Apresente este comprovante no check-in."
                : "Sua solicitação foi registrada. A hospedagem só é confirmada após a identificação do pagamento e a validação da disponibilidade."}
            </p>
          </div>
          <div className="flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="QR da reserva" className="size-24 rounded-lg border border-slate-200 bg-white p-1" />
            <p className="mt-1 max-w-[8rem] text-center text-[9px] uppercase tracking-wide text-slate-400">{confirmed ? "QR de verificação" : "QR de acompanhamento"}</p>
            <p className="mt-0.5 hidden max-w-[8rem] break-all text-center text-[8px] text-slate-300 print:block">{consultUrl}</p>
          </div>
        </div>

        {/* Resumo da hospedagem */}
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <SectionTitle>Resumo da hospedagem</SectionTitle>
          <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-5 sm:divide-y-0">
            <Cell label="Check-in" big={formatIsoDate(r.checkIn)} sub={`${weekday(r.checkIn)} · ${r.checkInTime}`} />
            <Cell label="Check-out" big={formatIsoDate(r.checkOut)} sub={`${weekday(r.checkOut)} · ${r.checkOutTime}`} />
            <Cell label="Diárias" big={String(r.nights)} />
            <Cell label="Quartos" big={String(r.rooms)} />
            <Cell label="Hóspedes" big={String(r.adults + r.children)} sub={`${r.adults} adulto(s)${r.children ? ` · ${r.children} criança(s)` : ""}`} />
          </div>
        </section>

        {/* Hóspede principal */}
        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
          <SectionTitle>Hóspede principal</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome completo" value={r.guestName} />
            <Field label="CPF" value={maskCpf(r.guestCpf) || "Não informado"} />
            <Field label="E-mail" value={r.guestEmail} />
            <Field label="Telefone" value={r.guestPhone} />
          </div>
        </section>

        {/* Acomodação + plano de alimentação */}
        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
          <SectionTitle>Acomodação e plano de alimentação</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
            <div className="flex gap-4">
              {r.roomImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.roomImage} alt={r.roomName} className="h-28 w-36 flex-none rounded-lg object-cover ring-1 ring-black/5" />
              ) : (
                <div className="flex h-28 w-36 flex-none items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">Sem imagem</div>
              )}
              <div className="min-w-0">
                <p className="font-display text-lg font-bold text-[#15362f]">{r.roomName}</p>
                <p className="text-xs text-slate-500">{[r.roomArea && `Área: ${r.roomArea}`, `Capacidade: ${capacity}`].filter(Boolean).join(" · ")}</p>
                {r.roomDescription && <p className="mt-1 line-clamp-3 text-xs text-slate-500">{r.roomDescription}</p>}
              </div>
            </div>
            <div className="rounded-lg bg-[#f4efe4] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8a7350]">Plano de alimentação</p>
              <p className="mt-1 text-sm text-slate-700">{meal}</p>
            </div>
          </div>
        </section>

        {/* Valores e pagamento */}
        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
          <SectionTitle>Valores e pagamento</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4 text-sm">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Resumo financeiro</p>
              <div className="flex justify-between py-1"><span className="text-slate-500">Valor da hospedagem</span><span className="font-semibold tabular-nums">{centsToBRL(r.totalPromoCents)}</span></div>
              <div className="flex justify-between py-1"><span className="text-slate-500">Valor pago</span><span className="font-semibold tabular-nums">{confirmed ? centsToBRL(r.totalPromoCents) : "R$ 0,00"}</span></div>
              <div className="flex justify-between border-t border-slate-100 py-1 pt-2"><span className="text-slate-500">Saldo restante</span><span className="font-semibold tabular-nums">{confirmed ? "R$ 0,00" : "A definir"}</span></div>
            </div>
            <div className={`rounded-lg p-4 text-sm ${confirmed ? "bg-green-50" : "bg-amber-50"}`}>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Status do pagamento</p>
              <p className={`text-lg font-bold ${confirmed ? "text-green-700" : "text-amber-700"}`}>{confirmed ? "Pago integralmente" : "Aguardando pagamento"}</p>
              <p className="mt-1 text-slate-600">Forma de pagamento: <strong>{pay}</strong></p>
              {r.discountPercent ? <p className="mt-1 text-xs text-slate-500">Desconto aplicado: {r.discountPercent}%</p> : null}
            </div>
          </div>
        </section>

        {/* Informações + selo */}
        <section className="mt-5 flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <SectionTitle>Informações importantes</SectionTitle>
            <ul className="space-y-1 text-xs text-slate-500">
              <li>• {confirmed ? "Pagamento confirmado — reserva garantida para as datas acima." : "A pré-reserva não garante a hospedagem até a confirmação do pagamento."}</li>
              <li>• Confirmação, validação e pagamento são feitos diretamente com o resort pelo WhatsApp{r.hotelWhatsapp ? ` (${r.hotelWhatsapp})` : ""}.</li>
              <li>• Horários, inclusões, alterações e cancelamento seguem as condições da tarifa contratada.</li>
              {r.rules ? <li className="whitespace-pre-line">• {r.rules}</li> : null}
            </ul>
          </div>
          {confirmed && (
            <div className="flex flex-col items-center gap-2">
              <AuthSeal code={r.code} />
              <p className="text-[9px] uppercase tracking-wide text-slate-400">Autenticidade · {r.code}</p>
            </div>
          )}
        </section>
      </div>

      {/* Rodapé */}
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white px-6 py-3 text-[11px] text-slate-400 sm:px-8">
        <span className="font-semibold text-slate-500">{r.hotelName}{r.hotelCity ? ` · ${r.hotelCity}` : ""}</span>
        <span>Referência: <span className="font-mono">{r.code}</span>{r.campaignName ? ` · ${r.campaignName}` : ""}</span>
      </footer>
    </article>
  );
}
