// POST /api/admin-logga-in — adminvyns lösenordslogin (GRANSKNING_
// foreningsguiden.md, Grind 2). Delat lösenord (ADMIN_SECRET), ingen
// e-post inblandad — bara en admin finns (Jacob).
export const prerender = false;

import type { APIRoute } from 'astro';
import { loggaInAdmin, ADMIN_SESSION_COOKIE_NAMN } from '../../lib/adminSession';
import { underGransen, klientIdentitet } from '../../lib/rateLimit';

const ADMIN_SESSION_COOKIE_MAX_AGE_SEKUNDER = 60 * 60 * 24 * 7;
// M2.6 (Jacob 2026-08-17): ingen brute-force-spärr fanns — ADMIN_SECRET
// (ett delat lösenord som låser upp alla prenumeranters/köpares
// uppgifter) kunde provas i obegränsad takt. 5 försök/15 min per IP gör
// gissning praktiskt omöjlig utan att straffa ett enda felstavat försök.
const LOSENORD_MAX = 500;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (!(await underGransen('admin-logga-in', klientIdentitet(request), 5, '15 m'))) {
    return redirect('/admin/?fel=for-manga', 303);
  }

  const form = await request.formData();
  const losenord = String(form.get('losenord') ?? '');
  if (losenord.length > LOSENORD_MAX) {
    return redirect('/admin/?fel=1', 303);
  }

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
