/**
 * POST /api/byt-epost — H29-tillägg (Mina sidor: byt e-post). Kräver en
 * giltig sessionscookie — INTE bara att man skriver in en "gammal"
 * e-post i formuläret. Utan den spärren kunde vem som helst döpa om en
 * känd förenings-adress till sin egen genom att bara ange sin egen
 * adress som "ny" (bekräftelsen går bara till den nya adressen, som
 * angriparen kontrollerar) — kräver detta att angriparen redan är
 * inloggad som offret, ett helt annat och mycket svårare hot.
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { metodEjTillaten } from '../../lib/httpSvar';
import { SESSION_COOKIE_NAMN, hamtaSessionEmail, skapaEpostbytestoken } from '../../lib/session';
import { sendEpostbyteLank } from '../../lib/mejl';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const sessionToken = cookies.get(SESSION_COOKIE_NAMN)?.value;
  const oldEmail = sessionToken ? await hamtaSessionEmail(sessionToken) : null;
  if (!oldEmail) {
    return new Response('Inte inloggad.', { status: 401 });
  }

  const form = await request.formData();
  const newEmail = String(form.get('ny_epost') ?? '').trim();

  if (!EMAIL_RE.test(newEmail) || newEmail.toLowerCase() === oldEmail.toLowerCase()) {
    return new Response('Ogiltig e-postadress.', { status: 400 });
  }

  const token = await skapaEpostbytestoken(oldEmail, newEmail);
  await sendEpostbyteLank(newEmail, token);

  return redirect('/mina-sidor/?epostbyte=skickat', 303);
};

// AB1.6 (Jacobs order): GET på en POST-bar route ska svara 405, inte Astros
// egen 404 för en oexporterad metod — 404 säger "finns inte", 405 säger
// "finns, men inte så här".
export const GET: APIRoute = () => metodEjTillaten('POST');
