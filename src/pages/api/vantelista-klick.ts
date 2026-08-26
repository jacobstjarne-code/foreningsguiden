// POST /api/vantelista-klick — loggar ett klick på väntelista-knappen
// (SPRINT §Spår B: "Log every click on the button — that's intent
// measurement, must not be dropped"). Fire-and-forget från klienten
// (keepalive: true) — räknar intresse oavsett om formuläret fylls i.
export const prerender = false;

import type { APIRoute } from 'astro';
import { metodEjTillaten } from '../../lib/httpSvar';
import { getKommunBySlug } from '../../lib/kommuner';
import { logVantelistaKlick } from '../../lib/vantelista';

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const kommunSlug = String(form.get('kommun') ?? '').trim();
  const bidragIdRaw = String(form.get('bidrag') ?? '').trim();
  const syfte = form.get('syfte') === 'registrering' ? 'registrering' : 'utkast';

  const kommun = getKommunBySlug(kommunSlug);
  if (!kommun) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  // registrering är kommun-scopad — inget bidragId att verifiera.
  if (syfte === 'utkast') {
    const bidragFinns = kommun.bidrag.some((b) => b.id === bidragIdRaw);
    if (!bidragFinns) {
      return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { 'content-type': 'application/json' } });
    }
  }

  await logVantelistaKlick(kommunSlug, syfte === 'registrering' ? null : bidragIdRaw);
  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
};

// AB1.6 (Jacobs order): GET på en POST-bar route ska svara 405, inte Astros
// egen 404 för en oexporterad metod — 404 säger "finns inte", 405 säger
// "finns, men inte så här".
export const GET: APIRoute = () => metodEjTillaten('POST');
