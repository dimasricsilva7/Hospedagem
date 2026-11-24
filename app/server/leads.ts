import "server-only";
import { db } from "@/app/lib/db";
import type { Prisma, LeadStatus } from "@prisma/client";
import type { LeadInput } from "@/app/lib/validators";
import { toCsv } from "@/app/lib/csv";
import { formatDateTime } from "@/app/lib/format";

/**
 * Cria o lead. Resolve o hotel pela campanha (fonte confiável, não pelo cliente).
 * Retorna o id criado — o evento Lead só é disparado no cliente após este retorno.
 */
export async function createLead(input: LeadInput): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const campaign = await db.campaign.findUnique({ where: { id: input.campaignId }, select: { id: true, hotelId: true, status: true } });
  if (!campaign || campaign.status !== "PUBLISHED") return { ok: false, error: "Campanha indisponível." };

  const lead = await db.lead.create({
    data: {
      hotelId: campaign.hotelId,
      campaignId: campaign.id,
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      customFields: input.custom && Object.keys(input.custom).length ? input.custom : undefined,
      consentData: { marketing: input.consentMarketing, lgpd: true, at: new Date().toISOString() },
      utmSource: input.utm?.utm_source || null,
      utmMedium: input.utm?.utm_medium || null,
      utmCampaign: input.utm?.utm_campaign || null,
      utmContent: input.utm?.utm_content || null,
      utmTerm: input.utm?.utm_term || null,
      fbclid: input.fbclid || null,
      gclid: input.gclid || null,
      landingPage: input.landingPage || null,
    },
    select: { id: true },
  });
  return { ok: true, id: lead.id };
}

export type LeadFilters = {
  q?: string;
  hotelId?: string;
  campaignId?: string;
  status?: LeadStatus;
  from?: string;
  to?: string;
};

function whereFromFilters(f: LeadFilters): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {};
  if (f.hotelId) where.hotelId = f.hotelId;
  if (f.campaignId) where.campaignId = f.campaignId;
  if (f.status) where.status = f.status;
  if (f.from || f.to) {
    where.createdAt = {};
    if (f.from) where.createdAt.gte = new Date(f.from);
    if (f.to) where.createdAt.lte = new Date(`${f.to}T23:59:59`);
  }
  if (f.q?.trim()) {
    const q = f.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
    ];
  }
  return where;
}

export async function listLeads(f: LeadFilters, page = 1, pageSize = 25) {
  const where = whereFromFilters(f);
  const [items, total] = await Promise.all([
    db.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { hotel: { select: { name: true } }, campaign: { select: { name: true } } },
    }),
    db.lead.count({ where }),
  ]);
  return { items, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function updateLead(id: string, data: { status?: LeadStatus; notes?: string }) {
  await db.lead.update({ where: { id }, data });
}

/** Exporta leads filtrados para CSV. Mesmos filtros da listagem. */
export async function exportLeadsCsv(f: LeadFilters): Promise<string> {
  const leads = await db.lead.findMany({
    where: whereFromFilters(f),
    orderBy: { createdAt: "desc" },
    include: { hotel: { select: { name: true } }, campaign: { select: { name: true } } },
  });
  const header = ["Data", "Nome", "E-mail", "Telefone", "Hotel", "Campanha", "Status", "Origem (UTM)", "Campanha (UTM)", "fbclid", "gclid", "Consentimento marketing", "Observações"];
  const rows = leads.map((l) => [
    formatDateTime(l.createdAt),
    l.name,
    l.email,
    l.phone,
    l.hotel?.name,
    l.campaign?.name,
    l.status,
    l.utmSource,
    l.utmCampaign,
    l.fbclid,
    l.gclid,
    (l.consentData as { marketing?: boolean } | null)?.marketing ? "Sim" : "Não",
    l.notes,
  ]);
  return toCsv([header, ...rows]);
}
