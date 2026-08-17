/**
 * POST /api/logga-in — H29 (GRANSKNING_foreningsguiden.md). Skickar en
 * magic-länk till angiven e-post, oavsett om den redan har en
 * Subscriber-post eller inte (svarar likadant i båda fallen — avslöjar
 * aldrig om en adress finns i systemet, samma resonemang som
 * lösenordsåterställningsflöden generellt).
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { skapaInloggningstoken } from '../../lib/session';
import { sendInloggningsLank } from '../../lib/mejl';
import { underGransen, klientIdentitet } from '../../lib/rateLimit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX = 254; // RFC 5321

// H15 (SPEC: Det som återstår, 2026-07-28): en besökare som loggar in
// från kop-sidans "logga in för att se ert köp"-formulär ska landa
// direkt där, inte på generella /mina-sidor/. Bara interna
// /mina-sidor/kop/-vägar accepteras — aldrig ett obegränsat
// öppen-redirect-mål från formuläret.
const RETUR_RE = /^\/mina-sidor\/kop\/[^/]+\/$/;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const returRaw = String(form.get('retur') ?? '');
  const retur = RETUR_RE.test(returRaw) ? returRaw : null;

  if (!EMAIL_RE.test(email) || email.length > EMAIL_MAX) {
    return new Response('Ogiltig e-postadress.', { status: 400 });
  }

  // M2.6 (Jacob 2026-08-17): mejlar en godtycklig adress ett riktigt
  // inloggningsmejl — tydligaste "spamma en tredje part"-vektorn av
  // dessa endpoints. Dubbelspärr (IP + mål-e-post).
  if (!(await underGransen('logga-in-ip', klientIdentitet(request), 5, '10 m')) || !(await underGransen('logga-in-epost', email, 5, '1 h'))) {
    return new Response('För många försök. Vänta en stund och försök igen.', { status: 429 });
  }

  const token = await skapaInloggningstoken(email, retur);
  await sendInloggningsLank(email, token);

  return redirect('/mina-sidor/?skickat=1', 303);
};
