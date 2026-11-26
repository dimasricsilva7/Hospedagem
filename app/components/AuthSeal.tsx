// Selo holográfico de autenticação do voucher validado. Puro CSS/SVG (ver globals.css).
export function AuthSeal({ code }: { code: string }) {
  const pathId = `seal-${code.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <div className="auth-seal" role="img" aria-label={`Selo de autenticação — reserva confirmada ${code}`}>
      <div className="auth-seal__holo" />
      <div className="auth-seal__guilloche" />
      <svg className="auth-seal__ring" viewBox="0 0 200 200" aria-hidden>
        <defs>
          <path id={pathId} d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" fill="none" />
        </defs>
        <text className="auth-seal__ringtext">
          <textPath href={`#${pathId}`} startOffset="0">
            RESERVA CONFIRMADA · AUTENTICADO · NANNAI MURO ALTO ·&nbsp;
          </textPath>
        </text>
      </svg>
      <div className="auth-seal__core">
        <svg viewBox="0 0 24 24" className="auth-seal__check" aria-hidden>
          <path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="auth-seal__word">AUTENTICADO</span>
        <span className="auth-seal__code">{code}</span>
      </div>
      <div className="auth-seal__sheen" />
    </div>
  );
}
