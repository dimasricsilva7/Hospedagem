import { getSession } from "@/app/server/auth";
import { exportReservationsCsv, type ReservationFilters } from "@/app/server/reservations";
import type { ReservationStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") return new Response("Não autorizado", { status: 401 });

  const p = new URL(req.url).searchParams;
  const filters: ReservationFilters = {
    q: p.get("q") || undefined,
    phone: p.get("phone") || undefined,
    hotelId: p.get("hotelId") || undefined,
    campaignId: p.get("campaignId") || undefined,
    status: (p.get("status") as ReservationStatus) || undefined,
    from: p.get("from") || undefined,
    to: p.get("to") || undefined,
  };
  const csv = await exportReservationsCsv(filters);
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="solicitacoes-${date}.csv"`,
    },
  });
}
