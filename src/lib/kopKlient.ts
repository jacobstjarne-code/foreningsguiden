/**
 * kopKlient.ts — Klientsidan hämtning av köpräknaren (/api/kopantal,
 * kop.ts hamtaAllaKop). Live ur Redis vid varje sidvisning, ingen cache
 * — samma skäl och samma mönster som bevakningKlient.ts (utkastvyn är
 * förbyggd, "live" kräver ett separat klientanrop).
 */

// F① (konverteringsstapeln, 2026-08-12, Jacob): "Noll köp, alltså under
// tröskeln 100." — den lokala (kommun-scopade) sociala bevis-tröskeln.
export const SOCIALT_BEVIS_GOLV = 100;

/** Ren, testbar gränsfunktion — samma form som bevakningKlient.ts arOverGolv(). */
export function arOverSocialtBevisGolv(antal: number): boolean {
  return antal >= SOCIALT_BEVIS_GOLV;
}

/** Antal bekräftade köp (registrering + bidragsutkast) för en kommun, eller null vid nätverksfel. */
export async function hamtaKopantal(kommunSlug: string): Promise<number | null> {
  try {
    const res = await fetch(`/api/kopantal?kommun=${encodeURIComponent(kommunSlug)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { antal: number };
    return data.antal;
  } catch {
    return null;
  }
}
