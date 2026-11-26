"use server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/server/auth";
import { manualReservationSchema } from "@/app/lib/validators";
import { createAdminReservation } from "@/app/server/reservations";

export type ManualState = { error?: string };

export async function createManualReservationAction(_prev: ManualState, formData: FormData): Promise<ManualState> {
  await requireAdmin();
  const parsed = manualReservationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const r = await createAdminReservation(parsed.data);
  if (!r.ok) return { error: r.error };
  redirect(`/admin/solicitacoes/${r.id}?saved=1`);
}
