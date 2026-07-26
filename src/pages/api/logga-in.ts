/**
 * POST /api/logga-in — H29 (GRANSKNING_foreningsguiden.md). Skickar en
 * magic-länk till angiven e-post, oavsett om den redan har en
 * Subscriber-post eller inte (svarar likadant i båda fallen — avslöjar
 * aldrig om en adress finns i systemet, samma resonemang som
 * lösenordsåterställningsflöden generellt).
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { skapaInloggningstoken } from '../../lib/session';
import { sendInloggningsLank } from '../../lib/mejl';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();

  if (!EMAIL_RE.test(email)) {
    return new Response('Ogiltig e-postadress.', { status: 400 });
  }

  const token = await skapaInloggningstoken(email);
  await sendInloggningsLank(email, token);

  return redirect('/mina-sidor/?skickat=1', 303);
};
