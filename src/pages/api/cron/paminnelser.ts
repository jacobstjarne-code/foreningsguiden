// GET /api/cron/paminnelser — utskicksmotorn (SPRINT §Spår A). Körs dagligen
// via Vercel Cron (vercel.json, 07:00 UTC). Skickar MEJL.paminnelse14/
// paminnelse3 till BEKRÄFTADE prenumeranter vars bevakade kommuner har
// bidrag med fast deadline exakt 14 eller 3 dagar bort. Idempotent:
// wasReminderSent/markReminderSent (subscribers.ts) spårar per
// (typ, bidrag, faktiskt datum) — samma dag kan aldrig skicka två gånger
// även om cronjobbet triggas om.
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
import { loadKommuner, formatDate, formatWeekday, nextOccurrenceISO, daysUntil, todayISO } from '../../../lib/kommuner';
import type { Kommun, Bidrag } from '../../../lib/kommuner';
import { getAllConfirmedSubscribers, wasReminderSent, markReminderSent } from '../../../lib/subscribers';
import { sendPaminnelse14, sendPaminnelse3, siteUrl } from '../../../lib/mejl';

interface Raknare {
  sent14: number;
  sent3: number;
  skipped: number;
  errors: string[];
}

async function behandlaBidrag(email: string, kommun: Kommun, bidrag: Bidrag, today: string, raknare: Raknare): Promise<void> {
  if (bidrag.deadlines.typ !== 'fasta') return;

  for (const mmdd of bidrag.deadlines.datum) {
    const occurrence = nextOccurrenceISO(mmdd, today);
    const days = daysUntil(occurrence, today);
    const typ: '14' | '3' | null = days === 14 ? '14' : days === 3 ? '3' : null;
    if (!typ) continue;

    const redanSkickat = await wasReminderSent(typ, bidrag.id, occurrence, email);
    if (redanSkickat) {
      raknare.skipped++;
      continue;
    }

    const bidragLank = `${siteUrl()}/kommun/${kommun.kommun_slug}/#bidrag-${bidrag.id}`;
    try {
      if (typ === '14') {
        await sendPaminnelse14(email, {
          bidragsnamn: bidrag.namn,
          kommun: kommun.kommun,
          datum: formatDate(occurrence),
          bidragLank,
        });
        raknare.sent14++;
      } else {
        await sendPaminnelse3(email, {
          bidragsnamn: bidrag.namn,
          kommun: kommun.kommun,
          datum: formatDate(occurrence),
          veckodag: formatWeekday(occurrence),
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
  // av endpointen. Låter oss verifiera 14-/3-dagarslogiken mot en riktig
  // kommande deadline utan att vänta på kalendern eller fabricera data.
  const today = url.searchParams.get('today') || todayISO();
  const subscribers = await getAllConfirmedSubscribers();
  const kommuner = loadKommuner();

  const raknare: Raknare = { sent14: 0, sent3: 0, skipped: 0, errors: [] };

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
  }

  return new Response(
    JSON.stringify({ today, subscribers: subscribers.length, ...raknare }),
    { headers: { 'content-type': 'application/json' } }
  );
};
