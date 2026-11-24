"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { campaignMetaSchema } from "@/app/lib/validators";
import { requireAdmin } from "@/app/server/auth";
import { db } from "@/app/lib/db";
import { defaultContent, defaultFormConfig, defaultTracking, normalizeContent, normalizeForm, normalizeTracking } from "@/app/lib/content";

export type CampaignState = { error?: string; saved?: boolean };

function parseDate(v: FormDataEntryValue | null): Date | null {
  const s = (v as string) || "";
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export async function createCampaign(_prev: CampaignState, formData: FormData): Promise<CampaignState> {
  await requireAdmin();
  const parsed = campaignMetaSchema.safeParse({
    hotelId: formData.get("hotelId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    timezone: formData.get("timezone") || "America/Sao_Paulo",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const d = parsed.data;
  let created;
  try {
    created = await db.campaign.create({
      data: {
        hotelId: d.hotelId,
        name: d.name,
        slug: d.slug,
        startsAt: parseDate(formData.get("startsAt")),
        endsAt: parseDate(formData.get("endsAt")),
        timezone: d.timezone,
        status: "DRAFT",
        content: defaultContent(),
        formConfig: defaultFormConfig(),
        trackingConfig: defaultTracking(),
      },
    });
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002") return { error: "Já existe uma campanha com esse slug neste hotel." };
    throw e;
  }
  redirect(`/admin/campanhas/${created.id}`);
}

export async function saveCampaign(_prev: CampaignState, formData: FormData): Promise<CampaignState> {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return { error: "Campanha inválida." };

  const parsed = campaignMetaSchema.safeParse({
    hotelId: formData.get("hotelId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    timezone: formData.get("timezone") || "America/Sao_Paulo",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  let content, formConfig, trackingConfig;
  try {
    content = normalizeContent(JSON.parse((formData.get("content") as string) || "{}"));
    formConfig = normalizeForm(JSON.parse((formData.get("formConfig") as string) || "{}"));
    trackingConfig = normalizeTracking(JSON.parse((formData.get("trackingConfig") as string) || "{}"));
  } catch {
    return { error: "Conteúdo inválido (erro ao ler os campos)." };
  }

  const d = parsed.data;
  try {
    await db.campaign.update({
      where: { id },
      data: {
        hotelId: d.hotelId,
        name: d.name,
        slug: d.slug,
        startsAt: parseDate(formData.get("startsAt")),
        endsAt: parseDate(formData.get("endsAt")),
        timezone: d.timezone,
        content,
        formConfig,
        trackingConfig,
      },
    });
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002") return { error: "Já existe uma campanha com esse slug neste hotel." };
    throw e;
  }
  revalidatePath("/admin/campanhas");
  return { saved: true };
}

export async function setStatus(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const status = formData.get("status") as "DRAFT" | "PUBLISHED";
  if (id && (status === "DRAFT" || status === "PUBLISHED")) {
    await db.campaign.update({ where: { id }, data: { status } });
  }
  revalidatePath("/admin/campanhas");
}

export async function duplicateCampaign(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const src = await db.campaign.findUnique({ where: { id } });
  if (!src) return;
  // slug único por hotel: tenta -copia, -copia-2, ...
  let slug = `${src.slug}-copia`;
  for (let i = 2; await db.campaign.findFirst({ where: { hotelId: src.hotelId, slug } }); i++) slug = `${src.slug}-copia-${i}`;
  await db.campaign.create({
    data: {
      hotelId: src.hotelId,
      name: `${src.name} (cópia)`,
      slug,
      status: "DRAFT",
      startsAt: src.startsAt,
      endsAt: src.endsAt,
      timezone: src.timezone,
      content: src.content as object,
      formConfig: src.formConfig as object,
      trackingConfig: src.trackingConfig as object,
    },
  });
  revalidatePath("/admin/campanhas");
}

export async function deleteCampaign(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (id) await db.campaign.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/campanhas");
}
