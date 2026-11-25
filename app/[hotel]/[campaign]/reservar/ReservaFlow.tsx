"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BedDouble, Calendar as CalIcon, Check, ChevronLeft, ChevronRight, ImageIcon, Loader2, Minus, Plus, ShieldCheck, X } from "lucide-react";
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

const field = "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-[color:var(--color-ink)] outline-none transition focus:border-[color:var(--color-brand)]";

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
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  const nights = nightsBetween(checkIn, checkOut);
  const guests = adults + children;
  const room = rooms.find((r) => r.id === roomId) || null;
  const totals = room && nights > 0 ? computeTotals({ priceOriginalCents: room.priceOriginalCents, pricePromoCents: room.pricePromoCents, nights, rooms: roomsQty }) : null;

  const datesValid = nights >= config.minNights && nights <= config.maxNights;
  const canNext = step === 0 ? datesValid : step === 1 ? guests >= 1 && guests <= config.maxGuests : step === 2 ? Boolean(room) : true;

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
      window.location.href = data.whatsappUrl;
    } catch {
      setSending(false);
      setError("Falha de conexão. Tente novamente.");
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full" style={{ backgroundColor: `${brand}1a`, color: brand }}>
          <Check className="size-8" />
        </div>
        <h1 className="font-display text-3xl font-semibold">Solicitação registrada!</h1>
        <p className="mt-3 text-[color:var(--color-mute)]">
          Código <strong className="text-[color:var(--color-ink)]">{done.code}</strong>. Abrimos o WhatsApp com os detalhes para você confirmar com o hotel.
        </p>
        <a href={done.whatsappUrl} className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white" style={{ backgroundColor: brand }}>
          Abrir o WhatsApp novamente
        </a>
      </div>
    );
  }

  const anim = reduce ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 } };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
      {/* progresso */}
      <ol className="mb-8 flex items-center gap-2 text-xs sm:text-sm">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full border text-[13px] font-semibold transition"
              style={i <= step ? { backgroundColor: brand, borderColor: brand, color: "#fff" } : { borderColor: "var(--color-line)", color: "var(--color-mute)" }}
            >
              {i < step ? <Check className="size-4" /> : i + 1}
            </span>
            <span className={`hidden sm:inline ${i <= step ? "font-medium text-[color:var(--color-ink)]" : "text-[color:var(--color-mute)]"}`}>{label}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px flex-1 bg-[color:var(--color-line)]" />}
          </li>
        ))}
      </ol>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={step} {...anim} transition={{ duration: 0.22 }}>
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
                  setChildAge={(idx, v) => setChildrenAges((p) => p.map((a, k) => (k === idx ? v : a)))}
                  roomsQty={roomsQty}
                  setRoomsQty={(n) => setRoomsQty(Math.max(1, Math.min(10, n)))}
                  maxGuests={config.maxGuests}
                />
              )}
              {step === 2 && (
                <StepRooms brand={brand} rooms={rooms} nights={nights} roomsQty={roomsQty} guests={guests} roomId={roomId} setRoomId={setRoomId} openGallery={(images, index) => setLightbox({ images, index })} />
              )}
              {step === 3 && (
                <StepReview brand={brand} name={name} setName={setName} phone={phone} setPhone={(v) => setPhone(maskPhone(v))} email={email} setEmail={setEmail} rules={config.rules} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* honeypot */}
          <input type="text" name="website" value={honey} onChange={(e) => setHoney(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0" />

          {error && <p className="mt-5 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

          <div className="mt-8 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-[color:var(--color-mute)] transition hover:bg-slate-50 disabled:invisible">
              Voltar
            </button>
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} disabled={!canNext} className="rounded-full px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-40" style={{ backgroundColor: brand }}>
                Continuar
              </button>
            ) : (
              <button type="button" onClick={submit} disabled={sending} className="flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60" style={{ backgroundColor: brand }}>
                {sending ? <Loader2 className="size-4 animate-spin" /> : null}
                {config.buttonLabel}
              </button>
            )}
          </div>
        </div>

        <Summary brand={brand} hotelName={hotelName} campaignName={campaignName} room={room} roomsQty={roomsQty} checkIn={checkIn} checkOut={checkOut} checkInTime={checkInTime} checkOutTime={checkOutTime} nights={nights} adults={adults} kids={children} totals={totals} />
      </div>

      {lightbox && <Lightbox state={lightbox} onClose={() => setLightbox(null)} onNav={(d) => setLightbox((l) => (l ? { ...l, index: (l.index + d + l.images.length) % l.images.length } : l))} />}
    </div>
  );
}

// ── Etapa 1: Datas ───────────────────────────────────────────────────────────
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
      <p className="mt-1 text-sm text-[color:var(--color-mute)]">Selecione a chegada e a saída no calendário.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Check-in" value={checkIn ? fmtBR(checkIn) : "Data de chegada"} active={Boolean(checkIn)} brand={brand} />
        <Field label="Check-out" value={checkOut ? fmtBR(checkOut) : "Data de saída"} active={Boolean(checkOut)} brand={brand} />
      </div>

      <div className="mt-6">
        <MonthCalendar brand={brand} checkIn={checkIn} checkOut={checkOut} onPick={pick} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm text-[color:var(--color-mute)]">Horário de check-in</span>
          <select value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} className={field}>
            {inTimes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-[color:var(--color-mute)]">Horário de check-out (até {config.checkOutMax})</span>
          <select value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} className={field}>
            {outTimes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      </div>

      {checkIn && checkOut && (
        <p className="mt-4 text-sm font-medium" style={{ color: brand }}>
          {nights} diária{nights > 1 ? "s" : ""} selecionada{nights > 1 ? "s" : ""}
          {nights < config.minNights ? ` — mínimo ${config.minNights}` : nights > config.maxNights ? ` — máximo ${config.maxNights}` : ""}
        </p>
      )}
    </section>
  );
}

function Field({ label, value, active, brand }: { label: string; value: string; active: boolean; brand: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4" style={{ borderColor: active ? brand : "var(--color-line)" }}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-[color:var(--color-mute)]">
        <CalIcon className="size-4" /> {label}
      </div>
      <div className={`mt-1 text-lg font-medium ${active ? "text-[color:var(--color-ink)]" : "text-slate-400"}`}>{value}</div>
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
    <div className="mx-auto max-w-[320px]">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => canPrev && setCursor(new Date(year, month - 1, 1))} disabled={!canPrev} className="rounded-full p-1.5 text-[color:var(--color-mute)] transition hover:bg-slate-100 disabled:opacity-30" aria-label="Mês anterior">
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-medium capitalize">{monthLabel}</span>
        <button type="button" onClick={() => setCursor(new Date(year, month + 1, 1))} className="rounded-full p-1.5 text-[color:var(--color-mute)] transition hover:bg-slate-100" aria-label="Próximo mês">
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="mt-2 grid grid-cols-7 text-center text-[11px] text-slate-400">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => <div key={i} className="py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((iso, i) => {
          if (!iso) return <div key={i} />;
          const past = iso < today;
          const selected = iso === checkIn || iso === checkOut;
          const inRange = checkIn && checkOut && iso > checkIn && iso < checkOut;
          return (
            <button
              key={i}
              type="button"
              disabled={past}
              onClick={() => onPick(iso)}
              className="flex h-9 items-center justify-center rounded-lg text-sm transition disabled:cursor-not-allowed disabled:text-slate-300"
              style={
                selected
                  ? { backgroundColor: brand, color: "#fff", fontWeight: 600 }
                  : inRange
                    ? { backgroundColor: `${brand}1f`, color: brand }
                    : past
                      ? {}
                      : { color: "var(--color-ink)" }
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
    <div className="flex items-center justify-between rounded-2xl border border-[color:var(--color-line)] bg-white px-5 py-4">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} className="flex size-9 items-center justify-center rounded-full border border-slate-300 transition hover:bg-slate-50 disabled:opacity-30" aria-label={`Diminuir ${label}`}>
          <Minus className="size-4" />
        </button>
        <span className="w-6 text-center text-lg font-semibold" style={{ color: brand }}>{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} className="flex size-9 items-center justify-center rounded-full border border-slate-300 transition hover:bg-slate-50" aria-label={`Aumentar ${label}`}>
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
      <p className="mt-1 text-sm text-[color:var(--color-mute)]">Até {maxGuests} hóspedes no total.</p>
      <div className="mt-6 grid gap-4">
        <Stepper label="Adultos" value={adults} onChange={setAdults} min={1} brand={brand} />
        <Stepper label="Crianças" value={kids} onChange={setKids} min={0} brand={brand} />
        {kids > 0 && (
          <div className="rounded-2xl border border-[color:var(--color-line)] bg-white px-5 py-4">
            <p className="mb-3 text-sm text-[color:var(--color-mute)]">Idade das crianças</p>
            <div className="flex flex-wrap gap-3">
              {childrenAges.map((age, i) => (
                <label key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-[color:var(--color-mute)]">#{i + 1}</span>
                  <select value={age} onChange={(e) => setChildAge(i, Number(e.target.value))} className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none">
                    {Array.from({ length: 18 }, (_, a) => <option key={a} value={a}>{a} ano{a === 1 ? "" : "s"}</option>)}
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
  openGallery,
}: {
  brand: string;
  rooms: RoomDTO[];
  nights: number;
  roomsQty: number;
  guests: number;
  roomId: string;
  setRoomId: (id: string) => void;
  openGallery: (images: string[], index: number) => void;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold">Escolha a acomodação</h2>
      <p className="mt-1 text-sm text-[color:var(--color-mute)]">Valores calculados para {nights || 0} diária(s). Clique na foto para ver mais imagens.</p>
      <div className="mt-6 grid gap-5">
        {rooms.map((r) => {
          const capacity = (r.maxAdults + r.maxChildren) * roomsQty;
          const fits = guests <= capacity;
          const t = nights > 0 ? computeTotals({ priceOriginalCents: r.priceOriginalCents, pricePromoCents: r.pricePromoCents, nights, rooms: roomsQty }) : null;
          const selected = roomId === r.id;
          const gallery = [r.mainImage, ...r.images].filter(Boolean) as string[];
          return (
            <article key={r.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm transition" style={{ borderColor: selected ? brand : "var(--color-line)" }}>
              <div className="grid sm:grid-cols-[240px_1fr]">
                <button type="button" onClick={() => gallery.length && openGallery(gallery, 0)} className="group relative aspect-[4/3] bg-slate-100 sm:aspect-auto" aria-label="Ver fotos do quarto">
                  {r.mainImage ? (
                    <Image src={r.mainImage} alt={r.name} fill sizes="(max-width:640px) 100vw, 240px" className="object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300"><BedDouble className="size-10" /></div>
                  )}
                  {r.discountPercent > 0 && <span className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold text-white" style={{ backgroundColor: brand }}>{r.discountPercent}% OFF</span>}
                  {gallery.length > 1 && (
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                      <ImageIcon className="size-3.5" /> {gallery.length} fotos
                    </span>
                  )}
                </button>
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-xl font-semibold">{r.name}</h3>
                      <p className="mt-0.5 text-sm text-[color:var(--color-mute)]">{r.beds ? `${r.beds} · ` : ""}até {r.maxAdults + r.maxChildren} hóspedes/quarto</p>
                    </div>
                    {r.badgeCount && r.badgeCount > 0 ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">Restam apenas {r.badgeCount}</span> : null}
                  </div>
                  {r.description && <p className="mt-2 line-clamp-2 text-sm text-[color:var(--color-mute)]">{r.description}</p>}
                  {r.amenities.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {r.amenities.slice(0, 5).map((a) => <li key={a} className="rounded-full border border-[color:var(--color-line)] px-2 py-0.5 text-xs text-[color:var(--color-mute)]">{a}</li>)}
                    </ul>
                  )}
                  <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      {r.priceOriginalCents > r.pricePromoCents && <div className="text-sm text-slate-400 line-through">{centsToBRL(r.priceOriginalCents)}</div>}
                      <div className="text-2xl font-bold" style={{ color: brand }}>{centsToBRL(r.pricePromoCents)}<span className="text-sm font-normal text-[color:var(--color-mute)]"> /noite</span></div>
                      {t && <div className="mt-0.5 text-sm text-[color:var(--color-mute)]">Total: <strong className="text-[color:var(--color-ink)]">{centsToBRL(t.totalPromoCents)}</strong> · economia {centsToBRL(t.savingsCents)}</div>}
                    </div>
                    <button type="button" onClick={() => fits && setRoomId(r.id)} disabled={!fits} className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40" style={{ backgroundColor: selected ? brand : "#0f172a" }}>
                      {selected ? "Selecionado ✓" : fits ? "Selecionar" : "Não comporta"}
                    </button>
                  </div>
                  {!fits && <p className="mt-2 text-xs text-amber-600">Esta acomodação comporta até {capacity} hóspedes para {roomsQty} quarto(s).</p>}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ── Etapa 4: Revisão ─────────────────────────────────────────────────────────
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
      <p className="mt-1 text-sm text-[color:var(--color-mute)]">Confirme para enviarmos a solicitação ao hotel pelo WhatsApp.</p>
      <div className="mt-6 grid gap-4">
        <label className="block">
          <span className="mb-1 block text-sm text-[color:var(--color-mute)]">Nome completo *</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-[color:var(--color-mute)]">WhatsApp</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-[color:var(--color-mute)]">E-mail</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={field} />
        </label>
      </div>
      {rules && <div className="mt-5 rounded-xl border border-[color:var(--color-line)] bg-white p-4 text-sm text-[color:var(--color-mute)]"><strong className="text-[color:var(--color-ink)]">Regras da hospedagem:</strong> {rules}</div>}
      <p className="mt-5 flex items-start gap-2 text-xs text-[color:var(--color-mute)]">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" style={{ color: brand }} />
        <span>
          <strong className="text-[color:var(--color-ink)]">A reserva é realizada e confirmada diretamente pelo WhatsApp do resort</strong>, onde fazemos a confirmação e a validação da reserva juntamente com o pagamento. O envio deste formulário é uma solicitação e não confirma a reserva.
        </span>
      </p>
    </section>
  );
}

// ── Resumo ───────────────────────────────────────────────────────────────────
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
          <div className="my-2 h-px bg-[color:var(--color-line)]" />
          <Row label="Diária promocional" value={centsToBRL(totals.pricePromoCents)} />
          {totals.totalOriginalCents > totals.totalPromoCents && <Row label="Total original" value={centsToBRL(totals.totalOriginalCents)} strike />}
          {totals.discountPercent > 0 && <Row label="Desconto" value={`${totals.discountPercent}% · −${centsToBRL(totals.savingsCents)}`} accent={brand} />}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[color:var(--color-mute)]">Total</span>
            <span className="text-xl font-bold" style={{ color: brand }}>{centsToBRL(totals.totalPromoCents)}</span>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block">
        <div className="sticky top-20 rounded-2xl border border-[color:var(--color-line)] bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-display text-lg font-semibold">Resumo da reserva</h3>
          {body}
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--color-line)] bg-white/95 p-4 backdrop-blur lg:hidden">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between">
          <span className="text-sm text-[color:var(--color-mute)]">Resumo da reserva</span>
          <span className="text-lg font-bold" style={{ color: brand }}>{totals ? centsToBRL(totals.totalPromoCents) : "—"}</span>
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
      <span className="text-[color:var(--color-mute)]">{label}</span>
      <span className={`text-right font-medium ${strike ? "text-slate-400 line-through" : "text-[color:var(--color-ink)]"}`} style={accent ? { color: accent } : undefined}>{value}</span>
    </div>
  );
}

// ── Lightbox das fotos do quarto ──────────────────────────────────────────────
function Lightbox({ state, onClose, onNav }: { state: { images: string[]; index: number }; onClose: () => void; onNav: (d: number) => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, onNav]);

  const src = state.images[state.index];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={onClose} role="dialog" aria-modal="true">
      <button type="button" aria-label="Fechar" className="absolute right-4 top-4 text-white" onClick={onClose}><X className="size-8" /></button>
      {state.images.length > 1 && (
        <>
          <button type="button" aria-label="Anterior" className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); onNav(-1); }}><ChevronLeft className="size-7" /></button>
          <button type="button" aria-label="Próxima" className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); onNav(1); }}><ChevronRight className="size-7" /></button>
        </>
      )}
      <div className="relative h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <Image src={src} alt="Foto do quarto" fill sizes="100vw" className="object-contain" />
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">{state.index + 1} / {state.images.length}</span>
      </div>
    </div>
  );
}
