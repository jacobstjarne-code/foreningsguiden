// /llms.txt — SOKBARHETSSPEC §5.2. B2A-yta: curerad karta över sajtens
// innehåll för AI-agenter. Innehållstexten är Fable (LLMS_TXT i content.ts);
// länklistan är datadriven (Code).
export const prerender = true;

import type { APIRoute } from 'astro';
import { loadKommuner } from '../lib/kommuner';
import { LLMS_TXT } from '../lib/content';

export const GET: APIRoute = ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? '';
  const kommuner = loadKommuner();

  const kommunLankar = kommuner
    .map((k) => `- [${k.kommun}](${base}/kommun/${k.kommun_slug}/)`)
    .join('\n');

  const body = [
    LLMS_TXT.rubrik,
    '',
    LLMS_TXT.sammanfattning,
    '',
    LLMS_TXT.sektionKommuner,
    kommunLankar,
    '',
    LLMS_TXT.sektionResurser,
    `- [Deadlinekalender](${base}/deadlines/)`,
    `- [Om och metod](${base}/om/)`,
    '',
  ].join('\n');

  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
