// GET /api/utfall/{session}/{bidrag}/{svar}/ — H19 (SPEC: Kluster 1 —
// efter-köp-ytan, 2026-07-28): klick på en av de tre svarslänkarna i
// utfallsfrågan (cron/utfallsfraga.ts). Samma "path-parameter, GET-länk,
// engångsklick"-mönster som api/bekrafta/[token].ts — men returnerar en
// egen liten bekräftelsesida direkt i stället för att redirecta till en
// befintlig Astro-sida: ingen naturlig hemvist finns (Mina sidor kräver
// inloggning, kommunsidan är statiskt byggd och kan inte läsa en
// querysträng server-side) för ett fire-and-forget-klick från en
// e-postklient.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getKommunBySlug } from '../../../../../lib/kommuner';
import { hamtaKop, sparaUtfallssvar, type KopUtfallSvar } from '../../../../../lib/kop';

const GILTIGA_SVAR: readonly KopUtfallSvar[] = ['beviljat', 'avslag', 'vet_inte'];

function sida(rubrik: string, text: string, kommunLank?: string): Response {
  const html = `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${rubrik} — Föreningsguiden</title>
</head>
<body style="font-family: system-ui, sans-serif; max-width: 40ch; margin: 4rem auto; padding: 0 1.5rem; color: #1a1a1a;">
<h1 style="font-size: 1.3rem;">${rubrik}</h1>
<p>${text}</p>
${kommunLank ? `<p><a href="${kommunLank}">Till kommunens bidragssida</a></p>` : ''}
</body>
</html>`;
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}

export const GET: APIRoute = async ({ params }) => {
  const sessionId = params.session ?? '';
  const bidragId = params.bidrag ?? '';
  const svar = params.svar as KopUtfallSvar;

  if (!GILTIGA_SVAR.includes(svar)) {
    return sida('Länken fungerar inte', 'Det här svarsalternativet finns inte.');
  }

  const kop = await hamtaKop(sessionId);
  if (!kop) {
    return sida('Länken fungerar inte', 'Länken kan ha gått ut eller redan använts.');
  }

  const kommun = getKommunBySlug(kop.kommunSlug);
  const bidrag = kommun?.bidrag.find((b) => b.id === bidragId);
  const bidragNamn = bidrag?.namn ?? bidragId;

  await sparaUtfallssvar(sessionId, bidragId, bidragNamn, svar);

  const kommunLank = kommun ? `https://foreningsguiden.se/kommun/${kommun.kommun_slug}/` : undefined;
  return sida('Tack för svaret', `Vi har sparat att ni svarade "${SVAR_TEXT[svar]}" för ${bidragNamn}. Det hjälper oss göra utkasten bättre.`, kommunLank);
};

const SVAR_TEXT: Record<KopUtfallSvar, string> = {
  beviljat: 'Vi fick bidraget',
  avslag: 'Vi fick avslag',
  vet_inte: 'Vet inte än',
};
