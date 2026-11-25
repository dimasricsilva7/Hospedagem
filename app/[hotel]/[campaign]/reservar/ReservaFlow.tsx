"use client";
import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BedDouble, Calendar as CalIcon, Check, ChevronLeft, ChevronRight, Loader2, Minus, Plus, ShieldCheck } from "lucide-react";
import { maskPhone } from "@/app/lib/format";
import { centsToBRL, computeTotals, nightsBetween } from "@/app/lib/reservation";

export type RoomDTO = {
  id: string;
  name: string;
  description: string;
  mainImage: string;
  images: string[];
  amenities: string[];
  beds: string;
  maxAdults: number;
  maxChildren: number;
  priceOriginalCents: number;
  pricePromoCents: number;
  discountPercent: number;
  badgeCount: number | null;
};

type Config = {
  checkInMin: string;
  checkInMax: string;
  checkOutMax: string;
  checkOutDefault: string;
  timeStepMin: number;
  minNights: number;
  maxNights: number;
  maxGuests: number;
  buttonLabel: string;
  rules: string;
};

type Lead = { id: string; name: string; phone: string; email: string };

const STEPS = ["Datas", "Hóspedes", "Acomodação", "Revisão"] as const;

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO = () => toISO(new Date());
const fmtBR = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
};

function timeOptions(min: string, max: string, step: number): string[] {
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const out: string[] = [];
  for (let m = toMin(min); m <= toMin(max); m += step) out.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  return out;
}

function track(event: string) {
  try {
    window.gtag?.("event", event);
    window.fbq?.("trackCustom", event);
  } catch {}
}

export function ReservaFlow({
  brand,
  hotelName,
  campaignId,
  campaignName,
  rooms,
  config,
  lead,
}: {
  brand: string;
  hotelName: string;
  campaignId: string;
  campaignName: string;
  rooms: RoomDTO[];
  config: Config;
  lead: Lead | null;
}) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [checkInTime, setCheckInTime] = useState(config.checkInMin);
  const [checkOutTime, setCheckOutTime] = useState(config.checkOutDefault);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [childrenAges, setChildrenAges] = useState<number[]>([]);
  const [roomsQty, setRoomsQty] = useState(1);
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState(lead?.name ?? "");
  const [phone, setPhone] = useState(lead?.phone ? maskPhone(lead.phone) : "");
  const [email, setEmail] = useState(lead?.email ?? "");
  const [honey, setHoney] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ code: string; whatsappUrl: string } | null>(null);

  const nights = nightsBetween(checkIn, checkOut);
  const guests = adults + children;
  const room = rooms.find((r) => r.id === roomId) || null;
  const totals = room && nights > 0 ? computeTotals({ priceOriginalCents: room.priceOriginalCents, pricePromoCents: room.pricePromoCents, nights, rooms: roomsQty }) : null;

  const datesValid = nights >= config.minNights && nights <= config.maxNights;
  const canNext =
    step === 0 ? datesValid : step === 1 ? guests >= 1 && guests <= config.maxGuests : step === 2 ? Boolean(room) : true;

  function setChildrenCount(n: number) {
    const v = Math.max(0, Math.min(10, n));
    setChildren(v);
    setChildrenAges((prev) => Array.from({ length: v }, (_, i) => prev[i] ?? 0));
  }

  function next() {
    if (!canNext) return;
    if (step === 0) track("reserva_datas");
    if (step === 2) track("reserva_quarto");
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  async function submit() {
    setError("");
    if (!name.trim()) return setError("Informe seu nome.");
    if (!room || !datesValid) return setError("Revise as datas e a acomodação.");
    setSending(true);
    track("reserva_solicitar");
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          roomId: room.id,
          leadId: lead?.id || "",
          guestName: name,
          guestPhone: phone,
          guestEmail: email,
          checkIn,
          checkInTime,
          checkOut,
          checkOutTime,
          adults,
          children,
          childrenAges,
          rooms: roomsQty,
          website: honey,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; code?: string; whatsappUrl?: string };
      if (!res.ok || !data.ok || !data.whatsappUrl) {
        setSending(false);
        return setError(data.error || "Não foi possível registrar a solicitação. Tente novamente.");
      }
      track("reserva_registrada");
      setDone({ code: data.code!, whatsappUrl: data.whatsappUrl });
      window.location.href = data.whatsappUrl; // abre o WhatsApp (não envia sozinho)
    } catch {
      setSending(false);
      setError("Falha de conexão. Tente novamente.");
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full" style={{ backgroundColor: `${brand}22`, color: brand }}>
          <Check className="size-8" />
        </div>
        <h1 className="font-display text-3xl font-semibold">Solicitação registrada!</h1>
        <p className="mt-3 text-white/70">
          Código <strong className="text-white">{done.code}</strong>. Abrimos o WhatsApp com os detalhes para você confirmar com o hotel.
        </p>
        <a href={done.whatsappUrl} className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white" style={{ backgroundColor: brand }}>
          Abrir o WhatsApp novamente
        </a>
      </div>
    );
  }

  const anim = reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -16 } };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
      {/* progresso */}
      <ol className="mb-8 flex items-center gap-2 text-xs sm:text-sm">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full border text-[13px] font-semibold transition"
              style={i <= step ? { backgroundColor: brand, borderColor: brand, color: "#fff" } : { borderColor: "rgba(255,255,255,.25)", color: "rgba(255,255,255,.55)" }}
            >
              {i < step ? <Check className="size-4" /> : i + 1}
            </span>
            <span className={i <= step ? "font-medium text-white" : "text-white/45"}>{label}</span>
            {i < STEPS.length - 1 && <span className="mx-1 hidden h-px flex-1 bg-white/15 sm:block" />}
          </li>
        ))}
      </ol>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={step} {...anim} transition={{ duration: 0.25 }}>
              {step === 0 && (
                <StepDates
                  brand={brand}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onPick={(ci, co) => {
                    setCheckIn(ci);
                    setCheckOut(co);
                  }}
                  checkInTime={checkInTime}
                  setCheckInTime={setCheckInTime}
                  checkOutTime={checkOutTime}
                  setCheckOutTime={setCheckOutTime}
                  config={config}
                  nights={nights}
                />
              )}
              {step === 1 && (
                <StepGuests
                  brand={brand}
                  adults={adults}
                  setAdults={(n) => setAdults(Math.max(1, Math.min(config.maxGuests, n)))}
                  kids={children}
                  setKids={setChildrenCount}
                  childrenAges={childrenAges}
                  setChildAge={(i, v) => setChildrenAges((p) => p.map((a, idx) => (idx === i ? v : a)))}
                  roomsQty={roomsQty}
                  setRoomsQty={(n) => setRoomsQty(Math.max(1, Math.min(10, n)))}
                  maxGuests={config.maxGuests}
                />
              )}
              {step === 2 && <StepRooms brand={brand} rooms={rooms} nights={nights} roomsQty={roomsQty} guests={guests} roomId={roomId} setRoomId={setRoomId} />}
              {step === 3 && (
                <StepReview
                  brand={brand}
                  name={name}
                  setName={setName}
                  phone={phone}
                  setPhone={(v) => setPhone(maskPhone(v))}
                  email={email}
                  setEmail={setEmail}
                  rules={config.rules}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* honeypot — invisível para humanos */}
          <input type="text" name="website" value={honey} onChange={(e) => setHoney(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0" />

          {error && <p className="mt-5 rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-300">{error}</p>}

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/5 disabled:invisible"
            >
              Voltar
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                disabled={!canNext}
                className="rounded-full px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-40"
                style={{ backgroundColor: brand }}
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={sending}
                className="flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
                style={{ backgroundColor: brand }}
              >
                {sending ? <Loader2 className="size-4 animate-spin" /> : null}
                {config.buttonLabel}
              </button>
            )}
          </div>
        </div>

        {/* resumo */}
        <Summary brand={brand} hotelName={hotelName} campaignName={campaignName} room={room} roomsQty={roomsQty} checkIn={checkIn} checkOut={checkOut} checkInTime={checkInTime} checkOutTime={checkOutTime} nights={nights} adults={adults} kids={children} totals={totals} />
      </div>
    </div>
  );
}

// ── Etapa 1: Datas + horários ────────────────────────────────────────────────
function StepDates({
  brand,
  checkIn,
  checkOut,
  onPick,
  checkInTime,
  setCheckInTime,
  checkOutTime,
  setCheckOutTime,
  config,
  nights,
}: {
  brand: string;
  checkIn: string;
  checkOut: string;
  onPick: (ci: string, co: string) => void;
  checkInTime: string;
  setCheckInTime: (v: string) => void;
  checkOutTime: string;
  setCheckOutTime: (v: string) => void;
  config: Config;
  nights: number;
}) {
  function pick(iso: string) {
    if (!checkIn || (checkIn && checkOut)) return onPick(iso, "");
    if (iso <= checkIn) return onPick(iso, "");
    onPick(checkIn, iso);
  }
  const inTimes = timeOptions(config.checkInMin, config.checkInMax, config.timeStepMin);
  const outTimes = timeOptions("00:00", config.checkOutMax, config.timeStepMin);

  return (
    <section>
      <h2 className="font-display text-2xl font-semibold">Escolha as datas</h2>
      <p className="mt-1 text-sm text-white/55">Selecione a chegada e a saída no calendário.</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Field label="Check-in" value={checkIn ? fmtBR(checkIn) : "Escolha sua data de chegada"} active={Boolean(checkIn)} brand={brand} />
        <Field label="Check-out" value={checkOut ? fmtBR(checkOut) : "Escolha sua data de saída"} active={Boolean(checkOut)} brand={brand} />
      </div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <MonthCalendar brand={brand} checkIn={checkIn} checkOut={checkOut} onPick={pick} />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm text-white/70">Horário de check-in</span>
          <select value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-white/40">
            {inTimes.map((t) => (
              <option key={t} value={t} className="bg-[#0b0c10]">
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-white/70">Horário de check-out (até {config.checkOutMax})</span>
          <select value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-white/40">
            {outTimes.map((t) => (
              <option key={t} value={t} className="bg-[#0b0c10]">
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      {checkIn && checkOut && (
        <p className="mt-4 text-sm" style={{ color: brand }}>
          {nights} diária{nights > 1 ? "s" : ""} selecionada{nights > 1 ? "s" : ""}
          {nights < config.minNights ? ` — mínimo ${config.minNights}` : nights > config.maxNights ? ` — máximo ${config.maxNights}` : ""}
        </p>
      )}
    </section>
  );
}

function Field({ label, value, active, brand }: { label: string; value: string; active: boolean; brand: string }) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: active ? brand : "rgba(255,255,255,.12)" }}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/50">
        <CalIcon className="size-4" /> {label}
      </div>
      <div className={`mt-1 text-lg font-medium ${active ? "text-white" : "text-white/40"}`}>{value}</div>
    </div>
  );
}

function MonthCalendar({ brand, checkIn, checkOut, onPick }: { brand: string; checkIn: string; checkOut: string; onPick: (iso: string) => void }) {
  const today = todayISO();
  const [cursor, setCursor] = useState(() => {
    const d = checkIn ? new Date(`${checkIn}T00:00:00`) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toISO(new Date(year, month, d)));

  const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(cursor);
  const canPrev = toISO(new Date(year, month, 1)) > today;

  return (
    <div>
      <div className="flex items-center justify-between px-1">
        <button type="button" onClick={() => canPrev && setCursor(new Date(year, month - 1, 1))} disabled={!canPrev} className="rounded-full p-2 text-white/70 transition hover:bg-white/10 disabled:opacity-30" aria-label="Mês anterior">
          <ChevronLeft className="size-5" />
        </button>
        <span className="font-medium capitalize">{monthLabel}</span>
        <button type="button" onClick={() => setCursor(new Date(year, month + 1, 1))} className="rounded-full p-2 text-white/70 transition hover:bg-white/10" aria-label="Próximo mês">
          <ChevronRight className="size-5" />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-white/40">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <div key={i} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((iso, i) => {
          if (!iso) return <div key={i} />;
          const past = iso < today;
          const isIn = iso === checkIn;
          const isOut = iso === checkOut;
          const inRange = checkIn && checkOut && iso > checkIn && iso < checkOut;
          const selected = isIn || isOut;
          return (
            <button
              key={i}
              type="button"
              disabled={past}
              onClick={() => onPick(iso)}
              className="aspect-square rounded-lg text-sm transition disabled:cursor-not-allowed disabled:text-white/20"
              style={
                selected
                  ? { backgroundColor: brand, color: "#fff", fontWeight: 600 }
                  : inRange
                    ? { backgroundColor: `${brand}33`, color: "#fff" }
                    : past
                      ? {}
                      : { color: "rgba(255,255,255,.85)" }
              }
            >
              {Number(iso.slice(8, 10))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Etapa 2: Hóspedes ────────────────────────────────────────────────────────
function Stepper({ label, value, onChange, min = 0, brand }: { label: string; value: number; onChange: (n: number) => void; min?: number; brand: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} className="flex size-9 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10 disabled:opacity-30" aria-label={`Diminuir ${label}`}>
          <Minus className="size-4" />
        </button>
        <span className="w-6 text-center text-lg font-semibold" style={{ color: brand }}>
          {value}
        </span>
        <button type="button" onClick={() => onChange(value + 1)} className="flex size-9 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10" aria-label={`Aumentar ${label}`}>
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

function StepGuests({
  brand,
  adults,
  setAdults,
  kids,
  setKids,
  childrenAges,
  setChildAge,
  roomsQty,
  setRoomsQty,
  maxGuests,
}: {
  brand: string;
  adults: number;
  setAdults: (n: number) => void;
  kids: number;
  setKids: (n: number) => void;
  childrenAges: number[];
  setChildAge: (i: number, v: number) => void;
  roomsQty: number;
  setRoomsQty: (n: number) => void;
  maxGuests: number;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold">Quem vai viajar?</h2>
      <p className="mt-1 text-sm text-white/55">Até {maxGuests} hóspedes no total.</p>
      <div className="mt-6 grid gap-4">
        <Stepper label="Adultos" value={adults} onChange={setAdults} min={1} brand={brand} />
        <Stepper label="Crianças" value={kids} onChange={setKids} min={0} brand={brand} />
        {kids > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
            <p className="mb-3 text-sm text-white/70">Idade das crianças</p>
            <div className="flex flex-wrap gap-3">
              {childrenAges.map((age, i) => (
                <label key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-white/60">#{i + 1}</span>
                  <select value={age} onChange={(e) => setChildAge(i, Number(e.target.value))} className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white outline-none">
                    {Array.from({ length: 18 }, (_, a) => (
                      <option key={a} value={a} className="bg-[#0b0c10]">
                        {a} ano{a === 1 ? "" : "s"}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>
        )}
        <Stepper label="Quartos" value={roomsQty} onChange={setRoomsQty} min={1} brand={brand} />
      </div>
    </section>
  );
}

// ── Etapa 3: Acomodações ─────────────────────────────────────────────────────
function StepRooms({
  brand,
  rooms,
  nights,
  roomsQty,
  guests,
  roomId,
  setRoomId,
}: {
  brand: string;
  rooms: RoomDTO[];
  nights: number;
  roomsQty: number;
  guests: number;
  roomId: string;
  setRoomId: (id: string) => void;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold">Escolha a acomodação</h2>
      <p className="mt-1 text-sm text-white/55">Valores calculados para {nights || 0} diária(s).</p>
      <div className="mt-6 grid gap-5">
        {rooms.map((r) => {
          const capacity = (r.maxAdults + r.maxChildren) * roomsQty;
          const fits = guests <= capacity;
          const t = nights > 0 ? computeTotals({ priceOriginalCents: r.priceOriginalCents, pricePromoCents: r.pricePromoCents, nights, rooms: roomsQty }) : null;
          const selected = roomId === r.id;
          return (
            <article
              key={r.id}
              className="overflow-hidden rounded-2xl border bg-white/[0.03] transition"
              style={{ borderColor: selected ? brand : "rgba(255,255,255,.1)" }}
            >
              <div className="grid sm:grid-cols-[220px_1fr]">
                <div className="relative aspect-[4/3] bg-white/5 sm:aspect-auto">
                  {r.mainImage ? (
                    <Image src={r.mainImage} alt={r.name} fill sizes="(max-width:640px) 100vw, 220px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/30">
                      <BedDouble className="size-10" />
                    </div>
                  )}
                  {r.discountPercent > 0 && (
                    <span className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold text-white" style={{ backgroundColor: brand }}>
                      {r.discountPercent}% OFF
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-xl font-semibold">{r.name}</h3>
                      <p className="mt-0.5 text-sm text-white/55">
                        {r.beds ? `${r.beds} · ` : ""}até {r.maxAdults + r.maxChildren} hóspedes/quarto
                      </p>
                    </div>
                    {r.badgeCount && r.badgeCount > 0 ? (
                      <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-300">Restam apenas {r.badgeCount}</span>
                    ) : null}
                  </div>
                  {r.description && <p className="mt-2 line-clamp-2 text-sm text-white/60">{r.description}</p>}
                  {r.amenities.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {r.amenities.slice(0, 5).map((a) => (
                        <li key={a} className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">
                          {a}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      {r.priceOriginalCents > r.pricePromoCents && <div className="text-sm text-white/40 line-through">{centsToBRL(r.priceOriginalCents)}</div>}
                      <div className="text-2xl font-bold" style={{ color: brand }}>
                        {centsToBRL(r.pricePromoCents)}
                        <span className="text-sm font-normal text-white/50"> /noite</span>
                      </div>
                      {t && (
                        <div className="mt-0.5 text-sm text-white/60">
                          Total: <strong className="text-white">{centsToBRL(t.totalPromoCents)}</strong> · economia {centsToBRL(t.savingsCents)}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fits && setRoomId(r.id)}
                      disabled={!fits}
                      className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                      style={{ backgroundColor: selected ? brand : "rgba(255,255,255,.12)" }}
                    >
                      {selected ? "Selecionado ✓" : fits ? "Selecionar" : "Não comporta"}
                    </button>
                  </div>
                  {!fits && <p className="mt-2 text-xs text-amber-300">Esta acomodação comporta até {capacity} hóspedes para {roomsQty} quarto(s).</p>}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ── Etapa 4: Revisão + dados do hóspede ──────────────────────────────────────
function StepReview({
  brand,
  name,
  setName,
  phone,
  setPhone,
  email,
  setEmail,
  rules,
}: {
  brand: string;
  name: string;
  setName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  rules: string;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold">Seus dados</h2>
      <p className="mt-1 text-sm text-white/55">Confirme para enviarmos a solicitação ao hotel pelo WhatsApp.</p>
      <div className="mt-6 grid gap-4">
        <label className="block">
          <span className="mb-1 block text-sm text-white/70">Nome completo *</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-white/40" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-white/70">WhatsApp</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-white/40" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-white/70">E-mail</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-white/40" />
        </label>
      </div>
      {rules && (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
          <strong className="text-white/80">Regras da hospedagem:</strong> {rules}
        </div>
      )}
      <p className="mt-5 flex items-center gap-2 text-xs text-white/45">
        <ShieldCheck className="size-4" style={{ color: brand }} /> Nada é confirmado automaticamente — o hotel valida a disponibilidade com você.
      </p>
    </section>
  );
}

// ── Resumo lateral/responsivo ────────────────────────────────────────────────
function Summary({
  brand,
  hotelName,
  campaignName,
  room,
  roomsQty,
  checkIn,
  checkOut,
  checkInTime,
  checkOutTime,
  nights,
  adults,
  kids,
  totals,
}: {
  brand: string;
  hotelName: string;
  campaignName: string;
  room: RoomDTO | null;
  roomsQty: number;
  checkIn: string;
  checkOut: string;
  checkInTime: string;
  checkOutTime: string;
  nights: number;
  adults: number;
  kids: number;
  totals: ReturnType<typeof computeTotals> | null;
}) {
  const [open, setOpen] = useState(false);
  const body = (
    <div className="space-y-3 text-sm">
      <Row label="Hotel" value={hotelName} />
      <Row label="Campanha" value={campaignName} />
      {room && <Row label="Acomodação" value={`${room.name} (${roomsQty})`} />}
      {checkIn && <Row label="Check-in" value={`${fmtBR(checkIn)} · ${checkInTime}`} />}
      {checkOut && <Row label="Check-out" value={`${fmtBR(checkOut)} · ${checkOutTime}`} />}
      {nights > 0 && <Row label="Diárias" value={String(nights)} />}
      <Row label="Hóspedes" value={`${adults} adulto(s)${kids ? ` · ${kids} criança(s)` : ""}`} />
      {totals && (
        <>
          <div className="my-2 h-px bg-white/10" />
          <Row label="Diária promocional" value={centsToBRL(totals.pricePromoCents)} />
          {totals.totalOriginalCents > totals.totalPromoCents && <Row label="Total original" value={centsToBRL(totals.totalOriginalCents)} strike />}
          {totals.discountPercent > 0 && <Row label="Desconto" value={`${totals.discountPercent}% · −${centsToBRL(totals.savingsCents)}`} accent={brand} />}
          <div className="flex items-center justify-between pt-1">
            <span className="text-white/60">Total</span>
            <span className="text-xl font-bold" style={{ color: brand }}>
              {centsToBRL(totals.totalPromoCents)}
            </span>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* desktop: card fixo */}
      <aside className="hidden lg:block">
        <div className="sticky top-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h3 className="mb-4 font-display text-lg font-semibold">Resumo da reserva</h3>
          {body}
        </div>
      </aside>

      {/* mobile: barra expansível no rodapé */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0b0c10]/95 p-4 backdrop-blur lg:hidden">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between">
          <span className="text-sm text-white/70">Resumo da reserva</span>
          <span className="text-lg font-bold" style={{ color: brand }}>
            {totals ? centsToBRL(totals.totalPromoCents) : "—"}
          </span>
        </button>
        {open && <div className="mt-4">{body}</div>}
      </div>
      <div className="h-16 lg:hidden" />
    </>
  );
}

function Row({ label, value, strike, accent }: { label: string; value: string; strike?: boolean; accent?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white/55">{label}</span>
      <span className={`text-right font-medium ${strike ? "text-white/40 line-through" : "text-white"}`} style={accent ? { color: accent } : undefined}>
        {value}
      </span>
    </div>
  );
}
