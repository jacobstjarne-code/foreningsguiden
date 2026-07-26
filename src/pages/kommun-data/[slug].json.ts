// GET /kommun-data/[slug].json — matchningstrattens (turn-11) on-demand
// bidragsdata. Tratten (src/pages/matcha/index.astro) behöver bara
// kommunlistans namn/slug/län upfront (KommunValjare renderar redan det) —
// den fulla bidragslistan för VALD kommun hämtas härifrån med fetch() när
// fråga 1 besvarats, i stället för att bädda in alla 80+ kommuners
// bidragsdata i sidans initiala payload.
import type { APIRoute } from 'astro';
import { loadKommuner } from '../../lib/kommuner';

export function getStaticPaths() {
  return loadKommuner().map((kommun) => ({
    params: { slug: kommun.kommun_slug },
    props: { kommun },
  }));
}

export const GET: APIRoute = ({ props }) => {
  const { kommun } = props as { kommun: ReturnType<typeof loadKommuner>[number] };
  return new Response(JSON.stringify(kommun), { headers: { 'content-type': 'application/json' } });
};
