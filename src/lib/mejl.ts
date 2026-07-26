/**
 * mejl.ts — Utskicksmotorn (SPRINT §Spår A). Resend-klient + mallrendering
 * för MEJL.* (content.ts). All copy kommer från content.ts — den här filen
 * fyller variabler och skickar, skriver ingen egen text.
 *
 * import.meta.env (inte process.env) — samma mönster som subscribers.ts,
 * verifierat att fungera i både dev och Vercel-produktion för KV_REST_API_*.
 */
import { Resend } from 'resend';
import { MEJL } from './content';

const env = import.meta.env as unknown as Record<string, string>;
// .trim() — rotorsak till den korrumperade bekräftelselänken (skarpt test
// 2026-07-18): SITE_URL sattes en gång via en printf-pipe med en släpande
// radbrytning, som Vercel/dotenv sparade in i värdet ordagrant. Resultatet
// var en äkta "\n" mitt i varje länk (inte bara ett quoted-printable-
// kodningsproblem), vilket bröt raden efter ".vercel.app" i själva verket.
// Värdena i Vercel är nu rensade, men trim() här är kvar som permanent skydd
// mot att samma klass av inputfel återkommer nästa gång ett env-värde sätts.
const resend = new Resend(env.RESEND_API_KEY?.trim());

// Ingen no-reply (SPRINT §MEJL) — mottagare ska kunna svara direkt.
// Egen verifierad domän (SPRINT §Steg 2, 2026-07-20) — resend.dev var bara
// provisoriskt tills SPF/DKIM/DMARC fanns på plats för foreningsguiden.se.
const FROM = 'Föreningsguiden <bevakning@foreningsguiden.se>';

/**
 * Bas-URL för länkar i mejl. SITE_URL = https://foreningsguiden.se sedan
 * domänkopplingen (2026-07-20). vercel.app kvar som fallback bara om
 * env-värdet någon gång saknas.
 */
export function siteUrl(): string {
  return (env.SITE_URL || 'https://foreningsguiden.vercel.app').trim();
}

function fillTemplate(str: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), str);
}

/**
 * Rotorsak-skydd: en lång inline-URL kan hamna på mejltransportens quoted-
 * printable-radbrytningsgräns och korrumpera ett "="-tecken i frågesträngen
 * (verifierat i skarpt test, se [token].ts). Länkar utan "=" (path-params)
 * löser grundfelet; detta bryter dessutom ut varje URL till en egen rad,
 * som andra skyddslager och för att länkar generellt är säkrare fristående
 * i vanlig text-mejl.
 */
function urlPaEgenRad(text: string): string {
  return text.replace(/([^\n])(https?:\/\/\S+)/g, '$1\n$2');
}

interface MejlMall {
  amne: string;
  body: string[];
}

async function sendMejl(to: string, mall: MejlMall, vars: Record<string, string>): Promise<void> {
  const allVars = { avregLank: `${siteUrl()}/avregistrera/`, ...vars };
  const subject = fillTemplate(mall.amne, allVars);
  const bodyText = mall.body.map((p) => fillTemplate(p, allVars)).join('\n\n');
  const sidfot = fillTemplate(MEJL.sidfot, allVars);
  const text = urlPaEgenRad(`${bodyText}\n\n—\n${sidfot}`);

  const result = await resend.emails.send({ from: FROM, to, subject, text });
  if (result.error) {
    throw new Error(`Resend-fel vid utskick till ${to}: ${result.error.message}`);
  }
}

export async function sendBekraftelse(to: string, kommunLista: string, token: string): Promise<void> {
  // Path-parameter, inte querysträng — se rotorsaksnoten i [token].ts.
  const bekraftaLank = `${siteUrl()}/api/bekrafta/${encodeURIComponent(token)}/`;
  await sendMejl(to, MEJL.bekraftelse, { kommunLista, bekraftaLank });
}

export async function sendValkomst(to: string, kommunLista: string, kommunLank: string): Promise<void> {
  await sendMejl(to, MEJL.valkomst, { kommunLista, kommunLank });
}

export interface PaminnelseVars {
  bidragsnamn: string;
  kommun: string;
  datum: string;
  bidragLank: string;
}

export async function sendPaminnelse14(to: string, vars: PaminnelseVars): Promise<void> {
  await sendMejl(to, MEJL.paminnelse14, vars);
}

export async function sendPaminnelse3(to: string, vars: PaminnelseVars & { veckodag: string }): Promise<void> {
  await sendMejl(to, MEJL.paminnelse3, vars);
}

export interface KopNotisVars {
  email: string;
  kommunSlug: string;
  belopp: string; // kr, utan öre — redan avrundat av anroparen
  registreraLank: string;
}

/**
 * Internt driftmejl till Jacob vid ett bekräftat köp (stripe-webhook.ts).
 * Faktatext, inte marknadscopy — går bara till Jacob, ingen Fable-copy
 * eller sendMejl()-mall (den lägger på ett avregistrera-dig-sidfot som
 * inte hör hemma i ett internt mejl). Registreringshjälpen levereras
 * manuellt (SPEC: Betalintegration §4) — det här mejlet ÄR
 * arbetsordern.
 */
export async function sendKopNotis(vars: KopNotisVars): Promise<void> {
  const to = 'jacob.stjarne@gmail.com';
  const text = [
    `Ny betald registreringshjälp — ${vars.kommunSlug}`,
    `E-post: ${vars.email}`,
    `Kommun: ${vars.kommunSlug}`,
    `Belopp: ${vars.belopp} kr`,
    `Registreringssida: ${vars.registreraLank}`,
  ].join('\n');

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: `Ny betald registreringshjälp — ${vars.kommunSlug}`,
    text,
  });
  if (result.error) {
    throw new Error(`Resend-fel vid köpnotis: ${result.error.message}`);
  }
}

export interface KontaktNotisVars {
  namn: string;
  email: string;
  meddelande: string;
}

/**
 * H21 (GRANSKNING_foreningsguiden.md): kontaktformulärets mejl till Jacob.
 * replyTo = avsändarens egen adress, så ett svar går direkt till henne —
 * inte till FROM (som är en avsändaradress, inget övervakat inkorg).
 */
export async function sendKontaktNotis(vars: KontaktNotisVars): Promise<void> {
  const to = 'jacob.stjarne@gmail.com';
  const text = [`Namn: ${vars.namn}`, `E-post: ${vars.email}`, '', vars.meddelande].join('\n');

  const result = await resend.emails.send({
    from: FROM,
    to,
    replyTo: vars.email,
    subject: `Kontaktformulär — ${vars.namn}`,
    text,
  });
  if (result.error) {
    throw new Error(`Resend-fel vid kontaktnotis: ${result.error.message}`);
  }
}
