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
 * Svarar 200 om ett leveransmejl fallerar (sendKopNotis/sendKopBekraftelse
 * m.fl., isolerade i egna try/catch INNE i respektive hanterarfunktion) —
 * betalningen/statusändringen är redan sparad hos oss när de körs, och en
 * mejlretry skulle inte reparera något (idempotensspärren nedan hindrar
 * en Stripe-retry från att nå hanterarfunktionen igen ändå).
 *
 * Svarar ICKE 200 (M1.2, 2026-08-17) om den KRITISKA skrivningen
 * (sparaKop/sparaAbonnemang/uppdateraAbonnemangStatus) eller ett
 * obligatoriskt fält på det inkommande Stripe-objektet fallerar — det
 * betyder att ett betalt köp riskerar att aldrig levereras. Se den yttre
 * catch-blockets kommentar i POST-hanteraren för hela resonemanget.
 *
 * Idempotens per event-typ (samma fälla som H22:s Upstash-auto-parse-bugg
 * — se kop.ts hamtaSenastNotifieradSnapshot): checkout.session.completed
 * kollar `hamtaKop`/`hamtaAbonnemang` FÖRE skrivning; subscription.updated/
 * deleted är rena "sätt status till X"-operationer och därför redan
 * naturligt idempotenta (att köra dem två gånger ger samma sluttillstånd).
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { metodEjTillaten } from '../../lib/httpSvar';
import Stripe from 'stripe';
import { sparaKop, hamtaKop, type KopEntry } from '../../lib/kop';
import { sparaAbonnemang, hamtaAbonnemang, uppdateraAbonnemangStatus, type AbonnemangStatus } from '../../lib/abonnemang';
import { addForeningsprofil } from '../../lib/subscribers';
import { sendKopNotis, sendKopBekraftelse, sendKvitto, sendBidragsutkastNotis, sendBidragsutkastBekraftelse } from '../../lib/mejl';
import type { Foreningsprofil } from '../../lib/foreningsprofil';
import { getKommunBySlug, formatDate } from '../../lib/kommuner';
import { genereraRegistreringsUtkast, genereraUtkast } from '../../lib/utkastGenerator';

const env = import.meta.env as unknown as Record<string, string>;

async function hanteraRegistreringsCheckout(session: Stripe.Checkout.Session, stripe: Stripe): Promise<void> {
  const email = session.customer_details?.email ?? null;
  const kommunSlug = session.metadata?.kommunSlug ?? null;
  if (!email || !kommunSlug) {
    // M1.2 (Jacob 2026-08-17): kastar nu i stället för att tyst returnera
    // — "bör aldrig hända" är inte samma sak som "får tystas". Ett
    // betalt köp utan email/kommunSlug ska synas som ett misslyckat
    // webhook-anrop (icke-200, se POST-hanteraren), inte försvinna som
    // en loggrad ingen läser.
    throw new Error(`registreringscheckout saknar email eller kommunSlug, session ${session.id}`);
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

  // M1.2: sparaKop() OVAN är den kritiska skrivningen (köpet). Ett fel
  // där ska propagera (icke-200, Stripe försöker igen). Profilmergen
  // HÄR sker EFTER att köpet redan räknas som klart hos oss — hamtaKop-
  // idempotensspärren i POST-hanteraren gör att en retry aldrig skulle
  // nå hit igen ändå, så ett kastat fel här vore synligt men inte
  // reparerbart genom retry. Loggat lokalt i stället, samma princip som
  // notismejlen nedan.
  if (foreningsprofil) {
    try {
      await addForeningsprofil(email, foreningsprofil);
    } catch (err) {
      console.error('addForeningsprofil misslyckades (registrering)', session.id, err);
    }
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
 * Bidragsutkastet (CODE_UPPDRAG_KOMMERSIELL §1.B, 2026-07-30). Samma
 * struktur som hanteraRegistreringsCheckout, men produkten är bidrags-
 * OCH profilberoende, inte bara kommun-scopad. metadata.foreningsprofil
 * är OBLIGATORISKT här (checkout/bidragsutkast.ts vägrar skapa en
 * session utan den — servern behöver profilen för att både verifiera
 * matchningen INNAN köpet och generera INNEHÅLLET efter).
 */
async function hanteraBidragsutkastCheckout(session: Stripe.Checkout.Session, stripe: Stripe): Promise<void> {
  const email = session.customer_details?.email ?? null;
  const kommunSlug = session.metadata?.kommunSlug ?? null;
  const bidragId = session.metadata?.bidragId ?? null;
  const profilRaw = session.metadata?.foreningsprofil ?? null;
  // M1.2 (2026-08-17): kastar i stället för att tyst returnera — se
  // motsvarande kommentar i hanteraRegistreringsCheckout.
  if (!email || !kommunSlug || !bidragId || !profilRaw) {
    throw new Error(`bidragsutkast-checkout saknar email/kommunSlug/bidragId/foreningsprofil, session ${session.id}`);
  }

  let foreningsprofil: Foreningsprofil;
  try {
    foreningsprofil = JSON.parse(profilRaw) as Foreningsprofil;
  } catch {
    throw new Error(`bidragsutkast-checkout: ogiltig foreningsprofil-metadata, session ${session.id}`);
  }

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

  const kommun = getKommunBySlug(kommunSlug);
  const bidrag = kommun?.bidrag.find((b) => b.id === bidragId);
  // Racefönster mellan checkout-spärren och webhooken (t.ex. bidraget
  // avaktiverat under tiden) är sannolikt ALDRIG i praktiken — men
  // betalningen är redan skarp hos Stripe när vi når hit, så vi sparar
  // köpet ändå med en tom snapshot hellre än att tappa det helt.
  const resultat = kommun && bidrag ? genereraUtkast(foreningsprofil, bidrag, kommun) : null;
  const doc = resultat?.typ === 'bidragsutkast' ? resultat : null;
  if (!doc) {
    console.error('bidragsutkast-checkout: genereraUtkast gav inte bidragsutkast vid webhook-tillfället', session.id);
  }

  const entry: KopEntry = {
    email,
    kommunSlug,
    produkt: 'bidragsutkast',
    bidragId,
    beloppOre: session.amount_total ?? 0,
    stripeSessionId: session.id,
    betaldDatum: new Date().toISOString(),
    foreningsprofil,
    hostedInvoiceUrl,
    invoicePdf,
    bidragsutkastSnapshot: doc ? JSON.stringify(doc) : undefined,
  };
  await sparaKop(entry);

  // M1.2 — samma resonemang som hanteraRegistreringsCheckout: sparaKop()
  // ovan är den kritiska skrivningen, profilmergen sker efter att köpet
  // redan räknas som klart (idempotensspärren gör en retry meningslös
  // härifrån). Loggat lokalt, inte kastat.
  try {
    await addForeningsprofil(email, foreningsprofil);
  } catch (err) {
    console.error('addForeningsprofil misslyckades (bidragsutkast)', session.id, err);
  }

  const utkastLank = `https://foreningsguiden.se/kommun/${kommunSlug}/utkast/${bidragId}/`;
  const kopLank = `https://foreningsguiden.se/mina-sidor/kop/${encodeURIComponent(session.id)}/`;
  const beloppKr = (entry.beloppOre / 100).toFixed(0);
  const bidragNamn = doc?.bidragNamn ?? bidrag?.namn ?? bidragId;

  try {
    await sendBidragsutkastNotis({ email, kommunSlug, bidragNamn, belopp: beloppKr, utkastLank });
  } catch (err) {
    console.error('sendBidragsutkastNotis misslyckades', err);
  }

  if (doc) {
    try {
      await sendBidragsutkastBekraftelse(email, {
        kommun: doc.kommun,
        bidragNamn: doc.bidragNamn,
        belopp: beloppKr,
        deadlineText: doc.deadlineText,
        bidragBelopp: doc.belopp,
        kravRader: doc.kravRader,
        ansvarsrad: doc.ansvarsrad,
        kopLank,
        hostedInvoiceUrl,
      });
    } catch (err) {
      console.error('sendBidragsutkastBekraftelse misslyckades', err);
    }
  } else {
    console.error('sendBidragsutkastBekraftelse hoppades över — inget dokument kunde genereras för', session.id);
  }

  if (invoicePdf) {
    try {
      await sendKvitto(email, {
        produkt: `Bidragsutkast — ${bidragNamn} (${kommun?.kommun ?? kommunSlug})`,
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
    // M1.2 — kastar i stället för att tyst returnera, samma resonemang
    // som checkout-hanterarna.
    throw new Error(`abonnemang saknar e-post på kunden, subscription ${subscription.id}, customer ${customerId}`);
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
          // metadata.produkt tillagd 2026-07-30 (checkout/bidragsutkast.ts).
          // Äldre/okänd metadata (borde inte finnas i praktiken — bara
          // dessa två checkout-routes skapar mode='payment'-sessioner)
          // faller tillbaka till registrering, det historiska beteendet.
          if (session.metadata?.produkt === 'bidragsutkast') {
            await hanteraBidragsutkastCheckout(session, stripe);
          } else {
            await hanteraRegistreringsCheckout(session, stripe);
          }
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
    // M1.2 (Jacob 2026-08-17, "säkerhet först"): TIDIGARE svarade den här
    // grenen alltid 200 här — "ett fel ska inte trigga en falsk retry-
    // loop". Det var fel för den här sortens fel. Ett kastat fel härifrån
    // betyder att sparaKop/sparaAbonnemang/uppdateraAbonnemangStatus (den
    // KRITISKA skrivningen — betalningen är redan skarp hos Stripe)
    // aldrig lyckades, eller att en betald session saknade obligatoriska
    // fält. Att kvittera det som lyckat gömmer ett tappat köp bakom en
    // grön logg. Notismejl-fel (sendKopNotis m.fl.) och profilmerge-fel
    // (addForeningsprofil) är redan isolerade i egna try/catch INNE i
    // respektive hanterarfunktion och når aldrig hit — bara fel FÖRE
    // eller UNDER den kritiska skrivningen gör det. Loggar med full
    // kontext (event-typ, event-id, felet) och svarar icke-200 så Stripe
    // faktiskt försöker igen (och så felet syns i Stripes egen
    // leveranslogg om det ändå inte kan självläka).
    console.error('KRITISKT: stripe-webhook-hantering misslyckades', {
      eventType: event.type,
      eventId: event.id,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return new Response(JSON.stringify({ ok: false, fel: 'hanteringen misslyckades, se serverloggen' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};

// AB1.6 (Jacobs order): GET på en POST-bar route ska svara 405, inte Astros
// egen 404 för en oexporterad metod — 404 säger "finns inte", 405 säger
// "finns, men inte så här".
export const GET: APIRoute = () => metodEjTillaten('POST');
