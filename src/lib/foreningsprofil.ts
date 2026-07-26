/**
 * foreningsprofil.ts — Klientlagring för matchningstrattens svar (turn-11).
 * Anonym, kontofri lagring i localStorage — de fem frågorna besvaras UTAN
 * konto (DESIGN_UPPDRAG_2_KOMMERSIELL.md §2.1: "inget registreringsformulär
 * före värdet"). Detta är INTE samma mekanism som subscribers.ts/Upstash
 * Redis (den kräver en e-postadress som nyckel) — försök aldrig återanvända
 * Redis-mönstret här. Den bestående föreningsprofilen ("samma lagring som
 * bevakningen") är subscribers.ts Subscriber.foreningsprofil-fältet, som
 * fylls i FÖRST när en e-post fångas (se RegistreringsHjalp.astro) genom
 * att denna localStorage-profil mergas in.
 *
 * Alla funktioner no-opar defensivt om localStorage saknas — output:'static'
 * (astro.config.mjs) kör src/lib i Node vid bygge, och även om modulen
 * saknar toppnivå-sideeffekter är detta ett skydd mot en oavsiktlig
 * frontmatter-import som annars skulle krascha bygget.
 */

import type { Verksamhet } from './kommunTyper';

export type Medlemsbucket = 'xs' | 's' | 'm' | 'l';
export type Aldersbucket = 'ny' | 'mellan' | 'etablerad';
export type SoktSvar = 'ja' | 'nej' | 'osaker';

export interface Foreningsprofil {
  kommunSlug: string | null;
  verksamhet: Verksamhet[];
  storlek: Medlemsbucket | null;
  alder: Aldersbucket | null;
  sokt: SoktSvar | null;
  uppdaterad: string; // ISO
}

const STORAGE_KEY = 'foreningsguiden:foreningsprofil:v1';

const TOM_PROFIL: Foreningsprofil = {
  kommunSlug: null,
  verksamhet: [],
  storlek: null,
  alder: null,
  sokt: null,
  uppdaterad: '',
};

function harLocalStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

/** Läser sparad profil, eller null om ingen finns/lagringen är otillgänglig. */
export function getForeningsprofil(): Foreningsprofil | null {
  if (!harLocalStorage()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Foreningsprofil;
  } catch {
    return null;
  }
}

/** Mergar in ett svar i den sparade profilen (eller skapar en ny) och sparar. */
export function saveForeningsprofil(patch: Partial<Omit<Foreningsprofil, 'uppdaterad'>>): Foreningsprofil {
  const existing = getForeningsprofil() ?? TOM_PROFIL;
  const next: Foreningsprofil = {
    ...existing,
    ...patch,
    uppdaterad: new Date().toISOString(),
  };
  if (harLocalStorage()) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Lagring otillgänglig (privat läge, kvot full) — profilen lever bara
      // i minnet för den här sidladdningen. Inget att göra åt här.
    }
  }
  return next;
}

export function clearForeningsprofil(): void {
  if (!harLocalStorage()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
