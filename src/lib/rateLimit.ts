/**
 * rateLimit.ts — M2.6 (Jacob 2026-08-17). Delad rate limiter för publika,
 * oautentiserade endpoints som skickar mejl (felrapport, kontakt,
 * bevakningsanmälningar, delbart besked, mejla-tratt-länk, magic-link-
 * inloggning) och för adminlogin (brute force). Samma Upstash-instans
 * som redan används för prenumeranter/köp/adminsession
 * (env.KV_REST_API_URL/TOKEN, se adminSession.ts).
 *
 * Utan detta kunde vem som helst — utan konto, utan captcha — bränna
 * Resend-kvoten, spamma tredje parts inkorgar via våra bekräftelsemejl,
 * eller brute-forcea ADMIN_SECRET i valfri takt.
 */
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const env = import.meta.env as unknown as Record<string, string>;
const redis = new Redis({ url: env.KV_REST_API_URL, token: env.KV_REST_API_TOKEN });

/**
 * Klientens identitet för rate limiting — Vercel sätter x-forwarded-for
 * (första adressen i listan är den faktiska klienten, resten är proxy-
 * hopp). Ingen header alls delar samma hink ("anonym") i stället för att
 * smita förbi spärren obegränsat.
 */
export function klientIdentitet(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'anonym';
}

/**
 * Sant om anropet får fortsätta, false om gränsen är nådd för denna
 * (namn, identitet)-kombination. `namn` blir Redis-key-prefixet — en
 * egen räknare per endpoint, delad identitet påverkar aldrig en annan
 * endpoints gräns.
 */
export async function underGransen(
  namn: string,
  identitet: string,
  requests: number,
  fonster: `${number} ${'s' | 'm' | 'h' | 'd'}`
): Promise<boolean> {
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, fonster),
    prefix: `ratelimit:${namn}`,
  });
  const { success } = await ratelimit.limit(identitet);
  return success;
}

/** Standardsvaret när gränsen är nådd — samma form på alla endpoints. */
export function forManga(): Response {
  return new Response(JSON.stringify({ ok: false, fel: 'for_manga_forsok' }), {
    status: 429,
    headers: { 'content-type': 'application/json' },
  });
}
