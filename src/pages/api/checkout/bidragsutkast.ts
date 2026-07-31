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
 * skyddar mot ett manipulerat/förbigånget klientanrop. Två villkor,
 * inte ett:
 *   1. bidragId finns i matchKommun(profil, kommun).matchar.
 *   2. genereraUtkast(profil, bidrag, kommun) ger typ 'bidragsutkast',
 *      inte 'registrering_forst' — annars säljer vi fel produkt till
 *      en förening som borde köpa registreringsutkastet först (samma
 *      spärr 4 som utkastGenerator.ts:s eget filhuvud beskriver).
 * Ingen profil alls = kan inte verifieras = inget köp.
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { getKommunBySlug } from '../../../lib/kommuner';
import { matchKommun } from '../../../lib/matching';
import { genereraUtkast } from '../../../lib/utkastGenerator';
import type { Foreningsprofil } from '../../../lib/foreningsprofil';
import { siteUrl } from '../../../lib/mejl';
import { PRIS_BIDRAGSUTKAST_ORE, MOMSSATS, momsAndelOre } from '../../../lib/priser';
import { SALJARE } from '../../../lib/content';

const env = import.meta.env as unknown as Record<string, string>;

// Samma spärr som checkout/registrering.ts — se den filens kommentar.
function saljareArKlar(): boolean {
  return !SALJARE.foretag.startsWith('{{TODO') && !SALJARE.orgnr.startsWith('{{TODO');
}

export const POST: APIRoute = async ({ request }) => {
  const stripeKey = env.STRIPE_SECRET_KEY?.trim();
  if (!stripeKey) {
    return new Response(JSON.stringify({ ok: false, fel: 'betalning_ej_konfigurerad' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }
  if (stripeKey.startsWith('sk_live_') && !saljareArKlar()) {
    console.error('checkout/bidragsutkast: skarpt Stripe-läge men SALJARE i content.ts är fortfarande TODO — vägrar skapa en faktura med platshållartext.');
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
    return new Response(JSON.stringify({ ok: false, fel: 'matchar_inte' }), { status: 400, headers: { 'content-type': 'application/json' } });
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
