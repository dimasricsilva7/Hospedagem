"use server";
import { changePasswordSchema } from "@/app/lib/validators";
import { changePassword, createSession, requireAdmin } from "@/app/server/auth";

export type ConfigState = { error?: string; saved?: boolean };

export async function changeOwnPassword(_prev: ConfigState, formData: FormData): Promise<ConfigState> {
  const user = await requireAdmin();
  const parsed = changePasswordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const r = await changePassword(user.id, parsed.data.current, parsed.data.next);
  if (!r.ok) return { error: r.error };
  await createSession(user.id); // recria a sessão atual (as demais foram revogadas)
  return { saved: true };
}
