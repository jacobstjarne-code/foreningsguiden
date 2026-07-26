// POST /api/logga-ut — H29, rensar sessionen både server-sida (session.ts)
// och cookien i webbläsaren.
export const prerender = false;

import type { APIRoute } from 'astro';
import { raderaSession, SESSION_COOKIE_NAMN } from '../../lib/session';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const sessionToken = cookies.get(SESSION_COOKIE_NAMN)?.value;
  if (sessionToken) {
    await raderaSession(sessionToken);
  }
  cookies.delete(SESSION_COOKIE_NAMN, { path: '/' });
  return redirect('/mina-sidor/', 303);
};
