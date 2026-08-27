/**
 * aktivitetsbidragKorpus.ts — utbrutet ur analyze-krav-koppling.ts (AF2,
 * 2026-08-27) när medlemskrav.ts fick samma behov: samla alla bidrag som
 * identifieras som aktivitetsbidrag ur data/kommuner/*.yaml. EN källa för
 * heuristiken, inte en kopia per skript som kan glida isär.
 *
 * Namn/id-heuristik, samma teknik som verify-lok-ansokningsvag.ts redan
 * använder för LOK — datamodellen saknar ett separat bidragsart-fält
 * (AD1_KRAVENS_KARAKTAR.md §"Bidragsarten är identifierad från namn och
 * id"). "attraktivitetsbidrag" innehåller bokstavligen substrängen
 * "aktivitetsbidrag" (a-t-t-r + aktivitetsbidrag) — AE1:s egen
 * dokumenterade falska träff (316 kandidater → 314 riktiga). Uteslut den
 * explicit.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as yaml from 'js-yaml';

const KOMMUNER_DIR = join(import.meta.dirname, '..', '..', 'data', 'kommuner');

export function arAktivitetsbidrag(namn: string, id: string): boolean {
  const t = `${namn} ${id}`.toLowerCase();
  if (t.includes('attraktivitetsbidrag')) return false;
  return /aktivitetsbidrag|aktivitetsstöd|lokalt aktivitetsstöd|\blok\b/.test(t);
}

export interface AktivitetsbidragRad {
  id: string;
  namn: string;
  krav: string[];
}

export function samlaAktivitetsbidrag(): AktivitetsbidragRad[] {
  const resultat: AktivitetsbidragRad[] = [];
  for (const fil of readdirSync(KOMMUNER_DIR)) {
    if (!fil.endsWith('.yaml')) continue;
    const doc = yaml.load(readFileSync(join(KOMMUNER_DIR, fil), 'utf-8')) as { bidrag?: AktivitetsbidragRad[] };
    for (const b of doc.bidrag ?? []) {
      if (arAktivitetsbidrag(b.namn, b.id) && Array.isArray(b.krav)) {
        resultat.push(b);
      }
    }
  }
  return resultat;
}
