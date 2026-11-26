"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/server/auth";
import { updateReservation } from "@/app/server/reservations";
import { db } from "@/app/lib/db";
import type { ReservationStatus } from "@prisma/client";

const STATUSES: ReservationStatus[] = ["PENDENTE", "EM_ATENDIMENTO", "CONFIRMADA", "CANCELADA"];

export async function updateReservationAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const status = formData.get("status") as ReservationStatus;
  const notes = (formData.get("notes") as string) ?? "";
  if (!id) return;
  await updateReservation(id, { status: STATUSES.includes(status) ? status : undefined, notes });
  revalidatePath(`/admin/solicitacoes/${id}`);
  redirect(`/admin/solicitacoes/${id}?saved=1`);
}

export async function deleteReservationAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (id) await db.reservationRequest.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/solicitacoes");
}
