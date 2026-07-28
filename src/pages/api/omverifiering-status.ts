// GET /api/omverifiering-status?kommun=slug — SPEC: Omverifiering
// (2026-07-27), H27. Live ur Redis (samma "ingen cache"-princip som
// bevakningsantal.ts) — kommunsidan är statiskt byggd (getStaticPaths,
// prerender:true) och kan inte läsa cronets levande status server-sidan
// vid rendering, så en egen dynamisk rutt + klientsidan fetch krävs,
// samma mönster som den filen redan etablerat.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getKommunBySlug } from '../../lib/kommuner';
import { omverifieringStatusForKommun } from '../../lib/omverifiering';

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get('kommun');
  const kommun = slug ? getKommunBySlug(slug) : null;

  if (!kommun) {
    return new Response(JSON.stringify({ status: 'unknown' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const resultat = await omverifieringStatusForKommun(kommun);
  return new Response(JSON.stringify(resultat), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
};
