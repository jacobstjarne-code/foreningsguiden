/**
 * profilSvar.ts — AF1.1 (Jacobs order): schema för profillagrets svar.
 * Tre sorter, en gemensam lagringsform (samma disciplin som Bidrag.
 * belopp_status/deadline_status/krav_status delar EN Datatillstand-skala,
 * kommunTyper.ts) — en diskriminerad union, inte tre separata tabeller.
 *
 *   faktum      — ett värde plus var det kom ifrån (hon angav det, eller
 *                 det importerades). Täcker fältkatalogens tal/text/datum.
 *   dokument    — en fil plus vilket år/period den avser. Täcker fil.
 *   intygande   — ja/nej plus tidpunkten för svaret. Täcker ja/nej.
 *
 * Datatyp→sort är en STRIKT funktion av profilFalt.ts:s FaltDatatyp — inte
 * ett fritt val vid varje anrop. Se svarssortForDatatyp() nedan; en
 * felaktig kombination (t.ex. ett "tal"-fält lagrat som intygande) är ett
 * programmeringsfel, inte ett giltigt tillstånd.
 *
 * "Varje svar bär tidsstämpel" (Jacobs ord): tidsstampel sitter på
 * SvarBas, delad av alla tre — det är den som gör "ett intygande om
 * drogfrihet från 2024 kan visas som gammalt" möjligt utan ett separat
 * ålder-fält per sort.
 *
 * INGEN lagringsmekanism byggs här (ingen Redis-nyckel, ingen route) —
 * det är nästa steg, inte AF1. Det här är bara formen värdena har när de
 * väl lagras.
 */

import { hamtaFaltdefinition, type FaltDatatyp } from './profilFalt.ts';

export type SvarKalla = 'angiven' | 'importerad';

export interface SvarBas {
  faltId: string; // referens till profilFalt.ts:s FALT_KATALOG
  tidsstampel: string; // ISO — när SVARET lämnades, inte när det senast lästes
}

export interface FaktumSvar extends SvarBas {
  sort: 'faktum';
  varde: string | number;
  kalla: SvarKalla;
}

export interface DokumentSvar extends SvarBas {
  sort: 'dokument';
  filUrl: string;
  avserAr: number; // verksamhetsår/period dokumentet gäller för — INTE uppladdningsåret
}

export interface IntygandeSvar extends SvarBas {
  sort: 'intygande';
  varde: boolean;
}

export type Svar = FaktumSvar | DokumentSvar | IntygandeSvar;

/** Datatyp→sort är deterministisk, se filhuvudet. */
export function svarssortForDatatyp(datatyp: FaltDatatyp): Svar['sort'] {
  if (datatyp === 'fil') return 'dokument';
  if (datatyp === 'ja/nej') return 'intygande';
  return 'faktum'; // tal | text | datum
}

/**
 * Enda konstruktionsvägen in — vägrar bygga ett Svar vars sort inte
 * matchar fältets egen datatyp (t.ex. ett faktum-svar för ett ja/nej-fält)
 * och vägrar ett faltId som inte finns i katalogen. Ett ogiltigt Svar ska
 * aldrig kunna konstrueras, inte upptäckas efteråt.
 */
export function byggSvar(
  faltId: string,
  input:
    | { sort: 'faktum'; varde: string | number; kalla: SvarKalla }
    | { sort: 'dokument'; filUrl: string; avserAr: number }
    | { sort: 'intygande'; varde: boolean },
  tidsstampel: string = new Date().toISOString()
): Svar {
  const definition = hamtaFaltdefinition(faltId);
  if (!definition) {
    throw new Error(`byggSvar: okänt faltId "${faltId}" — finns inte i profilFalt.ts:s FALT_KATALOG`);
  }
  const forvantadSort = svarssortForDatatyp(definition.datatyp);
  if (input.sort !== forvantadSort) {
    throw new Error(
      `byggSvar: fältet "${faltId}" har datatyp ${definition.datatyp} → förväntar sort "${forvantadSort}", fick "${input.sort}"`
    );
  }
  return { ...input, faltId, tidsstampel } as Svar;
}

/** Ålder i hela dygn — "kan visas som gammalt" (Jacobs ord) räknas härifrån, inte en egen lagrad räkning. */
export function svarsAlderIDagar(svar: Svar, nu: string = new Date().toISOString()): number {
  const ms = Date.parse(nu) - Date.parse(svar.tidsstampel);
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
