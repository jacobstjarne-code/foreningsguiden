// GET /api/cron/paminnelser — utskicksmotorn (SPRINT §Spår A). Körs dagligen
// via Vercel Cron (vercel.json, 07:00 UTC). Skickar MEJL.paminnelse28/
// paminnelseSista till BEKRÄFTADE prenumeranter vars bevakade kommuner har
// bidrag med fast deadline exakt 28 eller 3 dagar bort. Idempotent:
// wasReminderSent/markReminderSent (subscribers.ts) spårar per
// (typ, bidrag, faktiskt datum) — samma dag kan aldrig skicka två gånger
// även om cronjobbet triggas om.
//
// J2 (2026-08-16, MEJLTEXTER.md "Rytm"): rytmen bytt från 14/3 till 28/3
// — samma rytm och samma två mejl (paminnelse28/paminnelseSista) som
// abonnemanget (cron/abonnemangsbevakning.ts) redan använde. "Inte
// 30/14/3": källfilens skäl är volym — bevakningens förval är hela
// kommunen (Gislaved har fjorton bidrag), tre mejl per frist blir
// fyrtiotvå mejl om året från en enda kommun.
//
// P3.1b (Jacob 2026-08-05): en andra körning bearbetar sub.bidrag (enskild
// bidragsbevakning, subscribers.ts addBidragBevakning) utöver den
// befintliga kommun-breda sub.kommuner-loopen — samma matchnings-/
// utskicksfunktion (behandlaBidrag), bara olika källa till vilka
// (kommun, bidrag)-par som ska kollas. Om samma bidrag råkar täckas av
// BÅDA (kommun-bred bevakning + en egen radbevakning i samma kommun)
// skyddar wasReminderSent/markReminderSent redan mot ett dubbelt
// utskick — nyckeln är (typ, bidragId, datum, email), oberoende av
// vilken loop som kom först.
//
// Skyddad med CRON_SECRET (Vercels standardmönster för att förhindra att
// endpointen triggas publikt — se vercel.com/docs/cron-jobs/manage-cron-jobs).
export const prerender = false;

import type { APIRoute } from 'astro';
import { loadKommuner, formatDate, formatRecurringDate, nextOccurrenceISO, daysUntil, todayISO } from '../../../lib/kommuner';
import type { Kommun, Bidrag } from '../../../lib/kommuner';
import { loadNationellaStod } from '../../../lib/nationellaStod';
import type { NationelltStod } from '../../../lib/nationellaStod';
import { getAllConfirmedSubscribers, wasReminderSent, markReminderSent } from '../../../lib/subscribers';
import { sendPaminnelse28, sendPaminnelseSista, sendNationellPaminnelse28, sendNationellPaminnelseSista, siteUrl } from '../../../lib/mejl';
import { registreraCronKorning } from '../../../lib/larm';

interface Raknare {
  sent28: number;
  sent3: number;
  skipped: number;
  errors: string[];
}

async function behandlaNationelltStod(email: string, stod: NationelltStod, today: string, raknare: Raknare): Promise<void> {
  for (const mmdd of stod.deadlines.datum) {
    const occurrence = nextOccurrenceISO(mmdd, today);
    const days = daysUntil(occurrence, today);
    const typ: '28' | '3' | null = days === 28 ? '28' : days === 3 ? '3' : null;
    if (!typ) continue;

    // Egen nyckelrymd; kan aldrig krocka med ett kommunalt bidrag-id.
    const reminderId = `nationell:${stod.id}`;
    if (await wasReminderSent(typ, reminderId, occurrence, email)) {
      raknare.skipped++;
      continue;
    }

    try {
      if (typ === '28') {
        // U2.2 (MEJL 7): {period}/{slutdatum} beräknas ur samma post,
        // inte hårdkodat. Antagande som gäller för LOK-stödets data:
        // deadlines.perioder och sanktionstrappa.steg[i].perioder är
        // parvis ordnade i samma index-ordning som deadlines.datum
        // (schemat kräver bara att varje periods datum FINNS i
        // deadlines.datum, inte index-parkoppling) — håller för den
        // här posten, inte ett generellt kontrakt.
        const periodIndex = stod.deadlines.datum.indexOf(mmdd);
        const nationellPeriod = stod.deadlines.perioder.find((p) => p.datum === mmdd);
        const avslagSteg = stod.sanktionstrappa.steg.find((s) => s.pafoljd === 'avslag');
        const avslagPeriod = avslagSteg?.perioder[periodIndex];
        if (!nationellPeriod || !avslagPeriod) {
          raknare.errors.push(`${email}/nationell:${stod.id}/28: kunde inte para ihop period/sanktionstrappa för ${mmdd}`);
          continue;
        }
        const occurrenceAr = Number(occurrence.slice(0, 4));
        const periodAr = nationellPeriod.avser.ar_relation === 'foregaende_ar' ? occurrenceAr - 1 : occurrenceAr;
        const period = `${formatRecurringDate(nationellPeriod.avser.fran)}–${formatRecurringDate(nationellPeriod.avser.till)} ${periodAr}`;
        await sendNationellPaminnelse28(email, {
          datum: formatDate(occurrence),
          period,
          slutdatum: formatRecurringDate(avslagPeriod.fran),
          lank: `${siteUrl()}/nationella-stod/${stod.id}/`,
        });
        raknare.sent28++;
      } else {
        await sendNationellPaminnelseSista(email, {
          datum: formatDate(occurrence),
          lank: `${siteUrl()}/nationella-stod/${stod.id}/`,
        });
        raknare.sent3++;
      }
      await markReminderSent(typ, reminderId, occurrence, email);
    } catch (e) {
      raknare.errors.push(`${email}/${reminderId}/${typ}: ${(e as Error).message}`);
    }
  }
}

async function behandlaBidrag(email: string, kommun: Kommun, bidrag: Bidrag, today: string, raknare: Raknare): Promise<void> {
  if (bidrag.deadlines.typ !== 'fasta') return;

  for (const mmdd of bidrag.deadlines.datum) {
    const occurrence = nextOccurrenceISO(mmdd, today);
    const days = daysUntil(occurrence, today);
    const typ: '28' | '3' | null = days === 28 ? '28' : days === 3 ? '3' : null;
    if (!typ) continue;

    const redanSkickat = await wasReminderSent(typ, bidrag.id, occurrence, email);
    if (redanSkickat) {
      raknare.skipped++;
      continue;
    }

    const bidragLank = `${siteUrl()}/kommun/${kommun.kommun_slug}/#bidrag-${bidrag.id}`;
    try {
      if (typ === '28') {
        await sendPaminnelse28(email, {
          bidragsnamn: bidrag.namn,
          kommun: kommun.kommun,
          datum: formatDate(occurrence),
          bidragLank,
        });
        raknare.sent28++;
      } else {
        await sendPaminnelseSista(email, {
          bidragsnamn: bidrag.namn,
          kommun: kommun.kommun,
          datum: formatDate(occurrence),
          bidragLank,
        });
        raknare.sent3++;
      }
      await markReminderSent(typ, bidrag.id, occurrence, email);
    } catch (e) {
      raknare.errors.push(`${email}/${bidrag.id}/${typ}: ${(e as Error).message}`);
    }
  }
}

export const GET: APIRoute = async ({ request, url }) => {
  const env = import.meta.env as unknown as Record<string, string>;
  const auth = request.headers.get('authorization');
  if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // ?today=YYYY-MM-DD — testkrok, skyddad av samma CRON_SECRET som resten
  // av endpointen. Låter oss verifiera 28-/3-dagarslogiken mot en riktig
  // kommande deadline utan att vänta på kalendern eller fabricera data.
  const today = url.searchParams.get('today') || todayISO();
  const subscribers = await getAllConfirmedSubscribers();
  const kommuner = loadKommuner();
  const nationellaStod = loadNationellaStod();

  const raknare: Raknare = { sent28: 0, sent3: 0, skipped: 0, errors: [] };

  for (const sub of subscribers) {
    for (const slug of sub.kommuner) {
      const kommun = kommuner.find((k) => k.kommun_slug === slug);
      if (!kommun) continue;

      for (const bidrag of kommun.bidrag) {
        await behandlaBidrag(sub.email, kommun, bidrag, today, raknare);
      }
    }

    for (const { kommunSlug, bidragId } of sub.bidrag ?? []) {
      const kommun = kommuner.find((k) => k.kommun_slug === kommunSlug);
      const bidrag = kommun?.bidrag.find((b) => b.id === bidragId);
      if (!kommun || !bidrag) continue;

      await behandlaBidrag(sub.email, kommun, bidrag, today, raknare);
    }

    for (const stodId of sub.nationellaStod ?? []) {
      const stod = nationellaStod.find((s) => s.id === stodId && s.status === 'aktiv');
      if (stod) await behandlaNationelltStod(sub.email, stod, today, raknare);
    }
  }

  await registreraCronKorning('paminnelser', raknare.errors);

  return new Response(
    JSON.stringify({ today, subscribers: subscribers.length, ...raknare }),
    { headers: { 'content-type': 'application/json' } }
  );
};
