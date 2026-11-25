import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { reservationSchema } from "@/app/lib/validators";
import { createReservation } from "@/app/server/reservations";
import { rateLimit } from "@/app/server/ratelimit";
import { hashIp } from "@/app/lib/crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = reservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dados inválidos. Confira os campos." }, { status: 400 });
  }
  const input = parsed.data;

  // Honeypot.
  if (input.website && input.website.trim() !== "") {
    return NextResponse.json({ ok: true, code: "ignored", whatsappUrl: "" });
  }

  // Rate limit por IP (evita duplicação/abuso): 6 solicitações / 10 min.
  const h = await headers();
  const key = hashIp(h.get("x-forwarded-for")?.split(",")[0]?.trim()) ?? "unknown";
  if (await rateLimit(`reserva:${key}`, 6, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: "Muitas solicitações. Aguarde alguns minutos." }, { status: 429 });
  }

  const result = await createReservation(input);
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
