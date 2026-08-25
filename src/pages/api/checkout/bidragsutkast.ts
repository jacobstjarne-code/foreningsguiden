/**
 * POST /api/checkout/bidragsutkast — Stripe Checkout Session för
 * bidragsutkastet (CODE_UPPDRAG_KOMMERSIELL §1.B, aktiverad 2026-07-30
 * efter golden set-grön). Samma mönster som checkout/registrering.ts
 * (hostad kassa, invoice_creation för H10-kvittot), men EGEN produkt —
 * PRIS_BIDRAGSUTKAST_ORE, metadata.produkt='bidragsutkast' — så
 * stripe-webhook.ts kan gren och adminvyn kan skilja dem åt.
 *
 * SPÄRR (Jacobs order, 2026-07-30): "Köp får bara skapas om profilen
 * faktiskt matchar bidraget. Kontrollera matchKommun() innan Checkout-
 * sessionen, inte bara i UI:t." Klientens egen matchKommun()-koll i
 * utkastvyn är bara vägvisning — DEN HÄR kollen är den som faktiskt
 * skyddar mot ett manipulerat/förbigånget klientanrop. Tre villkor,
 * inte ett:
 *   1. bidragId finns i matchKommun(profil, kommun).matchar.
 *   2. genereraUtkast(profil, bidrag, kommun) ger typ 'bidragsutkast',
 *      inte 'registrering_forst' — annars säljer vi fel produkt till
 *      en förening som borde köpa registreringsutkastet först (samma
 *      spärr 4 som utkastGenerator.ts:s eget filhuvud beskriver).
 *   3. SPÄRR (Jacobs order, 2026-08-18, R2): kommunens data för DETTA
 *      bidrag räcker till en användbar checklista — arBidragSaljbart()
 *      (kommunKlar.ts), samma tre rader som KLAR 1-3 (krav_status
 *      kontrollast, minst tre krav, krav_fullstandiga true). Ersätter
 *      M2.4:s luckor-baserade spärr (resultat.luckor === kravRader.
 *      length): den öppnade bara när en kravrad RÅKADE vara en bar
 *      sätesmening (R1-mätningen 2026-08-17 — 93 bidrag i hela basen,
 *      100% av samma skäl), okorrelerat med kommunens datakvalitet och
 *      utan att säga något om föreningen. Denna spärr är ren
 *      bidragsdata, ingen profil inblandad — samma spärr som
 *      kommunsidans köpteaser (KommunProgression.astro) och
 *      utkastsidans kopram/bevaka-val.
 * Ingen profil alls = kan inte verifieras = inget köp.
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { getKommunBySlug } from '../../../lib/kommuner';
import { matchKommun } from '../../../lib/matching';
import { genereraUtkast } from '../../../lib/utkastGenerator';
import { arBidragSaljbart } from '../../../lib/kommunKlar';
import type { Foreningsprofil } from '../../../lib/foreningsprofil';
import { siteUrl } from '../../../lib/mejl';
import { PRIS_BIDRAGSUTKAST_ORE, MOMSSATS, momsAndelOre } from '../../../lib/priser';
import { SALJARE } from '../../../lib/content';
import { saljargateOk } from '../../../lib/saljargate';

// `?? process.env` — se checkout/registrering.ts:s kommentar.
const env = (import.meta.env ?? process.env) as unknown as Record<string, string>;

export const POST: APIRoute = async ({ request }) => {
  const stripeKey = env.STRIPE_SECRET_KEY?.trim();
  if (!stripeKey) {
    return new Response(JSON.stringify({ ok: false, fel: 'betalning_ej_konfigurerad' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }
  if (stripeKey.startsWith('sk_live_') && !saljargateOk()) {
    console.error('checkout/bidragsutkast: skarpt Stripe-läge men säljargaten (saljargate.ts) är inte öppen — vägrar starta köpet.');
    return new Response(JSON.stringify({ ok: false, fel: 'betalning_ej_konfigurerad' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }

  const form = await request.formData();
  const kommunSlug = String(form.get('kommun') ?? '').trim();
  const bidragId = String(form.get('bidrag') ?? '').trim();
  const profilRaw = form.get('profil');

  const kommun = getKommunBySlug(kommunSlug);
  const bidrag = kommun?.bidrag.find((b) => b.id === bidragId && b.status === 'aktiv');
  if (!kommun || !bidrag) {
    return new Response(JSON.stringify({ ok: false, fel: 'okant_bidrag' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  if (typeof profilRaw !== 'string' || profilRaw.length === 0 || profilRaw.length > 500) {
    return new Response(JSON.stringify({ ok: false, fel: 'profil_saknas' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }
  let profil: Foreningsprofil;
  try {
    profil = JSON.parse(profilRaw) as Foreningsprofil;
  } catch {
    return new Response(JSON.stringify({ ok: false, fel: 'profil_ogiltig' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  // SPÄRREN — se filhuvudet. Server-sidans egen körning, oberoende av
  // vad klienten redan sagt sig ha kontrollerat.
  const matchning = matchKommun(profil, kommun);
  const matchar = matchning.matchar.some((b) => b.id === bidragId);
  const resultat = genereraUtkast(profil, bidrag, kommun);
  if (!matchar || resultat.typ !== 'bidragsutkast') {
    // M2.7 (Jacob 2026-08-17): OKAND (matching.ts) landar aldrig i
    // matchar, så den här grenen redan täcker det fallet — men ett eget
    // felkod-utfall gör avsikten explicit i stället för att förlita sig
    // på att OKAND råkar sakna en plats i matchar. "Ett jakande
    // behörighetssvar på tomma fält får inte grinda ett köp": ett bidrag
    // utan ett enda ifyllt matchningsvillkor ska nekas köpet som ett
    // "vi kan inte avgöra", inte tyst falla igenom som matchar_inte.
    const okand = matchning.okand.some((b) => b.id === bidragId);
    return new Response(JSON.stringify({ ok: false, fel: okand ? 'kan_inte_avgora' : 'matchar_inte' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  // R2 (Jacob 2026-08-18): "Ett jakande behörighetssvar på tomma fält
  // får inte grinda ett köp" — samma princip här på checklistans EGET
  // innehåll. Läst ur bidragets EGEN data vid varje anrop, aldrig en
  // hårdkodad bidrag-lista — när GPT fyller fler krav i en kommun öppnas
  // köpet av sig självt, ingen flagga att komma ihåg att ta bort.
  // Klientens utkastvy döljer redan köpknappen för samma fall (UX) — den
  // här kollen är vad som faktiskt stoppar ett manipulerat/förbigånget
  // anrop, samma "server-sidan är spärren"-princip som matchar-kollen
  // ovan.
  if (!arBidragSaljbart(bidrag)) {
    return new Response(JSON.stringify({ ok: false, fel: 'inget_att_salja' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  const metadata: Record<string, string> = {
    produkt: 'bidragsutkast',
    kommunSlug,
    bidragId,
    foreningsprofil: profilRaw,
  };

  const stripe = new Stripe(stripeKey);
  const base = siteUrl();
  const utkastLank = `${base}/kommun/${kommunSlug}/utkast/${bidragId}/`;

  const sessionParams = {
    mode: 'payment' as const,
    line_items: [
      {
        price_data: {
          currency: 'sek',
          unit_amount: PRIS_BIDRAGSUTKAST_ORE,
          product_data: {
            name: `Bidragsutkast — ${bidrag.namn} (${kommun.kommun})`,
          },
        },
        quantity: 1,
      },
    ],
    metadata,
    // H10-mönstret (checkout/registrering.ts) — samma varaktiga, hostade
    // faktura för det bokföringsbara kvittot.
    invoice_creation: {
      enabled: true,
      invoice_data: {
        custom_fields: [
          { name: 'Säljare', value: SALJARE.foretag },
          { name: 'Org.nr', value: SALJARE.orgnr },
          {
            name: `Varav moms (${MOMSSATS * 100}%)`,
            value: `${(momsAndelOre(PRIS_BIDRAGSUTKAST_ORE) / 100).toFixed(2).replace('.', ',')} kr`,
          },
        ],
      },
    },
    success_url: `${utkastLank}?betald=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: utkastLank,
  };

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({ ...sessionParams, payment_method_types: ['card', 'swish'] });
  } catch (err) {
    // Samma Swish-fallback som checkout/registrering.ts — se den filens kommentar.
    if (err instanceof Stripe.errors.StripeInvalidRequestError && err.param === 'payment_method_types') {
      session = await stripe.checkout.sessions.create({ ...sessionParams, payment_method_types: ['card'] });
    } else {
      throw err;
    }
  }

  if (!session.url) {
    return new Response(JSON.stringify({ ok: false }), { status: 502, headers: { 'content-type': 'application/json' } });
  }

  return new Response(JSON.stringify({ ok: true, url: session.url }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};
