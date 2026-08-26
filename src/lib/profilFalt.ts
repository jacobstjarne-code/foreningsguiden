/**
 * profilFalt.ts — AF1 (Jacobs order, profillagrets förberedelser).
 * Fältkatalogen: de 68 återanvändbara profilfälten AE1
 * (incoming/AE1_FALTLISTA_AKTIVITETSBIDRAG.md/.csv) fastställde ur 1 393
 * A-, B- och D1-kravrader i de 314 verkliga aktivitetsbidragen (316 minus
 * Bengtsfors Attraktivitetsbidrag och Värnamo Handels- och
 * attraktivitetsbidrag — AE1:s egna urvalsfel-not).
 *
 * Källan är forskningspasset, inte kod — samma "researchpass sätter,
 * kod bär" -princip som ansokningsvag (kommunTyper.ts, AA1.4). Ändra
 * INTE dessa rader utan att uppdatera AE1-dokumenten i samma commit;
 * de är samma sanning i två format.
 *
 * KLASS speglar AD1:s kravklassificering (incoming/AD1_KRAVENS_KARAKTAR.md):
 * A = profilfakta (kan fyllas i från profilen), B = bilaga/dokument,
 * D1 = villkor som gäller en aktivitetsmall (lag/grupp), inte hela
 * föreningen — se aktivitetsmall.ts.
 *
 * DATATYP avgör vilken av profilSvar.ts:s tre svarssorter fältet lagras
 * som: fil → dokument, ja/nej → intygande, allt annat (tal/text/datum)
 * → faktum. Se profilSvar.ts:s egen kommentar för resonemanget.
 */

export const FALT_DATATYPER = ['tal', 'text', 'datum', 'ja/nej', 'fil'] as const;
export type FaltDatatyp = (typeof FALT_DATATYPER)[number];

export const FALT_KLASSER = ['A', 'B', 'D1'] as const;
export type FaltKlass = (typeof FALT_KLASSER)[number];

export interface FaltDefinition {
  id: string;
  namn: string;
  datatyp: FaltDatatyp;
  klass: FaltKlass;
  // AE1:s egen mätning (hur många av de 314 aktivitetsbidragen vars
  // kravtext träffar fältet) — ett ögonblicksvärde från forskningspasset,
  // inte en levande räkning. Bevarat som spårbarhet mot källdokumentet,
  // inte tänkt att drivas om av senare kod.
  antalBidragAE1: number;
}

// Sorterad exakt som AE1_FALTLISTA_AKTIVITETSBIDRAG.md:s tabell (fallande
// antalBidragAE1) — samma ordning gör de två dokumenten lätta att
// jämföra rad för rad vid en framtida uppdatering.
export const FALT_KATALOG: FaltDefinition[] = [
  { id: 'activity_duration', namn: "Minsta aktivitetslängd, minuter", datatyp: 'tal', klass: 'D1', antalBidragAE1: 204 },
  { id: 'minimum_participants', namn: "Minsta deltagarantal per aktivitet", datatyp: 'tal', klass: 'D1', antalBidragAE1: 180 },
  { id: 'participant_min_age', namn: "Lägsta bidragsberättigade deltagarålder", datatyp: 'tal', klass: 'D1', antalBidragAE1: 161 },
  { id: 'participant_max_age', namn: "Högsta bidragsberättigade deltagarålder", datatyp: 'tal', klass: 'D1', antalBidragAE1: 151 },
  { id: 'leader_led', namn: "Aktiviteten är ledarledd", datatyp: 'ja/nej', klass: 'D1', antalBidragAE1: 143 },
  { id: 'leader_min_age', namn: "Lägsta ledarålder", datatyp: 'tal', klass: 'D1', antalBidragAE1: 107 },
  { id: 'activity_planned', namn: "Aktiviteter planeras och beslutas av föreningen", datatyp: 'ja/nej', klass: 'D1', antalBidragAE1: 102 },
  { id: 'attendance_recording', namn: "Närvaroregistrering förs", datatyp: 'ja/nej', klass: 'D1', antalBidragAE1: 75 },
  { id: 'maximum_participants', namn: "Högsta deltagarantal per aktivitet/ledare", datatyp: 'tal', klass: 'D1', antalBidragAE1: 73 },
  { id: 'member_count_filtered', namn: "Medlemsantal för relevant ålder/status", datatyp: 'tal', klass: 'A', antalBidragAE1: 64 },
  { id: 'participant_frequency_limit', namn: "Högsta räknade tillfällen per deltagare/dag/vecka", datatyp: 'tal', klass: 'D1', antalBidragAE1: 60 },
  { id: 'excluded_activity_forms', namn: "Inte kommersiell/tävling/studiecirkel/skolverksamhet", datatyp: 'ja/nej', klass: 'D1', antalBidragAE1: 57 },
  { id: 'democratic_form', namn: "Demokratiskt uppbyggd och styrd", datatyp: 'ja/nej', klass: 'A', antalBidragAE1: 56 },
  { id: 'municipal_base', namn: "Säte eller huvudsaklig verksamhetskommun", datatyp: 'text', klass: 'A', antalBidragAE1: 56 },
  { id: 'leader_present', namn: "Ledaren är utsedd och närvarande hela aktiviteten", datatyp: 'ja/nej', klass: 'D1', antalBidragAE1: 49 },
  { id: 'common_start_end', namn: "Gemensam samling/start och avslutning", datatyp: 'ja/nej', klass: 'D1', antalBidragAE1: 47 },
  { id: 'municipal_registration', namn: "Registrerad/godkänd som bidragsberättigad förening", datatyp: 'ja/nej', klass: 'A', antalBidragAE1: 46 },
  { id: 'activity_target_group', namn: "Återkommande målgrupp för aktiviteter", datatyp: 'text', klass: 'D1', antalBidragAE1: 43 },
  { id: 'bylaws_adopted', namn: "Antagna stadgar", datatyp: 'ja/nej', klass: 'A', antalBidragAE1: 38 },
  { id: 'association_account', namn: "Bank-/plusgiro eller föreningskonto", datatyp: 'text', klass: 'A', antalBidragAE1: 36 },
  { id: 'nonprofit_form', namn: "Ideell/allmännyttig förening", datatyp: 'ja/nej', klass: 'A', antalBidragAE1: 36 },
  { id: 'organisation_number', namn: "Organisationsnummer", datatyp: 'text', klass: 'A', antalBidragAE1: 36 },
  { id: 'file_annual_report', namn: "Verksamhetsberättelse/årsberättelse", datatyp: 'fil', klass: 'B', antalBidragAE1: 36 },
  { id: 'file_audit_report', namn: "Revisionsberättelse", datatyp: 'fil', klass: 'B', antalBidragAE1: 33 },
  { id: 'elected_board', namn: "Vald styrelse", datatyp: 'ja/nej', klass: 'A', antalBidragAE1: 32 },
  { id: 'file_annual_meeting_minutes', namn: "Årsmötesprotokoll/årsmöteshandlingar", datatyp: 'fil', klass: 'B', antalBidragAE1: 31 },
  { id: 'leader_group_limit', namn: "Högsta antal deltagare/grupper per ledare", datatyp: 'tal', klass: 'D1', antalBidragAE1: 30 },
  { id: 'free_activity', namn: "Aktiviteten är kostnadsfri/utan entréavgift", datatyp: 'ja/nej', klass: 'D1', antalBidragAE1: 28 },
  { id: 'file_financial_report', namn: "Resultat-, balans- och ekonomisk redovisning", datatyp: 'fil', klass: 'B', antalBidragAE1: 28 },
  { id: 'member_residence', namn: "Medlemmar bosatta i kommunen", datatyp: 'tal', klass: 'A', antalBidragAE1: 23 },
  { id: 'attendance_retention', namn: "Lagringstid för närvarounderlag", datatyp: 'tal', klass: 'D1', antalBidragAE1: 20 },
  { id: 'membership_fee', namn: "Medlemsavgift", datatyp: 'tal', klass: 'A', antalBidragAE1: 19 },
  { id: 'national_affiliation', namn: "Riks-/distriktsorganisation eller RF-anslutning", datatyp: 'text', klass: 'A', antalBidragAE1: 19 },
  { id: 'minimum_activity_count', namn: "Minsta antal aktiviteter/sammankomster per period", datatyp: 'tal', klass: 'A', antalBidragAE1: 18 },
  { id: 'general_rules_attestation', namn: "Följer kommunens allmänna bidragsregler", datatyp: 'ja/nej', klass: 'D1', antalBidragAE1: 17 },
  { id: 'rf_lok_compliance', namn: "Aktiviteterna uppfyller RF:s LOK-regler", datatyp: 'ja/nej', klass: 'D1', antalBidragAE1: 16 },
  { id: 'participants_are_members', namn: "Deltagarna är föreningsmedlemmar", datatyp: 'ja/nej', klass: 'D1', antalBidragAE1: 16 },
  { id: 'file_general_annual_docs', namn: "Övriga begärda årshandlingar", datatyp: 'fil', klass: 'B', antalBidragAE1: 16 },
  { id: 'outside_school_hours', namn: "Aktiviteten sker utanför skoltid", datatyp: 'ja/nej', klass: 'D1', antalBidragAE1: 15 },
  { id: 'association_run_activity', namn: "Aktiviteten genomförs i föreningens regi", datatyp: 'ja/nej', klass: 'D1', antalBidragAE1: 14 },
  { id: 'drug_free_activity', namn: "Barn- och ungdomsverksamheten är drogfri", datatyp: 'ja/nej', klass: 'D1', antalBidragAE1: 14 },
  { id: 'nondiscrimination', namn: "Motverkar diskriminering och kränkningar", datatyp: 'ja/nej', klass: 'A', antalBidragAE1: 14 },
  { id: 'file_bylaws', namn: "Stadgar", datatyp: 'fil', klass: 'B', antalBidragAE1: 14 },
  { id: 'elected_auditor', namn: "Vald revisor", datatyp: 'ja/nej', klass: 'A', antalBidragAE1: 12 },
  { id: 'file_activity_plan', namn: "Verksamhetsplan", datatyp: 'fil', klass: 'B', antalBidragAE1: 12 },
  { id: 'founded_date', namn: "Bildandedatum", datatyp: 'datum', klass: 'A', antalBidragAE1: 11 },
  { id: 'child_convention', namn: "Följer barnkonventionen/barnets bästa", datatyp: 'ja/nej', klass: 'A', antalBidragAE1: 11 },
  { id: 'activity_purpose', namn: "Återkommande aktivitetsinriktning/syfte", datatyp: 'text', klass: 'D1', antalBidragAE1: 11 },
  { id: 'drug_policy', namn: "Alkohol-, drog-, tobaks- och dopningspolicy", datatyp: 'ja/nej', klass: 'A', antalBidragAE1: 10 },
  { id: 'nonpolitical_nonreligious', namn: "Inte partipolitisk eller religiös verksamhet", datatyp: 'ja/nej', klass: 'D1', antalBidragAE1: 10 },
  { id: 'equality_policy', namn: "Jämställdhets-/likabehandlingsarbete", datatyp: 'ja/nej', klass: 'A', antalBidragAE1: 9 },
  { id: 'regular_activity', namn: "Verksamheten bedrivs regelbundet/återkommande", datatyp: 'ja/nej', klass: 'D1', antalBidragAE1: 9 },
  { id: 'activity_open', namn: "Aktiviteten är öppen och tillgänglig", datatyp: 'ja/nej', klass: 'D1', antalBidragAE1: 8 },
  { id: 'file_policy', namn: "Policy/handlingsplan för trygghet, alkohol och droger", datatyp: 'fil', klass: 'B', antalBidragAE1: 8 },
  { id: 'file_budget', namn: "Budget", datatyp: 'fil', klass: 'B', antalBidragAE1: 7 },
  { id: 'ordered_finances', namn: "Ordnad bokföring och ekonomi", datatyp: 'ja/nej', klass: 'A', antalBidragAE1: 7 },
  { id: 'no_double_funding', namn: "Ingen dubbelfinansiering av samma aktivitet/kostnad", datatyp: 'ja/nej', klass: 'D1', antalBidragAE1: 6 },
  { id: 'file_attendance', namn: "Närvarokort/aktivitetsredovisning", datatyp: 'fil', klass: 'B', antalBidragAE1: 6 },
  { id: 'previous_support', namn: "Tidigare beviljat LOK-/grund-/startbidrag", datatyp: 'ja/nej', klass: 'A', antalBidragAE1: 6 },
  { id: 'activity_location', namn: "Aktivitetens normala kommun/plats", datatyp: 'text', klass: 'D1', antalBidragAE1: 5 },
  { id: 'association_type', namn: "Föreningstyp/verksamhetsområde", datatyp: 'text', klass: 'A', antalBidragAE1: 5 },
  { id: 'annual_meeting', namn: "Senaste årsmötesdatum", datatyp: 'datum', klass: 'A', antalBidragAE1: 4 },
  { id: 'audit_consent', namn: "Godkänner kommunal kontroll/insyn", datatyp: 'ja/nej', klass: 'D1', antalBidragAE1: 3 },
  { id: 'background_checks', namn: "Registerutdrag för ledare med barnkontakt", datatyp: 'ja/nej', klass: 'D1', antalBidragAE1: 3 },
  { id: 'file_member_list', namn: "Medlemsförteckning/-lista", datatyp: 'fil', klass: 'B', antalBidragAE1: 2 },
  { id: 'open_membership', namn: "Öppet medlemskap", datatyp: 'ja/nej', klass: 'A', antalBidragAE1: 2 },
  { id: 'insurance', namn: "Förenings-/ansvarsförsäkring", datatyp: 'ja/nej', klass: 'A', antalBidragAE1: 1 },
  { id: 'contact_details', namn: "Kontaktperson och kontaktuppgifter", datatyp: 'text', klass: 'A', antalBidragAE1: 1 },

  // AF2-tillägg (Jacob 2026-08-26), INTE ur AE1:s ursprungliga 68 — upptäckt
  // vid härdningen av kravKoppling.ts, i ett stickprov av rader som inte
  // kopplade till något befintligt fält: "Högst tre ledare per
  // gruppaktivitet får räknas med" (Emmaboda). Motsatt riktning mot
  // leader_group_limit (deltagare/grupper PER ledare) — det här är ett tak
  // på ANTALET LEDARE som får räknas per gruppaktivitet, ett separat
  // koncept AE1:s researchpass inte fångade i sina 1393 A/B/D1-rader.
  // antalBidragAE1 här är DÄRFÖR INTE AE1-källd (ingen sådan mätning
  // finns) — talet är corpus-mätt av analyze-krav-koppling.ts mot samma
  // 309-bidrags-urval som resten av rapporten, inte jämförbart rad-för-
  // rad med övriga fälts AE1-tal. Bryter filens sorteringsinvariant
  // (fallande antalBidragAE1) medvetet — tillägget hör inte till AE1:s
  // tabell och ska inte låtsas göra det genom att sorteras in i den.
  { id: 'leader_count_limit', namn: "Högsta antal ledare per gruppaktivitet", datatyp: 'tal', klass: 'D1', antalBidragAE1: 1 },
];

const FALT_INDEX = new Map(FALT_KATALOG.map((f) => [f.id, f]));

export function hamtaFaltdefinition(faltId: string): FaltDefinition | null {
  return FALT_INDEX.get(faltId) ?? null;
}

/** D1-fälten — det aktivitetsmall.ts bygger sitt schema kring, se AF1.2. */
export function d1Falt(): FaltDefinition[] {
  return FALT_KATALOG.filter((f) => f.klass === 'D1');
}
