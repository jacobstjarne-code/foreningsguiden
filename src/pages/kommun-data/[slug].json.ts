// GET /kommun-data/[slug].json — matchningstrattens (turn-11) on-demand
// bidragsdata. Tratten (src/pages/matcha/index.astro) behöver bara
// kommunlistans namn/slug/län upfront (KommunValjare renderar redan det) —
// den fulla bidragslistan för VALD kommun hämtas härifrån med fetch() när
// fråga 1 besvarats, i stället för att bädda in alla 80+ kommuners
// bidragsdata i sidans initiala payload.
import type { APIRoute } from 'astro';
import { loadKommuner, individuelltBelopp } from '../../lib/kommuner';

export function getStaticPaths() {
  return loadKommuner().map((kommun) => ({
    params: { slug: kommun.kommun_slug },
    props: { kommun },
  }));
}

export const GET: APIRoute = ({ props }) => {
  const { kommun } = props as { kommun: ReturnType<typeof loadKommuner>[number] };
  const publicKommun = {
    ...kommun,
    // qa_anteckning är revisionsspår för oss, aldrig för besökaren (Opus
    // 2026-09-24) — det renderas inte, och ska inte heller ligga i publik JSON.
    bidrag: kommun.bidrag.map(({ qa_anteckning: _qa, ...bidrag }) => ({ ...bidrag, belopp: individuelltBelopp(bidrag as typeof kommun.bidrag[number]) })),
  };
  return new Response(JSON.stringify(publicKommun), { headers: { 'content-type': 'application/json' } });
};
