// GET /api/kop/{session}/pdf/ — H16 (SPEC: Det som återstår, 2026-07-28):
// PDF-nedladdning av det köpta underlaget. Samma inloggnings- och
// ägarskapskontroll som docx.ts/mina-sidor/kop/[session]/index.astro.
//
// Grenar på kop.produkt sedan 2026-07-30 — se docx.ts:s motsvarande kommentar.
export const prerender = false;

import type { APIRoute } from 'astro';
import { SESSION_COOKIE_NAMN, hamtaSessionEmail } from '../../../../lib/session';
import { hamtaAgtKop } from '../../../../lib/kop';
import { getKommunBySlug, bidragAnsokningsUrl, bidragAnsokningssystemNamn } from '../../../../lib/kommuner';
import { kopChecklista, kopBidragsutkast, harvestBilagor, harvestBilagorFranKrav } from '../../../../lib/kopDokument';
import { genereraKopPdf, checklistaTillDokument, bidragsutkastTillDokument } from '../../../../lib/kopExport';
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
  let bytes: Uint8Array;

  if (kop.produkt === 'bidragsutkast') {
    const bidrag = kop.bidragId ? kommun.bidrag.find((b) => b.id === kop.bidragId) : undefined;
    const doc = bidrag ? kopBidragsutkast(kop, kommun, bidrag) : null;
    if (!doc || !bidrag) return new Response('Underlaget kunde inte återskapas.', { status: 404 });
    const bilagor = harvestBilagorFranKrav(doc.kravRader);
    // AA1.4 (Jacobs order): bidragets EGEN ansökningsväg vinner över
    // kommunens generella system i det köpta underlaget — samma spärr
    // som bidragAnsokningsUrl redan garanterar för URL:en (kalla_url),
    // nu även för systemNAMNET (ansokningsvag).
    bytes = await genereraKopPdf(
      bidragsutkastTillDokument(doc, bilagor, bidragAnsokningssystemNamn(bidrag, kommun), bidragAnsokningsUrl(bidrag, kommun))
    );
    // AB1.4 (Jacobs order): filnamnet sa "bidragsutkast", produkten heter
    // ansökningschecklista — matchar nu registrering-grenens egen
    // "registreringschecklista-...", ett par rader ner.
    filnamn = `ansokningschecklista-${kommun.kommun_slug}-${kop.bidragId}.pdf`;
  } else {
    const checklista = kopChecklista(kop, kommun);
    const bilagor = harvestBilagor(checklista);
    bytes = await genereraKopPdf(
      checklistaTillDokument(kommun.kommun, checklista, bilagor, kommun.ansokningssystem.namn, kommun.ansokningssystem.url, VAGLEDNING.station5.ansvar, kop.foreningsuppgifter)
    );
    filnamn = `registreringschecklista-${kommun.kommun_slug}.pdf`;
  }

  return new Response(bytes, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${filnamn}"`,
    },
  });
};
