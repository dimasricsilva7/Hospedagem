"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hotelSchema } from "@/app/lib/validators";
import { requireAdmin } from "@/app/server/auth";
import { db } from "@/app/lib/db";

export type HotelState = { error?: string };

const orNull = (v: unknown) => {
  const s = (v as string | null) ?? "";
  return s.trim() === "" ? null : s.trim();
};

export async function saveHotel(_prev: HotelState, formData: FormData): Promise<HotelState> {
  await requireAdmin();
  const id = (formData.get("id") as string) || "";
  const parsed = hotelSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    logoUrl: formData.get("logoUrl"),
    primaryColor: formData.get("primaryColor") || "#0e7490",
    secondaryColor: formData.get("secondaryColor") || "#f59e0b",
    whatsapp: formData.get("whatsapp"),
    email: formData.get("email"),
    instagram: formData.get("instagram"),
    facebook: formData.get("facebook"),
    city: formData.get("city"),
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const d = parsed.data;
  const data = {
    name: d.name,
    slug: d.slug,
    description: orNull(d.description),
    logoUrl: orNull(d.logoUrl),
    primaryColor: d.primaryColor,
    secondaryColor: d.secondaryColor,
    whatsapp: orNull(d.whatsapp),
    email: orNull(d.email),
    instagram: orNull(d.instagram),
    facebook: orNull(d.facebook),
    city: orNull(d.city),
    isActive: d.isActive,
  };

  try {
    if (id) await db.hotel.update({ where: { id }, data });
    else await db.hotel.create({ data });
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002") {
      return { error: "Já existe um hotel com esse slug." };
    }
    throw e;
  }
  revalidatePath("/admin/hoteis");
  redirect("/admin/hoteis");
}

export async function deleteHotel(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (id) await db.hotel.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/hoteis");
}
