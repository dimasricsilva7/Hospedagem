"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { reservationConfigSchema } from "@/app/lib/validators";
import { normalizeReservation } from "@/app/lib/content";
import { requireAdmin } from "@/app/server/auth";
import { db } from "@/app/lib/db";

export type ReservaConfigState = { error?: string; saved?: boolean };

export async function saveReservationConfig(_prev: ReservaConfigState, formData: FormData): Promise<ReservaConfigState> {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return { error: "Campanha inválida." };

  const parsed = reservationConfigSchema.safeParse({
    enabled: formData.get("enabled") === "on",
    whatsapp: formData.get("whatsapp"),
    checkInMin: formData.get("checkInMin"),
    checkInMax: formData.get("checkInMax"),
    checkOutMax: formData.get("checkOutMax"),
    checkOutDefault: formData.get("checkOutDefault"),
    timeStepMin: formData.get("timeStepMin"),
    minNights: formData.get("minNights"),
    maxNights: formData.get("maxNights"),
    maxGuests: formData.get("maxGuests"),
    buttonLabel: formData.get("buttonLabel"),
    rules: formData.get("rules"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  // Normaliza (preenche defaults e coage números) antes de salvar o JSON.
  const config = normalizeReservation({ ...parsed.data, whatsapp: parsed.data.whatsapp || "", rules: parsed.data.rules || "" });
  await db.campaign.update({ where: { id }, data: { reservationConfig: config } });

  revalidatePath(`/admin/campanhas/${id}/reservas`);
  revalidatePath("/", "layout"); // reflete o novo WhatsApp/horários no site publicado
  redirect(`/admin/campanhas/${id}/reservas?saved=1`);
}
