/**
 * kopDokument.ts — H17 (SPEC: Det som återstår, 2026-07-28): bilagechecklistan
 * på den köpta, varaktiga kop-sidan (mina-sidor/kop/[session]/). Ren,
 * deterministisk logik, samma "gissa aldrig"-princip som utkastGenerator.ts:s
 * fyllKrav — en snäv vitlista av kända bilage-substantiv, matchad mot den
 * REDAN SOURCADE beskrivningstexten i köparens egen registreringschecklista
 * (RegistreringsUtkastRad[], forutsattningarSnapshot). Hittar aldrig på ett
 * krav som inte redan står i texten kommunen publicerat.
 *
 * Vitlistan är kalibrerad mot ett stickprov av ~60 riktiga
 * Forutsattning.beskrivning-strängar (grep över data/kommuner/*.yaml,
 * 2026-07-29) — orden nedan är de som faktiskt återkommer, inte gissade.
 */

import type { RegistreringsUtkastRad, UtkastDokument } from './utkastGenerator';
import { genereraRegistreringsUtkast, genereraUtkast } from './utkastGenerator';
import type { Kommun, Bidrag } from './kommunTyper';
import type { KopEntry } from './kop';

/**
 * H15/H16/H17: samma "läs det låsta snapshottet, fall tillbaka på en live
 * rendering" som mina-sidor/kop/[session]/index.astro behöver — delad
 * här så docx/pdf-endpointerna (api/kop/[session]/docx|pdf.ts) inte
 * duplicerar samma parse-eller-fall-tillbaka-logik tre gånger.
 */
export function kopChecklista(kop: KopEntry, kommun: Kommun): RegistreringsUtkastRad[] {
  if (kop.forutsattningarSnapshot) {
    try {
      return JSON.parse(kop.forutsattningarSnapshot);
    } catch {
      return genereraRegistreringsUtkast(kommun);
    }
  }
  return genereraRegistreringsUtkast(kommun);
}

/**
 * Samma mönster som kopChecklista, för produkt==='bidragsutkast'
 * (CODE_UPPDRAG_KOMMERSIELL §1.B, 2026-07-30). Snapshotten är LÅST till
 * köptillfällets profil-svar — regenereras ALDRIG mot kommunens
 * nuvarande data (det vore att visa något annat än vad hon betalade
 * för). Fallback (saknad/trasig snapshot, äldre köp) kräver
 * kop.foreningsprofil — utan den kan dokumentet inte återskapas
 * korrekt, och funktionen returnerar null hellre än att gissa en profil.
 */
export function kopBidragsutkast(kop: KopEntry, kommun: Kommun, bidrag: Bidrag): UtkastDokument | null {
  if (kop.bidragsutkastSnapshot) {
    try {
      return JSON.parse(kop.bidragsutkastSnapshot) as UtkastDokument;
    } catch {
      // faller igenom till live-fallbacken nedan
    }
  }
  if (!kop.foreningsprofil) return null;
  const resultat = genereraUtkast(kop.foreningsprofil, bidrag, kommun);
  return resultat.typ === 'bidragsutkast' ? resultat : null;
}

export interface Bilagepost {
  etikett: string;
  kallaVad: string; // vilket checklistesteg (RegistreringsUtkastRad.vad) texten hittades i
}

interface BilageRegel {
  etikett: string;
  monster: RegExp;
}

const BILAGE_REGLER: BilageRegel[] = [
  { etikett: 'Stadgar', monster: /\bstadgar\w*\b/i },
  { etikett: 'Mötesprotokoll (årsmöte eller konstituerande möte)', monster: /\bprotokoll\w*\b/i },
  { etikett: 'Verksamhetsberättelse', monster: /\bverksamhetsberättelse\w*\b/i },
  { etikett: 'Revisionsberättelse', monster: /\brevisionsberättelse\w*\b/i },
  { etikett: 'Organisationsnummer (från Skatteverket)', monster: /\borganisationsnummer\b|\borg\.?\s*nr\b/i },
  { etikett: 'Bank- eller plusgirouppgifter', monster: /\bbankkonto\w*\b|\bplusgiro\w*\b|\bbankgiro\w*\b/i },
  { etikett: 'Ekonomisk redovisning (resultat- och balansräkning)', monster: /resultat-?\s*och\s*balansräkning|ekonomisk\s+redovisning|årsredovisning/i },
  // Tillagda 2026-08-01 (SPRINT: Produkten B2) — samma vitlist-disciplin,
  // kalibrerade mot faktiska träffar i data/kommuner (Ale/Alingsås
  // "budget ... ska bifogas", Arboga/Strängnäs "registreringsbevis från
  // sk(atteverket|attemyndigheterna)"). \b-gränsen är avsiktlig: fångar
  // fristående "budget" men INTE sammansättningar som "kostnadsbudget"/
  // "sponsringsbudget" — de senare beskriver ofta KOMMUNENS egen budget,
  // inte ett dokument föreningen ska bifoga, och hade blivit falska
  // positiva om mönstret vidgades.
  { etikett: 'Budget', monster: /\bbudget\w*\b/i },
  { etikett: 'Registreringsbevis (från Skatteverket)', monster: /\bregistreringsbevis\w*\b/i },
];

/**
 * Delad skanningskärna — matchar BILAGE_REGLER mot en lista av
 * (etikett-att-citera-som-källa, text-att-söka-i)-par. Ren funktion,
 * ingen kunskap om vilken av de två produkternas datastruktur den kom
 * ifrån (harvestBilagor/harvestBilagorFranKrav nedan gör mappningen).
 */
function skannaBilagor(rader: { kalla: string; text: string }[]): Bilagepost[] {
  const funna = new Map<string, Bilagepost>();
  for (const rad of rader) {
    for (const regel of BILAGE_REGLER) {
      if (!funna.has(regel.etikett) && regel.monster.test(rad.text)) {
        funna.set(regel.etikett, { etikett: regel.etikett, kallaVad: rad.kalla });
      }
    }
  }
  return Array.from(funna.values());
}

/**
 * Skannar köparens registreringschecklista (vad+beskrivning) efter kända
 * bilage-substantiv. Returnerar bara det som faktiskt NÄMNS i texten —
 * ingen generisk "vanliga bilagor är..."-lista. Dedupar på etikett, första
 * träffen (i checklistans egen ordning) vinner källhänvisningen.
 */
export function harvestBilagor(checklista: RegistreringsUtkastRad[]): Bilagepost[] {
  return skannaBilagor(checklista.map((rad) => ({ kalla: rad.vad, text: `${rad.vad} ${rad.beskrivning}` })));
}

/**
 * Samma skanning för bidragsutkastets kravRader[] (UtkastKravRad —
 * kravText+innehall) i stället för registreringschecklistans vad/
 * beskrivning. Samma vitlista, samma "nämns det inte, listas det inte"-
 * princip — se filhuvudet.
 */
export function harvestBilagorFranKrav(kravRader: UtkastDokument['kravRader']): Bilagepost[] {
  return skannaBilagor(kravRader.map((rad) => ({ kalla: rad.kravText, text: `${rad.kravText} ${rad.innehall}` })));
}
