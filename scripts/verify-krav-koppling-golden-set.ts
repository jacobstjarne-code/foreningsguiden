/**
 * verify-krav-koppling-golden-set.ts — AF2 (Jacobs order): "Golden set:
 * de 51 missarna ur ditt stickprov som fixturer. De ska fälla mot
 * dagens regler och passera efter."
 *
 * SKILD FRÅN verify-krav-koppling.ts: den filen testar AE1:s EGNA
 * exempelmeningar (varför fältet existerar). Den här filen testar
 * VERKLIGA kravrader ur produktionsdatan (data/kommuner/*.yaml) som
 * analyze-krav-koppling.ts:s 100-radiga stickprov (2026-08-26) visade
 * missade ett befintligt fält trots att kravet konceptuellt hör dit —
 * en regressionsspärr mot just DE fynden, inte mot AE1:s källdokument.
 *
 * Varje fixtur nedan FALLERADE mot reglerna som fanns innan AF2-
 * härdningen. Om en framtida ändring av kravKoppling.ts får någon av
 * dem att sluta träffa sitt fält igen har en regression smugit sig in —
 * det är precis vad den här grinden är till för att fånga.
 *
 * Kör: node --experimental-strip-types scripts/verify-krav-koppling-golden-set.ts
 */
import { testaEgetMonster } from '../src/lib/kravKoppling.ts';

interface Fixtur {
  faltId: string;
  text: string;
}

// De 51 verkliga missarna ur 100-radersstickprovet (2026-08-26), ordagrant
// ur data/kommuner/*.yaml — inte omformulerade. Klassad mot det koncept
// texten uttrycker, inte mot vilket fält som råkar träffa först i
// kopplaKravtext():s prioritetsordning (testaEgetMonster testar varje
// fälts EGET mönster oberoende av den ordningen, se kravKoppling.ts).
const GOLDEN_SET: Fixtur[] = [
  { faltId: 'attendance_retention', text: 'Närvarounderlagen ska sparas i sju år' },
  { faltId: 'participant_frequency_limit', text: 'En deltagare får räknas i högst en gruppaktivitet per förening och veckodag' },
  { faltId: 'audit_consent', text: 'Närvaro ska redovisas för perioderna januari–juni respektive juli–december och underlagen ska kunna granskas' },
  { faltId: 'leader_min_age', text: 'Ledaren ska ha fyllt 13 år och får inte vara ansvarig för flera gruppaktiviteter samtidigt' },
  { faltId: 'leader_group_limit', text: 'Ledaren ska ha fyllt 13 år och får inte vara ansvarig för flera gruppaktiviteter samtidigt' },
  { faltId: 'minimum_activity_count', text: 'Minst 200 deltagartillfällen per år' },
  { faltId: 'no_double_funding', text: 'Kan inte kombineras med verksamhetsstöd eller stöd till social verksamhet' },
  { faltId: 'municipal_base', text: 'Verksamheten ska huvudsakligen gynna boende i Ängelholms kommun' },
  { faltId: 'participant_min_age', text: 'Föreningen ska uppfylla kommunens grundvillkor och redovisa verksamhet för äldre över 65 år eller personer med funktionsnedsättning' },
  { faltId: 'general_rules_attestation', text: 'Uppgifterna ska vara i enlighet med kommunens Regler och riktlinjer för Stöd till föreningslivet, §7 Kommunalt aktivitetsstöd' },
  { faltId: 'leader_min_age', text: 'Ledaren ska vara minst 13 år, närvara under sammankomsten, intyga närvaron och får inte samtidigt leda flera stödgrundande grupper' },
  { faltId: 'leader_present', text: 'Ledaren ska vara minst 13 år, närvara under sammankomsten, intyga närvaron och får inte samtidigt leda flera stödgrundande grupper' },
  { faltId: 'leader_group_limit', text: 'Ledaren ska vara minst 13 år, närvara under sammankomsten, intyga närvaron och får inte samtidigt leda flera stödgrundande grupper' },
  { faltId: 'leader_group_limit', text: 'Aktiviteten/gruppen ska ha minst en ledare som inte samtidigt är ledare för en annan grupp' },
  { faltId: 'minimum_participants', text: 'Varje sammankomst ska ha minst tre bidragsberättigade deltagare utöver ledare' },
  { faltId: 'maximum_participants', text: 'Bidrag utgår för maximalt 30 deltagare per sammankomst, inklusive bidragsberättigad ledare' },
  { faltId: 'participant_frequency_limit', text: 'Samma person, inklusive ledare, får endast redovisas i en aktivitet per dag och förening' },
  { faltId: 'activity_duration', text: 'En sammankomst ska vara minst en timme, omklädning får räknas in i tiden' },
  { faltId: 'leader_present', text: 'Vid varje sammankomst ska det finnas en myndig ansvarig person på plats' },
  { faltId: 'attendance_recording', text: 'Närvaro för deltagare och ledare ska registreras och godkännas av ansvarig ledare' },
  { faltId: 'file_member_list', text: 'Medlemsantalet ska kunna styrkas genom aktuellt medlemsregister' },
  { faltId: 'participant_frequency_limit', text: 'Samma deltagare får räknas i högst en grupp per dag och förening och en aktivitet får bara redovisas som en sammankomst även om gruppen delas' },
  { faltId: 'nondiscrimination', text: 'Alla barn ska behandlas lika vad gäller tillgång och deltagande' },
  { faltId: 'activity_duration', text: 'Aktiviteten ska vara minst 1 timme' },
  { faltId: 'leader_min_age', text: 'En ledare (minst 15 år)' },
  { faltId: 'leader_min_age', text: 'Ledaren ska vara minst 13 år och en ansvarig person som är minst 18 år ska finnas på plats' },
  { faltId: 'national_affiliation', text: 'Merparten av verksamhetsutövarna ska vara anslutna genom Funktionsrätt Boden eller Norrbottens Parasportförbund' },
  { faltId: 'member_residence', text: 'Deltagarna ska vara folkbokförda i Boden och aktiviteten genomföras i föreningens egen regi' },
  { faltId: 'association_run_activity', text: 'Deltagarna ska vara folkbokförda i Boden och aktiviteten genomföras i föreningens egen regi' },
  { faltId: 'member_residence', text: 'Föreningens syfte ska vara verksamhet för målgruppen och deltagarna ska vara folkbokförda i Boden' },
  { faltId: 'file_member_list', text: 'Föreningen ska ha ett styrkbart medlemsregister med namn, adress och födelseår' },
  { faltId: 'general_rules_attestation', text: 'Föreningen ska uppfylla kommunens allmänna medlems- och redovisningsvillkor' },
  { faltId: 'leader_min_age', text: 'Ledaren ska vara minst 15 år, närvaro föras direkt och aktiviteten arrangeras av lokalföreningen' },
  { faltId: 'attendance_recording', text: 'Ledaren ska vara minst 15 år, närvaro föras direkt och aktiviteten arrangeras av lokalföreningen' },
  { faltId: 'attendance_recording', text: 'Föreningen ska föra närvarounderlag och kunna lämna det till kommunen för kontroll' },
  { faltId: 'minimum_participants', text: 'Minst tre bidragsberättigade deltagare utöver ledaren ska delta' },
  { faltId: 'attendance_recording', text: 'Närvaro för deltagare och ledare ska dokumenteras och kunna visas för kommunen' },
  { faltId: 'leader_min_age', text: 'Ledaren ska vara minst 13 år, utsedd av föreningen och närvarande under aktiviteten' },
  { faltId: 'leader_present', text: 'Ledaren ska vara minst 13 år, utsedd av föreningen och närvarande under aktiviteten' },
  { faltId: 'excluded_activity_forms', text: 'Matcher i serier, cuper eller turneringar är inte bidragsberättigade' },
  { faltId: 'participant_frequency_limit', text: 'Samma grupp kan få bidrag högst en gång per dag oavsett antalet deltagare och aktivitetens längd' },
  { faltId: 'minimum_activity_count', text: 'Föreningen ska ha minst tio stödberättigade deltagartillfällen per år' },
  { faltId: 'leader_group_limit', text: 'En ledare får inte leda flera stödberättigade grupper under samma timme och ett lag eller en grupp får inte delas upp i mindre redovisningsgrupper' },
  { faltId: 'minimum_participants', text: 'Grupp om minst tre bidragsberättigade deltagare' },
  { faltId: 'participants_are_members', text: 'Deltagaren ska vara kommuninvånare och medlem i föreningen, med ett begränsat undantag för rekryteringsaktiviteter; ledaren får inte ansvara för flera aktiviteter samtidigt' },
  { faltId: 'leader_group_limit', text: 'Deltagaren ska vara kommuninvånare och medlem i föreningen, med ett begränsat undantag för rekryteringsaktiviteter; ledaren får inte ansvara för flera aktiviteter samtidigt' },
  // member_count_filtered-raden borttagen AG1 (Jacob 2026-08-27) — fältet
  // finns inte längre, se profilFalt.ts:s filhuvud.
  { faltId: 'minimum_activity_count', text: 'Föreningen ska ha minst 25 betalande medlemmar över sju år och redovisa minst 200 deltagaraktiviteter per år' },
  { faltId: 'no_double_funding', text: 'Beviljas inte för aktivitet som fått arrangemangsbidrag eller annat kommunalt produktionsstöd' },
  { faltId: 'attendance_recording', text: 'Genomförda medlemsaktiviteter och sammankomster ska styrkas med närvarounderlag eller motsvarande verifikation' },
  { faltId: 'member_residence', text: 'Aktivitetsstödet avser en medlem bosatt i kommunen som deltagit i en av föreningen arrangerad eller beslutad aktivitet' },
  { faltId: 'minimum_participants', text: 'Minst fem personer ska vara närvarande vid varje stödgrundande aktivitet' },
  { faltId: 'participant_frequency_limit', text: 'Samma deltagare får räknas vid högst en sammankomst per dag' },
  { faltId: 'file_attendance', text: 'Aktivitetskort ska bifogas årsansökan tillsammans med verksamhets- och ekonomihandlingar' },
  { faltId: 'audit_consent', text: 'Ansökan ska undertecknas av behöriga företrädare och beviljat stöd ska kunna granskas' },
  { faltId: 'activity_open', text: 'Verksamheten ska vara öppen för kommuninvånarna och ansökan ska avse rätt halvårsperiod' },
];

const fail: string[] = [];
for (const f of GOLDEN_SET) {
  if (!testaEgetMonster(f.faltId, f.text)) {
    fail.push(`${f.faltId}: "${f.text}"`);
  }
}

if (fail.length > 0) {
  console.error(`verify:krav-koppling-golden-set FAIL — ${fail.length}/${GOLDEN_SET.length} corpus-fixturer känns fortfarande inte igen`);
  for (const p of fail) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`verify:krav-koppling-golden-set — ${GOLDEN_SET.length}/${GOLDEN_SET.length} corpus-missar från 2026-08-26 känns nu igen. PASS`);
