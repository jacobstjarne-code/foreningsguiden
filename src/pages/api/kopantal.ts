// GET /api/kopantal?kommun=slug — live antal bekräftade köp (registrering
// + bidragsutkast tillsammans) för EN kommun (kop.ts hamtaAllaKop, samma
// "läs alla, filtrera"-mönster som subscribers.ts countSubscribersByKommun).
// F① (konverteringsstapeln, 2026-08-12): social bevis-tröskeln — lokal och
// verifierbar, inte ett nationellt aggregat (DESIGN_UPPDRAG_2_KOMMERSIELL.md
// §3: "grannföreningen", inte logotyper/omdömen).
//
// Egen rutt (prerender:false) av samma skäl som bevakningsantal.ts —
// utkastvyn är förbyggd (getStaticPaths), så "live ur Redis" kräver ett
// separat klientanrop i stället för ett inbakat tal i den statiska HTML:en.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getKommunBySlug } from '../../lib/kommuner';
import { hamtaAllaKop } from '../../lib/kop';

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get('kommun');
  if (!slug || !getKommunBySlug(slug)) {
    return new Response(JSON.stringify({ antal: 0 }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  const alla = await hamtaAllaKop();
  const antal = alla.filter((k) => k.kommunSlug === slug).length;
  return new Response(JSON.stringify({ antal }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
};
