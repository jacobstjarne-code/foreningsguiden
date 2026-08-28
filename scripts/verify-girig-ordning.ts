/**
 * verify-girig-ordning.ts — AH1.1/AH1.2: fäller bygget om frågemotorns
 * giriga val, tvåstegsordning (R3), eller räknarna (R1/R2) avviker från
 * den definierade algoritmen. Handkonstruerade fixturer, inte corpus —
 * syftet är att bevisa ALGORITMEN, inte mäta täckning (det gör
 * analyze-krav-koppling.ts).
 *
 * Kör: node --experimental-strip-types scripts/verify-girig-ordning.ts
 */
import { bidragArForberett, valjBastaFalt, nastaFraga, type KravRadMedFalt } from '../src/lib/girigOrdning.ts';
import { antalForberedda, rackviddForFalt, byggBidragstackning, type BidragMedKravRader } from '../src/lib/raknare.ts';

const fail: string[] = [];
function forvanta(namn: string, faktiskt: unknown, forvantat: unknown) {
  const f1 = JSON.stringify(faktiskt);
  const f2 = JSON.stringify(forvantat);
  if (f1 !== f2) fail.push(`${namn}: förväntade ${f2}, fick ${f1}`);
}

const rad = (text: string, faltIds: string[]): KravRadMedFalt => ({ text, faltIds });

// --- Sammansatt rad löses först när ALLA dess fält är besvarade -----------
{
  const rader: KravRadMedFalt[] = [rad('org.nr + stadgar + styrelse', ['organisation_number', 'bylaws_adopted', 'elected_board'])];
  forvanta('sammansatt rad, 0/3 besvarade → ej förberedd', bidragArForberett(rader, new Set()), false);
  forvanta(
    'sammansatt rad, 2/3 besvarade → fortfarande ej förberedd (AE2: "nödvändigt att inte kalla en sammansatt regel löst efter bara ett delsvar")',
    bidragArForberett(rader, new Set(['organisation_number', 'bylaws_adopted'])),
    false
  );
  forvanta(
    'sammansatt rad, 3/3 besvarade → förberedd',
    bidragArForberett(rader, new Set(['organisation_number', 'bylaws_adopted', 'elected_board'])),
    true
  );
}

// --- C/D2-rader (tomma faltIds) räknas aldrig in (R1) ----------------------
{
  const rader: KravRadMedFalt[] = [rad('krav A', ['activity_duration']), rad('fritext/processregel', [])];
  forvanta(
    'C/D2-rad utan matchat fält blockerar aldrig "förberedd"',
    bidragArForberett(rader, new Set(['activity_duration'])),
    true
  );
}

// --- Girig val: tarBortNu-marginal, exakt AE2:s definition -----------------
{
  // Fält X förekommer ensamt i en rad (färdigställer den direkt).
  // Fält Y förekommer i två rader men delar dem båda med ett annat
  // obesvarat fält — färdigställer INGEN rad ensamt. X ska vinna trots
  // att Y "berör" fler rader.
  const rader: KravRadMedFalt[] = [
    rad('rad1', ['X']),
    rad('rad2', ['Y', 'Z']),
    rad('rad3', ['Y', 'Z']),
  ];
  const val = valjBastaFalt(rader, new Set(), new Map());
  forvanta('girigt val väljer fältet som färdigställer en rad NU, inte flest berörda rader', val, 'X');
}

// --- Tiebreak-nivå 2: kvarvarandeBerorda när tarBortNu är lika -------------
{
  // A och B tar båda bort exakt en rad var (tarBortNu=1 för båda), men
  // B förekommer i ytterligare en olöst rad (kvarvarandeBerorda=2 mot 1).
  const rader: KravRadMedFalt[] = [rad('r1', ['A']), rad('r2', ['B']), rad('r3', ['B', 'C'])];
  const val = valjBastaFalt(rader, new Set(), new Map());
  forvanta('tiebreak nivå 2: lika tarBortNu → flest kvarvarande berörda rader vinner', val, 'B');
}

// --- Tiebreak-nivå 3: bidragstäckning ---------------------------------------
{
  const rader: KravRadMedFalt[] = [rad('r1', ['A']), rad('r2', ['B'])];
  const tackning = new Map([
    ['A', 5],
    ['B', 12],
  ]);
  const val = valjBastaFalt(rader, new Set(), tackning);
  forvanta('tiebreak nivå 3: lika tarBortNu och kvarvarandeBerorda → högst bidragstäckning vinner', val, 'B');
}

// --- Tiebreak-nivå 4: fältnamn (deterministisk sista skiljeregel) ----------
{
  const rader: KravRadMedFalt[] = [rad('r1', ['zeta']), rad('r2', ['alfa'])];
  const val = valjBastaFalt(rader, new Set(), new Map());
  forvanta('tiebreak nivå 4: helt lika → alfabetiskt fältnamn vinner', val, 'alfa');
}

// --- Redan besvarade fält väljs aldrig igen ---------------------------------
{
  const rader: KravRadMedFalt[] = [rad('r1', ['A'])];
  const val = valjBastaFalt(rader, new Set(['A']), new Map());
  forvanta('inget kvar att fråga när enda fältet redan är besvarat', val, null);
}

// --- R3: steg 1 alltid före steg 2, även när steg 2 skulle "vinna" ----------
{
  // Öppna bidraget har EN olöst rad med fält X (tarBortNu=1). Övriga
  // bidrag i kommunen har ett fält Y som täcker tio bidrag — långt
  // starkare marginal om man bara tittade på steg 2 isolerat. Steg 1
  // ska ändå vinna: "en fråga som bidraget inte kräver får aldrig visas
  // på dess skärm" så länge bidraget självt har olösta frågor kvar.
  const oppna: KravRadMedFalt[] = [rad('öppna-rad', ['X'])];
  const ovriga: KravRadMedFalt[] = Array.from({ length: 10 }, (_, i) => rad(`övrig-rad-${i}`, ['Y']));
  const resultat = nastaFraga(oppna, ovriga, new Set(), new Map());
  forvanta('steg 1 vinner över steg 2 så länge öppna bidraget har olösta rader', resultat, { faltId: 'X', steg: 1 });
}

// --- R3: steg 2 kicker in när öppna bidragets rader är uttömda -------------
{
  const oppna: KravRadMedFalt[] = [rad('öppna-rad', ['X'])];
  const ovriga: KravRadMedFalt[] = [rad('övrig-rad', ['Y'])];
  const resultat = nastaFraga(oppna, ovriga, new Set(['X']), new Map());
  forvanta('steg 2 tar vid när öppna bidragets egna fält är besvarade', resultat, { faltId: 'Y', steg: 2 });
}

// --- R3: null när INGET återstår, varken steg 1 eller steg 2 ---------------
{
  const oppna: KravRadMedFalt[] = [rad('öppna-rad', ['X'])];
  const ovriga: KravRadMedFalt[] = [rad('övrig-rad', ['X'])]; // samma fält, redan besvarat
  const resultat = nastaFraga(oppna, ovriga, new Set(['X']), new Map());
  forvanta('nastaFraga returnerar null när inget kvar i varken steg 1 eller 2', resultat, null);
}

// --- R1: antalForberedda räknar bara HELT förberedda bidrag -----------------
{
  const bidrag: BidragMedKravRader[] = [
    { id: 'b1', namn: 'Bidrag 1', kravRader: [rad('r', ['A'])] },
    { id: 'b2', namn: 'Bidrag 2', kravRader: [rad('r', ['A', 'B'])] },
    { id: 'b3', namn: 'Bidrag 3', kravRader: [rad('r', ['C']), rad('fritext', [])] }, // C/D2 räknas aldrig in
  ];
  const { forberedda, totalt } = antalForberedda(bidrag, new Set(['A', 'C']));
  forvanta('R1: b1 (A besvarat) och b3 (C besvarat, D2-raden ignoreras) förberedda, b2 (saknar B) inte', forberedda, 2);
  forvanta('R1: totalt = alla bidrag i kommunen, oavsett förberedelsestatus', totalt, 3);
}

// --- R2: rackviddForFalt är kommun-scopad, inte nationell -------------------
{
  const bidrag: BidragMedKravRader[] = [
    { id: 'b1', namn: 'B1', kravRader: [rad('r', ['A'])] },
    { id: 'b2', namn: 'B2', kravRader: [rad('r', ['A'])] },
    { id: 'b3', namn: 'B3', kravRader: [rad('r', ['B'])] },
  ];
  forvanta('R2: räckvidd räknar bara bidrag i den givna listan (kommunen)', rackviddForFalt('A', bidrag), 2);
  forvanta('R2: ett fält som inte förekommer alls ger 0, inte fel', rackviddForFalt('Z', bidrag), 0);
}

// --- byggBidragstackning matchar rackviddForFalt exakt ----------------------
{
  const bidrag: BidragMedKravRader[] = [
    { id: 'b1', namn: 'B1', kravRader: [rad('r1', ['A']), rad('r2', ['A'])] }, // A två gånger i SAMMA bidrag — ska räknas en gång
    { id: 'b2', namn: 'B2', kravRader: [rad('r', ['A', 'B'])] },
  ];
  const tackning = byggBidragstackning(bidrag);
  forvanta('bidragstäckning dubbelräknar aldrig samma bidrag för samma fält', tackning.get('A'), 2);
  forvanta('bidragstäckning och rackviddForFalt ger samma tal', tackning.get('A'), rackviddForFalt('A', bidrag));
}

// --- 'fil'-fält frågas ALDRIG (dokument, AF2:s dokumentverifiering.ts är ---
// --- den avsedda vägen, inte den här motorn) — regressionstest mot en ---
// --- verklig incident: file_policy återkom som "aktiv fråga" i oändlig ---
// --- loop eftersom sparaVardeSvar tyst avvisade sort 'dokument'. -----------
{
  // file_policy: verkligt faltId ur profilFalt.ts, datatyp 'fil'.
  const rader: KravRadMedFalt[] = [rad('r1', ['file_policy'])];
  forvanta('fil-fält väljs aldrig som girigt val ens ensamt i en rad', valjBastaFalt(rader, new Set(), new Map()), null);
}
{
  // Sammansatt rad: ett svarbart fält (X) + ett dokumentfält (file_policy).
  // X ska INTE få tarBortNu-poäng för raden (den löses inte förrän
  // dokumentet också finns) — men X ska ändå vara VÄLJBAR, bara utan att
  // ensam få credit för att "ta bort" raden.
  const rader: KravRadMedFalt[] = [rad('r1', ['X', 'file_policy'])];
  const val = valjBastaFalt(rader, new Set(), new Map());
  forvanta('svarbart fält i en sammansatt rad med ett dokumentfält väljs ändå (bara file_policy uteslutet)', val, 'X');
}
{
  // bidragArForberett: en rad som VÄNTAR på ett dokument ska aldrig
  // räknas som löst bara för att engine inte kan fråga om den.
  const rader: KravRadMedFalt[] = [rad('r1', ['file_policy'])];
  forvanta('en rad som bara väntar på ett dokument är ALDRIG "löst" via denna motor', bidragArForberett(rader, new Set()), false);
}

if (fail.length > 0) {
  console.error(`verify:girig-ordning FAIL — ${fail.length} fel`);
  for (const f of fail) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('verify:girig-ordning — alla testfall gröna (marginal, tiebreak 1–4, R3 steg 1/2, R1, R2). PASS');
