// POST /api/prenumerera — §6 UPPDRAG_POC.md. Dubbel opt-in aktiverad
// (SPRINT §Spår A, 2026-07-18): skapar en OBEKRÄFTAD prenumerant och
// skickar MEJL.bekraftelse. Bevakningen börjar först vid klick på länken
// (GET /api/bekrafta) — se subscribers.ts.
export const prerender = false;

import type { APIRoute } from 'astro';
import { metodEjTillaten } from '../../lib/httpSvar';
import { loadKommuner, svenskLista } from '../../lib/kommuner';
import { addPendingSubscriber } from '../../lib/subscribers';
import { sendBekraftelse } from '../../lib/mejl';
import { underGransen, klientIdentitet } from '../../lib/rateLimit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// M2.6 (Jacob 2026-08-17): endpointen mejlar en GODTYCKLIG adress —
// utan spärr kan den missbrukas för att spamma en tredje parts inkorg
// med bekräftelsemejl, inte bara bränna vår Resend-kvot. Två räknare:
// IP (snabb utskicksfrekvens) och mål-e-post (samma offer via många
// IP-adresser).
const EMAIL_MAX = 254; // RFC 5321
const FORENINGSNAMN_MAX = 200;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const samtycke = form.get('samtycke');
  // C1 (ARBETSORDER 2026-08-11): frivilligt — tomt fält skickas som
  // undefined, aldrig en tom sträng vidare (se addPendingSubscriber-
  // kommentaren om varför en tom sträng aldrig får skriva över ett
  // tidigare sparat namn).
  const foreningsnamnRaw = String(form.get('foreningsnamn') ?? '').trim();
  const foreningsnamn = foreningsnamnRaw || undefined;
  const alla = loadKommuner();
  const giltigaSlugs = new Set(alla.map((k) => k.kommun_slug));
  const kommunSlugs = form.getAll('kommuner').map(String).filter((slug) => giltigaSlugs.has(slug));

  if (!EMAIL_RE.test(email) || email.length > EMAIL_MAX || !samtycke || kommunSlugs.length === 0 || foreningsnamnRaw.length > FORENINGSNAMN_MAX) {
    return new Response('Ogiltig anmälan — e-post, samtycke och minst en kommun krävs.', { status: 400 });
  }

  if (!(await underGransen('prenumerera-ip', klientIdentitet(request), 5, '10 m')) || !(await underGransen('prenumerera-epost', email, 5, '1 h'))) {
    return new Response('För många försök. Vänta en stund och försök igen.', { status: 429 });
  }

  const { token, alreadyConfirmed } = await addPendingSubscriber(email, kommunSlugs, foreningsnamn);

  // Redan bekräftad adress — kommunerna är tillagda direkt (subscribers.ts),
  // inget nytt mejl att skicka. Egen redirect-status så EmailSignup inte
  // påstår "vi har skickat ett bekräftelsemejl" om inget skickades.
  if (alreadyConfirmed || !token) {
    return redirect('/deadlines/?bevakning=uppdaterad', 303);
  }

  const kommunNamn = kommunSlugs
    .map((slug) => alla.find((k) => k.kommun_slug === slug)?.kommun)
    .filter((namn): namn is string => !!namn);

  try {
    await sendBekraftelse(email, svenskLista(kommunNamn), token);
  } catch (e) {
    // Prenumeranten är redan sparad (addPendingSubscriber ovan) — bara
    // mejlet failade. Samma 502-mönster som /api/giltighetsbevakning:
    // svara kontrollerat i stället för att krascha på Astros generiska
    // felsida på produktens enda aktiva löfte.
    console.error('prenumerera: bekräftelsemejl misslyckades', e);
    return new Response(JSON.stringify({ ok: false }), { status: 502, headers: { 'content-type': 'application/json' } });
  }

  return redirect('/deadlines/?bevakning=klar', 303);
};

// AB1.6 (Jacobs order): GET på en POST-bar route ska svara 405, inte Astros
// egen 404 för en oexporterad metod — 404 säger "finns inte", 405 säger
// "finns, men inte så här".
export const GET: APIRoute = () => metodEjTillaten('POST');
