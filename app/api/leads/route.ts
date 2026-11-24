import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { leadSchema } from "@/app/lib/validators";
import { createLead } from "@/app/server/leads";
import { rateLimit } from "@/app/server/ratelimit";
import { hashIp } from "@/app/lib/crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dados inválidos. Confira os campos." }, { status: 400 });
  }
  const input = parsed.data;

  // Honeypot: bot preencheu o campo oculto → responde sucesso sem salvar.
  if (input.website && input.website.trim() !== "") {
    return NextResponse.json({ ok: true, id: "ignored" });
  }

  // Rate limit por IP: 8 envios / 10 min.
  const h = await headers();
  const key = hashIp(h.get("x-forwarded-for")?.split(",")[0]?.trim()) ?? "unknown";
  if (await rateLimit(`lead:${key}`, 8, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: "Muitas tentativas. Aguarde alguns minutos." }, { status: 429 });
  }

  const result = await createLead(input);
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json({ ok: true, id: result.id });
}
