// Pixels de marketing injetados em runtime (ver app/components/Tracking.tsx).
export {};
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
