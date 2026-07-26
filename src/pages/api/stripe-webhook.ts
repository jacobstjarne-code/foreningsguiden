/**
 * POST /api/stripe-webhook — bekräftar Stripe-köp (checkout.session.completed)
 * och triggar leverans. Enda webhooken (SPEC: Betalintegration §3 —
 * "minimal yta = minimalt underhåll", ingen egenbyggd webhook-mängd).
 *
 * Läser RAW body (request.text(), INTE request.json()) — Stripes
 * signaturverifiering kräver den obehandlade byte-strömmen, en JSON-
 * ompparsning skulle ge en annan bytesekvens och alltid faila verifieringen.
 *
 * Svarar 200 så fort köpet är sparat, ÄVEN om notismejlet fallerar —
 * betalningen är redan skarp (i testläge: redan "genomförd" i Stripes
 * mening) och ett mejlfel ska inte trigga en falsk webhook-retry-loop hos
 * Stripe (som annars skickar samma event igen).
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { sparaKop, hamtaKop, type KopEntry } from '../../lib/kop';
import { addForeningsprofil } from '../../lib/subscribers';
import { sendKopNotis, sendKopBekraftelse } from '../../lib/mejl';
import type { Foreningsprofil } from '../../lib/foreningsprofil';

const env = import.meta.env as unknown as Record<string, string>;

export const POST: APIRoute = async ({ request }) => {
  const stripeKey = env.STRIPE_SECRET_KEY?.trim();
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripeKey || !webhookSecret) {
    return new Response('betalning ej konfigurerad', { status: 503 });
  }

  const signatur = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  const stripe = new Stripe(stripeKey);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signatur ?? '', webhookSecret);
  } catch (err) {
    return new Response(`ogiltig signatur: ${(err as Error).message}`, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return new Response(JSON.stringify({ ok: true, hoppadOver: event.type }), { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Idempotens — Stripe kan leverera samma event mer än en gång. Redan
  // sparad session ⇒ svara 200 utan att skicka notismejlet igen.
  const redanSparad = await hamtaKop(session.id);
  if (redanSparad) {
    return new Response(JSON.stringify({ ok: true, redanHanterad: true }), { status: 200 });
  }

  const email = session.customer_details?.email ?? null;
  const kommunSlug = session.metadata?.kommunSlug ?? null;
  if (!email || !kommunSlug) {
    // Bör aldrig hända (vi sätter alltid metadata.kommunSlug och Stripe
    // Checkout kräver e-post) — men svara 200 så Stripe inte retry-loopar
    // på ett event vi ändå inte kan koppla till en kommun.
    return new Response(JSON.stringify({ ok: false, fel: 'saknar email eller kommunSlug' }), { status: 200 });
  }

  let foreningsprofil: Foreningsprofil | undefined;
  const profilRaw = session.metadata?.foreningsprofil;
  if (profilRaw) {
    try {
      foreningsprofil = JSON.parse(profilRaw) as Foreningsprofil;
    } catch {
      foreningsprofil = undefined;
    }
  }

  // H10+H15: invoice_creation (checkout/registrering.ts) sätter
  // session.invoice — hämta fakturans varaktiga, hostade länk om den
  // hann skapas. Fakturan är inte kritisk för att köpet ska räknas som
  // klart — misslyckas hämtningen sparas köpet ändå, bara utan länken.
  let hostedInvoiceUrl: string | undefined;
  let invoicePdf: string | undefined;
  if (typeof session.invoice === 'string') {
    try {
      const invoice = await stripe.invoices.retrieve(session.invoice);
      hostedInvoiceUrl = invoice.hosted_invoice_url ?? undefined;
      invoicePdf = invoice.invoice_pdf ?? undefined;
    } catch (err) {
      console.error('Kunde inte hämta Stripe-fakturan', err);
    }
  }

  const entry: KopEntry = {
    email,
    kommunSlug,
    produkt: 'registrering',
    beloppOre: session.amount_total ?? 0,
    stripeSessionId: session.id,
    betaldDatum: new Date().toISOString(),
    foreningsprofil,
    hostedInvoiceUrl,
    invoicePdf,
  };
  await sparaKop(entry);

  if (foreningsprofil) {
    await addForeningsprofil(email, foreningsprofil);
  }

  const registreraLank = `https://foreningsguiden.se/kommun/${kommunSlug}/registrera/`;
  const beloppKr = (entry.beloppOre / 100).toFixed(0);

  try {
    await sendKopNotis({ email, kommunSlug, belopp: beloppKr, registreraLank });
  } catch (err) {
    // Loggas men blockerar inte 200-svaret — se filhuvudet.
    console.error('sendKopNotis misslyckades', err);
  }

  try {
    await sendKopBekraftelse(email, { kommunSlug, belopp: beloppKr, registreraLank, hostedInvoiceUrl });
  } catch (err) {
    console.error('sendKopBekraftelse misslyckades', err);
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
