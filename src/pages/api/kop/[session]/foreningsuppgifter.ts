// POST /api/kop/[session]/foreningsuppgifter — §0 (SPEC_HUVUDPROCESSEN,
// Opus/Fable 2026-08-01). Fyra fält en registreringsansökan faktiskt
// kräver som tratten aldrig samlar in: föreningens namn,
// organisationsnummer, kontaktperson (namn + e-post), bankgiro eller
// plusgiro. Sparas på KÖPET (kop.ts), inte i föreningsprofilen — org.nr
// är en annan sorts uppgift än trattens grova intervall.
//
// Traditionell POST-redirect-GET, inget fetch/JS: mina-sidor/kop/
// [session]/ är redan SSR (prerender=false) och läser
// kop.foreningsuppgifter direkt vid varje anrop — en redirect tillbaka
// räcker för att "dokumentet regenereras när fälten sparas", ingen
// extra klientlogik behövs.
export const prerender = false;

import type { APIRoute } from 'astro';
import { metodEjTillaten } from '../../../../lib/httpSvar';
import { SESSION_COOKIE_NAMN, hamtaSessionEmail } from '../../../../lib/session';
import { hamtaAgtKop, sparaForeningsuppgifter } from '../../../../lib/kop';

export const POST: APIRoute = async ({ params, request, cookies, redirect }) => {
  const sessionId = params.session ?? '';
  const returPath = `/mina-sidor/kop/${encodeURIComponent(sessionId)}/`;

  const sessionToken = cookies.get(SESSION_COOKIE_NAMN)?.value;
  const email = sessionToken ? await hamtaSessionEmail(sessionToken) : null;
  if (!email) return redirect('/mina-sidor/', 303);

  const kop = await hamtaAgtKop(email, sessionId);
  if (!kop) return redirect('/mina-sidor/', 303);

  const form = await request.formData();
  await sparaForeningsuppgifter(sessionId, {
    namn: String(form.get('namn') ?? '').trim(),
    orgnr: String(form.get('orgnr') ?? '').trim(),
    kontaktperson: String(form.get('kontaktperson') ?? '').trim(),
    kontaktEpost: String(form.get('kontaktEpost') ?? '').trim(),
    bankgiroPlusgiro: String(form.get('bankgiroPlusgiro') ?? '').trim(),
  });

  return redirect(`${returPath}?sparat=1`, 303);
};

// AB1.6 (Jacobs order): GET på en POST-bar route ska svara 405, inte Astros
// egen 404 för en oexporterad metod — 404 säger "finns inte", 405 säger
// "finns, men inte så här".
export const GET: APIRoute = () => metodEjTillaten('POST');
