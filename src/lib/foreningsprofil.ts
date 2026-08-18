/**
 * foreningsprofil.ts — Klientlagring för matchningstrattens svar (turn-11).
 * Anonym, kontofri lagring i localStorage — de fem frågorna besvaras UTAN
 * konto (DESIGN_UPPDRAG_2_KOMMERSIELL.md §2.1: "inget registreringsformulär
 * före värdet"). Detta är INTE samma mekanism som subscribers.ts/Upstash
 * Redis (den kräver en e-postadress som nyckel) — försök aldrig återanvända
 * Redis-mönstret här. Den bestående föreningsprofilen ("samma lagring som
 * bevakningen") är subscribers.ts Subscriber.foreningsprofil-fältet, som
 * fylls i FÖRST när en e-post fångas (framtida utkastflöde) genom att
 * denna localStorage-profil mergas in.
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
  // E1 (ARBETSORDER 2026-08-11, "den varma skärmen") + Jacobs uppföljning
  // 2026-08-11: INTE en fjärde tratt-fråga (B3.6 tog bort en fråga för
  // att hålla tratten kort — att fråga vem hon ÄR i stället för vad hon
  // BEHÖVER hade varit ett steg tillbaka). Speglas i stället från de
  // ställen hon redan skriver namnet: bevakningsformulären (C1,
  // EmailSignup.astro/GiltighetsKontroll.astro) och köpets förenings-
  // uppgiftsformulär (kop.ts Foreningsuppgifter.namn, starkare signal —
  // en riktig ansökan till kommunen). null = aldrig sett något av de två
  // ännu, skilt från en framtida tom sträng (uppstår inte — se
  // saveForeningsnamnFranFormular, sparar aldrig ett tomt fält).
  foreningsnamn: string | null;
  // E4 ("den gröna remsan på löftet att minnas") — speglad från
  // GiltighetsKontroll.astro:s epostForm, SAMMA ögonblick som
  // foreningsnamn ovan. Bär sin EGEN kommunSlug i stället för att
  // återanvända profilens delade kommunSlug-fält (som matchningstratten/
  // IgenkanningsRad redan äger, för ett annat syfte — att interagera med
  // giltighetskontrollen på kommun X ska inte tyst byta "hennes kommun"
  // för bidragsgrupperingen på en helt annan sida). En kommunsida
  // jämför alltså giltighet.kommunSlug mot sin EGEN kommun_slug innan
  // den litar på fältet.
  giltighet: { kommunSlug: string; arsmotesdatum: string } | null;
  // E2 (ARBETSORDER 2026-08-11, "den varma skärmen") + Jacobs uppföljning
  // 2026-08-11 ("lager ett", direkt byggbart): "Det ni redan sökt förr"
  // kräver en bevakning på JUST DET bidraget — INTE en e-postbaserad
  // uppslagning (mejladress ska ALDRIG i localStorage eller en query-
  // sträng, "en uppräkningslucka, inte en integritetsdetalj"). Klienten
  // vet redan vad hon bevakade i samma ögonblick hon skickar bevaka-
  // formuläret (bevakaKlient.ts) — skrivs direkt hit, ingen uppslagning.
  // "Lager två" (köp + andra enheter, via bekräftelsetoken i stället för
  // e-post) är medvetet INTE byggt än — väntar tills C är live/
  // verifierad, se Jacobs kommentar.
  bevakadeBidrag: { kommunSlug: string; bidragId: string }[];
}

// B3.8 (SPEC B3, Jacob 2026-08-06 — "den viktigaste punkten"): v1 → v2.
// En sparad v1-profil bar fyra svar (kommun, verksamhet, storlek, sökt)
// och tolkades efter B3 av en tratt med tre frågor (storlek borttagen) —
// en gammal profil gav "0 bidrag" i Karlshamn, felet som startade hela
// B3-granskningen. Regel: varje gång matchningsreglerna ändras bumpas
// nyckeln, annars sitter alla som testat tidigare kvar med ett tyst
// felaktigt besked. Ingen migrering av v1-data — en gammal profil läses
// helt enkelt inte, samma som att aldrig ha svarat.
const STORAGE_KEY = 'foreningsguiden:foreningsprofil:v2';

const TOM_PROFIL: Foreningsprofil = {
  kommunSlug: null,
  verksamhet: [],
  storlek: null,
  alder: null,
  sokt: null,
  uppdaterad: '',
  foreningsnamn: null,
  giltighet: null,
  bevakadeBidrag: [],
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

/**
 * E2 "lager ett" (Jacob 2026-08-11) — lägger till ett (kommunSlug,
 * bidragId)-par i bevakadeBidrag, dedupat. saveForeningsprofil() gör
 * bara en ytlig spread — ett rakt `saveForeningsprofil({bevakadeBidrag:
 * [x]})` hade ERSATT hela listan, inte lagt till. Samma "läs-och-
 * mergea"-princip som addBidragBevakning (subscribers.ts) redan följer
 * server-sidan.
 */
export function leggTillBevakatBidrag(kommunSlug: string, bidragId: string): Foreningsprofil {
  const existing = getForeningsprofil() ?? TOM_PROFIL;
  const redanBevakat = existing.bevakadeBidrag.some((b) => b.kommunSlug === kommunSlug && b.bidragId === bidragId);
  if (redanBevakat) return existing;
  return saveForeningsprofil({ bevakadeBidrag: [...existing.bevakadeBidrag, { kommunSlug, bidragId }] });
}

/**
 * R2 (Jacob 2026-08-18): konservativ fallback-profil — används när
 * besökaren inte har någon sparad profil (eller en som gäller en annan
 * kommun) så att utkastvyn ändå kan RENDERA strukturen (krav, bilagor,
 * arbetsordning, deadline) i stället för att blockera hela sidan.
 * kommunSlug=DENNA kommun räcker för Regel A (säte, utkastGenerator.ts
 * fyllKrav) att fylla i något utan att gissa något om föreningen.
 * sokt:'ja' undviker registreringsspärren — en förhandsvisning som
 * inte påstår sig veta något om föreningen ska inte heller påstå att
 * den saknar registrering. "Använd besökarens riktiga profil när den
 * finns, den konservativa när den saknas" (Jacob, R2) — svara på
 * matchningstrattens frågor fyller fler rader och avgör om köpet är
 * möjligt (api/checkout/bidragsutkast.ts kräver fortfarande en riktig,
 * matchande profil för själva betalningen).
 */
export function konservativProfil(kommunSlug: string): Foreningsprofil {
  return { ...TOM_PROFIL, kommunSlug, sokt: 'ja' };
}

export function clearForeningsprofil(): void {
  if (!harLocalStorage()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
