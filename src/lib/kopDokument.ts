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

import type { RegistreringsUtkastRad } from './utkastGenerator';
import { genereraRegistreringsUtkast } from './utkastGenerator';
import type { Kommun } from './kommunTyper';
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
];

/**
 * Skannar köparens registreringschecklista (vad+beskrivning) efter kända
 * bilage-substantiv. Returnerar bara det som faktiskt NÄMNS i texten —
 * ingen generisk "vanliga bilagor är..."-lista. Dedupar på etikett, första
 * träffen (i checklistans egen ordning) vinner källhänvisningen.
 */
export function harvestBilagor(checklista: RegistreringsUtkastRad[]): Bilagepost[] {
  const funna = new Map<string, Bilagepost>();
  for (const rad of checklista) {
    const text = `${rad.vad} ${rad.beskrivning}`;
    for (const regel of BILAGE_REGLER) {
      if (!funna.has(regel.etikett) && regel.monster.test(text)) {
        funna.set(regel.etikett, { etikett: regel.etikett, kallaVad: rad.vad });
      }
    }
  }
  return Array.from(funna.values());
}
