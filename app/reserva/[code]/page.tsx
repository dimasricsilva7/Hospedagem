import type { Metadata } from "next";
import { db } from "@/app/lib/db";
import { centsToBRL } from "@/app/lib/reservation";
import { formatIsoDate } from "@/app/lib/format";
import type { ReservationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Consulta de reserva", robots: { index: false, follow: false } };

const STATUS: Record<ReservationStatus, { label: string; cls: string }> = {
  PENDENTE: { label: "Solicitação recebida", cls: "bg-blue-100 text-blue-700" },
  EM_ATENDIMENTO: { label: "Em atendimento", cls: "bg-amber-100 text-amber-700" },
  CONFIRMADA: { label: "Confirmada com o hotel", cls: "bg-green-100 text-green-700" },
  CANCELADA: { label: "Cancelada", cls: "bg-slate-200 text-slate-600" },
};

// Consulta pública por código. Exibe o mínimo (sem telefone/e-mail) — o código é semi-adivinhável.
export default async function ConsultaReserva({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const r = await db.reservationRequest
    .findUnique({ where: { code: decodeURIComponent(code) }, include: { hotel: { select: { name: true, logoUrl: true, city: true } } } })
    .catch(() => null);

  if (!r) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-5 text-center">
        <h1 className="font-display text-2xl font-semibold text-[color:var(--color-ink)]">Reserva não encontrada</h1>
        <p className="mt-2 text-[color:var(--color-mute)]">Confira o número informado. Em caso de dúvida, fale com o resort pelo WhatsApp.</p>
      </main>
    );
  }

  const st = STATUS[r.status];
  const firstName = r.guestName.trim().split(/\s+/)[0];

  return (
    <main className="mx-auto max-w-lg px-5 py-12">
      <div className="rounded-3xl border border-[color:var(--color-line)] bg-white p-7 shadow-sm">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-mute)]">{r.hotel?.name}</p>
          <p className="mt-4 text-xs uppercase tracking-wide text-[color:var(--color-mute)]">Número da reserva</p>
          <p className="mt-1 font-mono text-3xl font-extrabold tracking-tight text-[color:var(--color-ink)]">{r.code}</p>
          <span className={`mt-4 inline-block rounded-full px-3 py-1 text-sm font-medium ${st.cls}`}>{st.label}</span>
        </div>

        <dl className="mt-7 grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-[color:var(--color-mute)]">Hóspede</dt><dd className="font-medium text-[color:var(--color-ink)]">{firstName}</dd></div>
          <div><dt className="text-[color:var(--color-mute)]">Acomodação</dt><dd className="font-medium text-[color:var(--color-ink)]">{r.roomName}</dd></div>
          <div><dt className="text-[color:var(--color-mute)]">Check-in</dt><dd className="font-medium text-[color:var(--color-ink)]">{formatIsoDate(r.checkIn)} · {r.checkInTime}</dd></div>
          <div><dt className="text-[color:var(--color-mute)]">Check-out</dt><dd className="font-medium text-[color:var(--color-ink)]">{formatIsoDate(r.checkOut)} · {r.checkOutTime}</dd></div>
          <div><dt className="text-[color:var(--color-mute)]">Diárias</dt><dd className="font-medium text-[color:var(--color-ink)]">{r.nights}</dd></div>
          <div><dt className="text-[color:var(--color-mute)]">Total estimado</dt><dd className="font-medium text-[color:var(--color-ink)]">{centsToBRL(r.totalPromoCents)}</dd></div>
        </dl>

        <p className="mt-6 border-t border-[color:var(--color-line)] pt-4 text-xs leading-relaxed text-[color:var(--color-mute)]">
          Este é o identificador interno da sua solicitação no Faça Sua Reserva. A confirmação, a validação e o pagamento são feitos
          diretamente com o resort pelo WhatsApp. Não é um comprovante oficial de hospedagem enquanto não confirmado pelo hotel.
        </p>
      </div>
    </main>
  );
}
