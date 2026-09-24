/**
 * aktivitetsbidragKorpus.ts — utbrutet ur analyze-krav-koppling.ts (AF2,
 * 2026-08-27) när medlemskrav.ts fick samma behov: samla alla bidrag som
 * identifieras som aktivitetsbidrag ur data/kommuner/*.yaml. EN källa för
 * heuristiken, inte en kopia per skript som kan glida isär.
 *
 * SERVER-ONLY (node:fs) — heuristiken själv flyttades till
 * aktivitetsbidragHeuristik.ts (AH1, 2026-08-28) så klientkod kan
 * importera BARA den utan att dra med sig node:fs. Den här filen är
 * bara för Node-skript och Astro-frontmatter/API-routes, aldrig för
 * ett `<script>`-block som körs i webbläsaren.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as yaml from 'js-yaml';
import { arAktivitetsbidrag } from './aktivitetsbidragHeuristik.ts';

export { arAktivitetsbidrag };

const KOMMUNER_DIR = join(import.meta.dirname, '..', '..', 'data', 'kommuner');

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
