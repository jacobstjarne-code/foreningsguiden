/**
 * POST /api/checkout/abonnemang — skapar en Stripe Checkout Session i
 * PRENUMERATIONSLÄGE (SPEC_ABONNEMANG.md §4) för Abonnemanget, 495 kr/år.
 * Testläge (sandbox) tills en juridisk part väljs — samma mönster som
 * checkout/registrering.ts, se den filens filhuvud för resonemanget.
 *
 * mode: 'subscription', inte 'payment' — priset byggs INLINE via
 * price_data + recurring (samma inline-mönster som registrering.ts
 * använder för sitt engångspris), inte ett förskapat Stripe Price-ID:
 * priset "testas via väntelistknappen" (SPEC_ABONNEMANG §3) och ska
 * inte låsas i ett Stripe-dashboard-objekt innan det är klart.
 * invoice_creation är INTE giltigt i subscription-läge (Stripe skapar
 * fakturor per faktureringsperiod automatiskt) — utelämnat medvetet,
 * till skillnad från registrering.ts.
 *
 * Ingen kommun-gate: abonnemanget är inte kommun-scopat vid köptillfället
 * (till skillnad från registreringsutkastet) — matchningen mot en
 * specifik kommun sker senare, i cronet, via den redan sparade
 * Subscriber.foreningsprofil.kommunSlug.
 *
 * Ytan som länkar hit finns inte än (SPEC_ABONNEMANG §6, Design-uppdrag)
 * — success/cancel pekar därför på Mina sidor, den enda befintliga,
 * riktiga destinationen för kontotillstånd.
 *
 * Bara kort (payment_method_types: ['card']) — Swish stödjer inte
 * återkommande debitering (ingen sparbar betalningsmetod för framtida
 * faktureringsperioder), till skillnad från engångsköpet i
 * checkout/registrering.ts. Ingen fallback-logik behövs här.
 *
 * metadata.foreningsprofil sätts på `subscription_data.metadata`, INTE
 * på sessionens egen metadata — webhooken lyssnar på
 * customer.subscription.created (samma handler som H11:s direkta
 * API-väg, som aldrig har en Checkout Session), och den läser
 * metadata från SUBSCRIPTION-objektet.
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { siteUrl } from '../../../lib/mejl';
import { PRIS_ABONNEMANG_ORE } from '../../../lib/priser';

const env = import.meta.env as unknown as Record<string, string>;

export const POST: APIRoute = async ({ request }) => {
  const stripeKey = env.STRIPE_SECRET_KEY?.trim();
  if (!stripeKey) {
    return new Response(JSON.stringify({ ok: false, fel: 'betalning_ej_konfigurerad' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }

  const form = await request.formData();
  const profilRaw = form.get('profil');

  const metadata: Record<string, string> = {};
  if (typeof profilRaw === 'string' && profilRaw.length > 0 && profilRaw.length <= 500) {
    metadata.foreningsprofil = profilRaw;
  }

  const stripe = new Stripe(stripeKey);
  const base = siteUrl();

  const sessionParams = {
    mode: 'subscription' as const,
    line_items: [
      {
        price_data: {
          currency: 'sek',
          unit_amount: PRIS_ABONNEMANG_ORE,
          recurring: { interval: 'year' as const },
          product_data: {
            name: 'Föreningsguiden — Abonnemang',
          },
        },
        quantity: 1,
      },
    ],
    subscription_data: { metadata },
    success_url: `${base}/mina-sidor/?abonnemang=klart`,
    cancel_url: `${base}/mina-sidor/`,
  };

  const session = await stripe.checkout.sessions.create({ ...sessionParams, payment_method_types: ['card'] });

  if (!session.url) {
    return new Response(JSON.stringify({ ok: false }), { status: 502, headers: { 'content-type': 'application/json' } });
  }

  return new Response(JSON.stringify({ ok: true, url: session.url }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};
