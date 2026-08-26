/**
 * POST /api/checkout/abonnemang-faktura — H11: faktura som betalalternativ
 * för Abonnemanget (SPEC_ABONNEMANG.md §4: "Många föreningar får bara
 * betala mot faktura... Inte en gate — ett alternativ"). Skapar en
 * Stripe Customer + Subscription DIREKT via API (ingen Checkout Session
 * — fakturaflödet är per definition inte en hostad kortkassa), med
 * `collection_method: 'send_invoice'`: Stripe mejlar en riktig faktura
 * själv, ingen egen fakturapipeline.
 *
 * Samma webhook-hantering som Checkout-vägen fångar detta: Stripe
 * fyrar customer.subscription.created oavsett skapandeväg, och
 * stripe-webhook.ts:s hanteraAbonnemangSkapad() läser metadata från
 * SUBSCRIPTION-objektet (satt direkt här, ingen Checkout Session att
 * hänga metadata på) — se den filens kommentar.
 *
 * Ingen egen UI-yta i detta pass (SPEC_ABONNEMANG §6) — en fri,
 * ogated POST-endpoint. `foretag`/`orgnr` är den BETALANDE föreningens
 * uppgifter (för Stripe-kundens namn), inte Föreningsguidens egna.
 *
 * stripe.subscriptions.create() accepterar INTE inline price_data.
 * product_data (till skillnad från Checkout Sessions, som stödjer det
 * som en bekvämlighet) — upptäckt i ett riktigt sandbox-testanrop:
 * "Received unknown parameter: items[0][price_data][product_data].
 * Did you mean product?". Skapar därför ett riktigt Price-objekt först
 * (stripe.prices.create STÖDJER inline product_data) och refererar dess
 * id i subscriptions.create — samma slutresultat, en extra rad kod.
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { metodEjTillaten } from '../../../lib/httpSvar';
import Stripe from 'stripe';
import { PRIS_ABONNEMANG_ORE } from '../../../lib/priser';

const env = import.meta.env as unknown as Record<string, string>;

// M1.1 (Jacob 2026-08-17, "säkerhet först"): STÄNGD. Ingen UI-yta har
// någonsin länkat hit (grep bekräftat), men endpointen var live och
// helt ogated — vem som helst kunde POSTa en godtycklig e-postadress
// och få Föreningsguiden att skapa en riktig Stripe-kund + skicka en
// riktig faktura (495 kr/år) till den adressen, utan betalning,
// inloggning eller CAPTCHA. Trakasserifara (skicka fakturor till
// främmande adresser i Föreningsguidens namn) + obegränsad Stripe-
// dataskapande. 410 utan att röra Stripe alls — koden nedan orörd för
// den dagen ett riktigt gated flöde (ADMIN_SECRET eller en byggd,
// inloggningsskyddad admin-yta) faktiskt ska anropa den.
export const POST: APIRoute = async () => {
  return new Response(JSON.stringify({ ok: false, fel: 'stängd' }), {
    status: 410,
    headers: { 'content-type': 'application/json' },
  });
};

async function _stangdOanvandKod(request: Request) {
  const stripeKey = env.STRIPE_SECRET_KEY?.trim();
  if (!stripeKey) {
    return new Response(JSON.stringify({ ok: false, fel: 'betalning_ej_konfigurerad' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }

  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const foretag = String(form.get('foretag') ?? '').trim();
  const profilRaw = form.get('profil');

  if (!email) {
    return new Response(JSON.stringify({ ok: false, fel: 'e-post krävs' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const metadata: Record<string, string> = {};
  if (typeof profilRaw === 'string' && profilRaw.length > 0 && profilRaw.length <= 500) {
    metadata.foreningsprofil = profilRaw;
  }

  const stripe = new Stripe(stripeKey);

  const customer = await stripe.customers.create({
    email,
    name: foretag || undefined,
  });

  const price = await stripe.prices.create({
    currency: 'sek',
    unit_amount: PRIS_ABONNEMANG_ORE,
    recurring: { interval: 'year' },
    product_data: { name: 'Föreningsguiden — Abonnemang' },
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: price.id }],
    collection_method: 'send_invoice',
    days_until_due: 30,
    metadata,
  });

  return new Response(JSON.stringify({ ok: true, subscriptionId: subscription.id }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

// AB1.6 (Jacobs order): GET på en POST-bar route ska svara 405, inte Astros
// egen 404 för en oexporterad metod — 404 säger "finns inte", 405 säger
// "finns, men inte så här".
export const GET: APIRoute = () => metodEjTillaten('POST');
