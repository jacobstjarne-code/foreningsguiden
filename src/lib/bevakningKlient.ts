/**
 * bevakningKlient.ts — Klientsidan hämtning av bevakningsräknaren
 * (/api/bevakningsantal, subscribers.ts countSubscribersByKommun). Live ur
 * Redis vid varje sidvisning, ingen cache — därför en fetch, inte inbakat i
 * den statiska HTML:en. Delad av kommunsidan, VantelistaFlode.astro och
 * RegistreringsHjalp.astro så alla tre visar samma golv-logik.
 */

export const BEVAKNING_GOLV = 3;
export const BEVAKNING_GOLV_GLOBALT = 50;

/** Antal bekräftade bevakare för en kommun, eller null vid nätverksfel. */
export async function hamtaBevakningsantal(kommunSlug: string): Promise<number | null> {
  return hamtaBevakningsantalRaw(`/api/bevakningsantal?kommun=${encodeURIComponent(kommunSlug)}`);
}

/** Globalt antal bekräftade bevakare (alla kommuner), eller null vid nätverksfel. */
export async function hamtaBevakningsantalGlobalt(): Promise<number | null> {
  return hamtaBevakningsantalRaw('/api/bevakningsantal');
}

async function hamtaBevakningsantalRaw(url: string): Promise<number | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as { antal: number };
    return data.antal;
  } catch {
    return null;
  }
}
