// POST /api/admin-logga-in — adminvyns lösenordslogin (GRANSKNING_
// foreningsguiden.md, Grind 2). Delat lösenord (ADMIN_SECRET), ingen
// e-post inblandad — bara en admin finns (Jacob).
export const prerender = false;

import type { APIRoute } from 'astro';
import { loggaInAdmin, ADMIN_SESSION_COOKIE_NAMN } from '../../lib/adminSession';

const ADMIN_SESSION_COOKIE_MAX_AGE_SEKUNDER = 60 * 60 * 24 * 7;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const losenord = String(form.get('losenord') ?? '');

  const token = await loggaInAdmin(losenord);
  if (!token) {
    return redirect('/admin/?fel=1', 303);
  }

  cookies.set(ADMIN_SESSION_COOKIE_NAMN, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_SESSION_COOKIE_MAX_AGE_SEKUNDER,
  });

  return redirect('/admin/', 303);
};
