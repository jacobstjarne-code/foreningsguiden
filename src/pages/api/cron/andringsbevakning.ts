// GET /api/cron/andringsbevakning — H22 (GRANSKNING_foreningsguiden.md).
// Körs dagligen via Vercel Cron (vercel.json). Jämför varje
// registreringsutkast-köps sparade snapshot (KopEntry.
// forutsattningarSnapshot, kop.ts — låst till köptillfället) mot
// kommunens checklista NU (genereraRegistreringsUtkast, samma motor
// som skapade snapshotten). Skiljer de sig och köparen inte redan
// mejlats om exakt DEN nya versionen: mejla, markera.
//
// Idempotent utan hash: hamtaSenastNotifieradSnapshot/
// markeraSnapshotNotifierad (kop.ts) sparar den senaste FAKTISKT
// mejlade snapshotten per köp — samma nya tillstånd mejlas aldrig två
// gånger, men en FÖRNYAD ändring efteråt mejlas igen.
//
// Skyddad med CRON_SECRET, samma mönster som cron/paminnelser.ts.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getKommunBySlug } from '../../../lib/kommuner';
import { genereraRegistreringsUtkast } from '../../../lib/utkastGenerator';
import { hamtaKopAvProdukt, hamtaSenastNotifieradSnapshot, markeraSnapshotNotifierad } from '../../../lib/kop';
import { sendAndringsNotis, siteUrl } from '../../../lib/mejl';

export const GET: APIRoute = async ({ request }) => {
  const env = import.meta.env as unknown as Record<string, string>;
  const auth = request.headers.get('authorization');
  if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const kop = await hamtaKopAvProdukt('registrering');

  let kontrollerade = 0;
  let mejlade = 0;
  let oforandrade = 0;
  const errors: string[] = [];

  for (const k of kop) {
    if (!k.forutsattningarSnapshot) continue;
    kontrollerade++;

    const kommun = getKommunBySlug(k.kommunSlug);
    if (!kommun) continue;

    const nuvarande = JSON.stringify(genereraRegistreringsUtkast(kommun));
    if (nuvarande === k.forutsattningarSnapshot) {
      oforandrade++;
      continue;
    }

    const senastNotifierad = await hamtaSenastNotifieradSnapshot(k.stripeSessionId);
    if (nuvarande === senastNotifierad) {
      continue; // redan mejlad om exakt detta nya tillstånd
    }

    try {
      await sendAndringsNotis(k.email, {
        kommunSlug: k.kommunSlug,
        registreraLank: `${siteUrl()}/kommun/${k.kommunSlug}/registrera/`,
      });
      await markeraSnapshotNotifierad(k.stripeSessionId, nuvarande);
      mejlade++;
    } catch (e) {
      errors.push(`${k.email}/${k.stripeSessionId}: ${(e as Error).message}`);
    }
  }

  return new Response(JSON.stringify({ kontrollerade, mejlade, oforandrade, errors }), {
    headers: { 'content-type': 'application/json' },
  });
};
