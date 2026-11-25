// Desenhos tropicais fornecidos pelo responsável (PNGs com fundo transparente, estilo adesivo).
// Puramente decorativos (aria-hidden). Mantém os nomes antigos p/ compatibilidade de import.

type P = { className?: string };

const BASE = "/assets/doodles";

function makeDoodle(src: string, name: string) {
  function Doodle({ className }: P) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" aria-hidden className={`pointer-events-none select-none object-contain ${className ?? ""}`} />;
  }
  Doodle.displayName = name;
  return Doodle;
}

export const DSun = makeDoodle(`${BASE}/sol.png`, "DSun");
export const DPalm = makeDoodle(`${BASE}/coqueiro.png`, "DPalm");
export const DShell = makeDoodle(`${BASE}/concha.png`, "DShell");
export const DWave = makeDoodle(`${BASE}/ondas.png`, "DWave");
export const DHibiscus = makeDoodle(`${BASE}/hibisco.png`, "DHibiscus");
export const DMonstera = makeDoodle(`${BASE}/folha-monstera.png`, "DMonstera");
export const DStar = makeDoodle(`${BASE}/estrela-do-mar.png`, "DStar");
export const DLeaves = makeDoodle(`${BASE}/folhas.png`, "DLeaves");
// Compat: DMoon era usada na faixa Natal; agora aponta para a estrela-do-mar.
export const DMoon = DStar;
