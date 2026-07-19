// POST /api/vantelista — köanmälan till utkasttjänsten (SPRINT §Spår B,
// SPRINT_COPY.ts §VÄNTELISTA). Ingen dubbel opt-in — kvittot lovar inget
// bekräftelsemejl. Anropas via fetch() från KommunProgression.astro (station
// 5), inte en full formulärnavigering — svarar JSON.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getKommunBySlug } from '../../lib/kommuner';
import { addVantelista } from '../../lib/vantelista';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const kommunSlug = String(form.get('kommun') ?? '').trim();
  const bidragId = String(form.get('bidrag') ?? '').trim();

  const kommun = getKommunBySlug(kommunSlug);
  const bidragFinns = kommun?.bidrag.some((b) => b.id === bidragId) ?? false;

  if (!EMAIL_RE.test(email) || !bidragFinns) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  await addVantelista(email, kommunSlug, bidragId);

  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
};
