// GET /api/verifiera-inloggning/{token}/ — H29, magic-länkens andra steg.
// Path-parameter av samma rotorsaksskäl som /api/bekrafta/{token}/ redan
// dokumenterar (querysträngens "=" korrumperas av mejltransportens
// quoted-printable-radbrytning). Förbrukar inloggningstoken (engångsbruk,
// se session.ts) och sätter en längre sessionscookie.
export const prerender = false;

import type { APIRoute } from 'astro';
import { verifieraInloggningstoken, skapaSession, SESSION_COOKIE_NAMN } from '../../../lib/session';

const SESSION_COOKIE_MAX_AGE_SEKUNDER = 60 * 60 * 24 * 30; // 30 dagar, samma som session.ts:s TTL

export const GET: APIRoute = async ({ params, cookies, redirect }) => {
  const token = params.token;
  if (!token) return redirect('/mina-sidor/?fel=ogiltig', 303);

  const data = await verifieraInloggningstoken(token);
  if (!data) return redirect('/mina-sidor/?fel=ogiltig', 303);

  const sessionToken = await skapaSession(data.email);
  cookies.set(SESSION_COOKIE_NAMN, sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_COOKIE_MAX_AGE_SEKUNDER,
  });

  return redirect(data.returTo ?? '/mina-sidor/', 303);
};
