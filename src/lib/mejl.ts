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
import type { RegistreringsUtkastRad } from './utkastGenerator';

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

/**
 * H29 (GRANSKNING_foreningsguiden.md): magic-länken för föreningskontot.
 * Path-parameter, inte querysträng — samma rotorsak som sendBekraftelse
 * ovan skyddar mot (en lång inline-URL med "=" kan korrumperas av
 * mejltransportens quoted-printable-radbrytning). Minimal, funktionell
 * transaktionscopy — samma precedent som övriga utility-sidors
 * instruktionstext (avregistrera/kontakt), inte Fable-marknadscopy.
 */
export async function sendInloggningsLank(to: string, token: string): Promise<void> {
  const lank = `${siteUrl()}/api/verifiera-inloggning/${encodeURIComponent(token)}/`;
  const text = urlPaEgenRad(
    `Klicka på länken för att logga in på Mina sidor. Länken är giltig i 15 minuter och kan bara användas en gång.\n${lank}\n\nBad ni inte om detta? Ni kan bortse från mejlet.`
  );

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: 'Logga in — Föreningsguiden',
    text,
  });
  if (result.error) {
    throw new Error(`Resend-fel vid inloggningslänk: ${result.error.message}`);
  }
}

/**
 * H29-tillägg (Mina sidor: byt e-post) — bekräftelselänken går till den
 * NYA adressen, aldrig den gamla (se säkerhetsresonemanget i
 * api/byt-epost.ts). Byter fullbordas först när mottagaren klickar —
 * skydd mot felskrivning som annars låser kontot ute (Jacobs egen
 * instruktion).
 */
export async function sendEpostbyteLank(nyEmail: string, token: string): Promise<void> {
  const lank = `${siteUrl()}/api/verifiera-epostbyte/${encodeURIComponent(token)}/`;
  const text = urlPaEgenRad(
    `Klicka på länken för att bekräfta att ni vill använda den här adressen för ert Föreningsguiden-konto. Länken är giltig i 15 minuter och kan bara användas en gång — bytet sker inte förrän ni klickat.\n${lank}\n\nBad ni inte om detta? Ni kan bortse från mejlet, ingenting ändras.`
  );

  const result = await resend.emails.send({
    from: FROM,
    to: nyEmail,
    subject: 'Bekräfta ny e-postadress — Föreningsguiden',
    text,
  });
  if (result.error) {
    throw new Error(`Resend-fel vid epostbyteslänk: ${result.error.message}`);
  }
}

export interface PaminnelseVars {
  bidragsnamn: string;
  kommun: string;
  datum: string;
  bidragLank: string;
}

/** SPEC_ABONNEMANG.md §4 — abonnemangets fyraveckorspåminnelse, per matchat bidrag. Se content.ts MEJL.paminnelse28 för FABLE-slot-noten. */
export async function sendPaminnelse28(to: string, vars: PaminnelseVars): Promise<void> {
  await sendMejl(to, MEJL.paminnelse28, vars);
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
 * inte hör hemma i ett internt mejl).
 *
 * H8: registreringsutkastet levereras HELT AUTOMATISERAT
 * (sendKopBekraftelse nedan) — det här mejlet är rent informationellt,
 * inget för Jacob att göra. Skiljer sig från det gamla, manuella
 * "Registreringshjälp"-flödet där detta mejl VAR arbetsordern.
 */
export async function sendKopNotis(vars: KopNotisVars): Promise<void> {
  const to = 'jacob.stjarne@gmail.com';
  const text = [
    `Nytt köp — registreringsutkast, ${vars.kommunSlug} (levererat automatiskt, inget att göra).`,
    `E-post: ${vars.email}`,
    `Kommun: ${vars.kommunSlug}`,
    `Belopp: ${vars.belopp} kr`,
    `Registreringssida: ${vars.registreraLank}`,
  ].join('\n');

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: `Nytt köp (levererat automatiskt) — ${vars.kommunSlug}`,
    text,
  });
  if (result.error) {
    throw new Error(`Resend-fel vid köpnotis: ${result.error.message}`);
  }
}

export interface KopBekraftelseVars {
  kommunSlug: string;
  belopp: string; // kr, utan öre
  registreraLank: string;
  hostedInvoiceUrl?: string;
  checklista: RegistreringsUtkastRad[];
}

/**
 * H8+H10+H15 (GRANSKNING_foreningsguiden.md): köparens egen bekräftelse
 * OCH den faktiska leveransen i samma mejl — separat från sendKopNotis
 * (som bara går till Jacob, rent informationellt). Minimal, funktionell
 * transaktionscopy runt checklistan (samma precedent som avregistrera/
 * kontakt-sidornas instruktionstext — Code skriver utility-text för en
 * ren teknisk sida, rapporterar till Fable för justering, inte
 * marknadsprosa). Checklistans EGET innehåll är citerat, inte skrivet
 * här — samma VAGLEDNING.station3-mallar som redan är Fable-godkända
 * (se genereraRegistreringsUtkast, utkastGenerator.ts). Länkar även
 * till Stripes varaktiga fakturalänk (H15) och tillbaka till
 * registreringssidan.
 */
export async function sendKopBekraftelse(to: string, vars: KopBekraftelseVars): Promise<void> {
  const rader = [
    `Tack för ditt köp — Registreringsutkast för er förening i ${vars.kommunSlug}.`,
    `Belopp: ${vars.belopp} kr.`,
    '',
    'Er registreringschecklista:',
    '',
  ];

  vars.checklista.forEach((rad, i) => {
    rader.push(`${i + 1}. ${rad.vad}`);
    rader.push(rad.beskrivning);
    rader.push(rad.ledtidText);
    if (rad.giltighetText) rader.push(rad.giltighetText);
    rader.push(`Källa: ${rad.kallaUrl}`);
    rader.push('');
  });

  rader.push(`Samma checklista, alltid uppdaterad: ${vars.registreraLank}`);
  if (vars.hostedInvoiceUrl) {
    rader.push(`Kvitto/faktura: ${vars.hostedInvoiceUrl}`);
  }

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: `Ert registreringsutkast — ${vars.kommunSlug}`,
    text: rader.join('\n'),
  });
  if (result.error) {
    throw new Error(`Resend-fel vid köpbekräftelse: ${result.error.message}`);
  }
}

export interface AndringsNotisVars {
  kommunSlug: string;
  registreraLank: string;
}

/**
 * H22 (GRANSKNING_foreningsguiden.md): ändringsbevakning. Kommunens
 * registreringskrav har ändrats sedan köparen fick sitt utkast — hon ska
 * inte sitta med ett utkast mot gamla regler utan att veta om det.
 * Minimal, funktionell transaktionstext, samma precedent som övriga
 * utility-mejl. Säger INTE exakt vad som ändrats (ingen egen
 * diff-renderare byggd för det) — bara att något gjort det, med länk
 * till den alltid uppdaterade sidan.
 */
export async function sendAndringsNotis(to: string, vars: AndringsNotisVars): Promise<void> {
  const text = [
    `Kommunens registreringskrav för er förening i ${vars.kommunSlug} har uppdaterats sedan ni fick ert registreringsutkast.`,
    `Se den uppdaterade checklistan: ${vars.registreraLank}`,
  ].join('\n');

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: `Uppdaterade registreringskrav — ${vars.kommunSlug}`,
    text,
  });
  if (result.error) {
    throw new Error(`Resend-fel vid ändringsnotis: ${result.error.message}`);
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
