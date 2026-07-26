/**
 * POST /api/kontakt — H21 (GRANSKNING_foreningsguiden.md): en betalande
 * kund måste kunna nå oss. Enkelt formulär, ingen ny lagring (mejlas
 * direkt via Resend, sparas inte i Redis — inget ändamål att spara det för).
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { sendKontaktNotis } from '../../lib/mejl';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const namn = String(form.get('namn') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const meddelande = String(form.get('meddelande') ?? '').trim();

  if (!EMAIL_RE.test(email) || meddelande.length === 0) {
    return new Response('Ogiltigt formulär.', { status: 400 });
  }

  await sendKontaktNotis({ namn: namn || '(inget namn angivet)', email, meddelande });

  return redirect('/kontakt/?skickat=1', 303);
};
