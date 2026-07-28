// POST /api/dela-besked — H7 (SPEC: Kluster 3 — en förening blir fler,
// 2026-07-28): "Dela beskedet" (mejla) på matchningstrattens besked
// (matcha/index.astro). Klienten skickar bara ID-REFERENSER (kommunSlug
// + de matchade bidragens id:n) — ALDRIG fritext eller ett färdigt
// mejlinnehåll. Servern slår upp namn/belopp/deadline mot kommun.bidrag
// själv och bygger mejlet av det. Detta är medvetet: en endpoint som tar
// emot fri mejltext från klienten och vidarebefordrar den vore en öppen
// spam-relä via vårt Resend-konto. bidragId:n som inte finns i kommunens
// egen bidragslista filtreras tyst bort (idSet.has-kollen).
export const prerender = false;

import type { APIRoute } from 'astro';
import { getKommunBySlug, earliestDeadlineISO, daysUntil, formatDate, todayISO } from '../../lib/kommuner';
import type { Bidrag } from '../../lib/kommuner';
import { sendDelbartBesked } from '../../lib/mejl';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Samma logik som matcha/index.astro:s bidragMeta(), fast som klartext
// utan HTML/urgency-chip — ett mejl är text, inte markup.
function deadlineText(bidrag: Bidrag, today: string): string {
  const dateISO = earliestDeadlineISO(bidrag, today);
  if (!dateISO) {
    return bidrag.deadlines.typ === 'okand' ? 'inget publicerat ansökningsdatum' : 'löpande ansökan';
  }
  const dagar = daysUntil(dateISO, today);
  const dagarText = dagar === 1 ? '1 dag kvar' : `${dagar} dagar kvar`;
  return `sista dag ${formatDate(dateISO)} · ${dagarText}`;
}

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const kommunSlug = String(form.get('kommun') ?? '').trim();
  const bidragIds = form.getAll('bidragId').map(String);

  const kommun = getKommunBySlug(kommunSlug);
  if (!EMAIL_RE.test(email) || !kommun || bidragIds.length === 0) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  const idSet = new Set(bidragIds);
  const matchade = kommun.bidrag.filter((b) => idSet.has(b.id));
  if (matchade.length === 0) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  const today = todayISO();
  try {
    await sendDelbartBesked(email, {
      kommun: kommun.kommun,
      kommunSlug: kommun.kommun_slug,
      bidrag: matchade.map((b) => ({ namn: b.namn, belopp: b.belopp, deadlineText: deadlineText(b, today) })),
    });
  } catch (e) {
    console.error('dela-besked: utskick misslyckades', e);
    return new Response(JSON.stringify({ ok: false }), { status: 502, headers: { 'content-type': 'application/json' } });
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
};
