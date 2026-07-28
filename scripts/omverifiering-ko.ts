/**
 * omverifiering-ko.ts — SPEC: Omverifiering (2026-07-27). Detta ÄR
 * gränssnittet mot "extraktionssessionen som läser kön": en
 * forskningspass är en Claude Code-instans med filsystemsåtkomst på en
 * branch (HAIKU_SPEC.md), inte en webbklient — så kön är ett vanligt,
 * skriptbart Node-verktyg, ingen ny webb-API/autentisering.
 *
 * Läser samma hamtaPrioriteradKo() som adminvyns "Omverifiering"-sektion
 * — en sanning, två läsytor. Kräver KV_REST_API_URL/KV_REST_API_TOKEN i
 * miljön (kör `vercel env pull .env.local` om de saknas) — läser
 * .env.local från cwd automatiskt om de inte redan är satta, ingen ny
 * dependency (ingen dotenv-paket, en trivial rad-för-rad-parser räcker).
 *
 * Kör: node scripts/omverifiering-ko.ts [--json]
 */
import { readFileSync, existsSync } from 'node:fs';

function laddaEnvLokalt(): void {
  if (!existsSync('.env.local')) return;
  for (const rad of readFileSync('.env.local', 'utf8').split('\n')) {
    const match = rad.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    const [, namn, raVarde] = match;
    if (process.env[namn] !== undefined) continue; // riktig miljövariabel vinner alltid
    process.env[namn] = raVarde.replace(/^["']|["']$/g, '');
  }
}
laddaEnvLokalt();

const { hamtaPrioriteradKo } = await import('../src/lib/omverifiering.ts');

const jsonLage = process.argv.includes('--json');

const ko = await hamtaPrioriteradKo();

if (jsonLage) {
  console.log(JSON.stringify(ko, null, 2));
} else if (ko.length === 0) {
  console.log('Inget flaggat — kön är tom.');
} else {
  console.log(`${ko.length} flaggade källor, prioritetsordning:\n`);
  ko.forEach((k, i) => {
    const kontext = k.bidrag.length > 0
      ? k.bidrag.map((b) => `${b.kommun}: ${b.bidragNamn}`).join(', ')
      : '(ingen bidragskoppling — kommun-nivå-URL utan matchande bidrag)';
    const senast = k.senastLyckad ? `senast lyckad kontroll ${k.senastLyckad.slice(0, 10)}` : 'aldrig lyckad kontroll';
    console.log(`${i + 1}. [${k.senasteUtfall}] ${k.url}`);
    console.log(`   ${kontext}`);
    console.log(`   ${senast}${k.konsekutivaFel > 0 ? `, ${k.konsekutivaFel} misslyckade försök i rad` : ''}`);
    if (k.minDagarTillDeadline !== null) console.log(`   Deadline om ${k.minDagarTillDeadline} dagar`);
    if (k.arKoptEllerBevakad) console.log('   Köpt eller bevakad av någon');
    console.log('');
  });
}
