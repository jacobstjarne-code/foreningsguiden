// POST /api/logga-ut — H29, rensar sessionen både server-sida (session.ts)
// och cookien i webbläsaren.
export const prerender = false;

import type { APIRoute } from 'astro';
import { metodEjTillaten } from '../../lib/httpSvar';
import { raderaSession, SESSION_COOKIE_NAMN } from '../../lib/session';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const sessionToken = cookies.get(SESSION_COOKIE_NAMN)?.value;
  if (sessionToken) {
    await raderaSession(sessionToken);
  }
  cookies.delete(SESSION_COOKIE_NAMN, { path: '/' });
  return redirect('/mina-sidor/', 303);
};

// AB1.6 (Jacobs order): GET på en POST-bar route ska svara 405, inte Astros
// egen 404 för en oexporterad metod — 404 säger "finns inte", 405 säger
// "finns, men inte så här".
export const GET: APIRoute = () => metodEjTillaten('POST');
