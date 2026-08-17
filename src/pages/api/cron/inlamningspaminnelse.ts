// GET /api/cron/inlamningspaminnelse — H18 (SPEC: Det som återstår,
// Opus/Fable 2026-07-28). Mejlar "Ansökan är inte inlämnad — fyra dagar
// kvar" till köpare av registreringsutkastet (kop.ts) vars sparade
// föreningsprofil matchar bidraget, och frågar om ansökan redan gått in
// (api/inlamnad/[session]/[bidrag]/[svar]).
//
// Speglar utfallsfraga.ts:s population (hamtaKopAvProdukt('registrering')
// + foreningsprofil + matchKommun) men går FRAMÅT i tiden som
// abonnemangsbevakning.ts (nextOccurrenceISO + daysUntil), inte bakåt —
// fyra dagar FÖRE deadline, inte efter.
//
// Idempotens per (köp, bidrag) — kop.ts harInlamningsPaminnelseSkickats/
// markeraInlamningsPaminnelseSkickad, egen nyckelrymd (samma resonemang
// som utfallsfraganKey).
//
// Skyddad med CRON_SECRET, samma mönster som övriga cron-filer. ?today= samma testkrok.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getKommunBySlug, formatDate, nextOccurrenceISO, daysUntil, todayISO } from '../../../lib/kommuner';
import { hamtaKopAvProdukt, harInlamningsPaminnelseSkickats, markeraInlamningsPaminnelseSkickad } from '../../../lib/kop';
import { matchKommun } from '../../../lib/matching';
import { sendPaminnelseInlamning, siteUrl } from '../../../lib/mejl';

const TROSKEL_DAGAR = 4;

export const GET: APIRoute = async ({ request, url }) => {
  const env = import.meta.env as unknown as Record<string, string>;
  const auth = request.headers.get('authorization');
  if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const today = url.searchParams.get('today') || todayISO();
  const kop = (await hamtaKopAvProdukt('registrering')).filter((k) => k.foreningsprofil);

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const entry of kop) {
    const profil = entry.foreningsprofil!;
    const kommun = getKommunBySlug(entry.kommunSlug);
    if (!kommun) continue;

    const resultat = matchKommun(profil, kommun);

    // M2.7 (2026-08-17) — matchar+okand tillsammans: samma breda omfång
    // som innan matching.ts:s OKAND-uppdelning (se abonnemangsbevakning.
    // ts filhuvud för resonemanget). Bara köpflödet tightnar mot OKAND.
    for (const bidrag of [...resultat.matchar, ...resultat.okand]) {
      if (bidrag.deadlines.typ !== 'fasta') continue;

      for (const mmdd of bidrag.deadlines.datum) {
        const occurrence = nextOccurrenceISO(mmdd, today);
        const days = daysUntil(occurrence, today);
        if (days !== TROSKEL_DAGAR) continue;

        const redanSkickat = await harInlamningsPaminnelseSkickats(entry.stripeSessionId, bidrag.id);
        if (redanSkickat) {
          skipped++;
          continue;
        }

        const base = siteUrl();
        const session = encodeURIComponent(entry.stripeSessionId);
        const bidragId = encodeURIComponent(bidrag.id);
        const lankFor = (svar: string) => `${base}/api/inlamnad/${session}/${bidragId}/${svar}/`;
        const bidragLank = `${base}/kommun/${kommun.kommun_slug}/#bidrag-${bidrag.id}`;

        try {
          await sendPaminnelseInlamning(entry.email, {
            bidrag: bidrag.namn,
            kommun: kommun.kommun,
            datum: formatDate(occurrence),
            bidragLank,
            svarJaLank: lankFor('ja'),
            svarNejLank: lankFor('nej'),
          });
          await markeraInlamningsPaminnelseSkickad(entry.stripeSessionId, bidrag.id);
          sent++;
        } catch (e) {
          errors.push(`${entry.stripeSessionId}/${bidrag.id}: ${(e as Error).message}`);
        }
      }
    }
  }

  return new Response(JSON.stringify({ today, kop: kop.length, sent, skipped, errors }), {
    headers: { 'content-type': 'application/json' },
  });
};
