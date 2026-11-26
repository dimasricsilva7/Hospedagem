import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { requireAdmin } from "@/app/server/auth";
import { db } from "@/app/lib/db";
import { getPublicBaseUrl } from "@/app/server/settings";
import { normalizePhoneIntl, slugify } from "@/app/lib/reservation";
import { normalizeReservation } from "@/app/lib/content";
import { PrintButton } from "./PrintButton";
import { VoucherDoc, type VoucherData } from "@/app/components/VoucherDoc";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

function safe(s: string) {
  return s.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim();
}

export default async function VoucherPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const r = await db.reservationRequest.findUnique({
    where: { id },
    include: {
      hotel: { select: { name: true, logoUrl: true, city: true, whatsapp: true } },
      campaign: { select: { name: true, reservationConfig: true } },
    },
  });
  if (!r) notFound();

  const confirmed = r.status === "CONFIRMADA";
  const base = await getPublicBaseUrl();
  // Pré-reserva: QR leva à consulta de status. Validado: QR leva ao comprovante do cliente (com o nome na URL).
  const consultUrl = confirmed
    ? `${base}/comprovante/${encodeURIComponent(r.code)}/${slugify(r.guestName)}`
    : `${base}/reserva/${encodeURIComponent(r.code)}`;
  const qr = await QRCode.toDataURL(consultUrl, { margin: 1, width: 200 });
  const filename = `${safe(r.guestName)} - ${safe(r.hotel?.name ?? "Reserva")} - ${r.code}`;

  const data: VoucherData = {
    code: r.code,
    hotelName: r.hotel?.name ?? "",
    hotelLogoUrl: r.hotel?.logoUrl,
    hotelCity: r.hotel?.city,
    hotelWhatsapp: r.hotel?.whatsapp,
    guestName: r.guestName,
    guestPhone: r.guestPhone,
    guestEmail: r.guestEmail,
    adults: r.adults,
    children: r.children,
    checkIn: r.checkIn,
    checkInTime: r.checkInTime,
    checkOut: r.checkOut,
    checkOutTime: r.checkOutTime,
    rooms: r.rooms,
    nights: r.nights,
    totalPromoCents: r.totalPromoCents,
    discountPercent: r.discountPercent,
    pricePromoCents: r.pricePromoCents,
    priceOriginalCents: r.priceOriginalCents,
    roomName: r.roomName,
    campaignName: r.campaign?.name,
    rules: r.campaign ? normalizeReservation(r.campaign.reservationConfig).rules : "",
  };

  const clientLink = `/comprovante/${encodeURIComponent(r.code)}/${slugify(r.guestName)}`;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white print:p-0">
      <style>{`@media print { .no-print { display:none !important; } @page { margin: 14mm; } body { background:#fff; } }`}</style>

      <div className="mx-auto mb-5 flex max-w-3xl flex-wrap items-center justify-between gap-3 no-print">
        <Link href={`/admin/solicitacoes/${r.id}`} className="text-sm text-slate-500 hover:underline">← Voltar</Link>
        <div className="flex items-center gap-2">
          <Link href={clientLink} target="_blank" className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white">
            Abrir voucher do cliente
          </Link>
          <PrintButton filename={filename} />
        </div>
      </div>

      {!confirmed && (
        <div className="mx-auto mb-4 max-w-3xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 no-print">
          Esta é a <strong>pré-reserva</strong> (pagamento pendente). Para gerar o <strong>voucher validado</strong> com selo de autenticação, marque o status da solicitação como <strong>“Confirmada”</strong> e depois use <strong>“Abrir voucher do cliente”</strong>.
        </div>
      )}

      <VoucherDoc r={data} confirmed={confirmed} consultUrl={consultUrl} qr={qr} />

      {r.hotel?.whatsapp && (
        <div className="mx-auto mt-5 max-w-3xl text-center no-print">
          <a href={`https://wa.me/${normalizePhoneIntl(r.guestPhone || "")}`} target="_blank" rel="noopener noreferrer" className="text-sm text-green-700 hover:underline">
            Abrir WhatsApp do cliente
          </a>
        </div>
      )}
    </main>
  );
}
