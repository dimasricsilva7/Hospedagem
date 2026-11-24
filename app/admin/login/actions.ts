"use server";
import { redirect } from "next/navigation";
import { loginSchema } from "@/app/lib/validators";
import { authenticate, createSession, loginThrottled } from "@/app/server/auth";

export type LoginState = { error?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Informe e-mail e senha válidos." };
  if (await loginThrottled()) return { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." };
  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user) return { error: "E-mail ou senha incorretos." };
  await createSession(user.id);
  redirect(user.passwordChangeRequired ? "/admin/trocar-senha" : "/admin/dashboard");
}
