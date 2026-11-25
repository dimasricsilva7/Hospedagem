// Desenhos tropicais decorativos — arte original (traço próprio, estilo adesivo/doodle).
// Contorno marrom-escuro suave + preenchimentos quentes para um visual "vivo" e caprichado.
// Puramente decorativos (aria-hidden).

type P = { className?: string };
const O = "#3f2d20"; // contorno (marrom escuro, mais macio que preto)
const common = { stroke: O, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export function DSun({ className }: P) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
      {Array.from({ length: 12 }).map((_, k) => {
        const a = (k * Math.PI) / 6;
        const x1 = 32 + 18 * Math.cos(a);
        const y1 = 32 + 18 * Math.sin(a);
        const x2 = 32 + 27 * Math.cos(a);
        const y2 = 32 + 27 * Math.sin(a);
        return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} {...common} strokeWidth="3.4" />;
      })}
      <circle cx="32" cy="32" r="15" fill="#ffc93c" {...common} strokeWidth="3" />
      <circle cx="32" cy="32" r="15" fill="url(#sunG)" opacity="0.55" />
      <defs>
        <radialGradient id="sunG" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fff2b2" />
          <stop offset="100%" stopColor="#ff9f1c" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function DPalm({ className }: P) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
      {/* tronco curvo */}
      <path d="M30 60 C27 47 26 34 31 22" {...common} stroke="#b9743a" strokeWidth="5" />
      <path d="M30 60 C27 47 26 34 31 22" {...common} strokeWidth="5.6" opacity="0.25" />
      {/* folhas (frondes) */}
      {[
        "M31 21 C20 16 10 18 4 25 C13 22 22 22 31 24",
        "M31 21 C42 15 54 17 60 25 C50 21 40 21 31 24",
        "M31 21 C25 10 14 7 6 10 C16 11 25 15 31 23",
        "M31 21 C38 10 50 8 58 12 C47 12 38 16 31 23",
        "M31 21 C30 10 33 3 41 1 C35 7 33 14 31 22",
      ].map((d, i) => (
        <path key={i} d={d} fill="#17a673" {...common} strokeWidth="2.4" />
      ))}
      {/* cocos */}
      <circle cx="29" cy="24" r="3" fill="#7a4a24" {...common} strokeWidth="2" />
      <circle cx="34" cy="25" r="3" fill="#7a4a24" {...common} strokeWidth="2" />
    </svg>
  );
}

export function DShell({ className }: P) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
      <path d="M32 54 C13 54 7 35 13 23 C18 14 46 14 51 23 C57 35 51 54 32 54 Z" fill="#ffb4a2" {...common} strokeWidth="3" />
      {/* nervuras do leque */}
      {[-18, -9, 0, 9, 18].map((dx, i) => (
        <path key={i} d={`M32 52 C${32 + dx * 0.5} 40 ${32 + dx} 30 ${32 + dx} 23`} {...common} stroke={O} strokeWidth="2.2" />
      ))}
      {/* charneira */}
      <path d="M26 24 C28 20 36 20 38 24" fill="#ff8fa3" {...common} strokeWidth="2.4" />
    </svg>
  );
}

export function DMoon({ className }: P) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
      <path d="M43 8 C27 10 17 25 20 42 C22 55 33 60 44 57 C31 51 25 39 27 27 C29 16 36 10 43 8 Z" fill="#ffe08a" {...common} strokeWidth="3" />
      <path d="M50 20 l1.6 3.4 3.7 .5 -2.7 2.6 .7 3.7 -3.3 -1.8 -3.3 1.8 .7 -3.7 -2.7 -2.6 3.7 -.5 Z" fill="#ffd166" {...common} strokeWidth="1.6" />
    </svg>
  );
}

export function DWave({ className }: P) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden fill="none">
      {/* onda com crista enrolada */}
      <path d="M4 28 C8 18 16 14 24 18 C30 21 30 30 24 31 C19 32 17 26 21 24" fill="#7fd3e8" {...common} strokeWidth="3" />
      <path d="M30 30 C34 20 42 16 50 20 C56 23 56 31 50 32" fill="#9fe0ef" {...common} strokeWidth="3" />
      <path d="M6 34 C18 30 30 36 42 32 C50 29 56 33 60 34" {...common} stroke="#2aa9c9" strokeWidth="3" />
    </svg>
  );
}
