/**
 * httpSvar.ts — AB1.6 (Jacobs order): en POST-bara route ska svara 405
 * (Method Not Allowed) på andra metoder, inte 404 (Hittar inte) — 404
 * säger "den här sidan finns inte", 405 säger "den finns, men inte så
 * här". Astro exporterar bara ett svar för de metoder en route-fil
 * uttryckligen definierar (export const POST/GET/...) — en oexporterad
 * metod ger annars Astros egen 404, inte ett 405. En sanning: alla
 * POST-bara routes importerar samma funktion i stället för att bygga
 * samma Response på 23 ställen.
 */
export function metodEjTillaten(tillatnaMetoder: string): Response {
  return new Response('Method Not Allowed', {
    status: 405,
    headers: { Allow: tillatnaMetoder },
  });
}
