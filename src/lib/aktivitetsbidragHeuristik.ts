/**
 * aktivitetsbidragHeuristik.ts — utbrutet ur aktivitetsbidragKorpus.ts
 * (AH1, 2026-08-28): namn/id-heuristiken i sig är ren text-logik, inga
 * Node-API:er — men aktivitetsbidragKorpus.ts:s samlaAktivitetsbidrag()
 * importerar node:fs på FILNIVÅ, vilket gör HELA filen obundlingsbar
 * för webbläsaren så fort NÅGOT därifrån importeras klientsidan (Vite:
 * "Module node:fs has been externalized for browser compatibility").
 * BidragInmatning.astro:s klientskript behöver bara heuristiken (avgöra
 * om DET HÄR bidraget, redan i handen som en prop, är ett
 * aktivitetsbidrag) — inte fil-skanningen. Egen fil = importerbar i
 * både server- och klientkod, samma "en sanning" som resten av AF1/AH1
 * redan håller sig till.
 */

export function arAktivitetsbidrag(namn: string, id: string): boolean {
  const t = `${namn} ${id}`.toLowerCase();
  if (t.includes('attraktivitetsbidrag')) return false;
  return /aktivitetsbidrag|aktivitetsstöd|lokalt aktivitetsstöd|\blok\b/.test(t);
}
