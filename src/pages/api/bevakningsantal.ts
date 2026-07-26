// GET /api/bevakningsantal?kommun=slug — live antal bekräftade prenumeranter
// som bevakar EN kommun (subscribers.ts countSubscribersByKommun).
// GET /api/bevakningsantal (utan kommun-param) — live GLOBALT antal
// bekräftade prenumeranter (getAllConfirmedSubscribers().length), för
// förstasidans aggregat.
// Egen rutt (prerender:false) eftersom sajten i övrigt är output:'static'
// — kommunsidan/förstasidan/väntelist-/registreringsytorna är förbyggda,
// så "live ur Redis, ingen cache" kräver ett separat, dynamiskt hämtat
// anrop klientsidan snarare än att baka in talet i statisk HTML.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getKommunBySlug, getDeadlineEntries, todayISO } from '../../lib/kommuner';
import {
  countSubscribersByKommun, getAllConfirmedSubscribers,
  getEarliestConfirmedRegistrationDate, countTrackedDeadlines,
} from '../../lib/subscribers';

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get('kommun');

  if (slug === null) {
    // Globalt läge — förstasidans live-datakort (turn-14). Tre tal, alla
    // live ur Redis: antal bekräftade prenumeranter, datumet för den
    // första av dem, och hur många kommande deadlines de sammanlagt
    // bevakar (kommun-för-kommun, kan räkna en deadline flera gånger om
    // flera prenumeranter delar kommun — avsiktligt, det är bevaknings-
    // RELATIONER som räknas, inte unika deadlines).
    const [alla, earliestDatum, antalDeadlines] = await Promise.all([
      getAllConfirmedSubscribers(),
      getEarliestConfirmedRegistrationDate(),
      countTrackedDeadlines(getDeadlineEntries(todayISO())),
    ]);
    return new Response(JSON.stringify({ antal: alla.length, earliestDatum, antalDeadlines }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  }

  if (!getKommunBySlug(slug)) {
    return new Response(JSON.stringify({ antal: 0 }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  const antal = await countSubscribersByKommun(slug);
  return new Response(JSON.stringify({ antal }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
};
