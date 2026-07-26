/**
 * POST /api/checkout/registrering — skapar en Stripe Checkout Session
 * (testläge tills en juridisk part väljs och kontot växlas till skarpt,
 * SPEC: Betalintegration §1) för Registreringshjälpen. Hostad kassa —
 * ingen egen korthantering, vi rör aldrig kortdata (utanför PCI-scope).
 *
 * Kommun-scopad, inte bidrag-scopad — samma mönster som
 * "registrering"-syftet i vantelista.ts. Stripe Checkout samlar in
 * e-post själv; vi validerar bara att kommunen finns.
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { getKommunBySlug } from '../../../lib/kommuner';
import { siteUrl } from '../../../lib/mejl';

// TODO(Jacob/Fable): bekräfta belopp innan skarp aktivering — ingen spec
// (AFFARSMODELL/KVALITETSSPEC/SLUTSPEC_LANSERING/Betalintegration) anger
// ett kronbelopp för just Registreringshjälpen. 149 kr vald som
// platshållare (samma nivå som utkastets ursprungspris innan
// 07-20-revideringen till 249 kr).
export const PRIS_REGISTRERINGSHJALP_ORE = 14900;

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
  const kommunSlug = String(form.get('kommun') ?? '').trim();
  const profilRaw = form.get('profil');

  const kommun = getKommunBySlug(kommunSlug);
  if (!kommun) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  const metadata: Record<string, string> = { kommunSlug };
  if (typeof profilRaw === 'string' && profilRaw.length > 0 && profilRaw.length <= 500) {
    metadata.foreningsprofil = profilRaw;
  }

  const stripe = new Stripe(stripeKey);
  const base = siteUrl();

  const sessionParams = {
    mode: 'payment' as const,
    line_items: [
      {
        price_data: {
          currency: 'sek',
          unit_amount: PRIS_REGISTRERINGSHJALP_ORE,
          product_data: {
            name: `Registreringshjälp — ${kommun.kommun}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata,
    success_url: `${base}/kommun/${kommunSlug}/registrera/?betald=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/kommun/${kommunSlug}/registrera/`,
  };

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({ ...sessionParams, payment_method_types: ['card', 'swish'] });
  } catch (err) {
    // Swish måste aktiveras i Stripe-dashboarden (Settings → Payment
    // methods) innan Stripe accepterar den som payment_method_type —
    // ett engångs kontoinställningssteg, oberoende av kod. Faller
    // tillbaka till kort ensamt så knappen aldrig 500:ar för en riktig
    // besökare bara för att den inställningen inte är gjord än.
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
