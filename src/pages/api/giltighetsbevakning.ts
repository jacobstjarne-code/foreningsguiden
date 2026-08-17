// POST /api/giltighetsbevakning — GILTIGHETSKOLLEN "erbjudandet" (SPRINT
// §Spår B, SPRINT_COPY.ts §GILTIGHETSKOLL). Sparar årsmötesdatum + adress
// mot kommunen, som underlag för giltighetspåminnelsen
// (MEJL.giltighetsvarningNiva1/Niva2, content.ts — utskicket sker via
// cron/giltighetsvarning.ts, se den filen för NIVÅ 1/2-status, J1
// 2026-08-16). Anropas via fetch() från GiltighetsKontroll.astro, inte en
// full formulärnavigering — svarar JSON.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getKommunBySlug } from '../../lib/kommuner';
import { addGiltighetBevakning } from '../../lib/subscribers';
import { sendBekraftelse } from '../../lib/mejl';
import { underGransen, klientIdentitet, forManga } from '../../lib/rateLimit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_MAX = 254; // RFC 5321
const FORENINGSNAMN_MAX = 200;

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const samtycke = form.get('samtycke');
  const kommunSlug = String(form.get('kommun') ?? '').trim();
  const arsmotesdatum = String(form.get('arsmotesdatum') ?? '').trim();
  // C1 (ARBETSORDER 2026-08-11): frivilligt — tomt fält skickas som
  // undefined, aldrig en tom sträng (se addGiltighetBevakning-kommentaren).
  const foreningsnamnRaw = String(form.get('foreningsnamn') ?? '').trim();
  const foreningsnamn = foreningsnamnRaw || undefined;

  const kommun = getKommunBySlug(kommunSlug);
  const todayISO = new Date().toISOString().slice(0, 10);

  if (
    !EMAIL_RE.test(email) ||
    email.length > EMAIL_MAX ||
    !samtycke ||
    !kommun ||
    !DATE_RE.test(arsmotesdatum) ||
    arsmotesdatum > todayISO ||
    foreningsnamnRaw.length > FORENINGSNAMN_MAX
  ) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  // M2.6 (Jacob 2026-08-17): mejlar en godtycklig adress — samma
  // dubbelspärr (IP + mål-e-post) som /api/prenumerera.
  if (!(await underGransen('giltighetsbevakning-ip', klientIdentitet(request), 5, '10 m')) || !(await underGransen('giltighetsbevakning-epost', email, 5, '1 h'))) {
    return forManga();
  }

  const { token, alreadyConfirmed } = await addGiltighetBevakning(email, kommunSlug, arsmotesdatum, foreningsnamn);

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
