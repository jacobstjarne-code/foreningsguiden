/**
 * saljargate.ts — AA1.1 (Jacobs order): fail-closed kontroll av att en
 * RIKTIG juridisk säljare är konfigurerad, innan något köp får starta i
 * skarpt Stripe-läge. Samma gate i alla tre köpvägarna (checkout/
 * registrering.ts, checkout/bidragsutkast.ts, checkout/abonnemang.ts).
 *
 * Ersätter den svagare saljareArKlar()-kollen som fanns dubblerad i
 * registrering.ts/bidragsutkast.ts — den kollade bara att foretag/orgnr
 * inte var en {{TODO-platshållare, vilket INTE fångar sandbox-testvärdet
 * 556000-0000 (ett giltigt-utseende värde, ingen platshållare). Och lägger
 * till kontrollen i abonnemang.ts, som saknade en gate helt — ett
 * skarpt-läge-abonnemangsköp hade kunnat starta utan någon säljarkoll
 * överhuvudtaget.
 *
 * Fyra villkor, ALLA måste hålla:
 *   1. SALJARE_VALD === true — den avsiktliga "partsvalet är gjort"-
 *      flaggan (content.ts). Satt i SAMMA commit som SALJARE själv byts.
 *   2. SALJARE.orgnr är formatgiltigt (NNNNNN-NNNN + svensk Luhn-
 *      checksiffra) OCH skiljer sig från sandbox-testvärdet 556000-0000
 *      — testvärdet utesluts explicit, oavsett vad checksumman säger om
 *      det (det är inte checksummans jobb att fånga just det värdet).
 *   3. SALJARE.foretag är satt — inget tomt, ingen {{TODO-platshållare.
 *   4. SALJARE.supportEpost är satt, formatgiltig e-post, ingen {{TODO.
 *
 * Fail-closed: saljargateOk() returnerar false vid minsta osäkerhet,
 * ALDRIG true av misstag (se try/catch — ett kastat fel tolkas som
 * "gaten är stängd", inte som "okänt, anta öppen").
 */
import { SALJARE, SALJARE_VALD } from './content.ts';

const SANDBOX_TESTORGNR = '556000-0000';
const EPOST_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Format NNNNNN-NNNN + svensk Luhn-checksiffra (samma algoritm som personnummer). */
export function arGiltigtOrgnr(orgnr: string): boolean {
  if (!/^\d{6}-\d{4}$/.test(orgnr)) return false;
  const siffror = orgnr.replace('-', '');
  let summa = 0;
  for (let i = 0; i < 9; i++) {
    let siffra = Number(siffror[i]) * (i % 2 === 0 ? 2 : 1);
    if (siffra > 9) siffra -= 9;
    summa += siffra;
  }
  const kontrollsiffra = (10 - (summa % 10)) % 10;
  return kontrollsiffra === Number(siffror[9]);
}

function arSattUtanTodo(varde: string | undefined): varde is string {
  return typeof varde === 'string' && varde.trim().length > 0 && !varde.startsWith('{{TODO');
}

/** Fail-closed: sant bara om ALLA fyra villkor håller. Se filhuvudet. */
export function saljargateOk(): boolean {
  try {
    return (
      SALJARE_VALD === true &&
      arGiltigtOrgnr(SALJARE.orgnr) &&
      SALJARE.orgnr !== SANDBOX_TESTORGNR &&
      arSattUtanTodo(SALJARE.foretag) &&
      arSattUtanTodo(SALJARE.supportEpost) &&
      EPOST_RE.test(SALJARE.supportEpost)
    );
  } catch {
    return false;
  }
}
