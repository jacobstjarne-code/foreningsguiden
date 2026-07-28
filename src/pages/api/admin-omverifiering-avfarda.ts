// POST /api/admin-omverifiering-avfarda — SPEC: Omverifiering (2026-07-27).
// Manuell escape-hatch för en flaggad källa som visade sig vara ett
// hash-falsklarm (ingen genuin ändring) — inget senast_verifierad-datum
// att auto-clear:a mot i det fallet, en människa måste rensa flaggan.
// Samma admin-sessionsskydd som övriga admin-POST-routes.
export const prerender = false;

import type { APIRoute } from 'astro';
import { ADMIN_SESSION_COOKIE_NAMN, arAdminInloggad } from '../../lib/adminSession';
import { avfardaFlagga } from '../../lib/omverifiering';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const token = cookies.get(ADMIN_SESSION_COOKIE_NAMN)?.value;
  if (!(await arAdminInloggad(token))) {
    return redirect('/admin/', 303);
  }

  const form = await request.formData();
  const url = String(form.get('url') ?? '').trim();
  if (url) {
    await avfardaFlagga(url);
  }

  return redirect('/admin/', 303);
};
