// Selo de autenticidade holográfico (estilo etiqueta de segurança). Nº de série = parte numérica do código.
// Puro CSS/SVG (ver globals.css). O brilho holográfico passa automaticamente.
export function AuthSeal({ code }: { code: string }) {
  // Nº de série de 6 dígitos: usa os dígitos do código; se tiver menos de 6, deriva um estável do próprio código.
  let d = code.replace(/\D/g, "");
  if (d.length < 6) {
    let h = 0;
    for (const c of code) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    d = (100000 + (h % 900000)).toString();
  }
  const serial = d.slice(-6);
  const pid = "holo-" + code.replace(/[^a-zA-Z0-9]/g, "");
  return (
    <div className="holo-seal" role="img" aria-label={`Selo de autenticidade ${serial}`}>
      <div className="holo-seal__bg" />
      <svg className="holo-seal__mesh" viewBox="0 0 200 130" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <pattern id={pid} width="120" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(-10)">
            <text x="0" y="12" className="holo-seal__word">GENUINE ★ ORIGINAL ✦</text>
            <text x="-34" y="26" className="holo-seal__word holo-seal__word--b">AUTHENTIC ★ SECURE ✦ VALID</text>
          </pattern>
        </defs>
        <rect width="200" height="130" fill={`url(#${pid})`} />
      </svg>
      <div className="holo-seal__face">
        <span className="holo-seal__mini">SECURE ✦ GENUINE</span>
        <span className="holo-seal__num">{serial}</span>
        <span className="holo-seal__mini">AUTHENTIC ✦ ORIGINAL</span>
      </div>
      <div className="holo-seal__sheen" />
    </div>
  );
}
