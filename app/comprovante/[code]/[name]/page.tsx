import type { Metadata } from "next";
import QRCode from "qrcode";
import { db } from "@/app/lib/db";
import { getPublicBaseUrl } from "@/app/server/settings";
import { slugify } from "@/app/lib/reservation";
import { PrintButton } from "@/app/voucher/[id]/PrintButton";
import { VoucherDoc, buildVoucherData } from "@/app/components/VoucherDoc";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Comprovante de reserva", robots: { index: false, follow: false } };

function safe(s: string) {
  return s.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim();
}

export default async function ComprovantePage({ params }: { params: Promise<{ code: string; name: string }> }) {
  const { code } = await params;
  const r = await db.reservationRequest
    .findUnique({
      where: { code: decodeURIComponent(code) },
      include: {
        hotel: { select: { name: true, logoUrl: true, city: true, whatsapp: true } },
        campaign: { select: { name: true, reservationConfig: true } },
        room: { select: { mainImage: true, description: true, beds: true, maxAdults: true, maxChildren: true, amenities: true } },
      },
    })
    .catch(() => null);

  if (!r) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-5 text-center">
        <h1 className="font-display text-2xl font-semibold text-[color:var(--color-ink)]">Comprovante não encontrado</h1>
        <p className="mt-2 text-[color:var(--color-mute)]">Confira o link. Em caso de dúvida, fale com o resort pelo WhatsApp.</p>
      </main>
    );
  }

  // Só é comprovante válido quando a reserva está confirmada (pagamento validado). Antes disso, nada de selo.
  if (r.status !== "CONFIRMADA") {
    const first = r.guestName.trim().split(/\s+/)[0];
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-5 py-12 text-center">
        <div className="rounded-3xl border border-[color:var(--color-line)] bg-white p-7 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-mute)]">{r.hotel?.name}</p>
          <h1 className="mt-3 font-display text-xl font-semibold text-[color:var(--color-ink)]">Olá, {first}</h1>
          <p className="mt-2 text-sm text-[color:var(--color-mute)]">
            Sua reserva <strong className="font-mono">{r.code}</strong> ainda está em processamento. O comprovante autenticado fica disponível aqui assim que o pagamento for confirmado com o resort.
          </p>
          {r.hotel?.whatsapp && <p className="mt-4 text-sm">Dúvidas? WhatsApp <strong>{r.hotel.whatsapp}</strong></p>}
        </div>
      </main>
    );
  }

  const base = await getPublicBaseUrl();
  const selfUrl = `${base}/comprovante/${encodeURIComponent(r.code)}/${slugify(r.guestName)}`;
  const qr = await QRCode.toDataURL(selfUrl, { margin: 1, width: 200 });
  const filename = `${safe(r.guestName)} - ${safe(r.hotel?.name ?? "Reserva")} - ${r.code}`;
  const data = buildVoucherData(r);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white print:p-0">
      <style>{`@media print { .no-print { display:none !important; } @page { margin: 14mm; } body { background:#fff; } }`}</style>

      <div className="mx-auto mb-5 flex max-w-3xl items-center justify-between no-print">
        <p className="text-sm font-semibold text-slate-600">Seu comprovante de reserva</p>
        <PrintButton filename={filename} />
      </div>

      <VoucherDoc r={data} confirmed consultUrl={selfUrl} qr={qr} />
    </main>
  );
}
