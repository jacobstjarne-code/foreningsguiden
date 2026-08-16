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
// NIVÅ 2 (2026-08-16, J1): LIVE. MEJLTEXTER.md #4 levererad av Opus —
// sendGiltighetsvarningNiva2 (mejl.ts) anropas nu, markGiltighetsvarning-
// Niva2Sent sätts vid lyckad sändning. Verifierat riskfritt innan
// omkopplingen: dry run-räkningen var 0 för NIVÅ 2 (fel månad, bara
// januari triggar) OCH 0 för NIVÅ 1 (ingen kommun har giltighet_regel) —
// ingen bakgrundsfylld mottagare kunde få ett förvånande första-mejl.
//
// NIVÅ 1 KVAR I DRY RUN (2026-08-16, J2): MEJLTEXTER.md #5 OCH
// regeltext-frastabellen finns nu (regeltext(), kommunTyper.ts) — loggen
// nedan räknar ut och visar frasen för varje mottagare, som bevis på att
// den är redo. Ändå ingen avsändning: Jacob (2026-08-16) "renderas
// aldrig i dag — giltighet_regel finns i noll kommuner — men texten ska
// ligga klar när G1 landar." G1 (kommun.giltighet_regel populerad i
// datan) är den enda kvarvarande spärren nu. Koppla NIVÅ 1 till
// sendGiltighetsvarningNiva1 (mejl.ts) när G1 landar.
//
// J3 (2026-08-16): kalenderar och fast_datum ger nu BÅDA ett beräknat
// förfallodatum (berakForfallodatum, kommunTyper.ts) — giltighetRegelGer-
// Datum() räknar dem till NIVÅ 1, inte NIVÅ 2 som förut. Ändrar inte
// grenlogiken nedan (den läser redan giltighetRegelGerDatum() rakt av),
// bara vilka typer som faktiskt tar den grenen.
//
// Skyddad med CRON_SECRET, samma mönster som paminnelser.ts/utfallsfraga.
// ts. ?today= samma testkrok.
export const prerender = false;

import type { APIRoute } from 'astro';
import {
  loadKommuner, todayISO, giltighetRegelGerDatum, berakForfallodatum, addMonths, regeltext,
} from '../../../lib/kommuner';
import { sendGiltighetsvarningNiva2, siteUrl } from '../../../lib/mejl';
import {
  getAllConfirmedSubscribers, wasGiltighetsvarningSent, wasGiltighetsvarningNiva2Sent,
  markGiltighetsvarningNiva2Sent,
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
          const forfallodatum = berakForfallodatum(regel!, arsmotesdatum, today);
          if (!forfallodatum) continue; // försvar — giltighetRegelGerDatum garanterar egentligen detta

          const paminnDatum = addMonths(forfallodatum, -2);
          if (today < paminnDatum) continue; // inte dags än

          const redanSkickat = await wasGiltighetsvarningSent(kommunSlug, forfallodatum, sub.email);
          if (redanSkickat) {
            niva1RedanSkickat++;
            continue;
          }

          // regeltext() (kommunTyper.ts) — inte null här (J3): alla typer
          // giltighetRegelGerDatum() släpper igenom hit (manader_efter_*,
          // kalenderar, fast_datum) har en rad i regeltext()-tabellen.
          const fras = regeltext(regel!);

          niva1SkulleSkickas++;
          niva1Logg.push(`${sub.email} / ${kommunSlug} — förfaller ${forfallodatum} (årsmöte ${arsmotesdatum}, regeltext: "${fras}")`);
        } else {
          // NIVÅ 2 — bara i januari, en gång per (kommun, år, e-post)
          if (todayManad !== 1) continue;

          const redanSkickat = await wasGiltighetsvarningNiva2Sent(kommunSlug, todayAr, sub.email);
          if (redanSkickat) {
            niva2RedanSkickat++;
            continue;
          }

          await sendGiltighetsvarningNiva2(sub.email, {
            kommun: kommun.kommun,
            kalla_url: `${siteUrl()}/kommun/${kommunSlug}/`,
          });
          await markGiltighetsvarningNiva2Sent(kommunSlug, todayAr, sub.email);

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
      // NIVÅ 1 fortfarande dry run (se filhuvudet), NIVÅ 2 live sedan
      // J1 (2026-08-16) — "niva2SkulleSkickas" är nu antal FAKTISKT
      // skickade, fältnamnet oförändrat för att inte bryta ev. loggparsning.
      niva1DryRun: true,
      niva2Live: true,
      subscribers: subscribers.length,
      niva1: { skulleSkickas: niva1SkulleSkickas, redanSkickat: niva1RedanSkickat, mottagare: niva1Logg },
      niva2: { skickade: niva2SkulleSkickas, redanSkickat: niva2RedanSkickat, mottagare: niva2Logg },
      errors,
    }),
    { headers: { 'content-type': 'application/json' } }
  );
};
