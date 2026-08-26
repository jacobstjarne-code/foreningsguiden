// POST /api/admin-logga-ut — rensar adminsessionen.
export const prerender = false;

import type { APIRoute } from 'astro';
import { metodEjTillaten } from '../../lib/httpSvar';
import { loggaUtAdmin, ADMIN_SESSION_COOKIE_NAMN } from '../../lib/adminSession';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const token = cookies.get(ADMIN_SESSION_COOKIE_NAMN)?.value;
  if (token) {
    await loggaUtAdmin(token);
  }
  cookies.delete(ADMIN_SESSION_COOKIE_NAMN, { path: '/' });
  return redirect('/admin/', 303);
};

// AB1.6 (Jacobs order): GET på en POST-bar route ska svara 405, inte Astros
// egen 404 för en oexporterad metod — 404 säger "finns inte", 405 säger
// "finns, men inte så här".
export const GET: APIRoute = () => metodEjTillaten('POST');
