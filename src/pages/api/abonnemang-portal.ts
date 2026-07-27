/**
 * POST /api/abonnemang-portal — öppnar Stripes hostade Customer Portal
 * för den inloggade förenings abonnemang (uppsägning, kortbyte).
 * SPEC_ABONNEMANG.md §4: "Hostat = inget eget bygge, inget underhåll" —
 * samma nollarbetsprincip som gjorde Checkout hostat.
 *
 * Kräver fg_session-cookie (samma mönster som mina-sidor/index.astro
 * och api/byt-epost.ts — sessionen bevisar bara att man äger e-posten,
 * ingen separat auth-modell).
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { SESSION_COOKIE_NAMN, hamtaSessionEmail } from '../../lib/session';
import { hamtaAbonnemangForEmail } from '../../lib/abonnemang';
import { siteUrl } from '../../lib/mejl';

const env = import.meta.env as unknown as Record<string, string>;

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const sessionToken = cookies.get(SESSION_COOKIE_NAMN)?.value;
  const email = sessionToken ? await hamtaSessionEmail(sessionToken) : null;
  if (!email) {
    return redirect('/mina-sidor/');
  }

  const stripeKey = env.STRIPE_SECRET_KEY?.trim();
  if (!stripeKey) {
    return new Response('betalning ej konfigurerad', { status: 503 });
  }

  const abonnemang = await hamtaAbonnemangForEmail(email);
  const aktivt = abonnemang.find((a) => a.status === 'active' || a.status === 'past_due');
  if (!aktivt) {
    return redirect('/mina-sidor/');
  }

  const stripe = new Stripe(stripeKey);
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: aktivt.stripeCustomerId,
    return_url: `${siteUrl()}/mina-sidor/`,
  });

  return redirect(portalSession.url);
};
