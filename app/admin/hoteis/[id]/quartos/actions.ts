"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { roomSchema } from "@/app/lib/validators";
import { requireAdmin } from "@/app/server/auth";
import { roomDataFromInput } from "@/app/server/reservations";
import { db } from "@/app/lib/db";

export type RoomState = { error?: string };

const lines = (v: FormDataEntryValue | null) =>
  ((v as string) || "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

export async function saveRoom(_prev: RoomState, formData: FormData): Promise<RoomState> {
  await requireAdmin();
  const hotelId = formData.get("hotelId") as string;
  const id = (formData.get("id") as string) || "";
  if (!hotelId) return { error: "Hotel inválido." };

  const parsed = roomSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    mainImage: formData.get("mainImage"),
    images: lines(formData.get("images")),
    amenities: lines(formData.get("amenities")),
    beds: formData.get("beds"),
    maxAdults: formData.get("maxAdults") || 2,
    maxChildren: formData.get("maxChildren") || 0,
    priceOriginal: formData.get("priceOriginal"),
    pricePromo: formData.get("pricePromo"),
    badgeCount: formData.get("badgeCount") || 0,
    active: formData.get("active") === "on",
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const data = roomDataFromInput(parsed.data);
  if (id) await db.room.update({ where: { id }, data });
  else await db.room.create({ data: { ...data, hotelId } });

  revalidatePath(`/admin/hoteis/${hotelId}/quartos`);
  redirect(`/admin/hoteis/${hotelId}/quartos`);
}

export async function deleteRoom(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const hotelId = formData.get("hotelId") as string;
  if (id) await db.room.delete({ where: { id } }).catch(() => {});
  revalidatePath(`/admin/hoteis/${hotelId}/quartos`);
}

export async function toggleRoom(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const hotelId = formData.get("hotelId") as string;
  const active = formData.get("active") === "1";
  if (id) await db.room.update({ where: { id }, data: { active } }).catch(() => {});
  revalidatePath(`/admin/hoteis/${hotelId}/quartos`);
}
