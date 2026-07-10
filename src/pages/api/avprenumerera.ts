// POST /api/avprenumerera — GDPR-avregistreringsväg (§6 UPPDRAG_POC.md).
// Enkel e-post-baserad borttagning via /avregistrera/ — ingen tokensignerad
// mejllänk i PoC (utskicksmotorn är inte byggd, §6). Mekanismen är Codes
// beslut, rapporterad till Fable för integritetsrad-justering.
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

  return redirect('/avregistrera/?klar=1', 303);
};
