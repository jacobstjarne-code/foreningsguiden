// POST /api/admin-logga-ut — rensar adminsessionen.
export const prerender = false;

import type { APIRoute } from 'astro';
import { loggaUtAdmin, ADMIN_SESSION_COOKIE_NAMN } from '../../lib/adminSession';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const token = cookies.get(ADMIN_SESSION_COOKIE_NAMN)?.value;
  if (token) {
    await loggaUtAdmin(token);
  }
  cookies.delete(ADMIN_SESSION_COOKIE_NAMN, { path: '/' });
  return redirect('/admin/', 303);
};
