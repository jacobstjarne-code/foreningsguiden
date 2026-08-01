// GET /api/cron/giltighetsvarning — B4 (SPRINT: Produkten, Opus/Fable
// 2026-07-31). GiltighetsKontroll.astro:s "erbjudande" sparar ett
// årsmötesdatum (addGiltighetBevakning, subscribers.ts) och skickar en
// bekräftelse — men själva varningsmejlet skickades aldrig, ingen cron
// fanns (giltighetsbevakning.ts:s egen kommentar: "själva utskicksjobbet
// är inte byggt än"). MEJL.giltighetsvarning (content.ts) fanns redan
// färdigskriven, oanvänd.
//
// Tröskeln (GILTIGHET_VARNING_DAGAR = 275) delar resonemang med
// GiltighetsKontroll.astro:s klientsidiga RISK_TROSKEL_DAGAR = 300 (samma
// "ungefär årliga cykler"-antagande, samma fyra kommuner med känd regel):
// 365 dagar antagen cykel minus 90 ("tre månader innan", Jacobs formulering
// i sprinten) = dag 275. Det ger marginal FÖRE widgetens egen risk-tröskel
// (275 < 300) — hon får en proaktiv påminnelse innan hon någonsin skulle
// se "kan ha förfallit"-läget om hon kollade manuellt. Ändras det ena
// talet bör det andra motiveras om tillsammans med det, inte var för sig.
//
// giltighetsregel (Forutsattning.giltighet) är fritext — precis som
// widgeten SJÄLV vägrar räkna fram ett exakt förfallodatum ur den
// (samma "gissa aldrig"-princip, se GiltighetsKontroll.astro:s filhuvud),
// skickar den här cronen ALDRIG mejlet om regeln saknas för kommunen.
//
// Idempotent per (kommun, årsmötesdatum, e-post) — EGEN nyckelrymd
// (subscribers.ts:s giltighetsvarningskickad:*), kan aldrig krocka med
// paminnelseskickad:*. Skyddad med CRON_SECRET, samma mönster som
// paminnelser.ts/utfallsfraga.ts. ?today= samma testkrok.
export const prerender = false;

import type { APIRoute } from 'astro';
import { loadKommuner, formatDate, daysUntil, todayISO } from '../../../lib/kommuner';
import { getAllConfirmedSubscribers, wasGiltighetsvarningSent, markGiltighetsvarningSent } from '../../../lib/subscribers';
import { sendGiltighetsvarning, siteUrl } from '../../../lib/mejl';

const GILTIGHET_VARNING_DAGAR = 275;

export const GET: APIRoute = async ({ request, url }) => {
  const env = import.meta.env as unknown as Record<string, string>;
  const auth = request.headers.get('authorization');
  if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const today = url.searchParams.get('today') || todayISO();
  const subscribers = await getAllConfirmedSubscribers();
  const kommuner = loadKommuner();

  let sent = 0;
  let skipped = 0;
  let ingenRegel = 0;
  const errors: string[] = [];

  for (const sub of subscribers) {
    const arsmoten = sub.giltighetArsmoten ?? {};
    for (const [kommunSlug, arsmotesdatum] of Object.entries(arsmoten)) {
      const kommun = kommuner.find((k) => k.kommun_slug === kommunSlug);
      if (!kommun) continue;

      const giltighetsregel = kommun.forutsattningar[0]?.giltighet ?? null;
      if (!giltighetsregel) {
        ingenRegel++;
        continue;
      }

      const dagarSedan = -daysUntil(arsmotesdatum, today);
      if (dagarSedan !== GILTIGHET_VARNING_DAGAR) continue;

      const redanSkickat = await wasGiltighetsvarningSent(kommunSlug, arsmotesdatum, sub.email);
      if (redanSkickat) {
        skipped++;
        continue;
      }

      try {
        await sendGiltighetsvarning(sub.email, {
          arsmotesdatum: formatDate(arsmotesdatum),
          kommun: kommun.kommun,
          giltighetsregel,
          system: kommun.ansokningssystem.namn,
          kommunLank: `${siteUrl()}/kommun/${kommun.kommun_slug}/`,
        });
        await markGiltighetsvarningSent(kommunSlug, arsmotesdatum, sub.email);
        sent++;
      } catch (e) {
        errors.push(`${sub.email}/${kommunSlug}: ${(e as Error).message}`);
      }
    }
  }

  return new Response(
    JSON.stringify({ today, subscribers: subscribers.length, sent, skipped, ingenRegel, errors }),
    { headers: { 'content-type': 'application/json' } }
  );
};
