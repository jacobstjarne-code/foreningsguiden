/**
 * umami.ts — MÄTNING (Jacob 2026-08-11): namngivna händelser utöver
 * Umamis egna sidvisningar (Base.astro laddar redan cloud.umami.is/
 * script.js sitewide — bara automatisk pageview-räkning fanns innan
 * detta). En delad, typad wrapper i stället för window.umami?.track(...)
 * upprepat på varje anropsställe.
 *
 * FIX (uppföljning 2026-08-11, Jacobs fynd): tratt_start syntes aldrig i
 * sekvensen. Rot: Umamis <script defer src="https://cloud.umami.is/...">
 * (Base.astro) laddar visserligen FÖRE sidans egna modulscript i
 * dokumentordning (defer/type=module delar samma exekveringsordnings-
 * garanti) — men scriptet hämtas från en extern CDN och sätter troligen
 * window.umami asynkront, EFTER sin egen initiering, inte synkront när
 * filen exekverar. tratt_start avfyras synkront vid modulens toppnivå
 * (matcha/index.astro), exakt det ögonblick där window.umami kan saknas
 * ett ögonblick än — det gamla `window.umami?.track()` tystnade då helt.
 * Kön nedan väntar in den i stället för att tappa händelsen: alla
 * SENARE händelser (svar på en fråga, klick) hinner Umami redan vara
 * redo för, så bara sidladdningens FÖRSTA anrop någonsin behöver vänta.
 */
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, unknown>) => void;
    };
  }
}

interface KödHändelse {
  eventName: string;
  eventData?: Record<string, unknown>;
}

const kö: KödHändelse[] = [];
let vantarPaUmami = false;

function tomKo(): void {
  if (!window.umami) return;
  while (kö.length > 0) {
    const handelse = kö.shift()!;
    try {
      window.umami.track(handelse.eventName, handelse.eventData);
    } catch {
      // Spårning får aldrig krascha sidan den mäter.
    }
  }
}

// Poll i 4 sekunder (100ms × 40), ge sedan upp TYST — en annonsblockerare
// som stoppar cloud.umami.is helt ska aldrig få kön att växa oändligt.
function startaVantan(): void {
  if (vantarPaUmami) return;
  vantarPaUmami = true;
  let forsok = 0;
  const MAX_FORSOK = 40;
  const intervall = window.setInterval(() => {
    forsok++;
    if (window.umami) {
      tomKo();
      window.clearInterval(intervall);
      vantarPaUmami = false;
    } else if (forsok >= MAX_FORSOK) {
      window.clearInterval(intervall);
      vantarPaUmami = false;
      kö.length = 0;
    }
  }, 100);
}

export function trackEvent(eventName: string, eventData?: Record<string, unknown>): void {
  try {
    if (window.umami) {
      window.umami.track(eventName, eventData);
      return;
    }
    kö.push({ eventName, eventData });
    startaVantan();
  } catch {
    // Spårning får aldrig krascha sidan den mäter.
  }
}
