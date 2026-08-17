/**
 * POST /api/kontakt — H21 (GRANSKNING_foreningsguiden.md): en betalande
 * kund måste kunna nå oss. Enkelt formulär, ingen ny lagring (mejlas
 * direkt via Resend, sparas inte i Redis — inget ändamål att spara det för).
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { sendKontaktNotis } from '../../lib/mejl';
import { underGransen, klientIdentitet } from '../../lib/rateLimit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// M2.6 (Jacob 2026-08-17): fri text utan gräns, ingen spärr alls innan.
const NAMN_MAX = 200;
const MEDDELANDE_MAX = 3000;
const EMAIL_MAX = 254; // RFC 5321

export const POST: APIRoute = async ({ request, redirect }) => {
  if (!(await underGransen('kontakt', klientIdentitet(request), 5, '10 m'))) {
    return new Response('För många försök. Vänta en stund och försök igen.', { status: 429 });
  }

  const form = await request.formData();
  const namn = String(form.get('namn') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const meddelande = String(form.get('meddelande') ?? '').trim();

  if (!EMAIL_RE.test(email) || email.length > EMAIL_MAX || meddelande.length === 0 || meddelande.length > MEDDELANDE_MAX || namn.length > NAMN_MAX) {
    return new Response('Ogiltigt formulär.', { status: 400 });
  }

  await sendKontaktNotis({ namn: namn || '(inget namn angivet)', email, meddelande });

  return redirect('/kontakt/?skickat=1', 303);
};
