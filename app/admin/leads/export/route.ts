import { getSession } from "@/app/server/auth";
import { exportLeadsCsv, type LeadFilters } from "@/app/server/leads";
import type { LeadStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Exportação de leads é restrita a administradores.
  const user = await getSession();
  if (!user || user.role !== "ADMIN") return new Response("Não autorizado", { status: 401 });

  const p = new URL(req.url).searchParams;
  const filters: LeadFilters = {
    q: p.get("q") || undefined,
    hotelId: p.get("hotelId") || undefined,
    campaignId: p.get("campaignId") || undefined,
    status: (p.get("status") as LeadStatus) || undefined,
    from: p.get("from") || undefined,
    to: p.get("to") || undefined,
  };
  const csv = await exportLeadsCsv(filters);
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${date}.csv"`,
    },
  });
}
