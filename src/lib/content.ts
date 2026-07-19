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

/** Startsidan. H1 bär funktion (sök); underraden bär nytta (människa). */
export const START = {
  metaTitle: 'Kommunala föreningsbidrag, samlade — Föreningsguiden',
  metaDescription:
    'Föreningsguiden samlar kommunernas föreningsbidrag, regler och sista ansökningsdatum på ett ställe. Se vad din förening kan söka och sök i tid.',
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
      svar: 'Sista ansökningsdatum skiljer sig mellan bidragen. {deadlinesammanfattning} Datumen återkommer varje år. En för sen ansökan kan ge minskat eller uteblivet bidrag, så kontrollera datumet mot kommunens egen sida i god tid.',
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
 * BEVAKNINGSFORMULÄR — e-post + GDPR-microcopy (UPPDRAG_POC §6, SOKBARHETSSPEC).
 * Skriven när formulärytan fanns (steg 3) och lagringen (Vercel KV) godkänts.
 * Register: tjänst, inte nyhetsbrevsfälla. Ändamålet är skarpt och avgränsat.
 * Ingen skarp insamling före dubbel opt-in är på plats.
 */
export const BEVAKNING = {
  rubrik: 'Bevaka deadlines för din kommun',
  ingress:
    'Vi mejlar två veckor och tre dagar innan sista ansökningsdag för de bidrag du väljer att bevaka. Inget annat.',
  epostLabel: 'Din e-postadress',
  epostPlaceholder: 'namn@forening.se',
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
    sparatText: 'Sparat till ert utkast: föreningstyp — {typ}',
  },

  // Station 2 — Vad är brådskande?
  station2: {
    rubrik: 'Vad är brådskande?',
    introMedDeadline: 'Närmast i tiden: {bidragsnamn}, sista ansökningsdag {datum}. {dagarKvar} dagar kvar.',
    introUtanDeadline: 'Inget av bidragen som gäller er har ett fast sista datum just nu — de söks löpande. Villkoren gäller ändå.',
    sentText: 'En för sen ansökan kostar pengar: {sen_ansokan_text}',
  },

  // Station 3 — Vad måste göras först? (den osynliga fällan)
  station3: {
    rubrik: 'Vad måste göras först?',
    intro: 'Innan ni kan söka något bidrag i {kommun} måste föreningen vara godkänd som bidragsberättigad. Det är ett eget ärende, med egen handläggningstid — och det är här föreningar oftast fastnar.',
    ledtidOkand: '{kommun} anger inte hur lång tid godkännandet tar, men uppmanar föreningar att söka i god tid. Hinner ansökan inte handläggas före bidragets sista datum blir den inte behandlad.',
    ledtidKand: 'Räkna med {ledtid} dagars handläggning innan ni får besked.',
    giltighetVarning: 'Tänk på att godkännandet inte gäller för alltid: {giltighet}. Fick ni bidrag förra året betyder det inte att ni är godkända i år — statusen kan ha gått ut utan besked.',
    extraSteg: 'Ett steg till, som är lätt att missa: {beskrivning}',
    inget: 'Vi har inte hittat några särskilda förkrav för {kommun}. Kontrollera ändå hos kommunen innan ni söker.',
  },

  // Station 4 — Vad kan ni söka nu?
  station4: {
    rubrik: 'Vad kan ni söka nu?',
    intro: '{antal} bidrag i {kommun} passar en {typ}. De ligger ordnade efter vad som är mest angeläget att göra något åt.',
    doldaText: '{antalDolda} bidrag gäller andra sorters föreningar och är dolda.',
    visaAndaLank: 'Visa ändå',
  },

  // Station 5 — Vad ska ni skriva?
  station5: {
    rubrik: 'Vad ska ni skriva?',
    intro: 'Ansökan bedöms mot kommunens egna kriterier. Vi kan skriva ett utkast som utgår från dem och från det ni redan fyllt i här.',
    faltStatus: '{ifyllda} av {totalt} fält är redan ifyllda',
    knapp: 'Skapa ansökan',
    ansvar: 'Vi skriver utkastet. Ansökan lämnar ni in själva, och beslutet fattar kommunen.',
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

  valkomst: {
    amne: 'Bevakningen är igång',
    body: [
      'Hej,',
      'Nu bevakar vi {kommunLista} åt er. Så här fungerar det: vi mejlar två veckor före sista ansökningsdag för bidragen i era kommuner, och en gång till tre dagar före. Inget annat — inga nyhetsbrev, ingen reklam.',
      'Ett tips redan nu: kontrollera att föreningen är godkänd som bidragsberättigad i er kommun. I flera kommuner förfaller godkännandet tyst efter en tid, och utan det spelar deadlines ingen roll. Ni ser vad som gäller er kommun här: {kommunLank}',
      'Föreningsguiden är gratis under betan.',
    ],
  },

  paminnelse14: {
    amne: 'Två veckor kvar: {bidragsnamn} i {kommun}',
    body: [
      'Hej,',
      'Den {datum} är sista ansökningsdag för {bidragsnamn} i {kommun}.',
      'Två saker att kontrollera i god tid: att föreningen är godkänd som bidragsberättigad (det är ett eget ärende med egen handläggningstid), och att ni har underlagen som krävs. Kraven, beloppen och länken till kommunens ansökan finns här: {bidragLank}',
      'Vi påminner en gång till tre dagar före.',
    ],
  },

  paminnelse3: {
    amne: 'Tre dagar kvar: {bidragsnamn} i {kommun}',
    body: [
      'Hej,',
      'På {veckodag} den {datum} stänger ansökan för {bidragsnamn} i {kommun}.',
      'Är ansökan inte inskickad än: allt ni behöver finns här — krav, belopp och länk till kommunens system: {bidragLank}',
      'En för sent inlämnad ansökan behandlas i många kommuner inte alls, så tre dagar är marginal, inte utrymme.',
    ],
  },

  giltighetsvarning: {
    amne: 'Kontrollera er bidragsstatus i {kommun}',
    body: [
      'Hej,',
      'Ni angav att föreningen hade årsmöte {arsmotesdatum}. I {kommun} gäller: {giltighetsregel}. Det betyder att er status som bidragsberättigad förening kan behöva förnyas ungefär nu.',
      'Vårt råd: kontrollera i {system} att föreningens uppgifter är uppdaterade och statusen aktiv — innan ni räknar med pengar från nästa ansökningsomgång. Ett förfallet godkännande upptäcks oftast först när det är för sent att hinna åtgärda.',
      'Vad som gäller i er kommun, med källa: {kommunLank}',
    ],
  },
};

/**
 * BETA — etiketten och vad den betyder (SPRINT_COPY.ts, Fable 2026-07-18).
 * Header-badgen (Base.astro) + egen deklarationssektion på /om/.
 */
export const BETA = {
  badge: 'Beta',
  rad: 'Föreningsguiden är i öppen beta. Allt är gratis medan vi bygger.',
  omRubrik: 'Om betan',
  omStycken: [
    'Föreningsguiden är i öppen beta. Det betyder att allt du ser är gratis att använda, att vi bygger vidare i högt tempo, och att enstaka saker kan vara ofärdiga eller ändras.',
    'Det som fungerar i dag: bidragsguider för 20 kommuner med verifierade uppgifter och källänkar, deadlinekalendern, och e-postbevakning som påminner innan sista ansökningsdag.',
    'Det som kommer: en tjänst som skriver utkast till er ansökan utifrån kommunens egna krav. Den öppnar senare i betan — du kan ställa dig på väntelistan redan nu.',
    'Hittar du fel, eller saknar du din kommun? Hör av dig till redaktionen. Betan blir bättre av varje påpekande.',
  ],
};

/**
 * GILTIGHETSKOLLEN — widget på kommunsidan, station 3-området
 * (SPRINT_COPY.ts, Fable 2026-07-18). Ett datum in, ett besked ut.
 * svarRisk/svarOk kräver en känd giltighetsregel (forutsattningar[0].giltighet);
 * svarOkand används ALLTID när regeln saknas — ingen beräkning gissas fram.
 */
export const GILTIGHETSKOLL = {
  rubrik: 'Är er bidragsstatus fortfarande giltig?',
  intro: 'I {kommun} förfaller godkännandet som bidragsberättigad förening om det inte förnyas. Ange när föreningen senast hade årsmöte, så räknar vi ut var ni står.',
  datumLabel: 'Föreningens senaste årsmöte',
  knapp: 'Kontrollera',
  svarRisk: 'Med årsmöte {arsmotesdatum} och regeln i {kommun} ({giltighetsregel}) kan er status ha förfallit eller vara nära att förfalla. Kontrollera i {system} att uppgifterna är uppdaterade — och gör det före nästa deadline, inte vid den.',
  svarOk: 'Med årsmöte {arsmotesdatum} bör er status vara giltig ännu en tid. Men den förfaller om den inte förnyas — {giltighetsregel}.',
  svarOkand: '{kommun} anger ingen tidsgräns för godkännandet i sina publicerade regler. Flera kommuner kräver ändå årlig uppdatering av föreningens uppgifter — kontrollera med kommunen. Vi har inte hittat en regel att räkna mot, så vi gissar inte.',
  erbjudande: 'Vill ni att vi säger till i god tid innan statusen behöver förnyas?',
  erbjudandeKnapp: 'Ja, påminn oss',
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
 * VÄNTELISTAN — station 5-knappen under betan (SPRINT_COPY.ts, Fable
 * 2026-07-18). Ersätter länken till kommunens ansökningssystem tills
 * utkastgeneratorn är byggd (UTKASTGENERATOR_BYGGD, KommunProgression.astro).
 */
export const VANTELISTA = {
  knapp: 'Skapa utkast till ansökan',
  prisRad: '149 kr när tjänsten öppnar — gratis att ställa sig i kön',
  rubrik: 'Utkasttjänsten öppnar senare i betan',
  besked: 'Vi bygger just nu tjänsten som skriver ett utkast till er ansökan utifrån {kommun}s egna krav. Den är inte öppen än — vi kalibrerar den mot verkliga ansökningar först, för att den ska hålla måttet.',
  cta: 'Lämna er e-postadress så säger vi till när den öppnar. Föreningar på väntelistan får prova först.',
  epostLabel: 'E-postadress',
  knappVantelista: 'Ställ oss i kön',
  kvitto: 'Ni står i kön. Vi hör av oss när utkasttjänsten öppnar — och inte om något annat.',
  ansvar: 'Vi skriver utkastet. Ansökan lämnar ni in själva, och beslutet fattar kommunen.',
};
