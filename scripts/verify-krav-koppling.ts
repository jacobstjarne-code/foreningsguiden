/**
 * verify-krav-koppling.ts — AF1.3 (Jacobs order): självvalideringsgrind
 * för kravKoppling.ts:s 68 fältmönster. Källa: AE1:s EGNA två
 * exempelmeningar per fält (incoming/AE1_FALTLISTA_AKTIVITETSBIDRAG.csv,
 * kolumnerna exempel_1/2_ordalydelse) — transkriberade hit ordagrant,
 * inte omformulerade. Ett mönster som inte känner igen de MENINGAR SOM
 * MOTIVERADE FÄLTETS EGEN EXISTENS är trasigt per definition, oavsett
 * hur det presterar mot resten av corpuset.
 *
 * Fäller bygget (till skillnad från analyze-krav-koppling.ts, som bara
 * rapporterar) — ett mönster som inte klarar sitt eget belägg ska aldrig
 * committas som "klart".
 *
 * Kör: node --experimental-strip-types scripts/verify-krav-koppling.ts
 */
import { testaEgetMonster, alltidRegistreradeFalt } from '../src/lib/kravKoppling.ts';
import { FALT_KATALOG } from '../src/lib/profilFalt.ts';

interface Exempel { faltId: string; text: string }

const EXEMPEL: Exempel[] = [
  { faltId: 'activity_duration', text: "Aktiviteten ska vara planerad av föreningen, ledarledd och pågå i minst 45 minuter" },
  { faltId: 'activity_duration', text: "Aktiviteten ska pågå minst 45 minuter och ha minst tre deltagare utöver ledare" },
  { faltId: 'minimum_participants', text: "Aktiviteten ska pågå minst 45 minuter och ha minst tre deltagare utöver ledare" },
  { faltId: 'minimum_participants', text: "Gruppen ska bestå av minst tre deltagare 5–25 år och vara naturligt sammansatt, exempelvis ett lag eller en nybörjargrupp" },
  { faltId: 'participant_min_age', text: "Deltagare ska vara 6–20 år eller 70 år och äldre; för personer med funktionsnedsättning finns ingen åldersgräns" },
  { faltId: 'participant_min_age', text: "Deltagarna ska vara 7–25 år; för deltagare med funktionsnedsättning finns ingen övre åldersgräns och ledare 13–25 år får räknas som deltagare" },
  { faltId: 'participant_max_age', text: "Deltagare ska vara 6–20 år eller 70 år och äldre; för personer med funktionsnedsättning finns ingen åldersgräns" },
  { faltId: 'participant_max_age', text: "Deltagarna ska vara 7–25 år; för deltagare med funktionsnedsättning finns ingen övre åldersgräns och ledare 13–25 år får räknas som deltagare" },
  { faltId: 'leader_led', text: "Aktiviteten ska vara planerad av föreningen, ledarledd och pågå i minst 45 minuter" },
  { faltId: 'leader_led', text: "Aktiviteten ska ledas av en utsedd ledare över 13 år och det ska finnas minst en ledare per 20 deltagare" },
  { faltId: 'leader_min_age', text: "Deltagarna ska vara 7–25 år; för deltagare med funktionsnedsättning finns ingen övre åldersgräns och ledare 13–25 år får räknas som deltagare" },
  { faltId: 'leader_min_age', text: "Minst 3 och max 20 deltagare i bidragsberättigad ålder per aktivitetstillfälle (ledare 13–21 år får räknas som deltagare)" },
  { faltId: 'activity_planned', text: "Aktiviteten ska vara planerad av föreningen, ledarledd och pågå i minst 45 minuter" },
  { faltId: 'activity_planned', text: "Aktiviteten ska planeras och genomföras av en förening och rikta sig till barn och unga under aktuellt lov" },
  { faltId: 'attendance_recording', text: "Närvarokorten ska granskas och ansökan undertecknas av en firmatecknare som styrelsen har utsett" },
  { faltId: 'attendance_recording', text: "Närvarokort ska föras vid varje sammankomst" },
  { faltId: 'maximum_participants', text: "Minst tre och högst 30 stödberättigade deltagare får räknas per gruppaktivitet; en deltagare får bara räknas i en gruppaktivitet per förening och dag" },
  { faltId: 'maximum_participants', text: "Minst 3 och max 20 deltagare i bidragsberättigad ålder per aktivitetstillfälle (ledare 13–21 år får räknas som deltagare)" },
  { faltId: 'member_count_filtered', text: "Föreningen ska normalt ha minst tio medlemmar, ta ut minst 50 kr i årlig medlemsavgift och föra medlemsregister som sparas i fyra år" },
  { faltId: 'member_count_filtered', text: "Föreningen ska uppfylla grundkraven och ha minst 15 medlemmar i åldern 6–20 år" },
  { faltId: 'participant_frequency_limit', text: "Aktiviteten genomförs i föreningens regi och bidrag ges endast en gång per dag och deltagare inom samma förening" },
  { faltId: 'participant_frequency_limit', text: "Högst en aktivitet per dygn är stödgrundande och närvarokort ska lämnas" },
  { faltId: 'excluded_activity_forms', text: "Bidrag utgår inte till aktivitet som ordnas av riksorganisation, distrikt eller lokalt samarbetsorgan, till kommersiella arrangemang eller till studiecirklar anordnade av studieförbund" },
  { faltId: 'excluded_activity_forms', text: "Entrébelagda tävlingar och verksamhet genom studieförbund är inte stödberättigade" },
  { faltId: 'democratic_form', text: "Föreningen ska ha organisationsnummer, konto i föreningens namn, demokratiska stadgar, vald styrelse, revisor och ordnad bokföring" },
  { faltId: 'democratic_form', text: "Föreningen ska vara ideell, demokratiskt uppbyggd, registrerad i kommunens föreningsregister och hålla uppgifterna aktuella" },
  { faltId: 'municipal_base', text: "Föreningen ska ha säte eller föreningsadress i Bollebygd, bedriva verksamhet för kommuninvånare och vara införd i kommunens föreningsregister" },
  { faltId: 'municipal_base', text: "Föreningen ska vara verksam i Borgholms kommun och genomföra aktiviteter för barn 2–6 år" },
  { faltId: 'leader_present', text: "Aktiviteten ska ledas av en utsedd ledare över 13 år och det ska finnas minst en ledare per 20 deltagare" },
  { faltId: 'leader_present', text: "Gruppledaren ska vara närvarande och föra närvarokort vid varje sammankomst" },
  { faltId: 'common_start_end', text: "Aktiviteten ska pågå minst 60 minuter och innehålla gemensam samling och avslutning" },
  { faltId: 'common_start_end', text: "Aktiviteten ska pågå minst 60 minuter, ha minst tre deltagare, ledarledd start och avslutning samt högst 30 stödgrundande deltagare per tillfälle och dygn" },
  { faltId: 'municipal_registration', text: "Föreningen ska vara ideell, demokratiskt uppbyggd, registrerad i kommunens föreningsregister och hålla uppgifterna aktuella" },
  { faltId: 'municipal_registration', text: "Föreningen ska vara godkänd som bidragsberättigad, registrerad i kommunen och uppfylla de allmänna kraven på ideell, demokratisk och öppen verksamhet" },
  { faltId: 'activity_target_group', text: "Aktiviteten ska planeras och genomföras av en förening och rikta sig till barn och unga under aktuellt lov" },
  { faltId: 'activity_target_group', text: "Aktiviteten ska rikta sig till barn 6–15 år" },
  { faltId: 'bylaws_adopted', text: "Föreningen ska ha organisationsnummer, konto i föreningens namn, demokratiska stadgar, vald styrelse, revisor och ordnad bokföring" },
  { faltId: 'bylaws_adopted', text: "Föreningen ska ha antagit stadgar, valt styrelse, varit verksam i minst sex månader och vara ansluten till en statsbidragsberättigad riksorganisation" },
  { faltId: 'association_account', text: "Föreningen ska ha organisationsnummer, konto i föreningens namn, demokratiska stadgar, vald styrelse, revisor och ordnad bokföring" },
  { faltId: 'association_account', text: "Ha bankkonto, bankgiro eller plusgiro samt organisationsnummer" },
  { faltId: 'nonprofit_form', text: "Föreningen ska vara ideell, demokratiskt uppbyggd, registrerad i kommunens föreningsregister och hålla uppgifterna aktuella" },
  { faltId: 'nonprofit_form', text: "Föreningen ska vara ideell, demokratiskt uppbyggd och bedriva verksamhet i Falu kommun" },
  { faltId: 'organisation_number', text: "Föreningen ska ha organisationsnummer, konto i föreningens namn, demokratiska stadgar, vald styrelse, revisor och ordnad bokföring" },
  { faltId: 'organisation_number', text: "Ha bankkonto, bankgiro eller plusgiro samt organisationsnummer" },
  { faltId: 'file_annual_report', text: "Justerat årsmötesprotokoll, verksamhetsberättelse, ekonomisk berättelse, revisionsberättelse och verksamhetsplan ska kunna lämnas till kommunen" },
  { faltId: 'file_annual_report', text: "Föreningen ska lämna verksamhetsberättelse, ekonomisk berättelse, revisionsberättelse, årsmötesprotokoll, aktuell plan och budget" },
  { faltId: 'file_audit_report', text: "Justerat årsmötesprotokoll, verksamhetsberättelse, ekonomisk berättelse, revisionsberättelse och verksamhetsplan ska kunna lämnas till kommunen" },
  { faltId: 'file_audit_report', text: "Föreningen ska lämna verksamhetsberättelse, ekonomisk berättelse, revisionsberättelse, årsmötesprotokoll, aktuell plan och budget" },
  { faltId: 'elected_board', text: "Föreningen ska ha organisationsnummer, konto i föreningens namn, demokratiska stadgar, vald styrelse, revisor och ordnad bokföring" },
  { faltId: 'elected_board', text: "Föreningen ska ha antagit stadgar, valt styrelse, varit verksam i minst sex månader och vara ansluten till en statsbidragsberättigad riksorganisation" },
  { faltId: 'file_annual_meeting_minutes', text: "Justerat årsmötesprotokoll, verksamhetsberättelse, ekonomisk berättelse, revisionsberättelse och verksamhetsplan ska kunna lämnas till kommunen" },
  { faltId: 'file_annual_meeting_minutes', text: "Årliga verksamhets-, ekonomi-, revisions- och årsmöteshandlingar ska lämnas till kommunen" },
  { faltId: 'leader_group_limit', text: "Aktiviteten ska ledas av en utsedd ledare över 13 år och det ska finnas minst en ledare per 20 deltagare" },
  { faltId: 'leader_group_limit', text: "Aktiviteten ska vara ledarledd och ledaren får inte ansvara för flera grupper samtidigt" },
  { faltId: 'free_activity', text: "Aktiviteten ska vara kostnadsfri och öppen för deltagare i den angivna målgruppen" },
  { faltId: 'free_activity', text: "Entrébelagda tävlingar och verksamhet genom studieförbund är inte stödberättigade" },
  { faltId: 'file_financial_report', text: "Justerat årsmötesprotokoll, verksamhetsberättelse, ekonomisk berättelse, revisionsberättelse och verksamhetsplan ska kunna lämnas till kommunen" },
  { faltId: 'file_financial_report', text: "Föreningen ska lämna verksamhetsberättelse, ekonomisk berättelse, revisionsberättelse, årsmötesprotokoll, aktuell plan och budget" },
  { faltId: 'member_residence', text: "Föreningen ska ha minst tio medlemmar bosatta i Emmaboda kommun och stöd lämnas bara för dessa medlemmar" },
  { faltId: 'member_residence', text: "Föreningen ska ha minst 15 medlemmar i bidragsberättigad ålder och huvuddelen ska vara bosatta i Huddinge" },
  { faltId: 'attendance_retention', text: "Närvaro ska registreras vid varje aktivitet och ansökan samt närvarounderlag sparas i minst tre år" },
  { faltId: 'attendance_retention', text: "Närvarokort med namn och födelsedata ska föras, intygas av ledaren och sparas i minst fyra år" },
  { faltId: 'membership_fee', text: "Föreningen ska normalt ha minst tio medlemmar, ta ut minst 50 kr i årlig medlemsavgift och föra medlemsregister som sparas i fyra år" },
  { faltId: 'membership_fee', text: "Föreningens verksamhet i Danderyd ska omfatta minst tio aktiva medlemmar i åldern 6–25 år som har betalat medlemsavgift och finns i medlemsförteckningen" },
  { faltId: 'national_affiliation', text: "Föreningen ska vara ansluten till en riksorganisation och bedriva stödberättigad verksamhet för deltagare 5–25 år" },
  { faltId: 'national_affiliation', text: "Föreningen ska vara ansluten till en godkänd riksorganisation eller godkännas av kommunen och lämna aktuella registeruppgifter, års-, ekonomi- och revisionshandlingar samt jämställdhetspolicy" },
  { faltId: 'minimum_activity_count', text: "Föreningen ska ha minst 10 medlemmar i åldern 5–25 år och minst 10 bidragsberättigade aktiviteter under föregående halvår" },
  { faltId: 'minimum_activity_count', text: "Minst 10 bidragsberättigade sammankomster per halvår för barn 5–20 år, funktionsnedsatta oavsett ålder eller pensionärer 65 år och äldre" },
  { faltId: 'general_rules_attestation', text: "Föreningen ska arbeta för personer med funktionsnedsättning eller diagnos och uppfylla kommunens allmänna villkor" },
  { faltId: 'general_rules_attestation', text: "Föreningen ska uppfylla kommunens allmänna villkor om registrering, organisationsnummer, styrelse, stadgar, föreningskonto, öppenhet, lokal verksamhet, medlemsantal och drogfri verksamhet" },
  { faltId: 'rf_lok_compliance', text: "Sammankomsten ska uppfylla villkoren för statligt lokalt aktivitetsstöd och ha minst tre stödberättigade deltagare samt en ledare" },
  { faltId: 'rf_lok_compliance', text: "Verksamheten ska följa Riksidrottsförbundets principer för lokalt aktivitetsstöd" },
  { faltId: 'participants_are_members', text: "Deltagare ska normalt vara medlemmar och får räknas högst en gång per dag inom samma förening" },
  { faltId: 'participants_are_members', text: "Deltagarna ska vara medlemmar i föreningen" },
  { faltId: 'file_general_annual_docs', text: "Närvarokort och kommunens begärda årshandlingar ska bifogas ansökan" },
  { faltId: 'file_general_annual_docs', text: "Föreningen ska vara registrerad och bidragsberättigad samt lämna stadgar och aktuella årshandlingar" },
  { faltId: 'outside_school_hours', text: "Entrébelagda tävlingar, kommersiella arrangemang, studiecirklar, skoltid och privat verksamhet är inte stödgrundande" },
  { faltId: 'outside_school_hours', text: "Studiecirklar och aktiviteter under skoltid är inte stödberättigade" },
  { faltId: 'association_run_activity', text: "Aktiviteten genomförs i föreningens regi och bidrag ges endast en gång per dag och deltagare inom samma förening" },
  { faltId: 'association_run_activity', text: "Aktiviteten ska pågå minst 60 minuter, vara ledarledd, ha minst tre deltagare och genomföras i föreningens regi" },
  { faltId: 'drug_free_activity', text: "Föreningar med barn- och ungdomsverksamhet ska vara drogfria, ha alkohol- och drogpolicy med handlingsplan och visa hur barnets bästa beaktas" },
  { faltId: 'drug_free_activity', text: "Verksamheten ska bedrivas på fritiden i Ekerö kommun, finnas i föreningens verksamhetsplan och främja barnrätt, etik, delaktighet, ideellt engagemang, jämställdhet, integration och drogfrihet" },
  { faltId: 'nondiscrimination', text: "Verksamheten får inte vara partipolitisk, religiös, diskriminerande eller droguppmuntrande" },
  { faltId: 'nondiscrimination', text: "Föreningen ska verka enligt demokratiska principer och aktivt motsätta sig våld, rasism och diskriminering" },
  { faltId: 'file_bylaws', text: "Föreningen ska lämna årsmöteshandlingar, ekonomiska handlingar, verksamhetsplan, budget, stadgar och aktivitetsredovisning" },
  { faltId: 'file_bylaws', text: "Föreningen ska vara registrerad och bidragsberättigad samt lämna stadgar och aktuella årshandlingar" },
  { faltId: 'elected_auditor', text: "Föreningen ska ha organisationsnummer, konto i föreningens namn, demokratiska stadgar, vald styrelse, revisor och ordnad bokföring" },
  { faltId: 'elected_auditor', text: "Ha en stadgeenligt vald styrelse och valda revisorer" },
  { faltId: 'file_activity_plan', text: "Justerat årsmötesprotokoll, verksamhetsberättelse, ekonomisk berättelse, revisionsberättelse och verksamhetsplan ska kunna lämnas till kommunen" },
  { faltId: 'file_activity_plan', text: "Föreningen ska lämna årsmöteshandlingar, ekonomiska handlingar, verksamhetsplan, budget, stadgar och aktivitetsredovisning" },
  { faltId: 'founded_date', text: "Föreningen ska ha antagit stadgar, valt styrelse, varit verksam i minst sex månader och vara ansluten till en statsbidragsberättigad riksorganisation" },
  { faltId: 'founded_date', text: "Föreningen ska ha antagit stadgar, valt styrelse och revisorer samt varit verksam i minst sex månader" },
  { faltId: 'child_convention', text: "Föreningar med barn- och ungdomsverksamhet ska vara drogfria, ha alkohol- och drogpolicy med handlingsplan och visa hur barnets bästa beaktas" },
  { faltId: 'child_convention', text: "Verksamheten ska bedrivas på fritiden i Ekerö kommun, finnas i föreningens verksamhetsplan och främja barnrätt, etik, delaktighet, ideellt engagemang, jämställdhet, integration och drogfrihet" },
  { faltId: 'activity_purpose', text: "Aktiviteterna ska stimulera alla barns deltagande och främja integration" },
  { faltId: 'activity_purpose', text: "Aktiviteten ska vara öppen för alla och främja ett aktivt liv, delaktighet och gemenskap samt motverka isolering och ensamhet" },
  { faltId: 'drug_policy', text: "Föreningar med barn- och ungdomsverksamhet ska vara drogfria, ha alkohol- och drogpolicy med handlingsplan och visa hur barnets bästa beaktas" },
  { faltId: 'drug_policy', text: "Föreningen ska följa Hällefors ANDTS-policy och ha plusgiro, bankgiro eller bankkonto" },
  { faltId: 'nonpolitical_nonreligious', text: "Stöd ges inte för fester, högtidsfiranden, religiös missionerande verksamhet eller politisk verksamhet" },
  { faltId: 'nonpolitical_nonreligious', text: "Endast barn- och ungdomsaktiviteter utan religiös påverkan godkänns" },
  { faltId: 'equality_policy', text: "Verksamhetsberättelsen ska visa arbete mot droger, våld, rasism och tidig utslagning och för jämställdhet" },
  { faltId: 'equality_policy', text: "Verksamheten ska bedrivas på fritiden i Ekerö kommun, finnas i föreningens verksamhetsplan och främja barnrätt, etik, delaktighet, ideellt engagemang, jämställdhet, integration och drogfrihet" },
  { faltId: 'regular_activity', text: "Verksamheten ska bedrivas regelbundet under året och får inte enbart bestå av lovverksamhet, möten eller öppen verksamhet" },
  { faltId: 'regular_activity', text: "Kostnadsfri för deltagarna, inget medlemskrav eller krav på regelbundet deltagande" },
  { faltId: 'activity_open', text: "Aktiviteten ska vara ledarledd, öppen för alla och ha minst tre deltagande barn i åldersgruppen" },
  { faltId: 'activity_open', text: "Aktiviteten ska vara öppen för alla" },
  { faltId: 'file_policy', text: "Justerat årsmötesprotokoll, verksamhetsberättelse, ekonomisk redovisning och bokslut, signerad revisionsberättelse, stadgar och drogpolicy ska finnas i Rbok" },
  { faltId: 'file_policy', text: "Kontaktuppgifter, medlemsantal, årsmötesprotokoll, verksamhetsberättelse och drogpolicy med handlingsplan ska lämnas årligen" },
  { faltId: 'file_budget', text: "Föreningen ska lämna verksamhetsberättelse, ekonomisk berättelse, revisionsberättelse, årsmötesprotokoll, aktuell plan och budget" },
  { faltId: 'file_budget', text: "Föreningen ska lämna årsmöteshandlingar, ekonomiska handlingar, verksamhetsplan, budget, stadgar och aktivitetsredovisning" },
  { faltId: 'ordered_finances', text: "Föreningen ska ha organisationsnummer, konto i föreningens namn, demokratiska stadgar, vald styrelse, revisor och ordnad bokföring" },
  { faltId: 'ordered_finances', text: "Föreningen ska ha vald styrelse, antagna stadgar och bokförd ekonomi" },
  { faltId: 'no_double_funding', text: "Samma aktivitet får inte redan finansieras av ett annat kommunalt stöd, men en ny aktivitet inom en stödd förening kan prövas" },
  { faltId: 'no_double_funding', text: "Beviljas inte för verksamhet under skoldagen, kommersiella/entrébelagda aktiviteter eller verksamhet som redan får annat kommunalt stöd" },
  { faltId: 'file_attendance', text: "Närvarokort och kommunens begärda årshandlingar ska bifogas ansökan" },
  { faltId: 'file_attendance', text: "Föreningen ska lämna årsmöteshandlingar, ekonomiska handlingar, verksamhetsplan, budget, stadgar och aktivitetsredovisning" },
  { faltId: 'previous_support', text: "Föreningen ska ha beviljats grundbidrag eller startbidrag" },
  { faltId: 'previous_support', text: "Föreningen ska ha beviljats startbidrag eller grundbidrag under de senaste 12 månaderna" },
  { faltId: 'activity_location', text: "Verksamheten ska bedrivas på fritiden i Ekerö kommun, finnas i föreningens verksamhetsplan och främja barnrätt, etik, delaktighet, ideellt engagemang, jämställdhet, integration och drogfrihet" },
  { faltId: 'activity_location', text: "Minst tre deltagare inklusive ansvarig ledare ska delta och aktiviteten ska bedrivas i kommunen" },
  { faltId: 'association_type', text: "Föreningen ska vara en bidragsberättigad barn- och ungdomsförening och ha genomfört minst fem bidragsberättigade aktivitetstillfällen under terminen" },
  { faltId: 'association_type', text: "Föreningen ska vara registrerad i kommunens föreningsregister och vara en pensionärs- eller funktionsrättsförening" },
  { faltId: 'annual_meeting', text: "Föreningen ska vara demokratiskt uppbyggd, ha stadgar, hålla årsmöte och välja styrelse och revisorer" },
  { faltId: 'annual_meeting', text: "Ha godkända stadgar, ansvarig styrelse och revisorer samt hålla årsmöte där verksamhetsberättelse, resultat- och balansräkning samt revisionsberättelse godkänns" },
  { faltId: 'audit_consent', text: "Utbetalningar kan bara göras till föreningens registrerade plus- eller bankgiro och kommunen får granska verksamheten" },
  { faltId: 'audit_consent', text: "Byalaget ska ge kommunen den insyn som behövs för att kontrollera hur stödet används" },
  { faltId: 'background_checks', text: "Föreningar med barn- och ungdomsverksamhet ska följa barnkonventionen, kontrollera belastningsregister och ha en årsmötesgodkänd ANDTS-policy" },
  { faltId: 'background_checks', text: "Om vuxna i föreningen har kontinuerlig kontakt med barn ska föreningen begära begränsat utdrag ur belastningsregistret" },
  { faltId: 'file_member_list', text: "Medlemsförteckning med namn, adress och telefonnummer ska kunna lämnas" },
  { faltId: 'file_member_list', text: "Ansökan och medlemsförteckning registrerade digitalt i Idrottsportalen, komplett med bilagor" },
  { faltId: 'open_membership', text: "Föreningen ska vara öppen för alla och arbeta för att motverka diskriminering" },
  { faltId: 'open_membership', text: "Föreningen ska vara öppen för alla och driva ideell verksamhet" },
  { faltId: 'insurance', text: "Föreningen ska ha stadgar, stadgeenligt vald styrelse och revisorer, årsmöte, eget organisationsnummer, eget konto och grundläggande försäkringsskydd" },
  { faltId: 'contact_details', text: "Finns i kommunens föreningsregister och uppdaterar kontaktinformationen efter årsmötet" },
];

const fail: string[] = [];

// EN dokumenterad avsiktlig avvikelse, inte en bugg: activity_purpose
// (D1, 11 bidrag) har inget mönster, se kravKoppling.ts:s filhuvud för
// varför (AE1:s egna två exempel delar bara ordet "främja" — för
// generiskt för ett mönster utan falska träffar). Faller till custom-
// fallbacken. Ett nytt fält utan mönster ska INTE tyst läggas till här
// — bara detta specifika, redan motiverade undantag.
const MEDVETET_UTAN_MONSTER = new Set(['activity_purpose']);

// (1) Varje fält i FALT_KATALOG ska ha ett eget mönster registrerat —
// annars faller ALLT för det fältet till custom-fallbacken, tyst.
const registrerade = new Set(alltidRegistreradeFalt());
for (const f of FALT_KATALOG) {
  if (!registrerade.has(f.id) && !MEDVETET_UTAN_MONSTER.has(f.id)) {
    fail.push(`${f.id}: inget mönster registrerat i kravKoppling.ts:s MATCHARE`);
  }
}

// (2) Varje exempelmening ska kännas igen av SITT EGET fälts mönster —
// utom för de medvetet omönstrade fälten, som per definition aldrig kan
// kännas igen textbaserat.
let testade = 0;
for (const ex of EXEMPEL) {
  if (MEDVETET_UTAN_MONSTER.has(ex.faltId)) continue;
  testade++;
  if (!testaEgetMonster(ex.faltId, ex.text)) {
    fail.push(`${ex.faltId}: känner INTE igen sitt eget AE1-exempel: "${ex.text}"`);
  }
}

if (fail.length > 0) {
  console.error(`verify:krav-koppling FAIL — ${fail.length} fel av ${testade} testade exempel + ${FALT_KATALOG.length} fältkontroller`);
  for (const problem of fail) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(
  `verify:krav-koppling — ${FALT_KATALOG.length - MEDVETET_UTAN_MONSTER.size}/${FALT_KATALOG.length} fält har ett registrerat mönster ` +
    `(${MEDVETET_UTAN_MONSTER.size} medvetet omönstrat: ${[...MEDVETET_UTAN_MONSTER].join(', ')}), ` +
    `${testade}/${testade} testade AE1-exempelmeningar självigenkända. PASS`
);
