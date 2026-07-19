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

  const token = await addPendingSubscriber(email, kommunSlugs);
  const kommunNamn = kommunSlugs
    .map((slug) => alla.find((k) => k.kommun_slug === slug)?.kommun)
    .filter((namn): namn is string => !!namn);

  await sendBekraftelse(email, svenskLista(kommunNamn), token);

  return redirect('/deadlines/?bevakning=klar', 303);
};
