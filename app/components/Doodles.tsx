// Desenhos tropicais decorativos — arte original (traço próprio, estilo adesivo).
// Usados como acentos para dar vida às seções. Puramente decorativos (aria-hidden).

type P = { className?: string };
const S = "#111"; // contorno

export function DSun({ className }: P) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
      {Array.from({ length: 10 }).map((_, k) => {
        const a = (k * Math.PI) / 5;
        const x = 32 + 26 * Math.cos(a);
        const y = 32 + 26 * Math.sin(a);
        const x2 = 32 + 19 * Math.cos(a);
        const y2 = 32 + 19 * Math.sin(a);
        return <line key={k} x1={x2} y1={y2} x2={x} y2={y} stroke={S} strokeWidth="4" strokeLinecap="round" />;
      })}
      <circle cx="32" cy="32" r="16" fill="#fcd34d" stroke={S} strokeWidth="4" />
    </svg>
  );
}

export function DPalm({ className }: P) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
      <path d="M31 58 C30 44 31 32 34 23" stroke="#c2703a" strokeWidth="5" strokeLinecap="round" />
      <path d="M34 22 C24 16 13 18 7 25" stroke="#14b8a6" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M34 22 C44 15 56 17 61 25" stroke="#14b8a6" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M34 22 C31 12 34 6 42 3" stroke="#0d9488" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M34 22 C27 14 16 12 9 15" stroke="#0d9488" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="34" cy="22" r="3.5" fill="#fcd34d" stroke={S} strokeWidth="2" />
    </svg>
  );
}

export function DShell({ className }: P) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
      <path d="M32 54 C14 54 8 36 12 24 C16 14 48 14 52 24 C56 36 50 54 32 54 Z" fill="#fb9a6b" stroke={S} strokeWidth="4" strokeLinejoin="round" />
      <path d="M32 54 L32 22 M32 52 C26 44 22 34 22 24 M32 52 C38 44 42 34 42 24" stroke={S} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function DMoon({ className }: P) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
      <path d="M44 10 C28 12 18 26 20 42 C22 54 32 59 42 57 C30 52 24 40 26 28 C28 18 36 12 44 10 Z" fill="#fde68a" stroke={S} strokeWidth="4" strokeLinejoin="round" />
    </svg>
  );
}

export function DWave({ className }: P) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden fill="none">
      <path d="M4 12 C10 6 16 18 22 12 C28 6 34 18 40 12 C46 6 52 18 58 12" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" />
      <path d="M4 26 C10 20 16 32 22 26 C28 20 34 32 40 26 C46 20 52 32 58 26" stroke={S} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
