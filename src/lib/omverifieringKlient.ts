/**
 * omverifieringKlient.ts — H27 (SPEC: Omverifiering, 2026-07-27).
 * Klientsidans hämtning av driftvarningsstatus, samma "try/catch → null,
 * kraschar aldrig sidan" kontrakt som bevakningKlient.ts:s
 * hamtaBevakningsantalRaw.
 */

export interface OmverifieringsStatus {
  status: 'unknown' | 'ok' | 'stale';
  dagarSedanLyckad: number | null;
  aldstaUrl: string | null;
}

export async function hamtaOmverifieringsStatus(kommunSlug: string): Promise<OmverifieringsStatus | null> {
  try {
    const res = await fetch(`/api/omverifiering-status?kommun=${encodeURIComponent(kommunSlug)}`);
    if (!res.ok) return null;
    return (await res.json()) as OmverifieringsStatus;
  } catch {
    return null;
  }
}
