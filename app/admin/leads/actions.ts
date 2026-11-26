"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/server/auth";
import { updateLead } from "@/app/server/leads";
import { db } from "@/app/lib/db";
import type { LeadStatus } from "@prisma/client";

const STATUSES: LeadStatus[] = ["NOVO", "CONTATADO", "NEGOCIACAO", "CONVERTIDO", "DESCARTADO"];

export async function updateLeadAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const status = formData.get("status") as LeadStatus;
  const notes = (formData.get("notes") as string) ?? "";
  if (!id) return;
  await updateLead(id, { status: STATUSES.includes(status) ? status : undefined, notes });
  revalidatePath(`/admin/leads/${id}`);
  redirect(`/admin/leads/${id}?saved=1`);
}

export async function deleteLeadAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (id) await db.lead.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/leads");
}
