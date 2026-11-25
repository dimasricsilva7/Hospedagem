"use client";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import type { FormConfig } from "@/app/lib/content";
import { maskCpf, maskPhone } from "@/app/lib/format";

type Props = { campaignId: string; form: FormConfig; brand: string; reservarPath?: string };

function readTracking() {
  if (typeof window === "undefined") return { utm: {}, fbclid: undefined, gclid: undefined, landingPage: "" };
  const p = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const v = p.get(k);
    if (v) utm[k] = v;
  }
  return { utm, fbclid: p.get("fbclid") || undefined, gclid: p.get("gclid") || undefined, landingPage: window.location.href };
}

export function LeadForm({ campaignId, form, brand, reservarPath }: Props) {
  const fields = form.fields.filter((f) => f.enabled);
  const [values, setValues] = useState<Record<string, string>>({});
  const [marketing, setMarketing] = useState(false);
  const [lgpd, setLgpd] = useState(false);
  const [honey, setHoney] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [leadId, setLeadId] = useState("");

  const set = (key: string, raw: string, type: string) => {
    const v = type === "tel" ? maskPhone(raw) : type === "cpf" ? maskCpf(raw) : raw;
    setValues((prev) => ({ ...prev, [key]: v }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!lgpd) {
      setError("É necessário aceitar a Política de Privacidade para prosseguir.");
      return;
    }
    setState("sending");
    const tr = readTracking();
    const custom: Record<string, string> = {};
    for (const f of fields) {
      if (f.key === "name" || f.key === "email" || f.key === "phone") continue;
      if (values[f.key]) custom[f.key] = values[f.key];
    }
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          name: values.name || "",
          email: values.email || "",
          phone: values.phone || "",
          custom,
          consentMarketing: marketing,
          website: honey,
          ...tr,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; id?: string };
      if (!res.ok || !data.ok) {
        setState("error");
        setError(data.error || "Não foi possível concluir o cadastro. Tente novamente.");
        return;
      }
      // Evento de conversão SÓ após o backend confirmar.
      try {
        window.fbq?.("track", "Lead");
        window.gtag?.("event", "generate_lead");
      } catch {}
      setLeadId(data.id || "");
      setState("done");
      // O cadastro não encerra a experiência: encaminha para a seleção da reserva (seção 5 do spec).
      const next = reservarPath ? `${reservarPath}?lead=${encodeURIComponent(data.id || "")}` : form.redirectUrl;
      if (next) setTimeout(() => (window.location.href = next), 1000);
    } catch {
      setState("error");
      setError("Falha de conexão. Tente novamente.");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-black/5">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full" style={{ backgroundColor: `${brand}1a`, color: brand }}>
          <Check className="size-7" />
        </div>
        <p className="font-display text-xl font-semibold">{form.successMessage}</p>
        {reservarPath && (
          <a href={`${reservarPath}?lead=${encodeURIComponent(leadId)}`} className="mt-5 inline-block rounded-xl px-6 py-3 font-semibold text-white" style={{ backgroundColor: brand }}>
            Montar minha reserva →
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5 sm:p-8">
      {/* honeypot — invisível para humanos */}
      <input type="text" name="website" value={honey} onChange={(e) => setHoney(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0" />

      <div className="grid gap-4">
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="mb-1 block text-sm font-medium text-[color:var(--color-ink)]">
              {f.label} {f.required && <span style={{ color: brand }}>*</span>}
            </span>
            <input
              type={f.type === "cpf" ? "text" : f.type === "number" ? "number" : f.type}
              inputMode={f.type === "tel" || f.type === "cpf" ? "numeric" : f.type === "number" ? "numeric" : undefined}
              required={f.required}
              value={values[f.key] ?? ""}
              onChange={(e) => set(f.key, e.target.value, f.type)}
              className="w-full rounded-xl border border-[color:var(--color-line)] bg-white px-4 py-3 text-[color:var(--color-ink)] outline-none transition focus:border-transparent focus:ring-2"
              style={{ ["--tw-ring-color" as string]: brand }}
            />
          </label>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        <label className="flex items-start gap-3 text-sm text-[color:var(--color-mute)]">
          <input type="checkbox" checked={lgpd} onChange={(e) => setLgpd(e.target.checked)} className="mt-0.5 size-4 shrink-0" />
          <span>
            Li e aceito a <a href="/privacidade" target="_blank" className="underline">Política de Privacidade</a> e autorizo o tratamento dos meus dados para este cadastro. <span style={{ color: brand }}>*</span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm text-[color:var(--color-mute)]">
          <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 size-4 shrink-0" />
          <span>{form.consentText}</span>
        </label>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
        style={{ backgroundColor: brand }}
      >
        {state === "sending" ? <Loader2 className="size-5 animate-spin" /> : null}
        {form.buttonLabel}
      </button>
    </form>
  );
}
