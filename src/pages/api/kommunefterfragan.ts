// POST /api/kommunefterfragan — H4 (SPEC_ATERSTAENDE_HAL.md, Kluster 4):
// "Meddela mig när {kommun} täcks" på landningsläget för en giltig men
// otäckt kommun. Validerar kommunSlug mot GILTIGA_KOMMUNSLUGS (kommunlan.ts,
// alla 290) — INTE mot loadKommuner() (bara de 99 med datafil), poängen är
// att den SKA accepteras trots att datafilen saknas. Ingen dubbel opt-in,
// samma resonemang som api/vantelista.ts. Svarar JSON, anropas via fetch().
export const prerender = false;

import type { APIRoute } from 'astro';
import { metodEjTillaten } from '../../lib/httpSvar';
import { GILTIGA_KOMMUNSLUGS } from '../../lib/kommunlan';
import { addKommunEfterfragan } from '../../lib/kommunefterfragan';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const kommunSlug = String(form.get('kommun') ?? '').trim();

  if (!EMAIL_RE.test(email) || !GILTIGA_KOMMUNSLUGS.has(kommunSlug)) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  await addKommunEfterfragan(email, kommunSlug);

  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
};

// AB1.6 (Jacobs order): GET på en POST-bar route ska svara 405, inte Astros
// egen 404 för en oexporterad metod — 404 säger "finns inte", 405 säger
// "finns, men inte så här".
export const GET: APIRoute = () => metodEjTillaten('POST');
