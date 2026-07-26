/**
 * bevakningKlient.ts — Klientsidan hämtning av bevakningsräknaren
 * (/api/bevakningsantal, subscribers.ts countSubscribersByKommun). Live ur
 * Redis vid varje sidvisning, ingen cache — därför en fetch, inte inbakat i
 * den statiska HTML:en. Delad av kommunsidan, VantelistaFlode.astro och
 * RegistreringsHjalp.astro så alla tre visar samma golv-logik.
 */

export const BEVAKNING_GOLV = 3;
export const BEVAKNING_GOLV_GLOBALT = 50;

/**
 * Ren, testbar gränsfunktion — separerad från fetch-koden just så att
 * övergången vid golvet (49→false, 50→true) kan verifieras med ett
 * vanligt assert-test utan att fabricera Redis-data (scripts/verify-
 * matching.ts). Alltid "antal >= golv", ingen dold av-runda/marginal.
 */
export function arOverGolv(antal: number, golv: number): boolean {
  return antal >= golv;
}

/**
 * Väljer singular/plural-mall (antal===1 → singular, annars plural) och
 * fyller i {antal}/{datum}. Ren funktion, testbar utan DOM/fetch — fångade
 * tidigare en "1 föreningar"-bugg i ett tidigare utkast av copyn.
 */
export function formateraBevakarText(antal: number, datumText: string, mallPlural: string, mallSingular: string): string {
  const mall = antal === 1 ? mallSingular : mallPlural;
  return mall.replace('{antal}', String(antal)).replace('{datum}', datumText);
}

/** Antal bekräftade bevakare för en kommun, eller null vid nätverksfel. */
export async function hamtaBevakningsantal(kommunSlug: string): Promise<number | null> {
  const data = await hamtaBevakningsantalRaw<{ antal: number }>(`/api/bevakningsantal?kommun=${encodeURIComponent(kommunSlug)}`);
  return data?.antal ?? null;
}

export interface BevakningsantalGlobalt {
  antal: number;
  earliestDatum: string | null;
  antalDeadlines: number;
}

/** Globala live-bevakningstalen (förstasidans live-datakort, turn-14), eller null vid nätverksfel. */
export async function hamtaBevakningsantalGlobalt(): Promise<BevakningsantalGlobalt | null> {
  return hamtaBevakningsantalRaw<BevakningsantalGlobalt>('/api/bevakningsantal');
}

async function hamtaBevakningsantalRaw<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
