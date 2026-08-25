// GET /api/kop/{session}/docx/ — H16 (SPEC: Det som återstår, 2026-07-28):
// Word-nedladdning av det köpta underlaget. Samma inloggnings- och
// ägarskapskontroll som mina-sidor/kop/[session]/index.astro
// (hamtaAgtKop, kop.ts) — en känd sessions-id räcker aldrig ensamt.
//
// Grenar på kop.produkt sedan 2026-07-30 (bidragsutkastet,
// CODE_UPPDRAG_KOMMERSIELL §1.B) — samma DokumentInnehall-rendering,
// olika källa (checklistaTillDokument vs bidragsutkastTillDokument).
export const prerender = false;

import type { APIRoute } from 'astro';
import { SESSION_COOKIE_NAMN, hamtaSessionEmail } from '../../../../lib/session';
import { hamtaAgtKop } from '../../../../lib/kop';
import { getKommunBySlug, bidragAnsokningsUrl, bidragAnsokningssystemNamn } from '../../../../lib/kommuner';
import { kopChecklista, kopBidragsutkast, harvestBilagor, harvestBilagorFranKrav } from '../../../../lib/kopDokument';
import { genereraKopDocx, checklistaTillDokument, bidragsutkastTillDokument } from '../../../../lib/kopExport';
import { VAGLEDNING } from '../../../../lib/content';

export const GET: APIRoute = async ({ params, cookies }) => {
  const sessionId = params.session ?? '';
  const sessionToken = cookies.get(SESSION_COOKIE_NAMN)?.value;
  const email = sessionToken ? await hamtaSessionEmail(sessionToken) : null;
  if (!email) return new Response('Kräver inloggning.', { status: 401 });

  const kop = await hamtaAgtKop(email, sessionId);
  const kommun = kop ? getKommunBySlug(kop.kommunSlug) : null;
  if (!kop || !kommun) return new Response('Hittar inte köpet.', { status: 404 });

  let filnamn: string;
  let buffer: Buffer;

  if (kop.produkt === 'bidragsutkast') {
    const bidrag = kop.bidragId ? kommun.bidrag.find((b) => b.id === kop.bidragId) : undefined;
    const doc = bidrag ? kopBidragsutkast(kop, kommun, bidrag) : null;
    if (!doc || !bidrag) return new Response('Underlaget kunde inte återskapas.', { status: 404 });
    const bilagor = harvestBilagorFranKrav(doc.kravRader);
    // AA1.4 (Jacobs order): bidragets EGEN ansökningsväg vinner över
    // kommunens generella system i det köpta underlaget — se pdf.ts:s
    // motsvarande kommentar.
    buffer = await genereraKopDocx(
      bidragsutkastTillDokument(doc, bilagor, bidragAnsokningssystemNamn(bidrag, kommun), bidragAnsokningsUrl(bidrag, kommun))
    );
    filnamn = `bidragsutkast-${kommun.kommun_slug}-${kop.bidragId}.docx`;
  } else {
    const checklista = kopChecklista(kop, kommun);
    const bilagor = harvestBilagor(checklista);
    buffer = await genereraKopDocx(
      checklistaTillDokument(kommun.kommun, checklista, bilagor, kommun.ansokningssystem.namn, kommun.ansokningssystem.url, VAGLEDNING.station5.ansvar, kop.foreningsuppgifter)
    );
    filnamn = `registreringschecklista-${kommun.kommun_slug}.docx`;
  }

  return new Response(buffer, {
    headers: {
      'content-type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'content-disposition': `attachment; filename="${filnamn}"`,
    },
  });
};
