/**
 * profilLagerLokalt.ts — AH1 (Jacobs order): lagringen bakom
 * inmatningsytan (AH1.3). Anonym, per-webbläsare, localStorage — SAMMA
 * princip som foreningsprofil.ts redan etablerar (ingen inloggning),
 * men en EGEN, SEPARAT lagring, inte en utökning av den filen.
 *
 * VARFÖR INTE foreningsprofil.ts: den filen är matchningstrattens platta
 * femfråge-svar (kommun/verksamhet/storlek/ålder/sökt) — en annan form,
 * en annan konsument. Att blanda in Svar-baserade kravsvar där hade
 * gjort BÅDA modellerna otydliga. "En lagringsmekanism per angelägenhet"
 * är redan etablerad praxis i den här kodbasen.
 *
 * VARFÖR INTE aktivitetsmall.ts/Profilnyckel HÄR ÄN: den riktiga
 * server-synkade profilen (AG1) kräver en Profilnyckel (email +
 * föreningsnamn) — men mocken (DESIGN_RUNDA_22_ny2.html, F1) visar att
 * hon börjar svara UTAN att någon mejladress frågats än. Att tvinga
 * fram en Profilnyckel här hade betytt att hitta på en falsk adress.
 * Lagret är därför FLATT (alla Svar, A/B/D1 om varandra, en implicit
 * "alla lag"-scope — F3:s "förval: alla lag, dela upp senare") tills
 * ett riktigt e-postmoment (bevakning eller köp, redan byggda flöden)
 * ger en Profilnyckel att synka mot. Den synken är INTE byggd här —
 * nästa steg, inte AH1:s.
 */

import type { Svar } from './profilSvar.ts';

const LAGER_KEY = 'foreningsguiden:profilsvar:v1';

interface ProfilLagerLokalt {
  svar: Record<string, Svar>;
  uppdaterad: string; // ISO
}

function tomtLager(): ProfilLagerLokalt {
  return { svar: {}, uppdaterad: new Date().toISOString() };
}

function harLocalStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

export function hamtaLokaltLager(): ProfilLagerLokalt {
  if (!harLocalStorage()) return tomtLager();
  try {
    const rad = localStorage.getItem(LAGER_KEY);
    if (!rad) return tomtLager();
    return JSON.parse(rad) as ProfilLagerLokalt;
  } catch {
    return tomtLager();
  }
}

/** Sparar/uppdaterar ETT svar — samma faltId skriver över (nytt svar, ny tidsstämpel). */
export function sparaLokaltSvar(svar: Svar): ProfilLagerLokalt {
  const lager = hamtaLokaltLager();
  const nytt: ProfilLagerLokalt = {
    svar: { ...lager.svar, [svar.faltId]: svar },
    uppdaterad: new Date().toISOString(),
  };
  if (harLocalStorage()) {
    try {
      localStorage.setItem(LAGER_KEY, JSON.stringify(nytt));
    } catch {
      // Lagring otillgänglig (privat läge, kvot) — svaret gäller ändå för sessionen i minnet.
    }
  }
  return nytt;
}

/** Mängden besvarade faltId:n — direkt insats till girigOrdning.ts:s besvarade-parameter. */
export function besvaradeFaltId(lager: ProfilLagerLokalt = hamtaLokaltLager()): Set<string> {
  return new Set(Object.keys(lager.svar));
}

const OPPNADE_KEY = 'foreningsguiden:oppnade-bidrag:v1';

/**
 * AH1.8: "Betalrutan visas först vid ANDRA öppnade bidraget, aldrig vid
 * det första." Registrerar besöket och returnerar hur många DISTINKTA
 * bidrag som öppnats hittills (inklusive det här) — anroparen visar
 * betalrutan när talet är ≥ 2.
 */
export function registreraOppnatBidrag(bidragId: string): number {
  if (!harLocalStorage()) return 1;
  try {
    const rad = localStorage.getItem(OPPNADE_KEY);
    const oppnade: string[] = rad ? JSON.parse(rad) : [];
    if (!oppnade.includes(bidragId)) oppnade.push(bidragId);
    localStorage.setItem(OPPNADE_KEY, JSON.stringify(oppnade));
    return oppnade.length;
  } catch {
    return 1;
  }
}
