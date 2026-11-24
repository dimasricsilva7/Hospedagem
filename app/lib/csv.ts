// Monta CSV (vírgula) a partir de linhas, escapando aspas/vírgulas/quebras. Puro → testável.
export function toCsv(rows: (string | number | null | undefined)[][]): string {
  const esc = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v);
    return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  // BOM + CRLF: Excel abre acentos corretamente.
  return "﻿" + rows.map((r) => r.map(esc).join(",")).join("\r\n");
}
