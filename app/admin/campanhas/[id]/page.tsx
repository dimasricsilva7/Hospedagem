import { notFound } from "next/navigation";
import { requireAdmin } from "@/app/server/auth";
import { db } from "@/app/lib/db";
import { normalizeContent, normalizeForm, normalizeTracking } from "@/app/lib/content";
import { CampaignEditor } from "../CampaignEditor";

export const dynamic = "force-dynamic";

// datetime-local espera "YYYY-MM-DDTHH:mm". shortcut: usa UTC truncado — pode divergir do fuso
// local por algumas horas na exibição; trocar por conversão com timezone se incomodar.
const dtLocal = (d: Date | null) => (d ? d.toISOString().slice(0, 16) : "");

export default async function EditarCampanha({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [campaign, hotels] = await Promise.all([
    db.campaign.findUnique({ where: { id }, include: { hotel: { select: { slug: true } } } }),
    db.hotel.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!campaign) notFound();

  return (
    <CampaignEditor
      meta={{
        id: campaign.id,
        hotelId: campaign.hotelId,
        name: campaign.name,
        slug: campaign.slug,
        startsAt: dtLocal(campaign.startsAt),
        endsAt: dtLocal(campaign.endsAt),
        timezone: campaign.timezone,
        status: campaign.status,
        previewUrl: `/${campaign.hotel.slug}/${campaign.slug}?preview=1`,
      }}
      hotels={hotels}
      content={normalizeContent(campaign.content)}
      form={normalizeForm(campaign.formConfig)}
      tracking={normalizeTracking(campaign.trackingConfig)}
    />
  );
}
