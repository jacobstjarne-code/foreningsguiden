// GET /api/cron/paminnelser — utskicksmotorn (SPRINT §Spår A). Körs dagligen
// via Vercel Cron (vercel.json, 07:00 UTC). Skickar MEJL.paminnelse14/
// paminnelse3 till BEKRÄFTADE prenumeranter vars bevakade kommuner har
// bidrag med fast deadline exakt 14 eller 3 dagar bort. Idempotent:
// wasReminderSent/markReminderSent (subscribers.ts) spårar per
// (typ, bidrag, faktiskt datum) — samma dag kan aldrig skicka två gånger
// även om cronjobbet triggas om.
//
// Skyddad med CRON_SECRET (Vercels standardmönster för att förhindra att
// endpointen triggas publikt — se vercel.com/docs/cron-jobs/manage-cron-jobs).
export const prerender = false;

import type { APIRoute } from 'astro';
import { loadKommuner, formatDate, formatWeekday, nextOccurrenceISO, daysUntil, todayISO } from '../../../lib/kommuner';
import { getAllConfirmedSubscribers, wasReminderSent, markReminderSent } from '../../../lib/subscribers';
import { sendPaminnelse14, sendPaminnelse3, siteUrl } from '../../../lib/mejl';

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

  let sent14 = 0;
  let sent3 = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const sub of subscribers) {
    for (const slug of sub.kommuner) {
      const kommun = kommuner.find((k) => k.kommun_slug === slug);
      if (!kommun) continue;

      for (const bidrag of kommun.bidrag) {
        if (bidrag.deadlines.typ !== 'fasta') continue;

        for (const mmdd of bidrag.deadlines.datum) {
          const occurrence = nextOccurrenceISO(mmdd, today);
          const days = daysUntil(occurrence, today);
          const typ: '14' | '3' | null = days === 14 ? '14' : days === 3 ? '3' : null;
          if (!typ) continue;

          const redanSkickat = await wasReminderSent(typ, bidrag.id, occurrence, sub.email);
          if (redanSkickat) {
            skipped++;
            continue;
          }

          const bidragLank = `${siteUrl()}/kommun/${kommun.kommun_slug}/#bidrag-${bidrag.id}`;
          try {
            if (typ === '14') {
              await sendPaminnelse14(sub.email, {
                bidragsnamn: bidrag.namn,
                kommun: kommun.kommun,
                datum: formatDate(occurrence),
                bidragLank,
              });
              sent14++;
            } else {
              await sendPaminnelse3(sub.email, {
                bidragsnamn: bidrag.namn,
                kommun: kommun.kommun,
                datum: formatDate(occurrence),
                veckodag: formatWeekday(occurrence),
                bidragLank,
              });
              sent3++;
            }
            await markReminderSent(typ, bidrag.id, occurrence, sub.email);
          } catch (e) {
            errors.push(`${sub.email}/${bidrag.id}/${typ}: ${(e as Error).message}`);
          }
        }
      }
    }
  }

  return new Response(
    JSON.stringify({ today, subscribers: subscribers.length, sent14, sent3, skipped, errors }),
    { headers: { 'content-type': 'application/json' } }
  );
};
