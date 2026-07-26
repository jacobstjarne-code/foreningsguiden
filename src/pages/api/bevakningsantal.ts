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
import { getKommunBySlug } from '../../lib/kommuner';
import { countSubscribersByKommun, getAllConfirmedSubscribers } from '../../lib/subscribers';

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get('kommun');

  if (slug === null) {
    const alla = await getAllConfirmedSubscribers();
    return new Response(JSON.stringify({ antal: alla.length }), {
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
