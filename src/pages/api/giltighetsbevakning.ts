// POST /api/giltighetsbevakning — GILTIGHETSKOLLEN "erbjudandet" (SPRINT
// §Spår B, SPRINT_COPY.ts §GILTIGHETSKOLL). Sparar årsmötesdatum + adress
// mot kommunen, som underlag för en framtida giltighetspåminnelse
// (MEJL.giltighetsvarning, content.ts — själva utskicksjobbet är inte
// byggt än, se rapporten till Jacob). Anropas via fetch() från
// GiltighetsKontroll.astro, inte en full formulärnavigering — svarar JSON.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getKommunBySlug } from '../../lib/kommuner';
import { addGiltighetBevakning } from '../../lib/subscribers';
import { sendBekraftelse } from '../../lib/mejl';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const samtycke = form.get('samtycke');
  const kommunSlug = String(form.get('kommun') ?? '').trim();
  const arsmotesdatum = String(form.get('arsmotesdatum') ?? '').trim();

  const kommun = getKommunBySlug(kommunSlug);
  const todayISO = new Date().toISOString().slice(0, 10);

  if (!EMAIL_RE.test(email) || !samtycke || !kommun || !DATE_RE.test(arsmotesdatum) || arsmotesdatum > todayISO) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  const { token, alreadyConfirmed } = await addGiltighetBevakning(email, kommunSlug, arsmotesdatum);

  if (!alreadyConfirmed && token) {
    try {
      await sendBekraftelse(email, kommun.kommun, token);
    } catch (e) {
      // Årsmötesdatumet är redan sparat (addGiltighetBevakning ovan) — bara
      // mejlet failade. Svara fel så widgeten visar fel-läget i stället för
      // att krascha på Astros generiska felsida (samma gap fanns latent i
      // /api/prenumerera, som denna endpoint är modellerad efter).
      console.error('giltighetsbevakning: bekräftelsemejl misslyckades', e);
      return new Response(JSON.stringify({ ok: false }), { status: 502, headers: { 'content-type': 'application/json' } });
    }
  }

  return new Response(JSON.stringify({ ok: true, alreadyConfirmed }), { headers: { 'content-type': 'application/json' } });
};
