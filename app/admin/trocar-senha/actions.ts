"use server";
import { redirect } from "next/navigation";
import { changePasswordSchema } from "@/app/lib/validators";
import { changePassword, createSession, requireAdmin } from "@/app/server/auth";

export type ChangeState = { error?: string };

export async function changePasswordAction(_prev: ChangeState, formData: FormData): Promise<ChangeState> {
  const user = await requireAdmin({ allowPasswordChange: true });
  const parsed = changePasswordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const r = await changePassword(user.id, parsed.data.current, parsed.data.next);
  if (!r.ok) return { error: r.error };
  await createSession(user.id); // sessões antigas foram revogadas; recria a atual
  redirect("/admin/dashboard");
}
