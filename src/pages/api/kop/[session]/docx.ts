// GET /api/kop/{session}/docx/ — H16 (SPEC: Det som återstår, 2026-07-28):
// Word-nedladdning av det köpta underlaget. Samma inloggnings- och
// ägarskapskontroll som mina-sidor/kop/[session]/index.astro
// (hamtaAgtKop, kop.ts) — en känd sessions-id räcker aldrig ensamt.
export const prerender = false;

import type { APIRoute } from 'astro';
import { SESSION_COOKIE_NAMN, hamtaSessionEmail } from '../../../../lib/session';
import { hamtaAgtKop } from '../../../../lib/kop';
import { getKommunBySlug } from '../../../../lib/kommuner';
import { kopChecklista, harvestBilagor } from '../../../../lib/kopDokument';
import { genereraKopDocx } from '../../../../lib/kopExport';
import { VAGLEDNING } from '../../../../lib/content';

export const GET: APIRoute = async ({ params, cookies }) => {
  const sessionId = params.session ?? '';
  const sessionToken = cookies.get(SESSION_COOKIE_NAMN)?.value;
  const email = sessionToken ? await hamtaSessionEmail(sessionToken) : null;
  if (!email) return new Response('Kräver inloggning.', { status: 401 });

  const kop = await hamtaAgtKop(email, sessionId);
  const kommun = kop ? getKommunBySlug(kop.kommunSlug) : null;
  if (!kop || !kommun) return new Response('Hittar inte köpet.', { status: 404 });

  const checklista = kopChecklista(kop, kommun);
  const bilagor = harvestBilagor(checklista);

  const buffer = await genereraKopDocx({
    kommunNamn: kommun.kommun,
    checklista,
    bilagor,
    ansokningssystemNamn: kommun.ansokningssystem.namn,
    ansokningssystemUrl: kommun.ansokningssystem.url,
    ansvarsrad: VAGLEDNING.station5.ansvar,
  });

  return new Response(buffer, {
    headers: {
      'content-type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'content-disposition': `attachment; filename="registreringschecklista-${kommun.kommun_slug}.docx"`,
    },
  });
};
