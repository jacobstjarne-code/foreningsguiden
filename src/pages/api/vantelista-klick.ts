// POST /api/vantelista-klick — loggar ett klick på väntelista-knappen
// (SPRINT §Spår B: "Log every click on the button — that's intent
// measurement, must not be dropped"). Fire-and-forget från klienten
// (keepalive: true) — räknar intresse oavsett om formuläret fylls i.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getKommunBySlug } from '../../lib/kommuner';
import { logVantelistaKlick } from '../../lib/vantelista';

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const kommunSlug = String(form.get('kommun') ?? '').trim();
  const bidragId = String(form.get('bidrag') ?? '').trim();

  const kommun = getKommunBySlug(kommunSlug);
  const bidragFinns = kommun?.bidrag.some((b) => b.id === bidragId) ?? false;
  if (!bidragFinns) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  await logVantelistaKlick(kommunSlug, bidragId);
  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
};
