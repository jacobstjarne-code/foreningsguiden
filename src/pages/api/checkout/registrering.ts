/**
 * POST /api/checkout/registrering — skapar en Stripe Checkout Session
 * (testläge tills en juridisk part väljs och kontot växlas till skarpt,
 * SPEC: Betalintegration §1) för Registreringsutkastet (H8, ersätter det
 * tidigare manuella "Registreringshjälp"-erbjudandet — automatiserad
 * leverans, se stripe-webhook.ts). Hostad kassa — ingen egen
 * korthantering, vi rör aldrig kortdata (utanför PCI-scope).
 *
 * Kommun-scopad, inte bidrag-scopad — samma mönster som
 * "registrering"-syftet i vantelista.ts. Stripe Checkout samlar in
 * e-post själv; vi validerar att kommunen finns OCH har
 * forutsattningar att sälja — annars vore det att ta betalt för
 * information som inte finns (AFFARSMODELL §0), inte bara ett
 * UI-gate på registrera-sidan.
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { metodEjTillaten } from '../../../lib/httpSvar';
import Stripe from 'stripe';
import { getKommunBySlug } from '../../../lib/kommuner';
import { siteUrl } from '../../../lib/mejl';
import { PRIS_REGISTRERINGSUTKAST_ORE, MOMSSATS, momsAndelOre } from '../../../lib/priser';
import { SALJARE } from '../../../lib/content';
import { saljargateOk } from '../../../lib/saljargate';

// `?? process.env` — samma idiom som kop.ts, se den filens kommentar.
// Gör env testbar från ett plant node-skript (scripts/verify-saljargate.ts,
// AA1.1) utan att ändra beteendet i Astro/Vite (import.meta.env är alltid
// satt där, ?? triggas aldrig).
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
    console.error('checkout/registrering: skarpt Stripe-läge men säljargaten (saljargate.ts) är inte öppen — vägrar starta köpet.');
    return new Response(JSON.stringify({ ok: false, fel: 'betalning_ej_konfigurerad' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }

  const form = await request.formData();
  const kommunSlug = String(form.get('kommun') ?? '').trim();
  const profilRaw = form.get('profil');
  // 1e (SPEC_HUVUDPROCESSEN §1e, Opus/Fable 2026-08-01): "Två betalknappar:
  // Swish primärt, kort sekundärt" — låser Stripes hostade kassa till
  // ETT betalsätt utifrån vilken knapp hon klickade, i stället för att
  // alltid visa båda och låta henne välja på Stripes sida. Okänt/saknat
  // värde faller på swish (samma default som knapparnas egen ordning).
  const metod = String(form.get('metod') ?? 'swish').trim() === 'kort' ? 'kort' : 'swish';

  const kommun = getKommunBySlug(kommunSlug);
  if (!kommun || kommun.forutsattningar.length === 0) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  // metadata.produkt tillagd 2026-07-30 (checkout/bidragsutkast.ts
  // infördes samma dag) — stripe-webhook.ts grenar nu på fältet i
  // stället för att anta registrering för allt som inte är mode=
  // 'subscription'.
  const metadata: Record<string, string> = { produkt: 'registrering', kommunSlug };
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
          unit_amount: PRIS_REGISTRERINGSUTKAST_ORE,
          product_data: {
            name: `Registreringsutkast — ${kommun.kommun}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata,
    // H10+H15 (GRANSKNING_foreningsguiden.md): Stripe skapar en riktig
    // faktura per köp och mejlar en PDF till en varaktig, hostad länk
    // (går inte ut som Checkout Session-URL:en gör) — täcker
    // "bokföringsbart kvitto" och "varaktig leverans" i en mekanism,
    // utan att vi bygger en egen PDF-pipeline. custom_fields (H10, SPEC:
    // Kluster 1) lägger säljarens namn/org.nr och momsspecifikationen
    // direkt på den PDF:en — Stripes konto-affärsprofil styr annars bara
    // en generisk header, inte de här fälten.
    invoice_creation: {
      enabled: true,
      invoice_data: {
        custom_fields: [
          { name: 'Säljare', value: SALJARE.foretag },
          { name: 'Org.nr', value: SALJARE.orgnr },
          {
            name: `Varav moms (${MOMSSATS * 100}%)`,
            value: `${(momsAndelOre(PRIS_REGISTRERINGSUTKAST_ORE) / 100).toFixed(2).replace('.', ',')} kr`,
          },
        ],
      },
    },
    success_url: `${base}/kommun/${kommunSlug}/registrera/?betald=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/kommun/${kommunSlug}/registrera/`,
  };

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({ ...sessionParams, payment_method_types: metod === 'kort' ? ['card'] : ['swish'] });
  } catch (err) {
    // Swish måste aktiveras i Stripe-dashboarden (Settings → Payment
    // methods) innan Stripe accepterar den som payment_method_type —
    // ett engångs kontoinställningssteg, oberoende av kod. Om HON valde
    // Swish men kontot inte har det aktiverat: faller tillbaka till
    // kort ensamt så knappen aldrig 500:ar för en riktig besökare bara
    // för att den inställningen inte är gjord än (samma resonemang som
    // innan — bara skrivet om för att gälla båda knapparna, inte bara
    // en implicit "båda samtidigt"-session).
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

// AB1.6 (Jacobs order): GET på en POST-bar route ska svara 405, inte Astros
// egen 404 för en oexporterad metod — 404 säger "finns inte", 405 säger
// "finns, men inte så här".
export const GET: APIRoute = () => metodEjTillaten('POST');
