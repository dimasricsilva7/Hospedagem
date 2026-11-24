"use client";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

export type FieldDef = { key: string; label: string; type?: "text" | "textarea" | "number" | "checkbox" | "csv"; placeholder?: string };

const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900";

type Row = Record<string, unknown>;

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const copy = [...arr];
  const [x] = copy.splice(from, 1);
  copy.splice(to, 0, x);
  return copy;
}

/** Lista editável de objetos (adicionar / remover / reordenar). Usada por benefícios, galeria, etc. */
export function ObjRepeater({ items, fields, onChange, newItem, addLabel }: { items: Row[]; fields: FieldDef[]; onChange: (v: Row[]) => void; newItem: () => Row; addLabel: string }) {
  const set = (i: number, key: string, value: unknown) => onChange(items.map((it, j) => (j === i ? { ...it, [key]: value } : it)));
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">#{i + 1}</span>
            <div className="flex gap-1">
              <button type="button" onClick={() => onChange(move(items, i, i - 1))} className="rounded p-1 hover:bg-slate-200"><ArrowUp className="size-4" /></button>
              <button type="button" onClick={() => onChange(move(items, i, i + 1))} className="rounded p-1 hover:bg-slate-200"><ArrowDown className="size-4" /></button>
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="rounded p-1 text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></button>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {fields.map((f) => {
              const raw = it[f.key];
              if (f.type === "checkbox") {
                return (
                  <label key={f.key} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={Boolean(raw)} onChange={(e) => set(i, f.key, e.target.checked)} className="size-4" /> {f.label}
                  </label>
                );
              }
              if (f.type === "textarea") {
                return (
                  <label key={f.key} className="block sm:col-span-2">
                    <span className="mb-0.5 block text-xs text-slate-500">{f.label}</span>
                    <textarea rows={2} value={(raw as string) ?? ""} placeholder={f.placeholder} onChange={(e) => set(i, f.key, e.target.value)} className={input} />
                  </label>
                );
              }
              if (f.type === "csv") {
                const str = Array.isArray(raw) ? (raw as string[]).join(", ") : "";
                return (
                  <label key={f.key} className="block sm:col-span-2">
                    <span className="mb-0.5 block text-xs text-slate-500">{f.label}</span>
                    <input value={str} placeholder={f.placeholder} onChange={(e) => set(i, f.key, e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} className={input} />
                  </label>
                );
              }
              return (
                <label key={f.key} className="block">
                  <span className="mb-0.5 block text-xs text-slate-500">{f.label}</span>
                  <input
                    type={f.type === "number" ? "number" : "text"}
                    value={f.type === "number" ? ((raw as number) ?? "") : ((raw as string) ?? "")}
                    placeholder={f.placeholder}
                    onChange={(e) => set(i, f.key, f.type === "number" ? (e.target.value === "" ? undefined : Number(e.target.value)) : e.target.value)}
                    className={input}
                  />
                </label>
              );
            })}
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, newItem()])} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50">
        <Plus className="size-4" /> {addLabel}
      </button>
    </div>
  );
}

/** Lista editável de textos simples (ex.: URLs de imagens, diferenciais). */
export function StrRepeater({ items, onChange, placeholder, addLabel }: { items: string[]; onChange: (v: string[]) => void; placeholder?: string; addLabel: string }) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <input value={it} placeholder={placeholder} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} className={input} />
          <button type="button" onClick={() => onChange(move(items, i, i - 1))} className="rounded p-1 hover:bg-slate-200"><ArrowUp className="size-4" /></button>
          <button type="button" onClick={() => onChange(move(items, i, i + 1))} className="rounded p-1 hover:bg-slate-200"><ArrowDown className="size-4" /></button>
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="rounded p-1 text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ""])} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50">
        <Plus className="size-4" /> {addLabel}
      </button>
    </div>
  );
}
