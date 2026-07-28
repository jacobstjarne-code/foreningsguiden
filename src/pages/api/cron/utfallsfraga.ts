// GET /api/cron/utfallsfraga — H19 (SPEC: Kluster 1 — efter-köp-ytan,
// Opus/Fable 2026-07-28). Mejlar "Hur gick det med {bidrag}?" fjorton
// dagar efter en bevakad deadline hos en köpare av registreringsutkastet
// (kop.ts) vars sparade föreningsprofil matchade det bidraget.
//
// Speglar abonnemangsbevakning.ts:s form (profil → matchKommun → per
// bidrag med fasta deadline → tröskelkontroll → send), men går BAKÅT i
// tiden i stället för framåt: nextOccurrenceISO rullar bara framåt och
// kan strukturellt aldrig hitta en deadline som redan passerat — därför
// subtractDays(today, 14) i stället, se kommunTyper.ts.
//
// Idempotens per (köp, bidrag) — kop.ts harUtfallsfraganSkickats/
// markeraUtfallsfraganSkickad, EGEN nyckelrymd (inte subscribers.ts:s
// paminnelseskickad:*, som är e-postscopad — den här är köp-scopad,
// samma person kan köpa flera gånger).
//
// Skyddad med CRON_SECRET, samma mönster som paminnelser.ts/
// abonnemangsbevakning.ts. ?today= samma testkrok.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getKommunBySlug, formatDate, subtractDays, todayISO } from '../../../lib/kommuner';
import { hamtaKopAvProdukt, harUtfallsfraganSkickats, markeraUtfallsfraganSkickad } from '../../../lib/kop';
import { matchKommun } from '../../../lib/matching';
import { sendUtfallsfraga, siteUrl } from '../../../lib/mejl';

export const GET: APIRoute = async ({ request, url }) => {
  const env = import.meta.env as unknown as Record<string, string>;
  const auth = request.headers.get('authorization');
  if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const today = url.searchParams.get('today') || todayISO();
  const targetISO = subtractDays(today, 14);
  const targetMMDD = targetISO.slice(5);

  const kop = (await hamtaKopAvProdukt('registrering')).filter((k) => k.foreningsprofil);

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const entry of kop) {
    const profil = entry.foreningsprofil!;
    const kommun = getKommunBySlug(entry.kommunSlug);
    if (!kommun) continue;

    const resultat = matchKommun(profil, kommun);

    for (const bidrag of resultat.matchar) {
      if (bidrag.deadlines.typ !== 'fasta' || !bidrag.deadlines.datum.includes(targetMMDD)) continue;

      const redanSkickat = await harUtfallsfraganSkickats(entry.stripeSessionId, bidrag.id);
      if (redanSkickat) {
        skipped++;
        continue;
      }

      const base = siteUrl();
      const session = encodeURIComponent(entry.stripeSessionId);
      const bidragId = encodeURIComponent(bidrag.id);
      const lankFor = (svar: string) => `${base}/api/utfall/${session}/${bidragId}/${svar}/`;

      try {
        await sendUtfallsfraga(entry.email, {
          bidrag: bidrag.namn,
          kommun: kommun.kommun,
          datum: formatDate(targetISO),
          svarBeviljatLank: lankFor('beviljat'),
          svarAvslagLank: lankFor('avslag'),
          svarVetInteLank: lankFor('vet_inte'),
        });
        await markeraUtfallsfraganSkickad(entry.stripeSessionId, bidrag.id);
        sent++;
      } catch (e) {
        errors.push(`${entry.stripeSessionId}/${bidrag.id}: ${(e as Error).message}`);
      }
    }
  }

  return new Response(JSON.stringify({ today, targetISO, kop: kop.length, sent, skipped, errors }), {
    headers: { 'content-type': 'application/json' },
  });
};
