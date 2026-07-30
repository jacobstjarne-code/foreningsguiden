/**
 * POST /api/stripe-webhook — bekräftar Stripe-köp och triggar leverans.
 * Enda webhooken (SPEC: Betalintegration §3 — "minimal yta = minimalt
 * underhåll", ingen egenbyggd webhook-mängd), nu med två produkter:
 *
 * - `checkout.session.completed` (mode='payment'): Registreringsutkastet
 *   (H8) — oförändrad logik, se hanteraRegistreringsCheckout().
 * - `customer.subscription.created`, `.updated`, `.deleted`: Abonnemanget
 *   (SPEC_ABONNEMANG.md §4, exakt de tre event-typerna specen ber om) —
 *   se hanteraAbonnemangSkapad() m.fl. Uniform för BÅDA sätten ett
 *   abonnemang kan skapas på (checkout/abonnemang.ts via Checkout, eller
 *   abonnemang-faktura.ts som skapar subscriptionen direkt via API för
 *   H11-fakturaflödet) — ingen checkout.session.completed-gren för
 *   subscription-läge, eftersom fakturavägen aldrig har en Checkout
 *   Session alls. metadata.foreningsprofil sätts därför på SJÄLVA
 *   subscription-objektet (subscription_data.metadata i Checkout-fallet)
 *   i stället för på sessionen, så en enda handler täcker båda vägarna.
 *
 * Läser RAW body (request.text(), INTE request.json()) — Stripes
 * signaturverifiering kräver den obehandlade byte-strömmen, en JSON-
 * ompparsning skulle ge en annan bytesekvens och alltid faila verifieringen.
 *
 * Svarar 200 så fort ett event är hanterat, ÄVEN om ett leveransmejl
 * fallerar — betalningen/statusändringen är redan skarp hos Stripe, och
 * ett mejlfel ska inte trigga en falsk webhook-retry-loop (som annars
 * skickar samma event igen).
 *
 * Idempotens per event-typ (samma fälla som H22:s Upstash-auto-parse-bugg
 * — se kop.ts hamtaSenastNotifieradSnapshot): checkout.session.completed
 * kollar `hamtaKop`/`hamtaAbonnemang` FÖRE skrivning; subscription.updated/
 * deleted är rena "sätt status till X"-operationer och därför redan
 * naturligt idempotenta (att köra dem två gånger ger samma sluttillstånd).
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { sparaKop, hamtaKop, type KopEntry } from '../../lib/kop';
import { sparaAbonnemang, hamtaAbonnemang, uppdateraAbonnemangStatus, type AbonnemangStatus } from '../../lib/abonnemang';
import { addForeningsprofil } from '../../lib/subscribers';
import { sendKopNotis, sendKopBekraftelse, sendKvitto } from '../../lib/mejl';
import type { Foreningsprofil } from '../../lib/foreningsprofil';
import { getKommunBySlug, formatDate } from '../../lib/kommuner';
import { genereraRegistreringsUtkast } from '../../lib/utkastGenerator';

const env = import.meta.env as unknown as Record<string, string>;

async function hanteraRegistreringsCheckout(session: Stripe.Checkout.Session, stripe: Stripe): Promise<void> {
  const email = session.customer_details?.email ?? null;
  const kommunSlug = session.metadata?.kommunSlug ?? null;
  if (!email || !kommunSlug) {
    // Bör aldrig hända (vi sätter alltid metadata.kommunSlug och Stripe
    // Checkout kräver e-post) — men logga och returnera, inte kasta, så
    // Stripe fortfarande får 200 (se POST-hanteraren).
    console.error('registreringscheckout saknar email eller kommunSlug', session.id);
    return;
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

  // H8: den faktiska leveransen — genererar registreringsutkastet.
  // Beräknas FÖRE sparaKop() så H22:s snapshot (samma innehåll som
  // faktiskt mejlas) kan sparas i samma skrivning, inte som ett separat
  // uppdateringssteg.
  const kommun = getKommunBySlug(kommunSlug);
  const checklista = kommun ? genereraRegistreringsUtkast(kommun) : [];

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
    forutsattningarSnapshot: JSON.stringify(checklista),
  };
  await sparaKop(entry);

  if (foreningsprofil) {
    await addForeningsprofil(email, foreningsprofil);
  }

  const registreraLank = `https://foreningsguiden.se/kommun/${kommunSlug}/registrera/`;
  // H15 (SPEC: Det som återstår, 2026-07-28): länken till köparens
  // varaktiga, inloggningsskyddade kopia — se kopLank-noten i
  // sendKopBekraftelse (mejl.ts).
  const kopLank = `https://foreningsguiden.se/mina-sidor/kop/${encodeURIComponent(session.id)}/`;
  const beloppKr = (entry.beloppOre / 100).toFixed(0);

  try {
    await sendKopNotis({ email, kommunSlug, belopp: beloppKr, registreraLank });
  } catch (err) {
    console.error('sendKopNotis misslyckades', err);
  }

  try {
    await sendKopBekraftelse(email, { kommunSlug, belopp: beloppKr, registreraLank, kopLank, hostedInvoiceUrl, checklista });
  } catch (err) {
    console.error('sendKopBekraftelse misslyckades', err);
  }

  // H10 (SPEC: Kluster 1): det bokföringsbara kvittot, SEPARAT mejl med
  // fakturans PDF som bilaga. Bara om fakturan faktiskt hanns hämtas
  // ovan — annars finns ingen PDF att bifoga, och ett kvittomejl som
  // PÅSTÅR att kvittot ligger som bilaga fast det inte gör det är värre
  // än inget kvittomejl alls.
  if (invoicePdf) {
    try {
      await sendKvitto(email, {
        produkt: `Registreringsutkast — ${kommun?.kommun ?? kommunSlug}`,
        belopp: beloppKr,
        datum: formatDate(entry.betaldDatum.slice(0, 10)),
        invoicePdfUrl: invoicePdf,
      });
    } catch (err) {
      console.error('sendKvitto misslyckades', err);
    }
  } else {
    console.error('sendKvitto hoppades över — ingen invoicePdf för', session.id);
  }
}

/**
 * current_period_end flyttades från Subscription till SubscriptionItem i
 * denna Stripe API-version (2026-06-24.dahlia) — bekräftat mot node_modules/
 * stripe/.../Subscriptions.d.ts under verifiering (subscription.
 * current_period_end fanns inte längre, gav "RangeError: Invalid time
 * value" i ett riktigt sandbox-testköp). Våra prenumerationer har alltid
 * EXAKT en rad (ett pris), så items.data[0] räcker — ingen sammanslagning
 * av flera rader med olika perioder behövs.
 */
function hamtaGiltigTill(subscription: Stripe.Subscription): string {
  const periodEnd = subscription.items.data[0]?.current_period_end;
  return new Date((periodEnd ?? 0) * 1000).toISOString().slice(0, 10);
}

/**
 * Abonnemangets startpunkt — customer.subscription.created, oavsett
 * vilken väg som skapade prenumerationen (Checkout eller H11:s direkta
 * API-anrop). En Subscription bär bara ett customer-ID, ingen e-post
 * direkt — hämtar kunden för att få den, samma mönster oberoende av väg.
 */
async function hanteraAbonnemangSkapad(subscription: Stripe.Subscription, stripe: Stripe): Promise<void> {
  // Idempotens — samma princip som hamtaKop-kollen i registreringsflödet.
  const redanSparad = await hamtaAbonnemang(subscription.id);
  if (redanSparad) return;

  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
  const customer = await stripe.customers.retrieve(customerId);
  const email = !customer.deleted ? customer.email : null;
  if (!email) {
    console.error('abonnemang saknar e-post på kunden', subscription.id, customerId);
    return;
  }

  const giltigTill = hamtaGiltigTill(subscription);

  await sparaAbonnemang({
    email,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    status: subscription.status as AbonnemangStatus,
    giltigTill,
    skapad: new Date().toISOString(),
  });

  // Samma merge-mekanism som registreringsflödet redan använder — ingen
  // ny kod, samma addForeningsprofil()-anrop. metadata ligger på SJÄLVA
  // subscription-objektet (subscription_data.metadata i Checkout-fallet,
  // metadata direkt i abonnemang-faktura.ts:s subscriptions.create) —
  // inte på en Checkout Session, som inte alltid finns (H11-vägen).
  const profilRaw = subscription.metadata?.foreningsprofil;
  if (profilRaw) {
    try {
      const foreningsprofil = JSON.parse(profilRaw) as Foreningsprofil;
      await addForeningsprofil(email, foreningsprofil);
    } catch {
      // Ogiltig JSON i metadata — abonnemanget är ändå giltigt sparat,
      // bara utan en föreningsprofil att matcha mot förrän tratten
      // besvaras separat.
    }
  }

  // Inget kop-notis/bekräftelsemejl än — SPEC_ABONNEMANG §6 (ingen
  // presentationsyta byggd) har heller ingen godkänd köpbekräftelsecopy
  // för abonnemanget. Flaggat, inte tyst byggt med gissad text.
}

/** customer.subscription.updated — status/giltighetsdatum ändras (förnyelse, betalningsproblem). */
async function hanteraAbonnemangUppdatering(subscription: Stripe.Subscription): Promise<void> {
  await uppdateraAbonnemangStatus(subscription.id, subscription.status as AbonnemangStatus, hamtaGiltigTill(subscription));
}

/** customer.subscription.deleted — uppsägning (via Customer Portal eller annars). */
async function hanteraAbonnemangUppsagning(subscription: Stripe.Subscription): Promise<void> {
  await uppdateraAbonnemangStatus(subscription.id, 'canceled', hamtaGiltigTill(subscription));
}

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

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Bara mode='payment' hanteras här — mode='subscription' skapar
      // sin egen customer.subscription.created, hanterad nedan, samma
      // handler oavsett om subscriptionen kom via Checkout eller H11:s
      // direkta API-anrop (abonnemang-faktura.ts).
      if (session.mode !== 'subscription') {
        const redanSparad = await hamtaKop(session.id);
        if (!redanSparad) {
          await hanteraRegistreringsCheckout(session, stripe);
        }
      }
    } else if (event.type === 'customer.subscription.created') {
      await hanteraAbonnemangSkapad(event.data.object as Stripe.Subscription, stripe);
    } else if (event.type === 'customer.subscription.updated') {
      await hanteraAbonnemangUppdatering(event.data.object as Stripe.Subscription);
    } else if (event.type === 'customer.subscription.deleted') {
      await hanteraAbonnemangUppsagning(event.data.object as Stripe.Subscription);
    } else {
      return new Response(JSON.stringify({ ok: true, hoppadOver: event.type }), { status: 200 });
    }
  } catch (err) {
    // Ett fel i hanteringen ska INTE ge Stripe en 4xx/5xx (det triggar
    // retry-loopar för ett event vi kanske redan delvis behandlat) —
    // logga och svara 200, samma policy som mejlfelen nedan alltid följt.
    console.error('stripe-webhook-hantering misslyckades', event.type, err);
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
