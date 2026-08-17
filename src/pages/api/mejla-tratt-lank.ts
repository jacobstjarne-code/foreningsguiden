// POST /api/mejla-tratt-lank — H5 (SPEC: Det som återstår, 2026-07-28):
// "Mejla mig en länk" på en avbruten tratt. Ingen server-sparad session
// finns för en anonym besökare (foreningsprofil.ts lever bara i
// localStorage) — länken kodar in profilen DIREKT i frågesträngen, så
// den fungerar på vilken enhet som helst. Servern validerar varje fält
// mot sina kända giltiga värden och bygger om URL:en själv — tar ALDRIG
// klientens råa sträng rakt in i ett utgående mejl (samma "aldrig fri
// text från klienten i ett mejl"-princip som api/dela-besked.ts).
export const prerender = false;

import type { APIRoute } from 'astro';
import { GILTIGA_KOMMUNSLUGS } from '../../lib/kommunlan';
import { VERKSAMHETER } from '../../lib/kommuner';
import { sendTrattLank, siteUrl } from '../../lib/mejl';
import { underGransen, klientIdentitet, forManga } from '../../lib/rateLimit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX = 254; // RFC 5321
const PROFIL_RAW_MAX = 2000; // ett litet JSON-objekt, generöst tak mot missbruk
const MEDLEMSBUCKETS = ['xs', 's', 'm', 'l'];
const ALDERSBUCKETS = ['ny', 'mellan', 'etablerad'];
const SOKT_SVAR = ['ja', 'nej', 'osaker'];

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const profilRaw = String(form.get('profil') ?? '');

  if (!EMAIL_RE.test(email) || email.length > EMAIL_MAX || profilRaw.length > PROFIL_RAW_MAX) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  // M2.6 (Jacob 2026-08-17): mejlar en godtycklig adress — samma
  // dubbelspärr (IP + mål-e-post) som övriga bevakningsendpoints.
  if (!(await underGransen('mejla-tratt-lank-ip', klientIdentitet(request), 5, '10 m')) || !(await underGransen('mejla-tratt-lank-epost', email, 5, '1 h'))) {
    return forManga();
  }

  let profil: unknown;
  try {
    profil = JSON.parse(profilRaw);
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { 'content-type': 'application/json' } });
  }
  if (typeof profil !== 'object' || profil === null) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  const p = profil as Record<string, unknown>;
  const kommunSlug = typeof p.kommunSlug === 'string' && GILTIGA_KOMMUNSLUGS.has(p.kommunSlug) ? p.kommunSlug : null;
  const verksamhet = Array.isArray(p.verksamhet) ? p.verksamhet.filter((v) => VERKSAMHETER.includes(v)) : [];
  const storlek = typeof p.storlek === 'string' && MEDLEMSBUCKETS.includes(p.storlek) ? p.storlek : null;
  const alder = typeof p.alder === 'string' && ALDERSBUCKETS.includes(p.alder) ? p.alder : null;
  const sokt = typeof p.sokt === 'string' && SOKT_SVAR.includes(p.sokt) ? p.sokt : null;

  if (!kommunSlug) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  // Bygger om profilen ur de validerade fälten ovan, inte klientens råa
  // sträng — servern är sanningen för vad som faktiskt hamnar i länken.
  const validerad = { kommunSlug, verksamhet, storlek, alder, sokt };
  const lank = `${siteUrl()}/matcha/?fortsatt=${encodeURIComponent(JSON.stringify(validerad))}`;

  try {
    await sendTrattLank(email, lank);
  } catch (e) {
    console.error('mejla-tratt-lank: utskick misslyckades', e);
    return new Response(JSON.stringify({ ok: false }), { status: 502, headers: { 'content-type': 'application/json' } });
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
};
