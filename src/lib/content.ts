/**
 * content.ts — All svensk brukstext för Föreningsguiden, på ett ställe.
 *
 * Skriven av Opus/Fable 2026-07-11. Ersätter {{FABLE:}}-platshållarna i
 * sidmallarna. Code importerar härifrån i stället för att hårdkoda text i
 * .astro-filerna — samma princip som KATEGORI_LABELS i kommuner.ts, och håller
 * copyn samlad för framtida redaktionell revidering samt återbruk i vertikal 2.
 *
 * Register (bindande, låst 2026-07-11): understatement, kassören i centrum,
 * ingen säljticka. Ingen AI-ton. Descriptor = ton (talar till människan under
 * ordmärket); funktionstext i titlar/H1 = sökbarhet. De två blandas inte.
 *
 * OBS: e-post-/GDPR-microcopy för bevakningsformuläret är AVSIKTLIGT utelämnad
 * här — den väntar på steg 3-strukturen (formulärets faktiska fält) och skrivs
 * av Fable när den ytan finns. Lägg inte platshållartext för den; be Fable.
 */

/** Ordmärkets descriptor — sitter under/bredvid loggan. Ton, inte sök. */
export const DESCRIPTOR = 'Vet vad din förening kan söka';

/** Global site-title-suffix (Base.astro sätter "{sidtitel} — Föreningsguiden"). */
export const SITE_NAMN = 'Föreningsguiden';

/**
 * Redaktionell avsändare. Namngiven avsändare krävs för E-E-A-T (SOKBARHETSSPEC
 * §3.7) och matar Organization-schemat. Beslut 2026-07-11: redaktion, inte
 * fysisk person — E-E-A-T-jobbet görs, ingen privatperson exponeras offentligt
 * för en PoC. INTE ansvarig utgivare i grundlagsmening (inget utgivningsbevis);
 * den frågan är parkerad till Regelrätten-vertikalen, se SOKBARHETSSPEC §9.
 */
export const AVSANDARE = 'Redaktionen Föreningsguiden';

/**
 * Startsidan. metaTitle/metaDescription omgjorda 2026-07-27 (Jacob):
 * ska matcha den synliga H1 (DESCRIPTOR, tjänsteform), inte motsäga den
 * med den gamla katalogramen. Återanvänder ordagrant DESCRIPTOR och
 * TRATT.start.ingress — samma text sökträffen och sidan visar, ingen ny
 * copy. h1/hero (sökfunktionsformen) ligger kvar oanvänd av startsidan
 * sen tratt-först-ombygget, kan behövas för framtida bruk.
 */
export const START = {
  metaTitle: 'Vet vad din förening kan söka — Föreningsguiden',
  metaDescription:
    'Svara på tre korta frågor, så visar vi vilka bidrag som finns i er kommun och vilka som passar er förening bäst.',
  h1: 'Kommunala föreningsbidrag, samlade på ett ställe',
  hero:
    'Varje kommun har egna bidrag, egna blanketter och egna sista datum. Föreningsguiden samlar dem kommun för kommun, så att din förening ser vad den kan söka och hinner söka i tid.',
  heroKort:
    'Kommunens bidrag, samlade på ett ställe — så att ni ser vad ni kan söka och hinner före deadline.',
  kommunvaljareRubrik: 'Välj din kommun',
  kalenderPuff:
    'Alla sista ansökningsdatum, samlade och sorterade efter vad som ligger närmast.',
};

/**
 * H1 — förstasidan svarar + säg priset först (Design runda 15–16,
 * 2026-08-12, incoming/FORSTASIDAN_SVARAR_15-16.md). Ramtext runt
 * svarsytans belopp — själva talen/kommunerna/bidragsnamnen läses ur
 * datan i index.astro, skrivs ALDRIG som strängar här (H1.2).
 *
 * I1 — handling + identitet (Design runda 17–18, 2026-08-12,
 * incoming/FORSTASIDAN_HANDLING_IDENTITET_17-18.md). identitetsrad
 * svarar KANON §3:s 10-sekunderstest ovanför H1. seAllaMall gör
 * beloppskorten till dörrar in i kommunens register ({n} = Code, antal
 * bidrag i den kommunen). bevakningsremsa ersätter den villkorade
 * remsan i Designs mock — Jacob (I1.3): "kommunval" som villkor
 * fungerar inte på förstasidan (sökfältet navigerar bort, ingen
 * kvardröjande vald-kommun-status att villkora på), så texten är
 * generell och alltid synlig, ingen andra primärknapp.
 */
export const FORSTASIDAN_SVARAR = {
  bevisMall: '{bidrag} bidrag kartlagda · {kontrollasta} belopp lästa för hand',
  olastPrefix: 'Upp till',
  olastEtikett: 'ej kontrolläst',
  identitetsrad: {
    text: 'Vi samlar alla kommunala föreningsbidrag i Sverige på ett ställe — och hjälper er förening att söka dem.',
    suffix: 'Oberoende, inte en myndighet.',
  },
  seAllaMall: 'Se alla {n} ›',
  bevakningsremsa: 'Sista dag är ofta i mars. Vi påminner er i tid — gratis, ingen inloggning.',
  prisrad: {
    gratisEtikett: 'HITTA · GRATIS',
    gratisText: 'Alla bidrag, krav, deadlines. Påminnelser.',
    betaltEtikett: 'HJÄLP ATT SÖKA · 249 KR',
    betaltText: 'Kraven i ordning, era uppgifter ifyllda.',
  },
};

/**
 * Kommunsida. Funktion i titel/H1 (Code sätter in kommunnamnet via mall).
 * introTemplate tar kommunnamn som {kommun}; Code ersätter vid render.
 */
export const KOMMUN = {
  metaTitleTemplate: 'Föreningsbidrag i {kommun} — bidrag, regler och deadlines',
  metaDescriptionTemplate:
    'Alla kommunala föreningsbidrag i {kommun}: vad din förening kan söka, vilka regler som gäller och sista ansökningsdatum. Med länk till kommunens egen sida.',
  h1Template: 'Föreningsbidrag i {kommun}',
  introTemplate:
    'Här är de kommunala föreningsbidrag vi hittat i {kommun}, grupperade efter vilken sorts förening de gäller. Varje bidrag har en länk till kommunens egen sida, och vi anger när vi senast stämde av uppgifterna.',
  ansokningssystemRubrik: 'Så ansöker du',
  ansokningssystemTemplate:
    '{kommun} tar emot ansökningar via {system}. Själva ansökan gör du hos kommunen — Föreningsguiden samlar bara informationen.',
  ingaBidrag:
    'Vi har ännu inte samlat några bidrag för den här kommunen. Kontrollera kommunens egen sida tills vidare.',

  /**
   * SVAR-FÖRST-BLOCK (SOKBARHETSSPEC §3.1) — högsta GEO-hävstången. Sitter
   * överst på kommunsidan, FÖRE bidragslistan. AI-motorer läser sidans topp
   * först; detta är det extraherbara direktsvaret. Självständigt läsbart utan
   * resten av sidan. Code fyller variablerna ur datat; INGEN säljton.
   *
   * Variabler: {kommun}, {antal} (antal bidrag), {kategorier} (t.ex. "idrott,
   * kultur och social"), {tidigaste} + {senaste} (klartext-datum, närmaste
   * respektive senaste fasta deadline), {system} (ansökningssystemets namn).
   *
   * Tre varianter beroende på datat — Code väljer:
   * - flera fasta deadlines: svarForstMedDeadlines
   * - bara löpande bidrag (inga fasta datum): svarForstLopande
   * - ett enda bidrag: svarForstEtt
   */
  svarForstMedDeadlines:
    'I {kommun} kan föreningar söka {antal} kommunala bidrag, inom {kategorier}. Sista ansökningsdatum varierar mellan {tidigaste} och {senaste} beroende på bidrag. Ansökan görs hos kommunen via {system}. Nedan finns varje bidrag med krav, belopp och länk till kommunens egen sida.',
  svarForstLopande:
    'I {kommun} kan föreningar söka {antal} kommunala bidrag, inom {kategorier}. Bidragen söks löpande under året snarare än mot ett fast sista datum. Ansökan görs hos kommunen via {system}. Nedan finns varje bidrag med krav, belopp och länk till kommunens egen sida.',
  svarForstEtt:
    'I {kommun} har vi hittat ett kommunalt föreningsbidrag: {bidragsnamn}. Ansökan görs hos kommunen via {system}. Nedan finns krav, belopp och länk till kommunens egen sida.',

  /**
   * FAQ (SOKBARHETSSPEC §3.3) — äkta frågor kassörer ställer, matar både synlig
   * Q&A-sektion OCH FAQPage-schema. KRITISKT: fråga/svar i schemat MÅSTE synas
   * på sidan (annars riktlinjebrott). Svar self-contained, 2–5 meningar, ingen
   * säljton. Code fyller variabler ur datat. Frågor där datat saknas hoppas över
   * hellre än att besvaras tomt.
   */
  faqRubrik: 'Vanliga frågor om föreningsbidrag i {kommun}',
  faq: [
    {
      fraga: 'Vilka föreningsbidrag kan man söka i {kommun}?',
      svar: 'I {kommun} kan föreningar söka {antal} kommunala bidrag: {bidragslista}. Vilka just din förening kan söka beror på verksamhet och målgrupp — kraven står vid varje bidrag ovan. Bidragen handläggs av {forvaltning}.',
    },
    {
      fraga: 'När är sista ansökningsdag för föreningsbidrag i {kommun}?',
      svar: 'Sista ansökningsdatum skiljer sig mellan bidragen. {deadlinesammanfattning} Kontrollera alltid datumet mot kommunens egen sida — en för sen ansökan kan ge minskat eller uteblivet bidrag.',
    },
    {
      fraga: 'Vart skickar man ansökan om föreningsbidrag i {kommun}?',
      svar: 'Ansökan görs hos {kommun} via {system}. Föreningsguiden samlar informationen men tar inte emot ansökningar — själva ansökan och beslutet ligger hos kommunen.',
    },
    {
      fraga: 'Hur mycket kan en förening få i bidrag i {kommun}?',
      svar: 'Beloppen varierar mellan bidrag och är inte alltid publikt angivna i förväg. Där kommunen anger ett belopp eller en beräkningsgrund står det vid respektive bidrag ovan. För exakt summa gäller kommunens besked på ansökan.',
    },
  ],
  // A6.3 (Jacob 2026-08-11) — singularvariant av faq[0].svar när kommunen
  // har exakt ETT bidrag ("1 kommunala bidrag" var grammatiskt fel).
  // "kommunalt bidrag" återanvänder ordagrant samma böjning som redan
  // finns i svarForstEtt ovan — ingen ny formulering, samma etablerade
  // singularform på två ställen i samma fil.
  faqSvarEtt: 'I {kommun} kan föreningar söka ett kommunalt bidrag: {bidragslista}. Vilka just din förening kan söka beror på verksamhet och målgrupp — kraven står vid varje bidrag ovan. Bidragen handläggs av {forvaltning}.',
};

/**
 * H4 (SPEC_ATERSTAENDE_HAL.md, Kluster 4): landningsläget för en giltig
 * men ännu OTÄCKT kommun (KOMMUNFACIT-slug utan data/kommuner/*.yaml).
 * {kommun}-platshållaren fylls i av KommunLandningsSida.astro. `brodtext`
 * är en FABLE-slot (ingen färdig förklarande copy finns, Code hittar inte
 * på den) — resten är kort, faktisk formulärtext, samma klass som
 * BEVAKNING/TACKNING ovan.
 */
export const KOMMUN_LANDNING = {
  metaTitleTemplate: 'Föreningsbidrag i {kommun} — Föreningsguiden',
  metaDescriptionTemplate: 'Vi har ännu inte samlat föreningsbidragen för {kommun}. Anmäl din e-post så hör vi av oss när kommunen är täckt.',
  h1Template: '{kommun} är inte täckt än',
  brodtext: '{{FABLE: kort förklarande stycke om varför kommunen saknas och vad Föreningsguiden gör åt det}}',
  formularRubrik: 'Meddela mig när {kommun} täcks',
  epostPlaceholder: 'namn@forening.se',
  knapp: 'Meddela mig',
  kvitto: 'Tack — vi hör av oss när vi täcker {kommun}.',
  fel: 'Något gick fel. Försök igen.',
};

/** Kategori × kommun-sida. */
export const KATEGORI_SIDA = {
  metaTitleTemplate: '{kategori} i {kommun} — föreningsbidrag',
  h1Template: '{kategori}: föreningsbidrag i {kommun}',
  introTemplate:
    'Bidrag i {kommun} som gäller {kategoriGemener}. För föreningens övriga bidrag, se sidan för {kommun}.',
};

/** Kategoribeskrivningar — en rad var, för filter och kategorisidor. */
export const KATEGORI_BESKRIVNING: Record<string, string> = {
  idrott: 'Bidrag till idrotts- och fritidsföreningar med barn- och ungdomsverksamhet.',
  kultur: 'Stöd till kulturföreningar och publika arrangemang.',
  social: 'Bidrag till föreningar som kompletterar kommunens sociala arbete.',
  pensionar: 'Stöd till pensionärs- och seniorföreningar.',
  funktionsratt: 'Bidrag till föreningar som arbetar för personer med funktionsnedsättning.',
  ovrig: 'Stöd till föreningar som inte faller inom kategorierna ovan.',
};

/** Deadlinekalendern — sajtens unika sida. */
export const KALENDER = {
  metaTitle: 'Sista ansökningsdatum för föreningsbidrag — Föreningsguiden',
  metaDescription:
    'Alla sista ansökningsdatum för kommunala föreningsbidrag, samlade och sorterade. Filtrera på kommun och kategori så att din förening inte missar en deadline.',
  h1: 'Sista ansökningsdatum',
  intro:
    'Alla sista ansökningsdatum vi samlat, sorterade med det som ligger närmast först. En missad deadline kan betyda minskat eller uteblivet bidrag — i vissa kommuner dras beloppet ned direkt vid för sen ansökan.',
  lopandeRubrik: 'Söks löpande',
  lopandeText:
    'De här bidragen har inget fast sista datum utan kan sökas löpande — men villkoren gäller ändå, så läs kommunens sida innan ni söker.',
};

/** Metod-/om-sidan. Sajtens förtroendetext. Byggs som stycken. */
export const OM = {
  metaTitle: 'Om Föreningsguiden — så samlar och verifierar vi uppgifterna',
  metaDescription:
    'Föreningsguiden samlar kommunala föreningsbidrag från kommunernas egen information. Så här verifierar vi uppgifterna, och det här gör vi inte.',
  h1: 'Om Föreningsguiden',
  stycken: [
    'Föreningsguiden samlar kommunala föreningsbidrag på ett ställe. Sverige har närmare 290 kommuner, och var och en har sina egna bidrag, sina egna regler och sina egna sista ansökningsdatum. För den som sköter en förening på fritiden är det svårt att hålla reda på, och lätt att missa pengar föreningen hade kunnat få.',
    'Varje uppgift här är hämtad från kommunens egen publicerade information och märkt med det datum vi senast stämde av den mot källan. Vi länkar alltid till kommunens sida, så att du kan läsa originalet själv. Är en uppgift äldre än ett halvår markerar vi den som möjligen inaktuell, eftersom regler och datum ändras.',
    'Vi är inte kommunen och kan inte avgöra din ansökan. Det vi gör är att hjälpa dig hitta rätt bidrag och komma ihåg när det ska sökas — ansökan lämnar du in hos kommunen. Ser du en uppgift som blivit fel, hör av dig, så rättar vi den och kontrollerar om mot källan.',
  ],
  // C2 (ÅTGÄRDSSPEC, 2026-08-03 kväll): värsta-fallet flyttat hit från
  // förstasidan (GUIDE_TRATT_COPY.ts TRATT.start.senastAvlastRad) — exakt
  // samma ordalydelse, {datum} injiceras av Code med det ÄLDSTA
  // `verifierad`-datumet över alla kommuner, samma beräkning som innan.
  senastAvlastRad: 'Vår äldsta avläsning mot en kommuns egen sida är från {datum}.',
  /**
   * Ansvar och källor — egen sektion längst ner på om-sidan. Gör E-E-A-T-jobbet
   * (namngiven avsändare) och håller ansvarsbegränsningen skarp. Rubrik + stycken.
   */
  ansvarRubrik: 'Ansvar och källor',
  ansvarStycken: [
    'Föreningsguiden ges ut av Redaktionen Föreningsguiden, som ansvarar för hur uppgifterna samlas in, struktureras och hålls aktuella.',
    'Uppgifterna återger kommunernas egen publicerade information. Vi gör inga egna bedömningar av enskilda ansökningar och lämnar inte juridisk rådgivning. Vid skillnad mellan det som står här och kommunens egen sida gäller alltid kommunens uppgift.',
    'Har du hittat ett fel, eller är du en kommun som vill rätta en uppgift? Hör av dig till redaktionen, så kontrollerar vi mot källan och rättar.',
  ],
  /**
   * H1 (GRANSKNING_foreningsguiden.md, 2026-07-26): en betaltjänst utan
   * namngiven avsändare/org.nr är inte trovärdig för målgruppen.
   * SKRIVEN 2026-07-27: partsvalet blockerar INTE — det behövs bara för att
   * ta emot riktiga pengar. Företagsnamn och org.nr läses ur konstanter så
   * bytet vid live-växling är EN ändring, inte en textredigering.
   */
  avsandarRubrik: 'Vilka vi är',
  avsandarStycken: [
    'Föreningsguiden drivs av {foretag} (org.nr {orgnr}). Redaktionen ansvarar för hur uppgifterna samlas in, struktureras och hålls aktuella.',
    'Har ni en fråga om en uppgift, ett köp eller något annat — mejla oss. Vi svarar själva, det finns ingen supportavdelning.',
  ],
};

/** Sidfot. Kort, saklig. */
export const SIDFOT = {
  kortText:
    'Föreningsguiden samlar kommunala föreningsbidrag från kommunernas egen publicerade information. Vi är inte en kommun eller myndighet.',
  kallpolicyLank: 'Så verifierar vi uppgifterna',
};

/** Inaktualitetsflaggan (StaleWarning). Tar dagar/datum via mall. */
export const STALE = {
  template:
    'Uppgifterna för den här kommunen stämdes senast av mot källan {datum} ({dagar} dagar sedan) och kan ha ändrats. Kontrollera alltid mot kommunens egen sida innan ni söker.',
};

/**
 * H27 (SPEC: Omverifiering, 2026-07-27): driftvarningen — skild från
 * STALE ovan. STALE säger "innehållet kan vara gammalt" (baserat på när
 * det senast BEKRÄFTADES). Den här säger något annat: "vår automatiska
 * bevakning har inte ens LYCKATS läsa av källan" på 60 dagar — ett
 * teknisk-drift-läge, inte ett innehålls-läge. Ny, förtroendekritisk
 * mening (inte bara en etikett) — flaggad för Fable-koll i commit-
 * meddelandet, men samma register som STALE.template ovan.
 */
export const OMVERIFIERING = {
  template:
    'Vi har inte kunnat läsa av {kommun}s källa på {dagar} dagar. Uppgifterna kan ha ändrats utan att vi märkt det — kontrollera alltid mot kommunens egen sida innan ni söker.',
};

/**
 * Täckningsvarningen (TackningsVarning, H24). Visas när kommunen inte
 * publicerar belopp för NÅGOT av sina bidrag — flyttar skulden till
 * kommunen, inte till tjänsten (SPEC_ATERSTAENDE_HAL.md, Kluster 4).
 */
export const TACKNING = {
  template:
    'Kommunen anger inte belopp för sina bidrag — ingen uppgift saknas hos oss, det gäller alla bidrag i {kommun}.',
};

/**
 * BEVAKNINGSFORMULÄR — e-post + GDPR-microcopy (UPPDRAG_POC §6, SOKBARHETSSPEC).
 * Skriven när formulärytan fanns (steg 3) och lagringen (Vercel KV) godkänts.
 * Register: tjänst, inte nyhetsbrevsfälla. Ändamålet är skarpt och avgränsat.
 * Ingen skarp insamling före dubbel opt-in är på plats.
 */
export const BEVAKNING = {
  rubrik: 'Bevaka deadlines för din kommun',
  // J3/K1 (2026-08-16): rättat "två veckor" → "fyra veckor" — cron/
  // paminnelser.ts gick från 14/3 till 28/3 (J2, MEJLTEXTER.md:s
  // "Rytm"-avsnitt). Talrättelse, ingen ny mening.
  ingress:
    'Vi mejlar fyra veckor och tre dagar innan sista ansökningsdag för de bidrag du väljer att bevaka. Inget annat.',
  epostLabel: 'Din e-postadress',
  epostPlaceholder: 'namn@forening.se',
  // C1 (ARBETSORDER 2026-08-11, Jacob): föreningsminnet utan konto — vet vi
  // vilken förening som bevakar kan framtida mejl/sidor tilltala föreningen
  // vid namn i stället för bara adressen. Frivilligt (inget required-attribut
  // i EmailSignup.astro) — ett namn på förening blockerar inte bevakningen.
  foreningsnamnLabel: 'Vilken förening bevakar ni för?',
  kommunLabel: 'Vilka kommuner vill du bevaka?',
  knapp: 'Börja bevaka',
  // Samtyckestext vid kryssruta — uttryckligt ändamål, GDPR-minimum.
  samtycke:
    'Jag vill att Föreningsguiden sparar min e-postadress för att skicka påminnelser om de deadlines jag valt. Jag kan avsluta när som helst.',

  // --- DUBBEL OPT-IN (aktiverad 2026-07-18 — Resend-utskicket byggt) -----
  // ÄRLIGHETSREGEL: gränssnittet får inte lova ett mejl som inte skickas.
  // Nu skickas det (src/lib/mejl.ts, MEJL.bekraftelse) — så detta är sant.
  kvittoRubrik: 'Kolla din inkorg',
  kvittoText:
    'Vi har skickat ett bekräftelsemejl. Klicka på länken där så börjar bevakningen. Utan bekräftelse sparar vi ingenting.',
  // Integritetsrad under formuläret, länkar till om-/metodsidan.
  integritetsrad:
    'Vi använder adressen bara till de påminnelser du valt, delar den inte, och du kan avregistrera dig när som helst via länk i varje utskick.',
  // Avregistreringsbekräftelse.
  avreg:
    'Du är nu avregistrerad och vi har raderat din adress. Du är välkommen tillbaka när du vill.',
  // 1f (SPEC_HUVUDPROCESSEN §1f, Jacob 2026-08-02): deadlineradens
  // "bevakas"-tillstånd. J3/K1 (2026-08-16): den ursprungliga kommentaren
  // här sa att mockens "4 veckor" var fel och 14/3 rätt — sedan J2 (28/3-
  // rytmen) är det TVÄRTOM, mockens "4 veckor" var rätt hela tiden.
  // Samma talrättelse som ingress ovan.
  bevakasBadge: 'Bevakas — vi mejlar fyra veckor och tre dagar innan sista ansökningsdag.',
};

/**
 * K1 (2026-08-16, incoming/BEVAKNINGEN_KOMMUNSIDAN_19.md, mock §19a/19b
 * i "Föreningsguiden huvudprocessen.dc.html"). Bevaka-ytan på kommun-
 * sidan, egen komponent (BevakaKommunen.astro), placerad efter registret
 * (Jacob 2026-08-16: "Bevakningsrutan ligger efter registret, före FAQ").
 *
 * "30, 14 och 3 dagar" i mockens egen copy är FEL sedan J2:s 28/3-rytm
 * (Jacob 2026-08-16, K1-uppdraget: "K1 mot rytmen 28/3. Bekräftelse-
 * skärmen visar två mejl, inte tre.") — rättat till "28 och 3 dagar"
 * överallt nedan, samma minimala talrättelse som ingress/bevakasBadge
 * ovan, ingen ny meningsstruktur. Övrig copy ordagrant ur mocken.
 */
export const BEVAKA_KOMMUN = {
  // F4 — remsan. Fallback (ingen kontrolläst frist hittad för kommunen)
  // återanvänder I1:s redan godkända, kommun-oberoende bevakningsremsa-
  // text (FORSTASIDAN_SVARAR.bevakningsremsa) i stället för en ny,
  // ospecificerad "vet inte"-mening.
  remsanMall: 'Sista dag i {kommun} är {datum}.',
  boxLabelMall: 'Bevaka {kommun} · gratis, inget konto',
  bodyMall: 'Vi mejlar er 28 och 3 dagar innan varje sista dag i {kommun}.',
  scopeAllaMall: 'Alla {n} bidrag i {kommun}',
  scopeForvalEtikett: 'förval',
  scopeValjLank: 'Välj enskilda bidrag i stället ›',
  knapp: 'Bevaka →',
  footer: 'Ingen inloggning, inget konto. Avsluta när ni vill — en länk finns i varje mejl.',
  felText: 'Något gick fel. Försök igen.',

  // F3 — bekräftelsen, egen vy (inte en toast).
  confirmHeadlineMall: 'Klart. Ni bevakar {kommun}.',
  confirmBodyMall: 'Vi mejlar {epost} — 28 och 3 dagar innan varje sista dag i {kommun}. Ni behöver inte göra något mer.',
  nastaPaminnelseLabel: 'Nästa påminnelse gäller',
  omfattningMall: 'Ni bevakar alla {n} bidrag i {kommun}. Vi lägger till fler i takt med att vi läser in kommunens sidor — bevakningen växer med dem, utan att ni gör något.',
  ingetKontoText: 'Inget konto skapades — vi lagrar bara er mejladress. Vill ni ändra eller sluta? Varje mejl har en länk längst ned.',
  seAllaBidragMall: 'Se alla {n} bidrag i {kommun}',
};

/**
 * llms.txt-INNEHÅLL (SOKBARHETSSPEC §5.2) — B2A-yta, curerad karta över sajtens
 * bästa innehåll för AI-agenter. Code renderar detta som /llms.txt (plain text,
 * markdown-liknande enligt konventionen). Blockbeskrivning + länklista; Code
 * fyller den faktiska länklistan ur kommunindex + fasta sidor.
 */
export const LLMS_TXT = {
  rubrik: '# Föreningsguiden',
  sammanfattning:
    '> Föreningsguiden samlar Sveriges kommunala föreningsbidrag — regler, belopp, krav och sista ansökningsdatum — organiserat per kommun och föreningstyp. Varje uppgift återger kommunens egen publicerade information, med källänk och datum för när den senast stämdes av. Använd sidorna för att besvara frågor om vilka bidrag en förening kan söka i en viss kommun, vilka krav och belopp som gäller, och när ansökan ska lämnas. Föreningsguiden avgör inte ansökningar och är inte en myndighet; själva ansökan görs hos kommunen.',
  // Sektionsrubriker för länklistan; Code fyller länkarna.
  sektionKommuner: '## Kommuner',
  sektionResurser: '## Om och metod',
};

/**
 * VÄGLEDNINGSTEXT — de fem stationerna i progressionen (FORUTSATTNINGAR.md
 * §4, design-leverans 3). Mallvariabler i {}; Code fyller ur datat.
 * Register: understatement, kassören i centrum, ingen säljton.
 */
export const VAGLEDNING = {
  // Station 1 — Vad gäller er?
  station1: {
    rubrik: 'Vad gäller er?',
    intro: 'Vilken sorts förening ni är avgör vilka bidrag som är möjliga. Välj här, så visar vi bara det som gäller er.',
    // R7.1 (Jacob 2026-08-08): "Sparat" var osant — applyFilter() håller
    // valet i klientminne, sidan glömmer vid omladdning (R7.0 blockerar
    // att station 1 skriver till profilen, så det stämmer fortfarande
    // inte). Minsta sanna version tills dess. Blir R7.0 löst byts raden
    // mot Designs "Sparat i den här webbläsaren."
    sparatText: 'Visar {typ}',
  },

  // Station 2 — Vad är brådskande?
  station2: {
    rubrik: 'Vad är brådskande?',
    introMedDeadline: 'Närmast i tiden: {bidragsnamn}, sista ansökningsdag {datum}. {dagarKvar} dagar kvar.',
    introUtanDeadline: 'Inget av bidragen som gäller er har ett fast sista datum just nu — de söks löpande. Villkoren gäller ändå.',
    sentText: 'En för sen ansökan kostar pengar: {sen_ansokan_text}',
  },

  // Station 3 — Vad måste göras först? (varning → erbjudande)
  station3: {
    // R5.5 (OMFORDELA_TEXTMASSAN.md runda 5, 2026-08-05): "— och det är
    // det vi hjälper er med" borttaget — samma överclaim-mönster som
    // P1.2/P1.6, och stationens drag pekar nu ut ur sajten (kommunens
    // egen källa), inte mot en tjänst vi levererar. Kort och sant kvar.
    rubrik: 'Det här stoppar de flesta',
    intro: 'Innan ni kan söka något bidrag i {kommun} måste föreningen vara godkänd som bidragsberättigad. Det är ett eget ärende med egen handläggningstid, och det är den vanligaste anledningen att en ansökan inte går igenom. Är det ordnat är ni förbi det som fäller flest.',
    ledtidOkand: '{kommun} anger inte hur lång tid godkännandet tar, men hinner det inte handläggas före bidragets sista datum blir ansökan inte behandlad. Vänta inte med det här.',
    ledtidKand: 'Räkna med {ledtid} dagars handläggning — så börja här, inte med själva ansökan.',
    giltighetVarning: 'Och en fälla som kostar föreningar pengar varje år: godkännandet gäller inte för alltid. {giltighet}. Fick ni bidrag förra året betyder det inte att ni är godkända i år — statusen kan ha gått ut utan besked.',
    extraSteg: 'Ett steg till som är lätt att missa: {beskrivning}',
    inget: 'Vi har inte hittat några särskilda förkrav för {kommun}. Kontrollera ändå hos kommunen innan ni söker.',
    // 1d (SPEC_HUVUDPROCESSEN §1d, Jacob 2026-08-02) — checklistaLabel
    // ("DETTA SKA NI HA") visas bara när delaUppKravPunkter (kommunTyper.ts)
    // faktiskt kunde dela upp beskrivningen i ≥2 punkter; annars renderas
    // beskrivningen som prosa precis som i dag, ingen ny etikett syns.
    checklistaLabel: 'Detta ska ni ha',
    bilagorLabel: 'Vad kommunen vill se bifogat',
    // R5.5: stationens drag som vägledning, inte köp — registrerings-
    // checklistan (produkt) kan strykas (beslut A, ej fattat). Länkar till
    // kommunens EGEN källa (kommun.kalla_url), inte /registrera/. Byts
    // tillbaka till en produktlänk den dag beslut A landar — bara
    // destinationen, inte formen (Jacobs egen instruktion, ordagrant).
    attentionKnappMall: 'Så blir ni godkända i {kommun}',
  },

  // Station 4 — Vad kan ni söka nu?
  station4: {
    rubrik: 'Vad kan ni söka nu?',
    intro: '{antal} bidrag i {kommun} passar en {typ}. De ligger ordnade efter vad som är mest angeläget att göra något åt.',
    doldaText: '{antalDolda} bidrag gäller andra sorters föreningar och är dolda.',
    visaAndaLank: 'Visa ändå',
  },

  // Station 5 — Vad ska ni skriva?
  // Copy bytt 2026-08-03 (arbetsorder 2, punkt 6, Jacob) — "utkast" byts
  // mot "underlag" på hela ytan (se även den hårdkodade CTA-texten i
  // KommunProgression.astro).
  station5: {
    rubrik: 'Vad ska ni skriva?',
    intro: 'Ansökan bedöms mot kommunens egna kriterier. Vi samlar dem på ett ställe, i den ordning kommunen vill ha dem, med det ni redan fyllt i här ifyllt.',
    faltStatus: '{ifyllda} av {totalt} fält är redan ifyllda',
    knapp: 'Skapa ansökan',
    // M3 (Jacob 2026-08-17, auditens P0.7): "underlag" bytt mot
    // "ansökningschecklista" — se KONVERTERINGSSTAPEL ovan för samma byte.
    ansvar: 'Vi ställer i ordning ansökningschecklistan. Ansökan lämnar ni in själva, och beslutet fattar kommunen.',
  },
};

/**
 * MEJLMALLAR — utskicksmotorn (SPRINT_COPY.ts, Fable 2026-07-13/18).
 * Avsändarnamn "Föreningsguiden", ingen no-reply. Varje mejl slutar med
 * MEJL.sidfot (avregistreringsrad, obligatorisk). Sändning/mallfyllning:
 * src/lib/mejl.ts.
 */
export const MEJL = {
  sidfot:
    'Du får det här mejlet för att den här adressen bevakar bidrag på Föreningsguiden. Vill du sluta bevaka? Avregistrera dig direkt: {avregLank} — då raderar vi adressen.',

  bekraftelse: {
    amne: 'Bekräfta er bevakning hos Föreningsguiden',
    body: [
      'Hej,',
      'Någon — förhoppningsvis du — har anmält den här adressen för att bevaka bidragsdeadlines i {kommunLista} hos Föreningsguiden.',
      'Klicka på länken för att bekräfta, så börjar bevakningen: {bekraftaLank}',
      'Var det inte du? Då kan du bortse från det här mejlet — utan bekräftelse sparar vi ingenting.',
    ],
  },

  // J1 (2026-08-16, Opus 12 augusti, incoming/MEJLTEXTER.md #1
  // "Bekräftelse — när hon anmäler bevakning"). Filens egen rubrik
  // döljer att texten INTE ber om ett klick — "Bevakningen är igång"
  // konstateras som redan sant, {lank} är bara en genväg. Det matchar
  // funktionellt VALKOMST-slotet (skickas EFTER klicket på
  // MEJL.bekraftelse, api/bekrafta/[token].ts), inte bekraftelse-slotet
  // (som ber om klicket och vars text MEJLTEXTER.md inte adresserar).
  // MEJL.bekraftelse lämnad orörd. {kommun}/{lank} — mejl.ts:s
  // sendValkomst mappar in sina befintliga kommunLista/kommunLank-värden
  // under de här namnen (samma innehåll, bara variabelnamnet ändrat för
  // att matcha källtexten ordagrant).
  valkomst: {
    amne: 'Bevakningen är igång — {kommun}',
    body: [
      'Ni bevakar nu föreningsbidragen i {kommun}. Vi hör av oss fyra veckor före varje sista ansökningsdag, och när kommunen ändrar datum, belopp eller villkor.',
      'Ingen inloggning, inget konto. Vill ni sluta räcker det med länken längst ned i varje mejl.',
      'Se vad {kommun} har: {lank}',
    ],
  },

  // SPEC_ABONNEMANG.md §4 (Jacob, 2026-07-27): abonnemangets fyraveckors-
  // påminnelse, per MATCHAT bidrag (inte per kommun som paminnelse14).
  // {{FABLE:}}-platshållaren ersatt J1 (MEJLTEXTER.md #2, ordagrant).
  // {bidragLank} — samma variabelnamn som paminnelse14/paminnelse3
  // (PaminnelseVars, mejl.ts), källtextens {lank} döpt om vid inplacering.
  paminnelse28: {
    amne: '{bidragsnamn} i {kommun} — fyra veckor kvar',
    body: [
      'Sista ansökningsdag för {bidragsnamn} i {kommun} är {datum}. Det är fyra veckor bort.',
      'Har ni sökt bidraget förut brukar det gå fort. Är det första gången behöver föreningen vara godkänd som bidragsberättigad i kommunen innan ansökan kan behandlas, och det tar tid att ordna. Kontrollera det nu, inte i sista veckan.',
      'Se vad kommunen kräver: {bidragLank}',
      'Ändrar kommunen datum, belopp eller villkor hör vi av oss.',
    ],
  },

  // J2 (2026-08-16, MEJLTEXTER.md #6 "Sista påminnelsen — tre dagar
  // före"). Ersätter de superseterade paminnelse14 (14-dagarsledet
  // utgår helt, se "Rytm"-avsnittet i källfilen: "Två mejl per frist:
  // 28 dagar och 3 dagar... Inte 30/14/3") och paminnelse3 (samma
  // 3-dagarsplats, ny, kortare text — "till alla som fått mejl 2 för
  // samma bidrag"). Delad mellan gratis bevakning (cron/paminnelser.ts)
  // och abonnemanget (cron/abonnemangsbevakning.ts) — samma rytm för
  // båda populationerna nu. {bidragLank} — samma variabelnamn som
  // paminnelse28, källtextens {lank} döpt om vid inplacering.
  paminnelseSista: {
    amne: '{bidragsnamn} i {kommun} — sista dagen är {datum}',
    body: [
      'På {datum} stänger ansökan för {bidragsnamn} i {kommun}. Det är om tre dagar.',
      'Har ni redan skickat in behöver ni inte göra något.',
      'Se vad kommunen kräver: {bidragLank}',
    ],
  },

  // J1 (2026-08-16, MEJLTEXTER.md #3 "Ändringsbeskedet"). TEXT-UTAN-YTA:
  // ingen cron/sändare anropar sendAndringsbesked (mejl.ts) än — den
  // bevakning-scopade ändringsdetekteringen (jämföra ett kommun-bidrags
  // datum/belopp/villkor mot ett tidigare avläst tillstånd, PER
  // BEVAKNINGSPRENUMERANT) finns inte byggd. Förväxla inte med H22:s
  // sendAndringsNotis nedan — den är en ANNAN population (köpare av
  // registreringsutkast, jämför mot deras låsta snapshot), inte gratis
  // bevakningsprenumeranter. Rapporterat till Jacob i J1-leveransen,
  // döda inte den här texten.
  andringsbesked: {
    amne: '{kommun} har ändrat {bidragsnamn}',
    body: [
      'Vi läste {kommun}s sida i dag och något har ändrats sedan sist.',
      '{vad_som_andrats}',
      'Läs hos kommunen: {kalla_url}',
      'Vi kontrollerar era bevakade bidrag löpande. Det här är det enda vi hittade.',
    ],
  },

  // J1 (2026-08-16, MEJLTEXTER.md #4 "Januarimejlet — giltighet, nivå
  // två"). Ersätter den gamla, aldrig skarpt körda MEJL.giltighetsvarning
  // (275-dagarsantagandet, se historik i mejl.ts/cron/giltighetsvarning.ts
  // — 0 riktiga mejl någonsin skickade av den, superseterad här, inget
  // innehåll att migrera). Går ut i januari till prenumeranter vars
  // kommun saknar giltighet_regel (cron/giltighetsvarning.ts NIVÅ 2) —
  // nu LIVE (Jacob 2026-08-16: dry-run-läget krävde bara att texten
  // fanns, se cron-filens historik).
  giltighetsvarningNiva2: {
    amne: 'Är er förening fortfarande godkänd i {kommun}?',
    body: [
      'I många kommuner måste en förening förnya sitt godkännande som bidragsberättigad, ofta efter årsmötet. Vi vet inte vad som gäller i {kommun} — kommunen publicerar ingen regel vi kunnat läsa.',
      'Kontrollera hos kommunen innan ansökningarna öppnar: {kalla_url}',
      'Vi hör av oss i januari varje år tills ni säger till att sluta.',
    ],
  },

  // J1+J2 (2026-08-16, MEJLTEXTER.md #5 "Giltighet, nivå ett"). Texten
  // är klar. {regeltext}-källan som J1 saknade finns nu (MEJLTEXTER.md
  // "Regeltext"-tabellen, J2) — regeltext() i kommunTyper.ts, en fras
  // per giltighet_regel.typ/antal, verbatim ur tabellen. G1 (2026-08-17)
  // populerade datafältet och kopplade cron/giltighetsvarning.ts:s NIVÅ
  // 1 till verklig avsändning för regler som ger ett säkert datum.
  giltighetsvarningNiva1: {
    amne: 'Ert godkännande i {kommun} går ut {manad}',
    body: [
      'Ni angav att föreningens senaste årsmöte var {arsmotesdatum}. I {kommun} gäller godkännandet som bidragsberättigad förening {regeltext}, vilket betyder att ert löper ut {forfallodatum}.',
      'Förnya innan dess, annars kan ansökningar avvisas utan prövning.',
      'Så gör ni i {kommun}: {kalla_url}',
    ],
  },

  /**
   * H10 (SPEC: Kluster 1 — efter-köp-ytan, Opus/Fable 2026-07-28): det
   * bokföringsbara kvittot. Skickas SEPARAT från leveransmejlet
   * (sendKopBekraftelse, som bär checklistan) — det här mejlet är rent
   * kvittot, med Stripes invoice_pdf som bilaga (mejl.ts sendKvitto).
   */
  kvitto: {
    amne: 'Kvitto — Föreningsguiden',
    body: [
      'Tack för ert köp. Kvittot ligger som bilaga (PDF) och går att spara i föreningens bokföring.',
      'Vad ni köpt: {produkt}\nBelopp: {belopp} kr inklusive moms\nDatum: {datum}',
      'Behöver ni kvittot igen finns det alltid under Mina sidor.',
    ],
  },

  /**
   * H19 (SPEC: Kluster 1, samma dokument): utfallsslingan. Skickas 14
   * dagar efter en bevakad deadline för ett matchat bidrag hos en köpare
   * av registreringsutkastet (cron/utfallsfraga.ts). Tre svarslänkar —
   * ren text i ett textmejl, inte riktiga knappar.
   */
  utfallsfraga: {
    amne: 'Hur gick det med {bidrag}?',
    body: [
      'Sista ansökningsdag för {bidrag} i {kommun} var {datum}. Vi är nyfikna på hur det gick — svaret hjälper oss göra utkasten bättre, och vi visar aldrig enskilda föreningars utfall.',
      'Vi fick bidraget: {svarBeviljatLank}\nVi fick avslag: {svarAvslagLank}\nVet inte än: {svarVetInteLank}',
      'Fick ni avslag och vill veta om beslutet går att ompröva, svara på det här mejlet.',
    ],
  },

  /**
   * H18 (SPEC: Det som återstår, 2026-07-28): inlämningspåminnelse. Går
   * bara till köpare av registreringsutkastet (kop.ts, samma population
   * som utfallsfraga) vars sparade profil matchar bidraget — fyra dagar
   * före deadline, den sista rimliga marginalen innan en ansökan blir
   * försent inlämnad (paminnelse3-registret). Frågan "har ni lämnat in
   * än" speglar utfallsfrågans två-svarslänkar-i-textmejl-mönster
   * (cron/inlamningspaminnelse.ts, api/inlamnad/[session]/[bidrag]/[svar]).
   */
  paminnelseInlamning: {
    amne: 'Er ansökan till {bidrag} är inte inlämnad — sista dag om fyra dagar',
    body: [
      'Den {datum} stänger ansökan för {bidrag} i {kommun}. Vi har inte hört från er, så vi vet inte om ansökan redan är inlämnad.',
      'Underlagen och länken till kommunens ansökan finns här: {bidragLank}',
      'Är ansökan inlämnad? Ja: {svarJaLank}\nNej, inte än: {svarNejLank}',
    ],
  },
};

/**
 * Säljaruppgifter för kvitton (H10). Humle och Dumle AB / 556000-0000 är
 * ett SANDBOX-testvärde (Jacob, 2026-07-28) — partsvalet självt är
 * fortfarande inte gjort (SPEC: Betalintegration §6 steg 3), men det
 * blockerar inte testkvitton. Byts till den riktiga juridiska partens
 * uppgifter vid live-växling. checkout/registrering.ts:s live-lägesspärr
 * ligger kvar oförändrad — den skyddar mot att fältet av misstag töms
 * (eller lämnas som ett nytt TODO) utan att någon märker det innan
 * Stripe-nyckeln växlas till skarp.
 */
export const SALJARE = {
  foretag: 'Humle och Dumle AB',
  orgnr: '556000-0000',
};

// A1 (SPEC: Kvarvarande luckor, 2026-07-29): checkout/registrering.ts:s
// TODO-spärr skyddar bara mot ett TOMT SALJARE — den kan inte skilja
// sandbox-testvärdet ovan från en riktig juridisk part, och behöver
// inte kunna det (fakturor testas redan säkert i sandboxläge). Men
// /integritet/ NAMNGER en personuppgiftsansvarig i ett dokument
// besökare läser skarpt idag — där räcker inte samma spärr. Sätt
// SALJARE_VALD = true i SAMMA commit som SALJARE bytes till den
// riktiga parten, aldrig innan.
export const SALJARE_VALD = false;

/**
 * INTEGRITETSPOLICY (H23) och ÅTERBETALNING (H13) — Fable 2026-07-27.
 * Faktagrund: DATAINVENTERING_GDPR.md (repo-rot). Skriven för att läsas av
 * en föreningskassör, inte av en jurist — men korrekt ändå.
 * Två beslut som fattades när texten skrevs, båda flaggade i inventeringen:
 * (1) Köpposter bevaras sju år enligt bokföringslagen även vid raderingsbegäran
 *     — GDPR art. 17.3(b) undantar rättslig förpliktelse. E-postadressen är del
 *     av underlaget och kan därför inte plockas ur.
 * (2) /avregistrera/ ska även rensa vantelista:-poster. BYGGT 2026-07-28
 *     (SPEC: Det som återstår, grupp A — removeSubscriber() anropar nu
 *     removeVantelista()) — texten och koden håller ihop.
 * {foretag}/{orgnr} fylls ur SALJARE ovan, samma konstanter som kvittot —
 * fortfarande sandbox-testvärdet tills den riktiga juridiska parten är vald.
 */
export const INTEGRITET = {
  ingress:
    'Vi samlar in så lite som möjligt, och bara det som behövs för att tjänsten ska fungera. Här står exakt vad det är.',

  ansvarigRubrik: 'Vem som ansvarar',
  ansvarigText:
    'Föreningsguiden drivs av {foretag} (org.nr {orgnr}), som är personuppgiftsansvarig för uppgifterna nedan.',

  vadRubrik: 'Vad vi sparar',
  vadStycken: [
    'Bevakar ni deadlines sparar vi er e-postadress och vilka kommuner ni bevakar. Inget mer.',
    'Fyller ni i matchningsfrågorna sparas svaren i er egen webbläsare. De når oss först om ni lämnar en e-postadress — och då i grova intervall: verksamhetsområde, ungefärlig storlek, ungefär hur länge föreningen funnits. Vi sparar inte föreningens namn, organisationsnummer eller kontouppgifter. Vi frågar inte ens efter dem.',
    'Köper ni något sparas vad ni köpt, belopp, datum och e-postadress. Kortuppgifter ser vi aldrig — de hanteras av Stripe och passerar aldrig våra system.',
  ],

  varforRubrik: 'Varför',
  varforText:
    'Bevakningen kräver e-postadressen för att kunna skicka påminnelsen — det är hela tjänsten. Köpuppgifterna behövs för att leverera det ni betalat för och för vår bokföring. Föreningsprofilen används för att visa vilka bidrag som passar just er.',

  hurLangeRubrik: 'Hur länge',
  hurLangeStycken: [
    'Bevakningsuppgifter sparas tills ni avregistrerar er. Då raderas de helt — ingen kopia, ingen papperskorg.',
    'Köpuppgifter måste vi spara i sju år. Bokföringslagen kräver det, och den går före en raderingsbegäran. Det betyder att kvitto, belopp, datum och den e-postadress köpet gjordes med finns kvar även om ni avregistrerar er från allt annat.',
    'En obekräftad bekräftelselänk raderas av sig själv efter sju dagar.',
  ],

  delasRubrik: 'Vem mer som ser uppgifterna',
  delasText:
    'Fyra leverantörer, alla för att tjänsten ska fungera: Stripe (betalning), Resend (utskick av mejl), Upstash (databasen) och Vercel (driften). Ingen av dem använder uppgifterna till något eget. Vi säljer inte uppgifter vidare och gör inga utskick åt andra.',

  cookiesRubrik: 'Kakor',
  // MÄTNING (Jacob 2026-08-11): namngav tidigare inte VERKTYGET, bara
  // metoden — "en tjänst som säljer sig på att inte påstå mer än den vet
  // ska inte ha ett oomnämnt analysverktyg på sidan". Umami tillagt,
  // samma "leverantör (syfte)"-mönster som delasText redan använder för
  // Stripe/Resend/Upstash/Vercel — ingen ny prosa, en namngivning.
  cookiesText:
    'Vi använder inga kakor för spårning och har ingen kakruta att klicka bort. Besöksstatistiken mäts cookiefritt (Umami) och visar bara aggregerade siffror — aldrig vem som besökt vad.',

  rattigheterRubrik: 'Era rättigheter',
  rattigheterStycken: [
    'Ni har rätt att få veta vad vi sparat om er, få det rättat om det är fel, och få det raderat — med undantag för köpuppgifterna som bokföringslagen kräver att vi behåller.',
    'Mejla oss så ordnar vi det. Ni behöver inte motivera varför.',
    'Tycker ni att vi hanterat era uppgifter fel kan ni klaga hos Integritetsskyddsmyndigheten (imy.se).',
  ],
};

/**
 * H13 — återbetalningsgarantin. Starkast där betalbeslutet fattas
 * (Jacob, 2026-07-30): renderas på /kommun/[slug]/registrera/ intill
 * priset, inte bara begravd på integritetspolicyn.
 */
export const ATERBETALNING = {
  rubrik: 'Återbetalning',
  stycken: [
    'Blev det ni köpte inte användbart för er — mejla oss inom 30 dagar så betalar vi tillbaka. Ni behöver inte förklara varför, och vi frågar inte efter ett kvitto på att ni försökt.',
    'En förening som köper av oss räknas formellt som näringsidkare och har därför inte ångerrätt enligt lag. Garantin ovan är alltså vår egen, inte ett lagkrav — men den gäller lika för det.',
    'Vi kan inte lova att en ansökan beviljas. Det beslutet fattar kommunen, och ett avslag är inte ett skäl till återbetalning i sig — däremot vill vi gärna veta om det händer.',
  ],
};

/**
 * PRIS — D2 (SPRINT: Produkten, Opus/Fable 2026-07-31): "249 kr för
 * registrering, 249 kr för utkast, 495 kr för abonnemang — de möts aldrig
 * på samma yta." Ny sida (/pris/) där alla tre visas tillsammans.
 *
 * beskrivRegistrering/beskrivUtkast är INTE nyskriven text — de är
 * KOPRUTA.leverans (redan Fable-skriven, kommun-oberoende, samma mening
 * gäller ordagrant båda produkterna). beskrivAbonnemang är {{FABLE:}}:
 * abonnemangsprodukten (checkout/abonnemang.ts, PRIS_ABONNEMANG_ORE) har
 * INGEN köpyta eller beskrivande text NÅGONSTANS i kodbasen idag — bara
 * backend (checkout-API + cron/abonnemangsbevakning.ts). Kunde inte hitta
 * något att återanvända, och Code skriver ingen egen produktbeskrivning.
 * Se rapporten till Jacob.
 */
export const PRIS = {
  metaTitle: 'Priser — Föreningsguiden',
  // J3 (2026-08-16, Jacob: "metaDescription på /pris/ enligt ovan" — dvs.
  // rätta till mot J2:s tre→två-produktflaggning). Ingen ny prosa —
  // PRIS.hjalp.namn/PRIS.abonnemang.namn (redan Opus-godkända ordval,
  // PRISTEXTER.md) omkombinerade, samma "Vad det kostar att X"-mall som
  // förut.
  metaDescription: 'Vad det kostar att få hjälp med en ansökan eller ett föreningsabonnemang hos Föreningsguiden.',
  h1: 'Priser',
  // J2 (2026-08-16, PRISTEXTER.md "Sidans ingress").
  intro: 'Att hitta bidragen, se vad kommunen kräver och få påminnelse före sista dag är gratis. Vi tar betalt för arbetet.',
  // J2: "Två produkter, inte tre: registreringschecklistan och
  // bidragsutkastet är samma sak — att bli godkänd som bidragsberättigad
  // förening ÄR en ansökan till kommunen." Ersätter de tidigare separata
  // PRIS.registrering/PRIS.utkast (två {{FABLE:}}-kort för samma produkt)
  // med EN post. `variant` är samma produkt riktad mot registreringen i
  // stället för ett enskilt bidrag — ingen anropare än (ingen yta
  // skiljer i dag på "sök ett bidrag" och "bli godkänd" som separata
  // köpvägar på /pris/), sparad här ordagrant för när en sådan yta finns.
  // M2.4 (Jacob 2026-08-17): "Produkten heter ansökningschecklista, inte
  // hjälp med ansökan." — namnet lovade en insats ("hjälp") produkten
  // inte alltid håller (96% av bidragen har inga ifyllda fält, se
  // checkout/bidragsutkast.ts SPÄRR). Checklistan i rätt ordning med
  // bilagor och arbetsordning är värt priset i sig — men bara om den
  // säljs som det den är, inte som personlig assistans.
  hjalp: {
    namn: 'Personlig ansökningschecklista',
    beskrivning: [
      'Kommunens krav för det bidrag ni valt, i rätt ordning, med sista ansökningsdag, belopp och bilagorna listade. De uppgifter vi kan fylla i utifrån era svar är ifyllda — resten står tydligt märkta som sådant ni fyller i själva.',
      'Ni får dokumentet som Word och PDF direkt efter betalning. Det ligger kvar hos er så länge ni vill ha det.',
      'Ansökan lämnar ni in själva och beslutet fattar kommunen. Vi lovar inte bifall.',
    ],
    variant: {
      namn: 'Personlig registreringschecklista',
      beskrivning: [
        'Kommunens krav för att bli bidragsberättigad förening, i rätt ordning, med blanketter och handläggningstid. Det formella steget som fäller flest ansökningar, och som måste vara klart innan ni kan söka något alls.',
      ],
    },
  },
  // J2: bakom ABONNEMANG_LEVERANS_LIVE (priser.ts) — "Renderas inte
  // förrän leveransen finns. Villkoret är att påminnelserna går ut
  // skarpt och att föreningsprofilen överlever en webbläsarrensning."
  // Påminnelserna (paminnelse28/paminnelseSista) skickas skarpt sedan
  // J1/J2 — profil-överlevnadsvillkoret är INTE verifierat i den här
  // leveransen, flaggan står kvar false tills båda är bekräftade.
  abonnemang: {
    namn: 'Föreningsabonnemang',
    perAr: '/ år',
    beskrivning: [
      'Ansökningarna ingår, hur många ni än gör under året. Två söka bidrag och ni har tjänat på det.',
      'Föreningsprofilen sparas mellan år och mellan enheter, så nästa kassör slipper börja om.',
      'Besked när kommunen ändrar datum, belopp eller villkor.',
    ],
  },
  cta: 'Hitta er kommun',
};

/**
 * 1e — köpytan (SPEC_HUVUDPROCESSEN §1e, MOCKAR_huvudprocessen.md,
 * Opus/Fable 2026-08-01). "Sex hål på en yta, och den enda där pengar
 * byter händer." Verbatim ur mocken — {kommun}/{antal} fylls av
 * anroparen (samma mönster som KOPRUTA).
 */
export const KOPYTAN_1E = {
  eyebrow: 'REGISTRERINGSANSÖKAN · {kommun}',
  rubrik: 'Det här får ni',
  // Sista punkten är G23 — löftet som tar bort oron för en tappad flik.
  // Punkt 1 omformulerad 2026-08-02 (Jacob): mockens exempel ("Gislaveds
  // fem krav") räknar 1d:s framtida bockningsbara punkter, som ännu inte
  // finns (1d blockerad, se golden-set-fyndet i förra sprinten) — rätt
  // att inte hitta på ett tal. Generisk "kommunens krav" i stället för
  // {kommun}s, ingen substitution behövs längre för den här raden.
  vadHonFar: [
    'Ett ifyllt ansökningsunderlag mot kommunens krav, som Word-fil och PDF.',
    'Ett kopieringsfält per avsnitt för kommunens e-tjänst.',
    'Bilagelistan med vad som ska med, och var det ska laddas upp.',
    'Mejl med varaktig länk. Dokumentet ligger kvar i föreningens profil.',
  ],
  prisspecRad: 'Registreringsansökan',
  momsRad: 'Moms 25 %',
  attBetalaRad: 'Att betala',
  kvittoRad: 'Kvitto med org.nr och momsspecifikation mejlas direkt — bokföringsbart som det är.',
  swishKnapp: 'Betala med Swish',
  kortKnapp: 'Betala med kort',
  swishInfo: 'I Swish-appen står Föreningsguiden som mottagare.',
};

/**
 * KÖPRUTAN — Fable 2026-07-31. Ersätter {{FABLE:}}-platshållarna på
 * utkastvyn (kommun/[slug]/utkast/[bidragId]/) och köprutan på
 * /kommun/[slug]/registrera/. {kommun}/{bidrag}/{antal}/{pris} fylls av
 * anroparen med riktiga värden — aldrig gissade.
 *
 * aterbetalning nedan täcker samma löfte som ATERBETALNING ovan, kortare
 * — renderas DÄRFÖR bara en gång per sida: på /registrera/ (som redan
 * hade den fulla ATERBETALNING-texten från H13, "starkast där
 * betalbeslutet fattas") används inte KOPRUTA.aterbetalning, den fulla
 * texten står kvar. På utkastvyn (som inte hade någon återbetalningsrad
 * alls) används KOPRUTA.aterbetalning. Två återbetalningslöften på samma
 * sida hade läst som ett dubbleringsfel, inte som omsorg.
 *
 * kravlistaRegistrering (Jacob 2026-07-31): luckorRad förutsätter ett
 * ifyllt/lucka-koncept — registreringsprodukten har inget sådant, ALLA
 * rader är sådant föreningen själv styrker. Ersätter luckorRad på
 * /registrera/ specifikt, används inte på utkastvyn.
 */
export const KOPRUTA = {
  rubrik: 'Vad ni får',
  // {kommunPossessiv} — INTE "{kommun}s" (bugg hittat 2026-08-03: en
  // kommun vars namn redan slutar på -s, t.ex. Västerås/Borås, hade fått
  // "Västeråss krav" av en bokstavlig {kommun}+"s"-konkatenering; aldrig
  // synligt live än eftersom köprutan varit tom sedan D1 skärptes samma
  // kväll — men templatet skulle ha gett fel text så fort ett bidrag
  // klarade D1). possessiv() (kommunTyper.ts) hanterar redan detta
  // korrekt på andra ställen i kodbasen — samma funktion här.
  beskrivning: '{kommunPossessiv} krav för {bidrag}, i rätt ordning, med sista ansökningsdag och belopp. Vilka bilagor som ska med. Och de uppgifter vi kan fylla i åt er redan ifyllda.',
  // C5 (ÅTGÄRDSSPEC, 2026-08-03 kväll): kommuner med ett riktigt
  // e-tjänstsystem (allt utom "E-post"/"Blankett", se
  // harEtjanstsystem i kommuner.ts) säljer mot systemet de faktiskt
  // ska öppna, inte mot ett generiskt "underlag". beskrivning ovan
  // (oförändrad i sak) gäller där systemet SAKNAS.
  beskrivningEtjanst: 'Allt ni behöver ha framme när ni öppnar {system} — {kommunPossessiv} krav i rätt ordning, era uppgifter ifyllda, bilagorna listade.',
  luckorRad: '{antal} rader behöver ni fylla i själva — vi säger vilka innan ni betalar.',
  kravlistaRegistrering: 'Ni får hela kravlistan för att bli godkända som bidragsberättigade i {kommun}, med vad varje krav betyder och var uppgiften finns.',
  leverans: 'Ni får dokumentet som Word och PDF direkt efter betalning. Det ligger kvar hos er så länge ni vill ha det.',
  prisOchKvitto: '{pris} kr inklusive moms. Kvitto med organisationsnummer och momsspecifikation mejlas — det går att bokföra.',
  aterbetalning: 'Blev det inte användbart: mejla inom 30 dagar så betalar vi tillbaka. Ingen förklaring behövs.',
};

/**
 * Konverteringsstapeln (F①–⑦, 2026-08-12, Jacob) — sju villkorade grepp
 * på utkastvyn, gate först i vart och ett. De tre raderna nedan är INTE
 * uppfunnen säljprosa — var och en ställer bara två redan kända fakta
 * (belopp+pris, deadline+typ, antal+kommun) bredvid varandra, samma
 * register som KOPRUTA ovan. Skrivna av Code i avsaknad av en Fable-
 * leverans (jfr PRIS.abonnemang.beskrivning, samma {{FABLE:}}-läge) —
 * flaggat i leveransrapporten, byt gärna ut mot Design/Fables egna ord.
 * {kommun}/{bidrag}/{pris}/{belopp}/{antal} fylls av anroparen.
 */
export const KONVERTERINGSSTAPEL = {
  // F① — sant-gren när kommunens köpantal når SOCIALT_BEVIS_GOLV (kopKlient.ts).
  // M3 (Jacob 2026-08-17, auditens P0.7): "underlag"/"utkast" bytt mot
  // "ansökningschecklista" — produktens namn, inte en synonym per ställe.
  socialtBevis: '{antal} föreningar i {kommun} har redan köpt en ansökningschecklista hos oss.',
  // F② — kräver bidrag.belopp_status === 'kontrollast'.
  vardeankring: '{kommun} kommun anger {belopp} för {bidrag}. Checklistan kostar {pris} kr.',
  // F③ — kräver bidrag.deadlines.typ === 'fasta' (årligt återkommande
  // MM-DD-datum utan år, se DEADLINE_TYPER i kommunTyper.ts — 'lopande'/
  // 'relativ'/'okand' har inget "om ett år" som är sant).
  forlustaversion: 'Missar ni det här datumet öppnar nästa ansökningstillfälle om ungefär ett år.',
};

/**
 * H20 (SPEC: Kluster 1 — efter-köp-ytan, 2026-07-28): "Medan ni är här" på
 * kvittoläget (kommun/[slug]/registrera/index.astro, ?betald=1). Tre
 * rader, var och en villkorad på att underlaget faktiskt finns — se den
 * filens klientskript.
 */
export const KVITTOSIDA = {
  rubrik: 'Medan ni är här',
  matchadeBidragRad: 'Ni matchade {antal} bidrag till i {kommun}.',
  matchadeBidragLank: 'Se dem',
  nastaDeadlineRad: 'Nästa deadline i {kommun} är {datum}. Vi kan säga till fyra veckor innan.',
  // H31 (SPEC: Kluster 3 — en förening blir fler, 2026-07-28): skärpt mot
  // en konkret gissning (samma bidrag, samma deadlines) i stället för en
  // generisk fråga. Kommun-scopad — {kommun} fylls i av anroparen.
  delaFraga: 'Känner ni en annan förening i {kommun}? De söker sannolikt samma bidrag och missar samma deadlines.',
  delaLank: 'Dela Föreningsguiden',
};

/**
 * BETA — etiketten och vad den betyder (SPRINT_COPY.ts, Fable 2026-07-18).
 * Header-badgen (Base.astro) + egen deklarationssektion på /om/.
 */
export const BETA = {
  badge: 'Beta',
  rad: 'Föreningsguiden är i öppen beta. Att hitta och bevaka bidrag är gratis.',
  omRubrik: 'Om betan',
  omStycken: [
    'Föreningsguiden är i öppen beta. Att hitta bidrag, se vilka som passar er förening och bevaka deadlines är gratis. Vi bygger vidare i högt tempo, och enstaka saker kan vara ofärdiga eller ändras.',
    'Det som fungerar i dag, utan att kosta något: bidragsguider för {antalKommuner} kommuner med verifierade uppgifter och källänkar, deadlinekalendern, matchningen som visar vad just er förening kan söka, och e-postbevakning som påminner innan sista ansökningsdag.',
    'Det som kostar: vi gör i ordning er registreringsansökan — det steg som fäller flest föreningar — för 249 kronor. Och det som kommer: en tjänst som skriver utkast till själva bidragsansökan utifrån kommunens egna krav. Den öppnar senare i betan, och ni kan reservera plats redan nu.',
    'Hittar du fel, eller saknar du din kommun? Hör av dig till redaktionen. Betan blir bättre av varje påpekande.',
  ],
};

/**
 * GILTIGHETSKOLLEN — widget på kommunsidan, station 3-området (SPRINT_COPY.ts,
 * Fable 2026-07-18; ombyggd C3.1, Jacob 2026-08-11 efter Helsingborg-fyndet:
 * widgeten räknade tidigare mot en gissad ~365-dagarscykel oavsett kommunens
 * faktiska regel — "ett år från beslutsdagen" blev "om 7 månader, mars 2027").
 *
 * Nu tre nivåer, styrda av giltighetRegelGerDatum() (kommunTyper.ts):
 *   NIVÅ 1 (regel ger datum + årsmötesdatum angivet) → nivaEttSvar, ett
 *   riktigt beräknat förfallodatum ur berakForfallodatum().
 *   NIVÅ 2 (regel saknas/ger inget datum + årsmötesdatum angivet) →
 *   nivaTva*, ingen gissning, bara löftet om januari-genomgången.
 *   NIVÅ 3 (inget årsmötesdatum än) → bara frågan (formuläret), inget
 *   påstående alls.
 */
export const GILTIGHETSKOLL = {
  rubrik: 'Är er bidragsstatus fortfarande giltig?',
  intro: 'I {kommun} förfaller godkännandet som bidragsberättigad förening om det inte förnyas. Ange när föreningen senast hade årsmöte, så räknar vi ut var ni står.',
  // Arbetsorder 2026-08-03 (2a): "intro" påstod förfall även för kommuner
  // utan känd giltighetsregel — motsäger nivaTva-grenen längre ned i samma
  // widget. introOkand används i stället när giltighetRegelGerDatum() är
  // falsk. Kort, funktionell text (Code, inte Fable — flaggat i commit,
  // samma klass som STALE.template/BEVAKNING.bevakasBadge tidigare).
  introOkand: 'Ange när föreningen senast hade årsmöte, så kontrollerar vi om {kommun} anger en tidsgräns för godkännandet.',
  datumLabel: 'Föreningens senaste årsmöte',
  knapp: 'Kontrollera',
  // NIVÅ 1 — Jacobs text ordagrant (C3 REVIDERAD, 2026-08-11): "Ni är
  // godkända till mars 2027. Vi säger till i januari, innan det går ut."
  // {manad}/{ar} = förfallomånaden ur berakForfallodatum(); {paminnManad}
  // = två månader före (addMonths(forfallodatum, -2)).
  nivaEttSvar: 'Ni är godkända till {manad} {ar}. Vi säger till i {paminnManad}, innan det går ut.',
  // NIVÅ 2 — Jacobs text ordagrant (C3.1, 2026-08-11), uppdelad i tre
  // bitar så "Kolla hos kommunen" kan renderas som en riktig länk till
  // kommun.kalla_url i markupen i stället för platt text.
  nivaTvaForeLank: 'Vi vet inte vad som gäller i {kommun}. ',
  nivaTvaLank: 'Kolla hos kommunen',
  nivaTvaEfterLank: ' — och vi hör av oss i januari.',
  paminnKnapp: 'Ja, påminn oss', // initial/fallback-text, overskrivs alltid av paminnKnappMall vid submit
  paminnKnappMall: 'Påminn oss i {manad}',
};

/**
 * VoidMark — "Ej verifierat" (DATATILLSTAND_och_koprutan.md §2b, Design
 * 2026-08-03). Text ordagrant ur specen, bara {datum}/{kommun}/{url}
 * mekaniskt ifyllda av Code — ingen ny prosa uppfunnen här.
 */
export const VOID_MARK = {
  forklaring: 'Vi hittade ingen {faltnamn} när vi läste kommunens sida {datum}. Det betyder inte att det saknas — bara att vi inte kan stå för det.',
  kallaKnappMall: 'Läs på {host}',
  felflaggaIntro: 'Vet ni {faltnamnBestamd}? Säg till oss — vi kontrollerar och rättar.',
};

/**
 * OlastMark — "olast" (ÅTGÄRDSSPEC T3, 2026-08-03 kväll). Kort och
 * faktisk, samma register som STALE.template/VOID_MARK — ingen
 * övertalning, bara vad vi faktiskt kan stå för.
 */
export const OLAST_MARK = {
  rad: 'Inte kontrollerad mot kommunens sida sedan vi hämtade den.',
  kallaKnappMall: 'Läs på {host}',
  // TILLSTANDET_OLAST.md 4c: "Aldrig markör utan legend på samma sida" —
  // ordagrann rad ur filen, för ytor där markören bär hela anspråket utan
  // egen reservationstext (deadlinekalendern, förstasidans närmaste).
  legend: 'streckad ring = hämtad, ej kontrolläst',
};

/**
 * KOMMUNSIFFRAN — aha-rad överst på kommunsidan (SPRINT_COPY.ts, Fable
 * 2026-07-18). Renderas ENDAST där Kommun.kommunsiffra finns i datat
 * (nu: Berg, se data/kommuner/berg.yaml) — aldrig en uppskattning.
 */
export const KOMMUNSIFFRA = {
  template: 'Förra året delade {antalForeningar} föreningar i {kommun} på {summa} kronor i {bidragstyp}.',
  kalla: 'Källa: kommunens egen sammanställning, utlämnad {utlamnadDatum}.',
};

/**
 * EKERN — 1a i SPEC_HUVUDPROCESSEN (Opus/Fable 2026-08-01),
 * MOCKAR_huvudprocessen.md §1a. Trebandskortet på varje kommunsida,
 * efter svar-först, före stationerna — kommunsidans ekorre in i tratten.
 * Verbatim ur mocken, ingen egen text — utom verifieradPrefix (Jacob
 * 2026-08-04, P1.1): "Senast verifierad" påstod mer än vad som hänt när
 * fältmarkörerna längre ner på samma sida säger "inte kontrollerad" —
 * en besökare läser det som en motsägelse. Sant ord för det som faktiskt
 * gjordes (vi öppnade sidan) i stället.
 */
export const EKERN = {
  verifieradPrefix: 'KÄLLAN LÄST',

  // B1 (ARBETSORDER 2026-08-11, Kalla besökaren, runda 13) — kommun-
  // sidans första skärm: avsändaren först, frågan ur URL:en, arbetet
  // som värme, två bidrag, sedan matchningen som inbjudan (B2/B3 nedan).
  avsandare: 'Oberoende — inte kommunen',
  soktFraga: 'Söker ni bidrag i {kommun}?',
  // A6.3 (Jacob 2026-08-11): "alla 1" var grammatiskt fel — singular när
  // kommunen har exakt ETT bidrag.
  varmeRadEtt: 'Vi har läst det åt er',
  varmeRadFlera: 'Vi har läst alla {antal} åt er',

  band2Eyebrow: 'GÄLLER DET HÄR ER?',
  // B2: matchningen är ALLTID en fråga, aldrig ett påstående. Ersätter
  // det tidigare påståendet ("Tre frågor, och ni ser vad just er
  // förening kan söka", R7 2026-08-08).
  band2Rubrik: 'Vill ni se vilka som gäller just er förening?',
  band2Text: 'Kraven skiljer sig mellan bidrag. Svaren sparas, så nästa gång ser ni bara det som är nytt.',
  band2Cta: 'Se vad ni kan söka',
  band2CtaUnderrad: 'Gratis. Inget konto, ingen mejladress.',

  // B3 — insats-nudgen (14a). En per skärm, efter svaret (band 2) och
  // före listan. Kräver ingen data, gäller i alla 290 kommuner —
  // ordagrant ur ordern, ingen ny formulering.
  insatsNudge: 'Bidrag missas nästan aldrig på ansökan — de missas på att sista dagen passerade, eller att föreningen inte visste att bidraget fanns.',

  band3Eyebrow: 'ELLER LÄS ALLT SJÄLV',
  band3Lank1: 'Alla bidrag i {kommun}',
  band3Lank2: 'Sista ansökningsdatum',
};

/**
 * DEN VARMA SKÄRMEN — E (ARBETSORDER 2026-08-11, mock: "Runda 12 · Inte
 * förklarad. Byggd."). Ersätter EKERN när Foreningsprofil.foreningsnamn
 * är känt klientsidan (E1) — annars gäller B/EKERN oförändrat. All text
 * ordagrant ur mocken (id="12a") — ARBETSORDER säger mockarna är
 * auktoritativa för form och ytcopy, ingen ny svensk prosa här.
 */
export const VARM_SKARM = {
  h2: 'Ni behöver inte<br>läsa allt.',
  kursivRad: 'Det har vi gjort åt er.',
  intro: '{kommun} har <strong>{antal} föreningsbidrag</strong>. De flesta känner till två. Vi läste alla och ställde dem i ordning efter er.',
  signaturRad: 'Läst för hand {datum} — av oss,<br>inte en robot.',

  // E4 — lättnadsremsan. Två rader, samma sakuppgift som GILTIGHETSKOLL.
  // nivaEttSvar (C3.1) men i mockens egen tvåradsform, med en tredje
  // mening tillagd. Visas bara när Foreningsprofil.giltighet + kommunens
  // giltighet_regel BÅDA ger ett beräknat datum (samma ärlighetstrappa
  // som C4 redan kräver — ingen data, ingen rad).
  lattnadRad1: 'Ni är godkända till {manad} {ar}.',
  lattnadRad2: 'Vi säger till i {paminnManad}, innan det går ut. En sak mindre att bära.',

  registerLabel: 'Börjar med det som brådskar för er',
  // E2 — bara när bidraget finns i Foreningsprofil.bevakadeBidrag.
  redanSokt: 'Det ni redan sökt förr.',
  // E3 (Kanon §6.4) — ersätter det gamla "Nytt för er — passar en
  // gymnastikförening" (ett påstående om HENNE). Vi säger vad kommunen
  // riktar bidraget till, inte att det passar henne. {malgrupp} =
  // svenskLista() av bidrag.foreningstyp via VERKSAMHET_FORENING_LABELS,
  // pluraliserat. Utelämnas helt (ingen rad) om foreningstyp saknas —
  // gissar aldrig fram en målgrupp.
  riktarSigTill: 'Riktar sig till {malgrupp}.',
  visaAllaMall: 'Och {antal} till, ordnade efter er.',
  visaAllaLank: 'Visa alla ↓',
};

/**
 * IGENKÄNNINGSRADEN — EN_PROFIL_ALLA_YTOR.md (Design, runda 7, R7.2/R7.3),
 * kommunsidan. Tre tillstånd: profil för DENNA kommun (matchMall*),
 * profil för ANNAN kommun (felKommunMall*), ingen profil/ingen verksamhet
 * (ingenProfil*). En rad, aldrig en banner — sorterar, spärrar aldrig
 * ("Visa allt ändå" finns alltid när profilen matchar).
 *
 * matchMallTyp/felKommunMallTyp används när profilen har EXAKT en
 * verksamhet som bildar ett riktigt sammansatt ord (kommunTyper.ts
 * VERKSAMHET_FORENING_LABELS). matchMallGenerisk/felKommunMallGenerisk
 * är fallback för flera verksamheter eller ett värde utan sammansatt
 * ord ('social', 'annat') — Design gav bara exemplet "en idrottsförening",
 * ingen regel för hur flera värden ska sammanfogas till ett ord.
 */
export const IGENKANNING = {
  matchMallTyp: 'Ordnat för en {typ}. Sidan visar det som passar er först.',
  matchMallGenerisk: 'Ordnat efter er verksamhet. Sidan visar det som passar er först.',
  matchAndra: 'Ändra',
  matchVisaAllaAnda: 'Visa allt ändå',

  ingenProfilText: 'Säg vad ni är för förening, så ordnar vi sidan efter er.',
  ingenProfilKnapp: 'Tre frågor',

  felKommunMallTyp: 'Ni är en {typ} — det tar vi med. Men er profil gäller {profilKommun}, och det här är {dennaKommun}.',
  felKommunMallGenerisk: 'Er verksamhet tar vi med. Men er profil gäller {profilKommun}, och det här är {dennaKommun}.',
  felKommunOrdna: 'Ordna {kommun} för oss',
  felKommunTillbaka: 'Till {kommun} i stället',
};

/**
 * VÄNTELISTAN — station 5-knappen under betan (SPRINT_COPY.ts, Fable
 * 2026-07-18). Ersätter länken till kommunens ansökningssystem tills
 * utkastgeneratorn är byggd (UTKASTGENERATOR_BYGGD, KommunProgression.astro).
 */
export const VANTELISTA = {
  knapp: 'Gör vår ansökan färdig',
  // PRIS: 249 kr, samma som registreringsutkastet. Tidigare stod 149 här
  // medan registreringen kostade 249 — den ENKLARE produkten kostade mer,
  // och en besökare som läste båda sidorna såg motsägelsen. Ett pris för
  // allt utkastarbete är också lättare att kommunicera än en trappa.
  // Talet TESTAS via väntelistknappen (149/249/395 mot klickfrekvens) —
  // det är inte låst, men det ska vara SAMMA överallt tills testet svarat.
  prisRad: '249 kr när underlaget ligger klart — inget nu',
  // Visas bara när countSubscribersByKommun(slug) >= 3 (subscribers.ts,
  // bevakningKlient.ts BEVAKNING_GOLV). Code fyller {antal}.
  socialProof: '{antal} föreningar i {kommun} bevakar redan sina deadlines här.',
  // Visas bara där kommunen har kommunsiffra (idag Berg; fler när fler
  // kommuner lämnar ut sin sammanställning, kommuner.ts Kommunsiffra).
  kostnadsram: 'Förra året delade föreningarna i {kommun} på {summa} kr. Missar ni ansökan får ni ingenting av den.',
  // rubrik/besked borttagna (Jacob 2026-08-04, P1.2): "Vi skriver allt
  // utom det bara ni vet" och "...bemöter varje krav kommunen ställer"
  // överclaimade. prisRad ovan är den gällande formuleringen.
  // Namnger luckorna FÖRE köpet. Aldrig procent ("60 % färdigt") — samma
  // påhittade precision som 90-dagarssiffran. Faktiskt kopplad i
  // VantelistaFlode.astro (A2, 2026-07-29) via fyllKrav() mot
  // bidrag.krav — kommentaren som stod här ("ORÖRD SEDAN 2026-07-30,
  // ingen yta läser detta") var fel/inaktuell, borttagen 2026-08-05.
  //
  // P1.6 (Jacob 2026-08-05): renderas nu som punktlista (VantelistaFlode
  // bygger <li> per krav), inte en semikolonfogad mening — en mall med
  // {luckor} inline gick sönder så fort ett bidrag hade fler än två
  // krav. luckorRubrik är därför en egen rad per bidrag ("Kommunens
  // villkor för X"), inte "Det här fyller ni själva" — vid många krav
  // är innehållet kommunens fulla lista, inte en kuraterad
  // luckuppräkning. Den gamla avslutningen "Allt annat skriver vi" är
  // borttagen (samma överclaim-mönster som P1.2), inte omformulerad —
  // se P1.6-svaret för varför.
  luckorRubrik: 'Kommunens villkor för {bidragsnamn}',
  luckorInga: 'För {bidragsnamn} behöver ni inte fylla i något — vi har allt vi behöver från era svar.',
  cta: 'Reservera plats nu. Ni betalar först när underlaget ligger klart att läsa — och behåller det till nästa år.',
  epostLabel: 'E-postadress',
  knappVantelista: 'Reservera vår plats',
  kvitto: 'Klart — er plats är reserverad. Vi hör av oss så snart utkastet för {kommun} går att skapa. Under tiden fyller vi på er föreningsprofil varje gång ni använder guiden, så det mesta redan är på plats när ni sätter igång.',
  ansvar: 'Ansökan lämnar ni in själva och beslutet fattar kommunen. Vi lovar inte bifall.',
};

/**
 * Förstasidans live-datakort (LiveDataKort.astro, Design turn-14,
 * incoming/foreningsguiden-tratt-tryck-v3-livedata.html). Två datalägen,
 * en yta — katalogtalet (bidrag/kommuner) är statiskt och alltid sant;
 * live-antalet växlar vilken position som är "stor" vid golvet (50,
 * bevakningKlient.ts BEVAKNING_GOLV_GLOBALT).
 */
export const KATALOG_LIVEDATA = {
  eyebrowKatalog: 'Kartlagt just nu',
  enhetBidrag: 'bidrag kartlagda',
  // P0.2 (Jacob 2026-08-04): "lästa från" → "hämtade från" — samma skäl
  // som P1.1: "läst" läser lätt som "kontrollerat", "hämtade" påstår
  // bara det som faktiskt hänt (extraherat, inte oberoende verifierat).
  katalogText: 'i {kommuner} kommuner — med krav, deadlines och belopp hämtade från kommunernas egna sidor.',
  // Under golvet — singular/plural, {antal}=1 väljer bevakarSingular
  // (rättar "1 föreningar" som fanns i ett tidigare utkast av copyn).
  bevakarPlural: '{antal} föreningar bevakar sina deadlines · sedan {datum}',
  bevakarSingular: '1 förening bevakar sina deadlines · sedan {datum}',
  eyebrowLive: 'Bevakar deadlines just nu',
  enhetForeningar: 'föreningar',
  katalogSomStod: 'i {kommuner} kommuner, med {bidrag} bidrag kartlagda.',
  liveDeadlinesText: '{antal} deadlines bevakas åt föreningar',
  senastAvlast: 'senast avläst {datum}',
};
