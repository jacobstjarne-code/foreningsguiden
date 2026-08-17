// POST /api/felrapport — H25 (SPEC_ATERSTAENDE_HAL.md, Kluster 4): "Det här
// stämmer inte"-länken vid varje bidrag. Modellerad på
// giltighetsbevakning.ts — anropas via fetch() från BidragCard-widgeten,
// svarar JSON, ingen sidladdning. E-post är valfritt (låg tröskel för en
// snabb rättelse) så EMAIL_RE prövas bara när fältet faktiskt är ifyllt.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getKommunBySlug } from '../../lib/kommuner';
import { sendFelrapport } from '../../lib/mejl';
import { underGransen, klientIdentitet, forManga } from '../../lib/rateLimit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// M2.6 (Jacob 2026-08-17): fri text utan gräns gick rakt in i ett mejl
// till Jacobs egen inkorg — ingen autentisering, ingen spärr alls innan.
const MEDDELANDE_MAX = 3000;
const EMAIL_MAX = 254; // RFC 5321

export const POST: APIRoute = async ({ request }) => {
  if (!(await underGransen('felrapport', klientIdentitet(request), 5, '10 m'))) {
    return forManga();
  }

  const form = await request.formData();
  const kommunSlug = String(form.get('kommun') ?? '').trim();
  const bidragId = String(form.get('bidragId') ?? '').trim();
  const bidragNamn = String(form.get('bidragNamn') ?? '').trim();
  const meddelande = String(form.get('meddelande') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();

  const kommun = getKommunBySlug(kommunSlug);

  if (
    !kommun ||
    !bidragId ||
    !meddelande ||
    meddelande.length > MEDDELANDE_MAX ||
    (email && (!EMAIL_RE.test(email) || email.length > EMAIL_MAX))
  ) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  try {
    await sendFelrapport({ kommun: kommun.kommun, bidragNamn: bidragNamn || bidragId, bidragId, meddelande, email });
  } catch (e) {
    console.error('felrapport: utskick misslyckades', e);
    return new Response(JSON.stringify({ ok: false }), { status: 502, headers: { 'content-type': 'application/json' } });
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
};
