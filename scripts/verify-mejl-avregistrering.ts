// J1.3 (Jacob, 2026-08-16): "Reglerna sist i filen [incoming/MEJLTEXTER.md]
// gäller som villkor, inte som stilråd. Särskilt: ... avregistreringslänken
// finns i varje mejl utan undantag. Lägg ett test som fäller om ett
// utgående mejl saknar den."
//
// Scope: MEJLTEXTER.md är titlad "bevakning och påminnelser" — reglerna
// gäller den populationen (gratis bevaknings-/påminnelsemejl), inte
// mejl.ts:s transaktionsmejl (kvitto, köpbekräftelse, inloggningslänk
// m.fl.), som MEDVETET saknar en avregistrera-rad — se t.ex. sendKvitto-
// kommentaren: "en kassörens kvitto ska inte bära en avregistrera-dig-rad".
// Att kräva länken där hade varit fel, inte en säkrare version av testet.
//
// Två kontroller:
// 1. MEJL.sidfot (content.ts, importerad på riktigt — inget regex-gissande
//    på en sträng) innehåller {avregLank}.
// 2. Varje känd bevakningsfunktion i mejl.ts anropar den delade sendMejl()
//    — som ALLTID injicerar avregLank (mejl.ts: `{ avregLank: ..., ...vars }`,
//    spreadad EFTER default, ingen anropare kan skriva över den) — i
//    stället för ett rått resend.emails.send() som skulle hoppa förbi
//    sidfoten helt. Källtextsökning i mejl.ts, samma stil som
//    verify-kalla-cta.ts.
import { readFileSync } from 'fs';
import { join } from 'path';
import { MEJL } from '../src/lib/content.ts';

const errors: string[] = [];

if (!MEJL.sidfot.includes('{avregLank}')) {
  errors.push('MEJL.sidfot saknar {avregLank} — sidfotsraden bär inte längre avregistreringslänken.');
}

// U3 (Jacob 2026-08-19): nationellSidfot — LOK-stödets mejl 7/8 använder
// en EGEN sidfot (sendMejl:s sidfotOverride-parameter), inte MEJL.sidfot
// direkt. Kontroll #1 ovan täcker den inte — separat check, annars kunde
// en framtida ändring tömma {avregLank} härifrån utan att testet märkte.
if (!MEJL.nationellSidfot.includes('{avregLank}')) {
  errors.push('MEJL.nationellSidfot saknar {avregLank} — LOK-stödets mejl 7/8 skulle sakna avregistreringslänk.');
}

// Bevakningspopulationens sändfunktioner (mejl.ts) — MEJLTEXTER.md #1–#5
// plus de äldre gratis-bevakningsmejlen (paminnelse14/3) som redan gick
// via sendMejl() innan J1. Transaktionsmejlen (kvitto, köpbekräftelse,
// inloggningslänk, kontakt-/felrapportnotiser m.fl.) är MEDVETET
// uteslutna — se filhuvudet.
const BEVAKNINGSFUNKTIONER = [
  'sendBekraftelse',
  'sendValkomst',
  'sendPaminnelse28',
  'sendPaminnelseSista',
  'sendAndringsbesked',
  'sendGiltighetsvarningNiva1',
  'sendGiltighetsvarningNiva2',
  // U3 (Jacob 2026-08-19) — LOK-stödet (MEJLTEXTER.md #7/#8), samma
  // bevakningspopulation, tidigare utelämnade ur den här listan.
  'sendNationellPaminnelse28',
  'sendNationellPaminnelseSista',
  // Z2.1 (incoming/OPPNA_PUNKTER_Z1.md) — nationella stödets egen
  // bekräftelsemejl, samma bevakningspopulation som sendBekraftelse.
  'sendNationellBekraftelse',
];

const mejlTsPath = join(process.cwd(), 'src', 'lib', 'mejl.ts');
const kalla = readFileSync(mejlTsPath, 'utf-8');

// Klipp filen i block: från varje "export async function NAME" till nästa
// (eller filslut). Samma en-funktion-per-block-stil som redan gäller i
// hela mejl.ts — robust nog för det här filens faktiska form, inte en
// generell TS-parser.
const funktionsstarter = [...kalla.matchAll(/export async function (\w+)\(/g)];
if (funktionsstarter.length === 0) {
  console.error('verify-mejl-avregistrering FAIL — 0 exporterade funktioner hittade i mejl.ts. Regexen matchar troligen inte längre filens form.');
  process.exit(1);
}

let kontrollerade = 0;
for (let i = 0; i < funktionsstarter.length; i++) {
  const namn = funktionsstarter[i][1];
  if (!BEVAKNINGSFUNKTIONER.includes(namn)) continue;

  const start = funktionsstarter[i].index!;
  const slut = i + 1 < funktionsstarter.length ? funktionsstarter[i + 1].index! : kalla.length;
  const block = kalla.slice(start, slut);

  kontrollerade++;
  if (!block.includes('sendMejl(')) {
    errors.push(`${namn}() anropar inte sendMejl() — troligen ett rått resend.emails.send() som hoppar förbi MEJL.sidfot/avregLank.`);
  }
}

// Samma "0 kontrollerade är alltid fel"-skydd som verify-kalla-cta.ts —
// annars kan en trasig namnlista tysta testet utan att någon märker det.
const saknade = BEVAKNINGSFUNKTIONER.filter((namn) => !kalla.includes(`export async function ${namn}(`));
if (saknade.length > 0) {
  errors.push(`Funktioner i BEVAKNINGSFUNKTIONER hittades inte i mejl.ts: ${saknade.join(', ')} — listan är utdaterad eller funktionen bytt namn.`);
}
if (kontrollerade === 0) {
  errors.push('0 bevakningsfunktioner kontrollerade — regexen eller namnlistan matchar inte mejl.ts längre.');
}

if (errors.length > 0) {
  console.error(`verify-mejl-avregistrering FAIL — ${errors.length} fynd:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`verify-mejl-avregistrering OK — MEJL.sidfot bär {avregLank}, ${kontrollerade}/${BEVAKNINGSFUNKTIONER.length} bevakningsfunktioner routar via sendMejl().`);
