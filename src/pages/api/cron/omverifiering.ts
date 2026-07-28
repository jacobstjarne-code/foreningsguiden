// GET /api/cron/omverifiering — SPEC: Omverifiering (2026-07-27), steg 1:
// billig detektering, alla källor. Körs dagligen (samma cadence som de
// fyra befintliga crons) — "kör veckovis" i specen är den ÖVRE gränsen
// per KÄLLA (en källa ska inte gå längre än en vecka utan kontroll), inte
// ett krav på att själva triggern bara får köras en gång i veckan.
//
// Bearbetar ETT skift av kön per körning (de mest eftersläpande källorna),
// inte alla ~1000-2500 på en gång — självläkande: en källa som inte
// hinns med ligger kvar först i kön (dess senasteForsok bumpades inte)
// till nästa körning, aldrig permanent överhoppad.
//
// TIDSBUDGET, inte bara ett skift-tal: ett livetest mot riktiga
// kommunsidor (2026-07-28) visade 151s för 400 källor à 15 samtidiga
// (29 av dem otillgängliga/timeout — långt över den optimistiska
// gissningen på 60s). I stället för att gissa fram EN exakt skiftstorlek
// som råkar passa Vercel-kontots faktiska gräns: hämta ett generöst
// skift (räcker gott och väl, oavsett faktisk hastighet) och sluta
// PLOCKA UPP nya källor när tidsbudgeten är nära slut — pågående
// hämtningar hinner då avsluta inom bufferten, ingen risk för en hård
// timeout-krasch. Detta ÄR självläkningen: allt som inte hanns med
// ligger redan kvar först i kön.
export const prerender = false;
export const config = { maxDuration: 60 };

import type { APIRoute } from 'astro';
import { loadKommuner } from '../../../lib/kommuner';
import { synkaKoMedYaml, nastaSkift, kontrolleraKalla, byggBidragIndex, maxSenastVerifierad } from '../../../lib/omverifiering';

const SKIFT_STORLEK = 1000; // generöst — tidsbudgeten är den verkliga bromsen, inte detta talet
const SAMTIDIGHET = 20;
const TIDSBUDGET_MS = 48_000; // 48s av 60s maxDuration — resten är buffert för pågående anrop + svar

export const GET: APIRoute = async ({ request }) => {
  const env = import.meta.env as unknown as Record<string, string>;
  const auth = request.headers.get('authorization');
  if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const index = byggBidragIndex(loadKommuner());
  const { tillagda, borttagna } = await synkaKoMedYaml();
  const ko = await nastaSkift(SKIFT_STORLEK);

  let oforandrade = 0;
  let andrade = 0;
  let otillgangliga = 0;
  const errors: string[] = [];

  const start = Date.now();
  let cursor = 0;
  async function arbetare(): Promise<void> {
    while (cursor < ko.length && Date.now() - start < TIDSBUDGET_MS) {
      const url = ko[cursor++];
      try {
        const kontext = maxSenastVerifierad(index.get(url) ?? []);
        const record = await kontrolleraKalla(url, kontext);
        if (record.senasteUtfall === 'oforandrad') oforandrade++;
        else if (record.senasteUtfall === 'andrad') andrade++;
        else otillgangliga++;
      } catch (e) {
        errors.push(`${url}: ${(e as Error).message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(SAMTIDIGHET, ko.length) }, arbetare));

  return new Response(
    JSON.stringify({
      tillagda, borttagna, kikadeIKon: ko.length,
      kontrollerade: oforandrade + andrade + otillgangliga,
      oforandrade, andrade, otillgangliga, errors,
    }),
    { headers: { 'content-type': 'application/json' } }
  );
};
