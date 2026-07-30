// GET /api/inlamnad/{session}/{bidrag}/{svar}/ — H18 (SPEC: Det som
// återstår, 2026-07-28): klick på en av de två svarslänkarna i
// inlämningspåminnelsen (cron/inlamningspaminnelse.ts). Samma
// "path-parameter, GET-länk, engångsklick, egen liten bekräftelsesida"
// -mönster som api/utfall/[session]/[bidrag]/[svar].ts.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getKommunBySlug } from '../../../../../lib/kommuner';
import { hamtaKop, sparaInlamningssvar, type KopInlamningSvar } from '../../../../../lib/kop';

const GILTIGA_SVAR: readonly KopInlamningSvar[] = ['ja', 'nej'];

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

const SVAR_TEXT: Record<KopInlamningSvar, string> = {
  ja: 'Ansökan är inlämnad',
  nej: 'Ansökan är inte inlämnad än',
};

export const GET: APIRoute = async ({ params }) => {
  const sessionId = params.session ?? '';
  const bidragId = params.bidrag ?? '';
  const svar = params.svar as KopInlamningSvar;

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

  await sparaInlamningssvar(sessionId, bidragId, bidragNamn, svar);

  const kommunLank = kommun ? `https://foreningsguiden.se/kommun/${kommun.kommun_slug}/` : undefined;
  return sida('Tack för svaret', `Vi har sparat att ni svarade "${SVAR_TEXT[svar]}" för ${bidragNamn}.`, kommunLank);
};
