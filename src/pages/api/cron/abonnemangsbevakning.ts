// GET /api/cron/abonnemangsbevakning — Abonnemangets bevakning
// (SPEC_ABONNEMANG.md §1/§4). Skillnaden mot den gratis kalendern
// (cron/paminnelser.ts): mejlar per MATCHAT bidrag, inte per kommun —
// kräver att föreningsprofilen (tratt-svaren) är sparad server-side
// (Subscriber.foreningsprofil, subscribers.ts — mergas redan in av
// stripe-webhook.ts/api/vantelista.ts) så matchKommun() kan köras här.
// Fyra veckor + tre dagar före (inte två veckor + tre dagar som den
// gratis bevakningen) — fyra veckor ger tid att hinna registrera sig
// om det behövs.
//
// GROV MATCHNING — FLAGGAT MEDVETET, INTE EN BUGG (Jacob, 2026-07-27):
// alla matchningsfält (min_medlemmar, alder_min/max,
// min_verksamhetstid_manader, foreningstyp, kraver_registrering) är
// null för de flesta bidrag i datakorpusen, så matchKommun() ger
// nästan alla bidrag i kommunen — samma grova-matchning-per-design som
// harMatchningsdata() (matching.ts) redan dokumenterar och motiverar.
// M2.7 (2026-08-17) delade upp det tidigare MATCHAR-utfallet i MATCHAR
// (minst ett villkor faktiskt prövat) och OKAND (inget att pröva mot
// alls) — matchKommun().matchar innehåller nu bara det förra. DEN HÄR
// cronen (påminnelser, ingen köpspärr) vill fortfarande ha samma breda
// omfång som innan uppdelningen, så den itererar matchar+okand
// tillsammans nedan — bara köpflödet (checkout/bidragsutkast.ts) ska
// behandla OKAND som "kan inte avgöra". Utskicket skärps AUTOMATISKT
// när struktureringspasset fyller i fälten (fler bidrag flyttar från
// okand till matchar) — den här cronen är byggd MOT det grova läget,
// inte runt det, och behöver ingen ändring när datan blir skarpare.
//
// Delad idempotensnyckel för "3 dagar kvar" med den gratis bevakningen
// (paminnelseskickad:3:<bidragId>:<datum>, subscribers.ts): en
// abonnent som ÄVEN är gratis-prenumerant på samma kommun ska bara få
// EN 3-dagarspåminnelse för samma bidrag, inte två identiska mejl.
// "28 dagar" har en egen typ-literal och krockar aldrig med "14 dagar"
// (den gratis bevakningens första utskick).
//
// Skyddad med CRON_SECRET, samma mönster som paminnelser.ts.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getKommunBySlug, formatDate, nextOccurrenceISO, daysUntil, todayISO } from '../../../lib/kommuner';
import { hamtaAllaAbonnemang } from '../../../lib/abonnemang';
import { getSubscriber, wasReminderSent, markReminderSent } from '../../../lib/subscribers';
import { matchKommun } from '../../../lib/matching';
import { sendPaminnelse28, sendPaminnelseSista, siteUrl } from '../../../lib/mejl';

export const GET: APIRoute = async ({ request, url }) => {
  const env = import.meta.env as unknown as Record<string, string>;
  const auth = request.headers.get('authorization');
  if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // ?today=YYYY-MM-DD — samma testkrok som paminnelser.ts, skyddad av
  // samma CRON_SECRET.
  const today = url.searchParams.get('today') || todayISO();
  const abonnemang = (await hamtaAllaAbonnemang()).filter((a) => a.status === 'active');

  let sent28 = 0;
  let sent3 = 0;
  let skipped = 0;
  let utanProfil = 0;
  const errors: string[] = [];

  for (const ab of abonnemang) {
    const subscriber = await getSubscriber(ab.email);
    const profil = subscriber?.foreningsprofil;

    // Känd lucka (SPEC_ABONNEMANG — inte byggd i detta pass): ingen
    // nudge-mekanism ber abonnenten fylla i tratten om profilen saknas.
    // Hoppar bara över — flaggas i svaret (utanProfil) så gapet syns,
    // döljs inte tyst.
    if (!profil || !profil.kommunSlug) {
      utanProfil++;
      continue;
    }

    const kommun = getKommunBySlug(profil.kommunSlug);
    if (!kommun) continue;

    const resultat = matchKommun(profil, kommun);

    // M2.7 — matchar+okand tillsammans, se filhuvudet: den här cronen
    // ska behålla sitt tidigare breda omfång, bara köpflödet tightnar.
    for (const bidrag of [...resultat.matchar, ...resultat.okand]) {
      if (bidrag.deadlines.typ !== 'fasta') continue;

      for (const mmdd of bidrag.deadlines.datum) {
        const occurrence = nextOccurrenceISO(mmdd, today);
        const days = daysUntil(occurrence, today);
        const typ: '28' | '3' | null = days === 28 ? '28' : days === 3 ? '3' : null;
        if (!typ) continue;

        const redanSkickat = await wasReminderSent(typ, bidrag.id, occurrence, ab.email);
        if (redanSkickat) {
          skipped++;
          continue;
        }

        const bidragLank = `${siteUrl()}/kommun/${kommun.kommun_slug}/#bidrag-${bidrag.id}`;
        try {
          if (typ === '28') {
            await sendPaminnelse28(ab.email, {
              bidragsnamn: bidrag.namn,
              kommun: kommun.kommun,
              datum: formatDate(occurrence),
              bidragLank,
            });
            sent28++;
          } else {
            await sendPaminnelseSista(ab.email, {
              bidragsnamn: bidrag.namn,
              kommun: kommun.kommun,
              datum: formatDate(occurrence),
              bidragLank,
            });
            sent3++;
          }
          await markReminderSent(typ, bidrag.id, occurrence, ab.email);
        } catch (e) {
          errors.push(`${ab.email}/${bidrag.id}/${typ}: ${(e as Error).message}`);
        }
      }
    }
  }

  return new Response(
    JSON.stringify({ today, abonnemang: abonnemang.length, utanProfil, sent28, sent3, skipped, errors }),
    { headers: { 'content-type': 'application/json' } }
  );
};
