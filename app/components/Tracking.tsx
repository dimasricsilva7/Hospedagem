"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import type { TrackingConfig } from "@/app/lib/content";

const KEY = "hosp_consent"; // "granted" | "denied"

/**
 * Carrega Meta Pixel / GA4 / GTM SOMENTE após consentimento (LGPD). PageView/ViewContent disparam
 * ao conceder. O evento Lead é disparado pelo formulário, após a confirmação do backend.
 */
export function Tracking({ tracking }: { tracking: TrackingConfig }) {
  const [consent, setConsent] = useState<"granted" | "denied" | "unknown">("unknown");

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      // Lê a escolha de consentimento salva no navegador na montagem.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConsent(v === "granted" ? "granted" : v === "denied" ? "denied" : "unknown");
    } catch {
      setConsent("unknown");
    }
  }, []);

  const choose = (v: "granted" | "denied") => {
    try {
      localStorage.setItem(KEY, v);
    } catch {}
    setConsent(v);
  };

  const hasPixels = Boolean(tracking.metaPixelId || tracking.ga4Id || tracking.gtmId);
  const load = consent === "granted" && hasPixels;

  return (
    <>
      {load && tracking.metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${tracking.metaPixelId}');fbq('track','PageView');fbq('track','ViewContent');
        `}</Script>
      )}
      {load && tracking.ga4Id && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${tracking.ga4Id}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">{`
            window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${tracking.ga4Id}');
          `}</Script>
        </>
      )}
      {load && tracking.gtmId && (
        <Script id="gtm" strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f)})(window,document,'script','dataLayer','${tracking.gtmId}');
        `}</Script>
      )}

      {consent === "unknown" && hasPixels && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[color:var(--color-line)] bg-white/95 p-4 backdrop-blur sm:p-5">
          <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[color:var(--color-mute)]">
              Usamos cookies para medir campanhas e melhorar sua experiência. Você pode aceitar ou recusar o rastreamento de marketing.
            </p>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => choose("denied")} className="rounded-full border border-[color:var(--color-line)] px-4 py-2 text-sm font-medium">
                Recusar
              </button>
              <button type="button" onClick={() => choose("granted")} className="rounded-full bg-[color:var(--color-ink)] px-4 py-2 text-sm font-medium text-white">
                Aceitar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
