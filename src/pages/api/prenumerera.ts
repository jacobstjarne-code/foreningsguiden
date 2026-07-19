// POST /api/prenumerera — §6 UPPDRAG_POC.md. Dubbel opt-in aktiverad
// (SPRINT §Spår A, 2026-07-18): skapar en OBEKRÄFTAD prenumerant och
// skickar MEJL.bekraftelse. Bevakningen börjar först vid klick på länken
// (GET /api/bekrafta) — se subscribers.ts.
export const prerender = false;

import type { APIRoute } from 'astro';
import { loadKommuner, svenskLista } from '../../lib/kommuner';
import { addPendingSubscriber } from '../../lib/subscribers';
import { sendBekraftelse } from '../../lib/mejl';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const samtycke = form.get('samtycke');
  const alla = loadKommuner();
  const giltigaSlugs = new Set(alla.map((k) => k.kommun_slug));
  const kommunSlugs = form.getAll('kommuner').map(String).filter((slug) => giltigaSlugs.has(slug));

  if (!EMAIL_RE.test(email) || !samtycke || kommunSlugs.length === 0) {
    return new Response('Ogiltig anmälan — e-post, samtycke och minst en kommun krävs.', { status: 400 });
  }

  const { token, alreadyConfirmed } = await addPendingSubscriber(email, kommunSlugs);

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
