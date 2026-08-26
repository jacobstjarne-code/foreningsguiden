/**
 * aktivitetsmall.ts — AF1.2 (Jacobs order): aktivitetsmallen som egen
 * nivå under föreningen, inte ett fält på föreningen själv.
 *
 * GPT:s fynd (AD1_KRAVENS_KARAKTAR.md §3, "D1 gäller en aktivitetsmall,
 * inte alltid hela föreningen"): längd, deltagarantal, ledarålder, plats,
 * målgrupp och frekvens (profilFalt.ts:s 31 D1-fält) kan skilja mellan
 * lag och aktivitetsformer i SAMMA förening — P13 och A-laget har olika
 * längd, åldrar och ledare. Ett globalt ja/nej-svar på föreningsnivå för
 * "aktiviteten pågår minst 45 minuter" skulle ge falska matchningar för
 * vilket lag som helst som inte råkar dela P13:s träningstid.
 *
 * En förening har därför NOLL ELLER FLERA aktivitetsmallar, var och en
 * med sina EGNA D1-svar — aldrig ett enda D1-svarsset delat av alla lag.
 *
 * ÖPPEN FRÅGA, inte löst här: vad en aktivitetsmall hänger under.
 * Foreningsprofil (foreningsprofil.ts) är anonym, per-webbläsare
 * localStorage utan stabilt förenings-id — det finns ingen inloggad
 * "Forening"-entitet i kodbasen ännu att koppla aktivitetsmallar till.
 * AktivitetsmallSamling nedan har därför ett eget genererat id, inte en
 * främmande nyckel mot något som inte finns. Ägarskap/lagring är nästa
 * beslut, inte AF1:s — se AF1-rapporten till Jacob.
 */

import { hamtaFaltdefinition, d1Falt } from './profilFalt.ts';
import type { Svar } from './profilSvar.ts';

export interface Aktivitetsmall {
  id: string; // genererat vid skapande (t.ex. crypto.randomUUID()), inte en slug — namnet är fritext och kan ändras
  namn: string; // fritext: "P13", "A-laget", "Nybörjargruppen onsdagar"
  skapad: string; // ISO
  // D1-svar SCOPADE till just den här mallen — samma faltId kan alltså
  // ha OLIKA värden i två mallar för samma förening (P13:s
  // activity_duration ≠ A-lagets). Nyckel = faltId.
  svar: Record<string, Svar>;
}

export function skapaAktivitetsmall(namn: string, id: string, skapad: string = new Date().toISOString()): Aktivitetsmall {
  return { id, namn, skapad, svar: {} };
}

/**
 * Sätter ett D1-svar på mallen — vägrar ett svar för ett fält som inte
 * är klass D1 (A/B-fält hör hemma på basprofilen, inte här, se AF1-
 * rapporten §AF1.2) och vägrar ett faltId utanför katalogen.
 */
export function sattMallsvar(mall: Aktivitetsmall, svar: Svar): Aktivitetsmall {
  const definition = hamtaFaltdefinition(svar.faltId);
  if (!definition) {
    throw new Error(`sattMallsvar: okänt faltId "${svar.faltId}"`);
  }
  if (definition.klass !== 'D1') {
    throw new Error(
      `sattMallsvar: "${svar.faltId}" är klass ${definition.klass}, inte D1 — hör hemma på basprofilen, inte en aktivitetsmall`
    );
  }
  return { ...mall, svar: { ...mall.svar, [svar.faltId]: svar } };
}

/** Hur många av de 31 D1-fälten mallen har besvarat — grunden för en framtida "12 av 18"-progressionsindikator (AE1:s produktrekommendation §5). */
export function mallTackning(mall: Aktivitetsmall): { besvarade: number; totalt: number } {
  const totalt = d1Falt().length;
  const besvarade = d1Falt().filter((f) => mall.svar[f.id] !== undefined).length;
  return { besvarade, totalt };
}
