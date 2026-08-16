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
import type { RegistreringsUtkastRad, UtkastKravRad } from './utkastGenerator';

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

// J1 (2026-08-16): parameternamnen kommunLista/kommunLank är kvar
// oförändrade (samma anrop från api/bekrafta/[token].ts) — bara vilka
// mallnycklar de fyller mappades om, till {kommun}/{lank}
// (MEJLTEXTER.md #1, se MEJL.valkomst-kommentaren i content.ts).
export async function sendValkomst(to: string, kommunLista: string, kommunLank: string): Promise<void> {
  await sendMejl(to, MEJL.valkomst, { kommun: kommunLista, lank: kommunLank });
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

/** SPEC_ABONNEMANG.md §4 — fyraveckorspåminnelsen (MEJLTEXTER.md #2), delad mellan gratis bevakning och abonnemang sedan J2 (28/3-rytmen). */
export async function sendPaminnelse28(to: string, vars: PaminnelseVars): Promise<void> {
  await sendMejl(to, MEJL.paminnelse28, vars);
}

/**
 * J2 (2026-08-16, MEJLTEXTER.md #6 "Sista påminnelsen"). Ersätter de
 * superseterade sendPaminnelse14 och sendPaminnelse3 (14/3-rytmen
 * utgår helt — "Rytm"-avsnittet i källfilen: "Inte 30/14/3"). Delad
 * mellan cron/paminnelser.ts (gratis bevakning) och cron/
 * abonnemangsbevakning.ts (abonnemang) — samma slot, samma text.
 */
export async function sendPaminnelseSista(to: string, vars: PaminnelseVars): Promise<void> {
  await sendMejl(to, MEJL.paminnelseSista, vars);
}

export interface GiltighetsvarningNiva2Vars {
  kommun: string;
  kalla_url: string;
}

/**
 * J1 (2026-08-16, MEJLTEXTER.md #4). Ersätter den superseterade
 * sendGiltighetsvarning/MEJL.giltighetsvarning (275-dagarsantagandet,
 * C3.1 2026-08-11 — 0 riktiga mejl någonsin skickade, inget innehåll att
 * migrera). NIVÅ 2: kommunen saknar giltighet_regel, går ut en gång om
 * året i januari — cron/giltighetsvarning.ts.
 */
export async function sendGiltighetsvarningNiva2(to: string, vars: GiltighetsvarningNiva2Vars): Promise<void> {
  await sendMejl(to, MEJL.giltighetsvarningNiva2, vars);
}

export interface GiltighetsvarningNiva1Vars {
  arsmotesdatum: string;
  kommun: string;
  // Fras för regel.typ+regel.antal (t.ex. "i tretton månader från
  // beslutsdagen") — källa: regeltext() (kommunTyper.ts), byggd J2 ur
  // MEJLTEXTER.md:s regeltext-tabell. Caller (cron/giltighetsvarning.ts)
  // beräknar den, inte den här filen.
  regeltext: string;
  forfallodatum: string;
  manad: string;
  kalla_url: string;
}

/**
 * J1+J2 (2026-08-16, MEJLTEXTER.md #5 "Giltighet, nivå ett"). G1
 * (2026-08-17) kopplade cron/giltighetsvarning.ts:s NIVÅ 1-gren hit när
 * den strukturerade regeldatan landade.
 */
export async function sendGiltighetsvarningNiva1(to: string, vars: GiltighetsvarningNiva1Vars): Promise<void> {
  await sendMejl(to, MEJL.giltighetsvarningNiva1, vars);
}

export interface AndringsbeskedVars {
  kommun: string;
  bidragsnamn: string;
  vad_som_andrats: string;
  kalla_url: string;
}

/**
 * J1 (2026-08-16, MEJLTEXTER.md #3 "Ändringsbeskedet"). TEXT-UTAN-YTA:
 * ingen anropare byggd än — bevakningens ändringsdetektering (jämföra
 * ett bevakat bidrags datum/belopp/villkor mot ett tidigare avläst
 * tillstånd) finns inte. Förväxla inte med sendAndringsNotis nedan (H22,
 * en annan population — köpare av registreringsutkast).
 */
export async function sendAndringsbesked(to: string, vars: AndringsbeskedVars): Promise<void> {
  await sendMejl(to, MEJL.andringsbesked, vars);
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

export interface BidragsutkastNotisVars {
  email: string;
  kommunSlug: string;
  bidragNamn: string;
  belopp: string;
  utkastLank: string;
}

/** Samma interna driftmejl-mönster som sendKopNotis, egen text (inte "registreringsutkast") — bidragsutkastet är en annan produkt. */
export async function sendBidragsutkastNotis(vars: BidragsutkastNotisVars): Promise<void> {
  const to = 'jacob.stjarne@gmail.com';
  const text = [
    `Nytt köp — bidragsutkast, ${vars.bidragNamn} (${vars.kommunSlug}) (levererat automatiskt, inget att göra).`,
    `E-post: ${vars.email}`,
    `Kommun: ${vars.kommunSlug}`,
    `Belopp: ${vars.belopp} kr`,
    `Utkastsida: ${vars.utkastLank}`,
  ].join('\n');

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: `Nytt köp (levererat automatiskt) — ${vars.bidragNamn}, ${vars.kommunSlug}`,
    text,
  });
  if (result.error) {
    throw new Error(`Resend-fel vid bidragsutkast-köpnotis: ${result.error.message}`);
  }
}

export interface KopBekraftelseVars {
  kommunSlug: string;
  belopp: string; // kr, utan öre
  registreraLank: string;
  kopLank: string;
  hostedInvoiceUrl?: string;
  checklista: RegistreringsUtkastRad[];
}

/**
 * H8+H10+H15 (GRANSKNING_foreningsguiden.md, uppdaterad SPEC: Det som
 * återstår 2026-07-28): köparens egen bekräftelse OCH den faktiska
 * leveransen i samma mejl — separat från sendKopNotis (som bara går till
 * Jacob, rent informationellt). Minimal, funktionell transaktionscopy
 * runt checklistan (samma precedent som avregistrera/kontakt-sidornas
 * instruktionstext — Code skriver utility-text för en ren teknisk sida,
 * rapporterar till Fable för justering, inte marknadsprosa). Checklistans
 * EGET innehåll är citerat, inte skrivet här — samma
 * VAGLEDNING.station3-mallar som redan är Fable-godkända (se
 * genereraRegistreringsUtkast, utkastGenerator.ts).
 *
 * H15-fix (2026-07-29): mejlet var tidigare köparens ENDA kopia — tappar
 * hon det var köpet borta. `kopLank` pekar nu på den varaktiga,
 * inloggningsskyddade sidan (mina-sidor/kop/[session]/) med kopiera-per-
 * sektion och docx/pdf-export (H16) — det som faktiskt löser
 * varaktighetslöftet, inte bara `registreraLank` (som visar kommunens
 * NUVARANDE, ev. ändrade läge, inte vad hon betalade för).
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

  rader.push(`Er varaktiga kopia — kopiera, ladda ner som Word eller PDF: ${vars.kopLank}`);
  rader.push(`Kommunens nuvarande sida (uppdateras löpande): ${vars.registreraLank}`);
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

export interface BidragsutkastBekraftelseVars {
  kommun: string;
  bidragNamn: string;
  belopp: string; // kr, utan öre (BELOPPET FÖR KÖPET, inte bidragets summa)
  deadlineText: string;
  bidragBelopp: string | null; // bidragets EGEN belopp-sträng, ordagrant ur datan
  kravRader: UtkastKravRad[];
  ansvarsrad: string;
  kopLank: string;
  hostedInvoiceUrl?: string;
}

/**
 * CODE_UPPDRAG_KOMMERSIELL §1.B (2026-07-30): köparens bekräftelse OCH
 * leverans i samma mejl — samma "minimal, funktionell transaktionscopy
 * runt citerat innehåll"-princip som sendKopBekraftelse. kravRader[]
 * kommer rakt ur genereraUtkast() (utkastGenerator.ts) — kravText och
 * innehall citeras ordagrant, ingen egen text om VAD kravet betyder.
 */
export async function sendBidragsutkastBekraftelse(to: string, vars: BidragsutkastBekraftelseVars): Promise<void> {
  const rader = [
    `Tack för ditt köp — utkast till ${vars.bidragNamn} i ${vars.kommun}.`,
    `Belopp: ${vars.belopp} kr.`,
    `${vars.bidragBelopp ?? 'Belopp ej publikt'} · sista ansökningsdag ${vars.deadlineText}`,
    '',
    'Ert utkast:',
    '',
  ];

  vars.kravRader.forEach((rad, i) => {
    rader.push(`${i + 1}. ${rad.kravText}`);
    rader.push(rad.innehall);
    rader.push('');
  });

  rader.push(vars.ansvarsrad);
  rader.push(`Er varaktiga kopia — kopiera, ladda ner som Word eller PDF: ${vars.kopLank}`);
  if (vars.hostedInvoiceUrl) {
    rader.push(`Kvitto/faktura: ${vars.hostedInvoiceUrl}`);
  }

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: `Ert utkast — ${vars.bidragNamn} (${vars.kommun})`,
    text: urlPaEgenRad(rader.join('\n')),
  });
  if (result.error) {
    throw new Error(`Resend-fel vid bidragsutkastbekräftelse: ${result.error.message}`);
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

export interface FelrapportVars {
  kommun: string;
  bidragNamn: string;
  bidragId: string;
  meddelande: string;
  email: string; // tom sträng om ingen angavs — låg tröskel, se api/felrapport.ts
}

/**
 * H25 (SPEC_ATERSTAENDE_HAL.md, Kluster 4): "Det här stämmer inte"-länken
 * vid varje bidrag. Internt driftmejl till Jacob, samma mönster som
 * sendKontaktNotis — replyTo satt bara om avsändaren lämnade en adress.
 */
export async function sendFelrapport(vars: FelrapportVars): Promise<void> {
  const to = 'jacob.stjarne@gmail.com';
  const text = [
    `Kommun: ${vars.kommun}`,
    `Bidrag: ${vars.bidragNamn} (${vars.bidragId})`,
    `E-post: ${vars.email || 'ej angiven'}`,
    '',
    vars.meddelande,
  ].join('\n');

  const result = await resend.emails.send({
    from: FROM,
    to,
    ...(vars.email ? { replyTo: vars.email } : {}),
    subject: `Felrapport — ${vars.bidragNamn}, ${vars.kommun}`,
    text,
  });
  if (result.error) {
    throw new Error(`Resend-fel vid felrapport: ${result.error.message}`);
  }
}

export interface KvittoVars {
  produkt: string;
  belopp: string; // kr, utan öre — redan avrundat av anroparen
  datum: string; // svensk klartext, redan formaterad av anroparen
  invoicePdfUrl: string;
}

/**
 * H10 (SPEC: Kluster 1 — efter-köp-ytan, 2026-07-28): det bokföringsbara
 * kvittot, SEPARAT från leveransmejlet (sendKopBekraftelse, som bär
 * checklistan). MEJL.kvitto (content.ts) — Fable-copy, fylls direkt
 * (samma precedent som övriga transaktionsmejl: ingen sendMejl()/sidfot,
 * en kassörens kvitto ska inte bära en "avregistrera dig"-rad).
 *
 * PDF:en bifogas via Resends `path`-attachment — Resends servrar hämtar
 * filen från Stripes invoice_pdf-URL själva. Ingen egen fetch/buffer-kod
 * i vår Vercel-funktion, samma nollarbetsprincip som hostedInvoiceUrl.
 */
export async function sendKvitto(to: string, vars: KvittoVars): Promise<void> {
  const amne = MEJL.kvitto.amne;
  const text = MEJL.kvitto.body
    .map((p) => p.replace('{produkt}', vars.produkt).replace('{belopp}', vars.belopp).replace('{datum}', vars.datum))
    .join('\n\n');

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: amne,
    text,
    attachments: [{ filename: 'kvitto.pdf', path: vars.invoicePdfUrl }],
  });
  if (result.error) {
    throw new Error(`Resend-fel vid kvitto: ${result.error.message}`);
  }
}

export interface UtfallsfragaVars {
  bidrag: string;
  kommun: string;
  datum: string; // svensk klartext, redan formaterad av anroparen
  svarBeviljatLank: string;
  svarAvslagLank: string;
  svarVetInteLank: string;
}

/**
 * H19 (SPEC: Kluster 1, samma dokument): utfallsslingan. Tre svarslänkar
 * — klartext-URL:er i ett textmejl, inte HTML-knappar (samma stil som
 * övriga textmejl i den här filen). Ingen sendMejl()/sidfot av samma skäl
 * som sendKvitto ovan.
 */
export async function sendUtfallsfraga(to: string, vars: UtfallsfragaVars): Promise<void> {
  const amne = MEJL.utfallsfraga.amne.replace('{bidrag}', vars.bidrag);
  const text = MEJL.utfallsfraga.body
    .map((p) =>
      p
        .replace(/{bidrag}/g, vars.bidrag)
        .replace(/{kommun}/g, vars.kommun)
        .replace('{datum}', vars.datum)
        .replace('{svarBeviljatLank}', vars.svarBeviljatLank)
        .replace('{svarAvslagLank}', vars.svarAvslagLank)
        .replace('{svarVetInteLank}', vars.svarVetInteLank)
    )
    .join('\n\n');

  const result = await resend.emails.send({ from: FROM, to, subject: amne, text: urlPaEgenRad(text) });
  if (result.error) {
    throw new Error(`Resend-fel vid utfallsfråga: ${result.error.message}`);
  }
}

export interface InlamningPaminnelseVars {
  bidrag: string;
  kommun: string;
  datum: string; // svensk klartext, redan formaterad av anroparen
  bidragLank: string;
  svarJaLank: string;
  svarNejLank: string;
}

/**
 * H18 (SPEC: Det som återstår, 2026-07-28): inlämningspåminnelsen. Två
 * svarslänkar, samma "klartext-URL i textmejl"-stil som sendUtfallsfraga.
 */
export async function sendPaminnelseInlamning(to: string, vars: InlamningPaminnelseVars): Promise<void> {
  const amne = MEJL.paminnelseInlamning.amne.replace('{bidrag}', vars.bidrag);
  const text = MEJL.paminnelseInlamning.body
    .map((p) =>
      p
        .replace(/{bidrag}/g, vars.bidrag)
        .replace(/{kommun}/g, vars.kommun)
        .replace('{datum}', vars.datum)
        .replace('{bidragLank}', vars.bidragLank)
        .replace('{svarJaLank}', vars.svarJaLank)
        .replace('{svarNejLank}', vars.svarNejLank)
    )
    .join('\n\n');

  const result = await resend.emails.send({ from: FROM, to, subject: amne, text: urlPaEgenRad(text) });
  if (result.error) {
    throw new Error(`Resend-fel vid inlämningspåminnelse: ${result.error.message}`);
  }
}

export interface DelbartBeskedBidrag {
  namn: string;
  belopp: string | null;
  deadlineText: string; // redan formaterad av anroparen (api/dela-besked.ts)
}

export interface DelbartBeskedVars {
  kommun: string;
  kommunSlug: string;
  bidrag: DelbartBeskedBidrag[];
}

/**
 * H7 (SPEC: Kluster 3 — en förening blir fler, 2026-07-28): delbart
 * besked. Innehåller de matchade bidragen DIREKT (namn, belopp, deadline)
 * — ingen länk som kräver att svaren fylls i på nytt (föreningsprofilen
 * finns bara i AVSÄNDARENS localStorage, en länk hade gett mottagaren en
 * tom tratt). api/dela-besked.ts bygger raderna ur kommun.bidrag
 * (server-sanningen), aldrig ur fritext klienten skickar.
 */
export async function sendDelbartBesked(to: string, vars: DelbartBeskedVars): Promise<void> {
  const rader: string[] = [`Matchade bidrag i ${vars.kommun}:`, ''];
  for (const b of vars.bidrag) {
    rader.push(b.namn);
    rader.push(`${b.belopp ?? 'Individuellt belopp inte fastställt'} · ${b.deadlineText}`);
    rader.push('');
  }
  rader.push(`Alla bidrag och källor: ${siteUrl()}/kommun/${vars.kommunSlug}/`);

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: `Föreningsbidrag i ${vars.kommun} — Föreningsguiden`,
    text: urlPaEgenRad(rader.join('\n')),
  });
  if (result.error) {
    throw new Error(`Resend-fel vid delbart besked: ${result.error.message}`);
  }
}

/**
 * H5 (SPEC: Det som återstår, 2026-07-28): "Mejla mig en länk" — en
 * avbruten tratt kan återupptas på vilken enhet som helst, eftersom
 * profilen kodas in i länken själv (ingen server-sparad session finns
 * innan ett köp/en e-post fångas, se foreningsprofil.ts). Minimal,
 * funktionell transaktionstext — samma precedent som övriga utility-
 * mejl i den här filen.
 */
export async function sendTrattLank(to: string, lank: string): Promise<void> {
  const text = urlPaEgenRad(
    `Här är länken tillbaka till era svar i Föreningsguidens matchningstratt.\n${lank}\n\nBad ni inte om detta? Ni kan bortse från mejlet.`
  );

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: 'Er länk tillbaka till matchningstratten — Föreningsguiden',
    text,
  });
  if (result.error) {
    throw new Error(`Resend-fel vid trattlänk: ${result.error.message}`);
  }
}
