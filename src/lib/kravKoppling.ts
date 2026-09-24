/**
 * kravKoppling.ts — AF1.3 (Jacobs order): kopplar en kravrads text till
 * sitt fält ur profilFalt.ts:s FALT_KATALOG.
 *
 * Krav lagras idag som Bidrag.krav: string[] (fri text, ingen struktur,
 * ingen A/B/C/D-klassificering i datamodellen — kommunTyper.ts har inget
 * Krav-objekt att lägga ett faltId på). Kopplingen byggs därför som ett
 * FRISTÅENDE, textnyckelt index (kravtext → faltId) i stället för att
 * mutera 314 bidrags YAML-filer eller bryta ut krav till en ny
 * objektform — samma "additiv, rör inte det befintliga"-princip som
 * ansokningsvag (kommunTyper.ts, AA1.4), fast här som en SEPARAT tabell
 * eftersom fältet den pekar på inte finns strukturerat att sätta.
 *
 * TVÅ LÄGEN, samma mekanik som AE1:s egen CSV redan etablerar:
 * 1. Mönstermatchning mot ett av de 68 återanvändbara fälten — en
 *    kravrad vars text uttrycker samma sak som "minst 45 minuter" ska
 *    koppla till activity_duration oavsett kommunens exakta ordval.
 * 2. Om inget mönster träffar: ett DETERMINISTISKT eget faltId,
 *    `custom:{klass}:{normaliserad text}` — exakt samma format AE1:s
 *    CSV redan använder för de 238 specialfrågorna (verifierat mot
 *    incoming/AE1_FALTLISTA_AKTIVITETSBIDRAG.csv rad 69+, t.ex.
 *    "custom:A:aktiviteten ska genomföras av föreningen..."). Detta
 *    lyckas ALLTID — "kan inte kopplas" betyder därför i praktiken
 *    "kopplas inte till ett ÅTERANVÄNDBART fält", inte "kopplas inte
 *    alls". Se analyzeKravKoppling.ts:s rapport för den distinktionen.
 *
 * ÄRLIGT OM TÄCKNINGEN: mönstren nedan är byggda och verifierade mot
 * AE1:s EGNA exempelmeningar (två per fält, se testKravKoppling.ts) —
 * de är INTE en reproduktion av GPT:s odokumenterade klassificerings-
 * metodik. Vissa fält (ålder, medlemsantal) är enligt AE1 §"Var
 * normaliseringen brister" inte enkla en-värdes-matchningar — de
 * mönster som finns här täcker BARA det vanliga fallet ("6–20 år"),
 * inte alternativa/disjunkta intervall eller funktionsnedsättnings-
 * undantag. Se AF1-rapporten till Jacob för den fulla avvägningen.
 */

import { FALT_KATALOG, type FaltKlass } from './profilFalt.ts';

// AE1:s källtexter stavar ofta ut små tal ("minst tre deltagare" inte
// "minst 3 deltagare") — utan denna normalisering missar alla numeriska
// mönster nedan hälften av sina egna AE1-exempel. "en"/"ett" är MEDVETET
// uteslutna: de är för vanliga som obestämd artikel ("en ledare per 20")
// för att ersättas blint utan att förstöra andra ords betydelse.
const TALORD: Record<string, string> = {
  två: '2', tre: '3', fyra: '4', fem: '5', sex: '6', sju: '7', åtta: '8', nio: '9', tio: '10',
};

export function normaliseraKravText(text: string): string {
  let t = text.trim().toLowerCase().replace(/\s+/g, ' ');
  for (const [ord, siffra] of Object.entries(TALORD)) {
    t = t.replace(new RegExp(`\\b${ord}\\b`, 'g'), siffra);
  }
  return t;
}

export function customFaltId(klass: FaltKlass, kravText: string): string {
  return `custom:${klass}:${normaliseraKravText(kravText)}`;
}

interface Matchare {
  faltId: string;
  // Testas mot normaliserad text. Numeriska fält returnerar det
  // utvunna talet (för AF1.4); ja/nej- och text-fält returnerar bara
  // om mönstret träffade.
  matcha: (normaliserad: string) => { traffad: boolean; varde?: number };
}

function nyckelord(faltId: string, ...ord: (string | RegExp)[]): Matchare {
  return {
    faltId,
    matcha: (t) => ({ traffad: ord.some((o) => (o instanceof RegExp ? o.test(t) : t.includes(o))) }),
  };
}

function numeriskt(faltId: string, regex: RegExp): Matchare {
  return {
    faltId,
    matcha: (t) => {
      const m = regex.exec(t);
      if (!m) return { traffad: false };
      const varde = Number(m[1]);
      return Number.isFinite(varde) ? { traffad: true, varde } : { traffad: false };
    },
  };
}

// Byggd i AE1:s egen fältordning. ETT fält saknar medvetet ett mönster
// här: activity_purpose (D1, 11 bidrag) — AE1:s två egna exempel
// ("stimulera alla barns deltagande och främja integration" /
// "främja ett aktivt liv, delaktighet och gemenskap") delar bara det
// generiska ordet "främja", för brett för ett mönster utan att ge
// falska träffar mot andra D1-syftesfält. Den faller till custom-
// fallbacken — se verify-krav-koppling.ts:s dokumenterade undantag.
// AF2-härdning: adjektiv mellan tal och substantiv ("minst 3
// bidragsberättigade deltagare") var den vanligaste felklassen i
// stickprovet på 100 — en gemensam lista, inte upprepad per fält.
const DELTAGARE_KVALIFICERARE = '(?:bidragsberättigade\\s+|stödberättigade\\s+|aktiva\\s+)?';

const MATCHARE: Matchare[] = [
  {
    // AF2: kravtexter anger ibland timmar, inte minuter ("minst en
    // timme"/"minst 2 timmar") — varde konverteras till minuter så
    // AF1.4:s tröskeljämförelse alltid jämför samma enhet.
    faltId: 'activity_duration',
    matcha: (t) => {
      const min = /(?:minst|minimum)\s+(\d+)\s*minuter/.exec(t);
      if (min) return { traffad: true, varde: Number(min[1]) };
      const tim = /(?:minst|minimum)\s+(\d+)\s*timm(?:e|ar)/.exec(t);
      if (tim) return { traffad: true, varde: Number(tim[1]) * 60 };
      if (/(?:minst|minimum)\s+en\s+timme/.test(t)) return { traffad: true, varde: 60 };
      return { traffad: false };
    },
  },
  numeriskt('minimum_participants', new RegExp(`minst\\s+(\\d+)\\s*${DELTAGARE_KVALIFICERARE}(?:deltagare|personer)`)),
  {
    // AF2: "över 65 år" är ett öppet nedre intervall (ingen övre gräns
    // i samma sats) — täcks inte av grundmönstrets "X–Y år"-krav.
    faltId: 'participant_min_age',
    matcha: (t) => {
      const spann = /(\d+)\s*[–-]\s*\d+\s*år/.exec(t); // "6–20 år" — se filhuvud: täcker inte alternativa/disjunkta intervall
      if (spann) return { traffad: true, varde: Number(spann[1]) };
      const oppen = /över\s+(\d+)\s*år/.exec(t);
      if (oppen) return { traffad: true, varde: Number(oppen[1]) };
      return { traffad: false };
    },
  },
  numeriskt('participant_max_age', /\d+\s*[–-]\s*(\d+)\s*år/),
  nyckelord('leader_led', 'ledarledd', 'ledarledda', 'ledd av en utsedd ledare', 'ledas av en utsedd ledare'),
  {
    // AF2: "ledaren ska vara/ha fyllt X år" och "en ledare (minst X år)"
    // klarar inte det ursprungliga mönstrets krav på att "ledare" och
    // talet står omedelbart intill varandra — flera alternativ, första
    // träff vinner.
    faltId: 'leader_min_age',
    matcha: (t) => {
      const monster = [
        /ledare?\s*(?:över\s*)?(\d+)\s*[–-]?\s*\d*\s*år/,
        /ledaren?\s*(?:ska\s+)?(?:vara|ha\s+fyllt)\s+(?:minst\s+)?(\d+)\s*år/,
        /ledare\w*\s*\(\s*(?:minst\s+)?(\d+)\s*år\s*\)/,
      ];
      for (const re of monster) {
        const m = re.exec(t);
        if (m) return { traffad: true, varde: Number(m[1]) };
      }
      return { traffad: false };
    },
  },
  nyckelord('activity_planned', 'planerad av föreningen', 'planeras och beslutas av föreningen', /planeras och genomför/),
  nyckelord(
    'attendance_recording',
    'närvaroregistrering',
    'föra närvarokort',
    'närvarokort ska föras',
    'närvaro ska registreras',
    'närvarokort',
    'närvarounderlag',
    /närvaro\w*[^.]{0,60}(?:registreras|förs\b|föras|dokumenteras)/
  ),
  numeriskt('maximum_participants', new RegExp(`(?:högst|max|maximalt)\\s+(\\d+)\\s*${DELTAGARE_KVALIFICERARE}deltagare`)),
  // member_count_filtered borttaget AG1 (Jacob 2026-08-27) — inte
  // återanvändbart, se profilFalt.ts:s filhuvud. Medlemsantalstext
  // upptäcks nu av medlemskrav.ts:s egen, separata detektor (boolesk,
  // ingen lagrad tröskel) i stället för att konkurrera om en plats i
  // MATCHARE.
  {
    // AF2: fyra vanliga omskrivningar av samma "en gång/aktivitet/grupp
    // per dag/dygn/förening"-regel — kärnan är substantivet + "per" +
    // tidsenheten, prefixordet ("högst"/"endast") varierar för mycket
    // för att kräva som anker.
    faltId: 'participant_frequency_limit',
    matcha: (t) => ({
      traffad: /en\s+(?:gång|aktivitet|grupp(?:aktivitet)?|sammankomst)\s+per\s+(?:dag|dygn|förening)(?:\s+och\s+\w+)?/.test(t),
    }),
  },
  nyckelord(
    'excluded_activity_forms',
    'kommersiell',
    'entrébelagda tävlingar',
    'studiecirk',
    /tävling(?!splan)/,
    /matcher[^.]{0,40}(?:serier|cuper|turneringar)/
  ),
  nyckelord('democratic_form', /demokratisk/),
  nyckelord('municipal_base', 'säte', 'huvudsaklig verksamhetskommun', /verksam i \S+ kommun/, /gynna boende i \S+ kommun/),
  {
    // AF2: AND i stället för proximitet ("ledaren...utsedd av föreningen
    // och närvarande under aktiviteten" har för långt mellanrum för ett
    // fönster-mönster) — samma teknik som file_bylaws.
    faltId: 'leader_present',
    matcha: (t) => {
      if (t.includes('ledaren ska vara närvarande') || t.includes('utsedd ledare') || t.includes('gruppledaren ska vara närvarande') || t.includes('myndig ansvarig person')) {
        return { traffad: true };
      }
      return { traffad: /ledare/.test(t) && /närvar/.test(t) };
    },
  },
  nyckelord('common_start_end', 'gemensam samling', 'gemensam start', 'ledarledd start och avslutning'),
  nyckelord('municipal_registration', 'registrerad i kommunens föreningsregister', 'godkänd som bidragsberättigad'),
  nyckelord('activity_target_group', 'rikta sig till', 'riktar sig till'),
  nyckelord('bylaws_adopted', 'antagit stadgar', 'antagna stadgar', 'antagna demokratiska stadgar', 'demokratiska stadgar'),
  nyckelord('association_account', 'bankkonto', 'plusgiro', 'bankgiro', 'föreningskonto', 'postgiro', 'konto i föreningens namn'),
  nyckelord('nonprofit_form', 'ideell', 'allmännyttig'),
  nyckelord('organisation_number', 'organisationsnummer'),
  nyckelord('file_annual_report', 'verksamhetsberättelse', 'årsberättelse'),
  nyckelord('file_audit_report', 'revisionsberättelse'),
  nyckelord('elected_board', 'vald styrelse', 'valt styrelse'),
  nyckelord('file_annual_meeting_minutes', 'årsmötesprotokoll', 'årsmöteshandlingar'),
  {
    // Hybrid: de flesta kommuner ger ett tal ("en ledare per 20"), men
    // några uttrycker samma regel kvalitativt ("ledaren får inte ansvara
    // för flera grupper samtidigt") utan tal — då registreras träffen
    // utan varde snarare än att mönstret missar kravet helt.
    faltId: 'leader_group_limit',
    matcha: (t) => {
      const m = /en ledare per (\d+)/.exec(t);
      if (m) return { traffad: true, varde: Number(m[1]) };
      // AF2: fyra observerade omskrivningar av samma booleska regel
      // ("inte ansvara för/vara ansvarig för/leda flera grupper/
      // aktiviteter", med valfritt adjektiv som "stödgrundande" mellan
      // "flera" och substantivet) plus en helt annan konstruktion
      // ("en ledare som inte samtidigt är ledare för en annan grupp").
      const bool =
        /(?:får\s+)?inte\s+(?:samtidigt\s+)?(?:vara\s+ansvarig\s+för|ansvara\s+för|leda)\s+flera\s+(?:\S+\s+)?(?:grupp|aktivitet)/.test(t) ||
        /inte\s+samtidigt\s+är\s+ledare\s+för\s+en\s+annan\s+grupp/.test(t);
      return { traffad: bool };
    },
  },
  numeriskt('leader_count_limit', /högst\s+(\d+)\s*ledare\s*per\s*gruppaktivitet/),
  nyckelord('free_activity', 'kostnadsfri', 'utan entréavgift', 'avgiftsfri', 'entrébelagd'),
  nyckelord('file_financial_report', 'ekonomisk berättelse', 'ekonomisk redovisning', 'resultat- och balansräkning', 'resultat-, balans-'),
  nyckelord('member_residence', 'bosatta i', 'bosatta i kommunen', /bosatt/, 'folkbokförd'),
  numeriskt('attendance_retention', /sparas?\s+(?:i\s+)?(?:minst\s+)?(\d+)\s*år/),
  {
    // Hybrid: de flesta kommuner anger ett belopp, men vissa kräver bara
    // att avgiften betalats utan att ange summan — då registreras
    // träffen utan varde.
    faltId: 'membership_fee',
    matcha: (t) => {
      const m = /minst\s+(\d+)\s*kr\s+i\s+(?:årlig\s+)?medlemsavgift/.exec(t);
      if (m) return { traffad: true, varde: Number(m[1]) };
      return { traffad: t.includes('medlemsavgift') };
    },
  },
  nyckelord('national_affiliation', 'riksorganisation', 'distriktsorganisation', 'rf-anslutning', /anslut/),
  numeriskt(
    'minimum_activity_count',
    new RegExp(`minst\\s+(\\d+)\\s*${DELTAGARE_KVALIFICERARE}(?:aktiviteter|aktivitetstillfällen|sammankomster|deltagartillfällen|deltagaraktiviteter)`)
  ),
  nyckelord('general_rules_attestation', 'kommunens allmänna bidragsregler', 'allmänna villkor', /allmänna[^.]{0,40}villkor/, 'regler och riktlinjer'),
  nyckelord('rf_lok_compliance', "rf:s principer", 'lokalt aktivitetsstöd', 'lok-stöd'),
  nyckelord(
    'participants_are_members',
    'deltagare ska normalt vara medlemmar',
    'deltagarna ska vara medlemmar',
    'deltagare ska vara medlemmar',
    /deltagar\w*[^.]{0,30}medlem/
  ),
  nyckelord('file_general_annual_docs', 'årshandlingar'),
  nyckelord('outside_school_hours', 'skoltid'),
  nyckelord('association_run_activity', 'föreningens regi', 'föreningens egen regi'),
  nyckelord('drug_free_activity', 'drogfri', 'drogfria'),
  nyckelord('nondiscrimination', /diskrimin/, 'kränkningar', 'kränkande', 'behandlas lika'),
  {
    // AND, inte proximitet — kravtexter radar ofta upp fem-sex dokument
    // i en enda mening ("lämna årsmöteshandlingar, ekonomiska handlingar,
    // verksamhetsplan, budget, stadgar...") där avståndet mellan "lämna"
    // och "stadgar" varierar för mycket för ett fönster-baserat mönster.
    faltId: 'file_bylaws',
    matcha: (t) => ({
      traffad: t.includes('stadgar') && (t.includes('lämna') || t.includes('bifoga') || t.includes('skicka in')),
    }),
  },
  nyckelord('elected_auditor', 'vald revisor', 'valda revisorer', 'revisor'),
  nyckelord('file_activity_plan', 'verksamhetsplan'),
  nyckelord('founded_date', 'bildandedatum', 'bildades', /verksam i (?:minst\s+)?\d+\s*(?:månader|år)/),
  nyckelord('child_convention', 'barnkonventionen', 'barnets bästa', 'barnrätt'),
  nyckelord('drug_policy', 'drogpolicy', 'alkohol- och drogpolicy', 'andts-policy', 'alkohol-, drog-'),
  nyckelord('nonpolitical_nonreligious', 'partipolitisk', 'religiös missionerande', 'religiös påverkan'),
  nyckelord('equality_policy', 'jämställdhet'),
  nyckelord('regular_activity', 'regelbundet', 'återkommande'),
  nyckelord('file_policy', 'policy', 'handlingsplan'),
  nyckelord('file_budget', 'budget'),
  nyckelord('ordered_finances', 'ordnad bokföring', 'bokförd ekonomi'),
  nyckelord('no_double_funding', 'dubbelfinansiering', 'redan finansieras', 'redan får annat kommunalt stöd', 'kan inte kombineras med', /fått[^.]{0,30}(?:bidrag|stöd)/),
  nyckelord('file_attendance', 'närvarokort', 'aktivitetsredovisning', 'aktivitetskort'),
  nyckelord('previous_support', 'tidigare beviljat', 'beviljats grundbidrag', 'beviljats startbidrag'),
  nyckelord('audit_consent', 'kommunal kontroll', 'kommunen får granska', 'den insyn', 'kunna granskas'),
  nyckelord('background_checks', /belastningsregist/, 'registerutdrag'),
  nyckelord('file_member_list', 'medlemsförteckning', 'medlemslista', 'medlemsregister'),
  nyckelord('insurance', 'försäkring', 'försäkringsskydd'),
  nyckelord('contact_details', 'kontaktperson', 'kontaktuppgifter', 'kontaktinformation'),
  // activity_open/open_membership delar vokabulär ("öppen för alla") och
  // går inte att skilja åt på textmönster ensamt — se filhuvudets not.
  // Prioriterar activity_open (D1, "aktiviteten") framför open_membership
  // (A, "föreningen") eftersom D1-frasen "aktiviteten ska vara öppen"
  // är den vanligare av de två (8 mot 2 bidrag, AE1).
  nyckelord('activity_open', 'aktiviteten ska vara öppen', 'öppen och tillgänglig', /öppen för/),
  nyckelord('open_membership', 'öppet medlemskap', 'föreningen ska vara öppen för alla'),
  nyckelord('activity_location', /bedrivas.*kommun/),
  nyckelord('association_type', 'barn- och ungdomsförening', 'pensionärs- eller funktionsrättsförening', 'funktionsrättsförening'),
  nyckelord('annual_meeting', 'hålla årsmöte'),
  // attendance_recording (D1, "förs/registreras") vs file_attendance (B,
  // "bifogas/lämnas") ovan delar samma "närvarokort"-ord — ordningen i
  // MATCHARE avgör vem som testas först (file_attendance står tidigare i
  // AE1-ordning men attendance_recording högre upp i den här listan);
  // första träff vinner, se kopplaKravtext().
];

export interface KravKopplingResultat {
  faltId: string;
  reusable: boolean; // false = custom-fallback, inget av de 68 fälten träffade
  varde?: number; // bara satt för numeriska mönsterträffar
}

/**
 * kopplaKravtext — huvudfunktionen. Testar alla mönster i ordning,
 * första träff vinner (se kommentaren ovan om overlappande vokabulär).
 * Ingen träff → deterministisk custom-koppling, ALDRIG null.
 */
export function kopplaKravtext(kravText: string, klass: FaltKlass): KravKopplingResultat {
  const normaliserad = normaliseraKravText(kravText);
  for (const matchare of MATCHARE) {
    const utfall = matchare.matcha(normaliserad);
    if (utfall.traffad) {
      return { faltId: matchare.faltId, reusable: true, varde: utfall.varde };
    }
  }
  return { faltId: customFaltId(klass, kravText), reusable: false };
}

export function faltklassForId(faltId: string): FaltKlass | null {
  return FALT_KATALOG.find((f) => f.id === faltId)?.klass ?? null;
}

/**
 * AH1 (Jacobs order, frågemotorn): en kravrad kan uttrycka FLERA fält
 * samtidigt ("organisationsnummer, konto, demokratiska stadgar, vald
 * styrelse, revisor, ordnad bokföring" styrker sex — se kommentaren vid
 * testaEgetMonster). kopplaKravtext() väljer bara det FÖRSTA för
 * custom-fallbackens skull; frågemotorn (girigOrdning.ts) behöver ALLA,
 * eftersom AE2:s egen regel är att en rad räknas besvarad först när
 * VARJE fält den uttrycker är besvarat — inte när ett av dem är det.
 */
export function allaFaltITexten(kravText: string): string[] {
  const normaliserad = normaliseraKravText(kravText);
  const traffar: string[] = [];
  for (const matchare of MATCHARE) {
    if (matchare.matcha(normaliserad).traffad) traffar.push(matchare.faltId);
  }
  return traffar;
}

/**
 * Testkrok för verify-krav-koppling.ts: kör ETT namngivet fälts EGNA
 * mönster mot en text, oberoende av kopplaKravtext():s "första träff
 * vinner"-beteende. Flera fält delar legitimt samma AE1-exempelmening
 * (t.ex. "organisationsnummer, konto, ... stadgar, vald styrelse,
 * revisor, ordnad bokföring" styrker sex olika fält samtidigt) — då
 * ska VARJE fälts EGET mönster kunna verifieras mot den meningen, inte
 * bara det fält som råkar stå tidigast i MATCHARE-listan.
 */
export function testaEgetMonster(faltId: string, text: string): boolean {
  const matchare = MATCHARE.find((m) => m.faltId === faltId);
  if (!matchare) return false;
  return matchare.matcha(normaliseraKravText(text)).traffad;
}

/** De faltId i MATCHARE som saknar ett eget mönster — bör vara tomt; verify-skriptet fäller annars. */
export function alltidRegistreradeFalt(): string[] {
  return MATCHARE.map((m) => m.faltId);
}
