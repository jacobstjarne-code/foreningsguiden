// GET /api/verifiera-epostbyte/{token}/ — H29-tillägg, e-postbytets
// andra steg. Path-parameter av samma rotorsaksskäl som
// /api/bekrafta/{token}/ och /api/verifiera-inloggning/{token}/ redan
// dokumenterar. Utför själva flytten (subscribers.ts + kop.ts) och
// utfärdar en ny session för den NYA adressen.
export const prerender = false;

import type { APIRoute } from 'astro';
import { verifieraEpostbytestoken, skapaSession, SESSION_COOKIE_NAMN } from '../../../lib/session';
import { flyttaSubscriber } from '../../../lib/subscribers';
import { flyttaKopIndex } from '../../../lib/kop';

const SESSION_COOKIE_MAX_AGE_SEKUNDER = 60 * 60 * 24 * 30;

export const GET: APIRoute = async ({ params, cookies, redirect }) => {
  const token = params.token;
  if (!token) return redirect('/mina-sidor/?fel=ogiltig', 303);

  const data = await verifieraEpostbytestoken(token);
  if (!data) return redirect('/mina-sidor/?fel=ogiltig', 303);

  await flyttaSubscriber(data.oldEmail, data.newEmail);
  await flyttaKopIndex(data.oldEmail, data.newEmail);

  const sessionToken = await skapaSession(data.newEmail);
  cookies.set(SESSION_COOKIE_NAMN, sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_COOKIE_MAX_AGE_SEKUNDER,
  });

  return redirect('/mina-sidor/?epostbyte=klart', 303);
};
