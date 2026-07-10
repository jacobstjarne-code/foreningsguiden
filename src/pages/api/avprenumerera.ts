// POST /api/avprenumerera — GDPR-avregistreringsväg (§6 UPPDRAG_POC.md).
// Enkel e-post-baserad borttagning. Ingen tokensignerad länk i PoC — utskicks-
// motorn byggs inte nu (§6), så det finns inget mejl att sätta en länk i än.
export const prerender = false;

import type { APIRoute } from 'astro';
import { removeSubscriber } from '../../lib/subscribers';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();

  if (!EMAIL_RE.test(email)) {
    return new Response('Ogiltig e-postadress.', { status: 400 });
  }

  await removeSubscriber(email);

  return redirect('/deadlines/?avanmald=klar', 303);
};
