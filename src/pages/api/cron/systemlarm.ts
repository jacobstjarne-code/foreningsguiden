// GET /api/cron/systemlarm — AB1.3 (Jacobs order, auditens P1). Körs
// dagligen 14:00 UTC (efter samtliga sju övriga crons, 07-13 UTC), det
// åttonde vercel.json-schemat. Larmar på EXAKT fem villkor, inget annat,
// och bara via ett mejl till Jacob — ingen dashboard:
//
// 1. Webhook 5xx/fastnat i retry  — stripe-webhook.ts:s KRITISKA gren
//    (M1.2) registrerar varje 500 i larm.ts. Samma event-id upprepat i
//    exempellistan = Stripe försöker om och om igen på samma event
//    ("fastnat i retry"), inte bara "gav 5xx en gång".
// 2. Cron ej körd/fel             — heartbeat (larm.ts) skriven sist i
//    varje övrigt cron/*.ts. Uteblivet = ingen heartbeat på över
//    CRON_UTEBLIVEN_TIMMAR timmar. En cron UTAN NÅGON heartbeat alls
//    (nyss deployad, aldrig observerad) hoppas över tyst — annars
//    larmar den falskt hela första dygnet efter varje ny cron.
// 3. Mejlfel över tröskel         — kastMejlFel (mejl.ts) registrerar
//    varje Resend-fel. MEJL_FEL_TROSKEL (larm.ts) skiljer enstaka
//    studsar från ett systemproblem.
// 4. Källa olästbar efter försök  — redan byggd infrastruktur
//    (omverifiering.ts, H27): konsekutivaFel >= OMVERIFIERING_MAX_
//    KONSEKUTIVA_FEL. Ingen ny räknare, bara en ny läsare av en
//    befintlig.
// 5. Växande granskningskö        — samma källdata som 4
//    (hamtaFlaggade(), "allt som inte är oforandrad"), jämfört mot
//    föregående körnings storlek (larm.ts). Ålder på äldsta öppna post
//    rapporteras varje gång kön faktiskt växt, inte annars.
//
// Skickar EXAKT ETT mejl per körning, bara om minst ett villkor
// utlöstes — tyst annars, samma "tyst om allt är synkat"-princip som
// deploy-sync-hooken (Bandy Manager-CLAUDE.md, samma författare/Jacob).
export const prerender = false;

import type { APIRoute } from 'astro';
import {
  hamtaOchNollstallWebhookFel, hamtaOchNollstallMejlFel, hamtaCronHeartbeat,
  hamtaGranskningForegaende, sparaGranskningStorlek, KANDA_CRON_NAMN,
  CRON_UTEBLIVEN_TIMMAR, MEJL_FEL_TROSKEL,
} from '../../../lib/larm';
import { bedomCron, granskningVaxer, aldstDatum } from '../../../lib/larmLogik';
import { hamtaFlaggade } from '../../../lib/omverifiering';
import { OMVERIFIERING_MAX_KONSEKUTIVA_FEL } from '../../../lib/omverifieringLogik';
import { sendSystemlarm } from '../../../lib/mejl';

const EXEMPEL_VISADE = 5; // tak på hur många exempel som listas per sektion i mejlet

export const GET: APIRoute = async ({ request }) => {
  const env = import.meta.env as unknown as Record<string, string>;
  const auth = request.headers.get('authorization');
  if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const rubriker: string[] = [];
  const sektioner: string[] = [];

  // 1. Webhook 5xx/fastnat i retry
  const webhook = await hamtaOchNollstallWebhookFel();
  if (webhook.antal > 0) {
    rubriker.push('Webhook');
    sektioner.push(
      [`WEBHOOK — ${webhook.antal} icke-2xx-svar sedan senaste kollen.`, ...webhook.exempel.slice(0, EXEMPEL_VISADE)].join('\n')
    );
  }

  // 2. Cron ej körd/fel
  const nu = Date.now();
  const cronProblem: string[] = [];
  for (const namn of KANDA_CRON_NAMN) {
    const heartbeat = await hamtaCronHeartbeat(namn);
    const bedomning = bedomCron(namn, heartbeat, nu, CRON_UTEBLIVEN_TIMMAR);
    if (bedomning.status === 'uteblivet' || bedomning.status === 'fel') {
      cronProblem.push(`${namn}: ${bedomning.meddelande}`);
    }
  }
  if (cronProblem.length > 0) {
    rubriker.push('Cron');
    sektioner.push(['CRON.'].concat(cronProblem).join('\n'));
  }

  // 3. Mejlfel över tröskel
  const mejl = await hamtaOchNollstallMejlFel();
  if (mejl.antal >= MEJL_FEL_TROSKEL) {
    rubriker.push('Mejl');
    sektioner.push(
      [`MEJL — ${mejl.antal} skickfel sedan senaste kollen (tröskel ${MEJL_FEL_TROSKEL}).`, ...mejl.exempel.slice(0, EXEMPEL_VISADE)].join('\n')
    );
  }

  // 4 + 5 delar källdata (omverifiering.ts:s hamtaFlaggade — allt som inte är 'oforandrad')
  const flaggade = await hamtaFlaggade();

  const olasbara = flaggade.filter((s) => s.konsekutivaFel >= OMVERIFIERING_MAX_KONSEKUTIVA_FEL);
  if (olasbara.length > 0) {
    rubriker.push('Källor');
    sektioner.push(
      [
        `KÄLLOR — ${olasbara.length} källa/källor olästbara ${OMVERIFIERING_MAX_KONSEKUTIVA_FEL}+ gånger i rad.`,
        ...olasbara.slice(0, EXEMPEL_VISADE).map((s) => `${s.url} (${s.konsekutivaFel} försök, senast: ${s.senasteFel ?? 'okänt fel'})`),
      ].join('\n')
    );
  }

  const foregaendeStorlek = await hamtaGranskningForegaende();
  const nuvarandeStorlek = flaggade.length;
  if (granskningVaxer(nuvarandeStorlek, foregaendeStorlek)) {
    const aldsta = aldstDatum(flaggade.map((s) => s.flaggadSedan ?? s.senasteForsok.slice(0, 10)));
    const dagarAldst = aldsta ? Math.floor((Date.now() - Date.parse(aldsta)) / (1000 * 60 * 60 * 24)) : null;
    rubriker.push('Granskningskö');
    sektioner.push(
      `GRANSKNINGSKÖ — växte från ${foregaendeStorlek} till ${nuvarandeStorlek} sedan senaste kollen. Äldsta öppna post: ${aldsta ?? 'okänt'}${dagarAldst !== null ? ` (${dagarAldst} dagar)` : ''}.`
    );
  }
  await sparaGranskningStorlek(nuvarandeStorlek);

  if (rubriker.length === 0) {
    return new Response(JSON.stringify({ larm: false }), { headers: { 'content-type': 'application/json' } });
  }

  await sendSystemlarm({ rubriker, kropp: sektioner.join('\n\n') });

  return new Response(JSON.stringify({ larm: true, rubriker }), { headers: { 'content-type': 'application/json' } });
};
