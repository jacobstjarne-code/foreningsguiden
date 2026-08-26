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
//
// P3.1b (Jacob 2026-08-05): ett valfritt bidrag-fält växlar till
// addBidragBevakning (subscribers.ts) — samma endpoint, men bevakningen
// scopas till DET enskilda bidraget i stället för hela kommunen.
// Validerat mot kommunens egna bidrag (aldrig ett bidrag-id från en
// annan kommun eller ett påhittat) innan det sparas.
export const prerender = false;

import type { APIRoute } from 'astro';
import { metodEjTillaten } from '../../lib/httpSvar';
import { getKommunBySlug } from '../../lib/kommuner';
import { getNationelltStodById, formatDatumradForStod } from '../../lib/nationellaStod';
import { addPendingSubscriber, addBidragBevakning, addNationelltStodBevakning } from '../../lib/subscribers';
import { sendBekraftelse, sendNationellBekraftelse } from '../../lib/mejl';
import { underGransen, klientIdentitet, forManga } from '../../lib/rateLimit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX = 254; // RFC 5321

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const samtycke = form.get('samtycke');
  const kommunSlug = String(form.get('kommun') ?? '').trim();
  const bidragId = String(form.get('bidrag') ?? '').trim();
  const nationelltStodId = String(form.get('nationelltStod') ?? '').trim();

  const kommun = kommunSlug ? getKommunBySlug(kommunSlug) : undefined;
  const bidrag = bidragId ? kommun?.bidrag.find((b) => b.id === bidragId) : undefined;
  const nationelltStod = nationelltStodId ? getNationelltStodById(nationelltStodId) : undefined;
  // Ogiltig/manipulerad bidrag-id (fanns i formuläret men inte i
  // kommunen) — vägra hellre spara en tyst kommun-bred bevakning i
  // stället, avvisa som ett felaktigt anrop.
  if (bidragId && !bidrag) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  // Exakt en identitetsmodell per anrop. Nationellt stöd saknar kommun
  // och kan därför inte falla tillbaka till en kommun-bred bevakning.
  if ((nationelltStodId && !nationelltStod) || (nationelltStodId && (kommunSlug || bidragId))) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  if (!EMAIL_RE.test(email) || email.length > EMAIL_MAX || !samtycke || (!nationelltStod && !kommun)) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  // M2.6 (Jacob 2026-08-17): samma spärr som /api/prenumerera — mejlar
  // en godtycklig adress, kan missbrukas mot en tredje part.
  if (!(await underGransen('prenumerera-ip', klientIdentitet(request), 5, '10 m')) || !(await underGransen('prenumerera-epost', email, 5, '1 h'))) {
    return forManga();
  }

  const { token, alreadyConfirmed } = nationelltStod
    ? await addNationelltStodBevakning(email, nationelltStod.id)
    : bidrag
      ? await addBidragBevakning(email, kommunSlug, bidrag.id)
      : await addPendingSubscriber(email, [kommunSlug]);

  if (!alreadyConfirmed && token) {
    try {
      // Z2.1 (incoming/OPPNA_PUNKTER_Z1.md): nationella stöd får en egen
      // mall (MEJL.nationellBekraftelse) i stället för den kommunala
      // (som gav "bevaka bidragsdeadlines i LOK-stöd" och fel sidfot).
      if (nationelltStod) {
        await sendNationellBekraftelse(email, nationelltStod.namn, formatDatumradForStod(nationelltStod), token);
      } else {
        const etikett = bidrag ? `${bidrag.namn} (${kommun!.kommun})` : kommun!.kommun;
        await sendBekraftelse(email, etikett, token);
      }
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

// AB1.6 (Jacobs order): GET på en POST-bar route ska svara 405, inte Astros
// egen 404 för en oexporterad metod — 404 säger "finns inte", 405 säger
// "finns, men inte så här".
export const GET: APIRoute = () => metodEjTillaten('POST');
