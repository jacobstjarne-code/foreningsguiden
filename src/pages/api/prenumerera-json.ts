// POST /api/prenumerera-json — samma gratis deadlinebevakning som
// /api/prenumerera (addPendingSubscriber, dubbel opt-in), men svarar
// JSON i stället för att redirecta — modellerad rakt av på
// giltighetsbevakning.ts (se den filens filhuvud för resonemanget om
// varför en fetch-driven widget behöver JSON och inte en 303).
//
// Skapad för "Bevaka den här"-knappen per deadlinerad (Jacob 2026-07-27):
// en kompakt, en-kommun-scopad variant av EmailSignup.astro, som gör
// helsidesnavigering (form-post + redirect) och kryssar alla ~290
// kommuner. Samma backend-lager, samma BEVAKNING-copy, bara ett annat
// svarsformat och en enda förvald kommun.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getKommunBySlug } from '../../lib/kommuner';
import { addPendingSubscriber } from '../../lib/subscribers';
import { sendBekraftelse } from '../../lib/mejl';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const samtycke = form.get('samtycke');
  const kommunSlug = String(form.get('kommun') ?? '').trim();

  const kommun = getKommunBySlug(kommunSlug);

  if (!EMAIL_RE.test(email) || !samtycke || !kommun) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  const { token, alreadyConfirmed } = await addPendingSubscriber(email, [kommunSlug]);

  if (!alreadyConfirmed && token) {
    try {
      await sendBekraftelse(email, kommun.kommun, token);
    } catch (e) {
      // Kommunen är redan sparad mot adressen (addPendingSubscriber ovan)
      // — bara mejlet failade. Svara fel så widgeten visar fel-läget,
      // samma gap-skydd som giltighetsbevakning.ts redan har.
      console.error('prenumerera-json: bekräftelsemejl misslyckades', e);
      return new Response(JSON.stringify({ ok: false }), { status: 502, headers: { 'content-type': 'application/json' } });
    }
  }

  return new Response(JSON.stringify({ ok: true, alreadyConfirmed }), { headers: { 'content-type': 'application/json' } });
};
