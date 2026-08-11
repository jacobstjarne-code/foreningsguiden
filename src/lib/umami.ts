/**
 * umami.ts — MÄTNING (Jacob 2026-08-11): namngivna händelser utöver
 * Umamis egna sidvisningar (Base.astro laddar redan cloud.umami.is/
 * script.js sitewide — bara automatisk pageview-räkning fanns innan
 * detta). En delad, typad wrapper i stället för window.umami?.track(...)
 * upprepat på varje anropsställe.
 *
 * window.umami sätts av Umamis egna script.js EFTER att det laddat —
 * kan saknas om en annonsblockerare stoppar cloud.umami.is, eller om
 * anropet händer innan scriptet hunnit köra. trackEvent() är alltså
 * medvetet tyst i det läget, aldrig en krasch för ett spårningsanrop.
 */
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, unknown>) => void;
    };
  }
}

export function trackEvent(eventName: string, eventData?: Record<string, unknown>): void {
  try {
    window.umami?.track(eventName, eventData);
  } catch {
    // Spårning får aldrig krascha sidan den mäter.
  }
}
