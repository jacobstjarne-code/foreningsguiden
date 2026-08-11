// GET /api/cron/giltighetsvarning — B4 (SPRINT: Produkten, Opus/Fable
// 2026-07-31), ombyggd C3.1/C3 REVIDERAD (Jacob 2026-08-11).
//
// Den GAMLA modellen (GILTIGHET_VARNING_DAGAR = 275) antog att ALLA
// kommuner har en ~365-dagars årsmötescykel och räknade mot fritext
// (Forutsattning.giltighet) — samma antagande som GiltighetsKontroll.
// astro:s gamla RISK_TROSKEL_DAGAR/GRANS_DAGAR, och samma fel: Helsingborgs
// källa säger "ett år från BESLUTSDAGEN", inte årsmötet, och flera av de
// 19 kommunerna med känd fritext har regler som inte är en 365-dagarscykel
// alls (Lund: var 13:e månad; Piteå/Täby/Trelleborg: fasta kalenderdatum;
// Nacka: ansökningsgap, inget datum). Diagnos 2026-08-11 (produktions-
// Redis, scripts/diagnos-giltighetsvarning.ts) bekräftade att cronet
// ALDRIG skickat något — 0 giltighetsvarningskickad-nycklar, 1 bekräftad
// prenumerant, 1 giltighetsbevakning. Ingen felaktig gissning nådde
// någonsin en verklig inkorg.
//
// Tre nivåer (samma modell som GiltighetsKontroll.astro):
//   NIVÅ 1 — kommun.giltighet_regel ger ett datum (giltighetRegelGerDatum,
//     kommunTyper.ts) → berakForfallodatum() räknar det exakta
//     förfallodatumet, varning två månader före (addMonths(-2)).
//     Idempotent per (kommun, förfallodatum, e-post) — samma nyckelrymd
//     som förut, men andra argumentet är nu förfallodatum, inte
//     årsmötesdatum (se subscribers.ts-kommentaren, säkert eftersom
//     nyckelrymden aldrig skrivits till).
//   NIVÅ 2 — regeln saknas/ger inget datum → ingen beräkning. En gång om
//     året, i januari (kommunernas deadlines klustrar februari–april, se
//     GILTIGHETSKOLL-kommentaren i content.ts). Idempotent per (kommun,
//     kalenderår, e-post) — egen nyckelrymd (giltighetsvarningNiva2*).
//
// DRY RUN (Jacob 2026-08-11, bekräftat via AskUserQuestion): NIVÅ 1/2:s
// mejltexter är inte skrivna än — MEJL.giltighetsvarning (content.ts)
// byggde på det gamla fritext/275-dagarsantagandet och passar inte de nya
// nivåerna (se mejl.ts:s sendGiltighetsvarning-kommentar). Samma klass av
// risk som {{FABLE:}}-platshållaren som hittades live i produktion
// tidigare i den här sessionen — hellre en tom logg än ett gissat mejl
// till en verklig inkorg. Cronet räknar ut ALLA rätta mottagare/datum och
// LOGGAR vad det skulle skicka, men anropar aldrig sendMejl och markerar
// aldrig som skickat. Byt till skarpt läge (anropa sendGiltighets-
// varningNiva1/Niva2, markera med markGiltighetsvarningSent/-Niva2Sent)
// när Opus/Fable levererat båda mejltexterna.
//
// Skyddad med CRON_SECRET, samma mönster som paminnelser.ts/utfallsfraga.
// ts. ?today= samma testkrok.
export const prerender = false;

import type { APIRoute } from 'astro';
import {
  loadKommuner, todayISO, giltighetRegelGerDatum, berakForfallodatum, addMonths,
} from '../../../lib/kommuner';
import {
  getAllConfirmedSubscribers, wasGiltighetsvarningSent, wasGiltighetsvarningNiva2Sent,
} from '../../../lib/subscribers';

export const GET: APIRoute = async ({ request, url }) => {
  const env = import.meta.env as unknown as Record<string, string>;
  const auth = request.headers.get('authorization');
  if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const today = url.searchParams.get('today') || todayISO();
  const todayManad = Number(today.slice(5, 7));
  const todayAr = today.slice(0, 4);

  const subscribers = await getAllConfirmedSubscribers();
  const kommuner = loadKommuner();

  let niva1SkulleSkickas = 0;
  let niva1RedanSkickat = 0;
  let niva2SkulleSkickas = 0;
  let niva2RedanSkickat = 0;
  const niva1Logg: string[] = [];
  const niva2Logg: string[] = [];
  const errors: string[] = [];

  for (const sub of subscribers) {
    const arsmoten = sub.giltighetArsmoten ?? {};
    for (const [kommunSlug, arsmotesdatum] of Object.entries(arsmoten)) {
      const kommun = kommuner.find((k) => k.kommun_slug === kommunSlug);
      if (!kommun) continue;

      try {
        const regel = kommun.giltighet_regel;
        if (giltighetRegelGerDatum(regel)) {
          // NIVÅ 1
          const forfallodatum = berakForfallodatum(regel!, arsmotesdatum);
          if (!forfallodatum) continue; // försvar — giltighetRegelGerDatum garanterar egentligen detta

          const paminnDatum = addMonths(forfallodatum, -2);
          if (today < paminnDatum) continue; // inte dags än

          const redanSkickat = await wasGiltighetsvarningSent(kommunSlug, forfallodatum, sub.email);
          if (redanSkickat) {
            niva1RedanSkickat++;
            continue;
          }

          niva1SkulleSkickas++;
          niva1Logg.push(`${sub.email} / ${kommunSlug} — förfaller ${forfallodatum} (årsmöte ${arsmotesdatum})`);
        } else {
          // NIVÅ 2 — bara i januari, en gång per (kommun, år, e-post)
          if (todayManad !== 1) continue;

          const redanSkickat = await wasGiltighetsvarningNiva2Sent(kommunSlug, todayAr, sub.email);
          if (redanSkickat) {
            niva2RedanSkickat++;
            continue;
          }

          niva2SkulleSkickas++;
          niva2Logg.push(`${sub.email} / ${kommunSlug} (årsmöte ${arsmotesdatum}, ingen känd regel)`);
        }
      } catch (e) {
        errors.push(`${sub.email}/${kommunSlug}: ${(e as Error).message}`);
      }
    }
  }

  return new Response(
    JSON.stringify({
      today,
      dryRun: true,
      subscribers: subscribers.length,
      niva1: { skulleSkickas: niva1SkulleSkickas, redanSkickat: niva1RedanSkickat, mottagare: niva1Logg },
      niva2: { skulleSkickas: niva2SkulleSkickas, redanSkickat: niva2RedanSkickat, mottagare: niva2Logg },
      errors,
    }),
    { headers: { 'content-type': 'application/json' } }
  );
};
