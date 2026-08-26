/**
 * larmLogik.ts — AB1.3, ren logik utan I/O-beroenden. Samma
 * utbrytningsskäl som omverifieringLogik.ts: testbar från
 * scripts/verify-larm.ts utan Redis. cron/systemlarm.ts (I/O) anropar
 * in hit för alla klassificeringsbeslut — den här filen fattar dem,
 * den andra hämtar underlaget och skickar mejlet.
 */
import type { CronHeartbeat } from './larm';

export type CronBedomningStatus = 'ej_observerad' | 'ok' | 'uteblivet' | 'fel';

export interface CronBedomning {
  namn: string;
  status: CronBedomningStatus;
  meddelande: string | null; // satt bara vid 'uteblivet'/'fel' — 'ok'/'ej_observerad' har inget att rapportera
}

/**
 * heartbeat === null (aldrig skriven) → 'ej_observerad', ALDRIG 'uteblivet'.
 * Skiljer "den här croneen är nydeployad, väntar på sin första körning"
 * från "den här cronen brukar köra men gjorde det inte" — annars larmar
 * varje ny cron falskt hela sitt första dygn.
 */
export function bedomCron(namn: string, heartbeat: CronHeartbeat | null, nuMs: number, uteblivenTimmar: number): CronBedomning {
  if (!heartbeat) return { namn, status: 'ej_observerad', meddelande: null };

  const timmarSedan = (nuMs - Date.parse(heartbeat.senasteKorning)) / (1000 * 60 * 60);
  if (timmarSedan > uteblivenTimmar) {
    return {
      namn,
      status: 'uteblivet',
      meddelande: `ingen körning på ${timmarSedan.toFixed(1)} timmar (senast ${heartbeat.senasteKorning}).`,
    };
  }
  if (heartbeat.fel.length > 0) {
    return {
      namn,
      status: 'fel',
      meddelande: `${heartbeat.fel.length} fel i senaste körningen (${heartbeat.senasteKorning}). Exempel: ${heartbeat.fel.slice(0, 3).join(' | ')}`,
    };
  }
  return { namn, status: 'ok', meddelande: null };
}

/**
 * foregaende === null → kallstart (aldrig sparad tidigare baslinje).
 * Larmar INTE då — "0/okänt → N" är att baslinjen sätts, inte tillväxt.
 */
export function granskningVaxer(nuvarande: number, foregaende: number | null): boolean {
  return foregaende !== null && nuvarande > foregaende;
}

/** Tidigast (lexikografiskt minsta) ISO-datum i listan, eller null om listan är tom. */
export function aldstDatum(datum: string[]): string | null {
  if (datum.length === 0) return null;
  return datum.reduce((min, d) => (d < min ? d : min));
}
