// GUIDE_TRATT_COPY.ts — Fable, 2026-07-24
// Skarp copy för matchningstratten (Designs turn 11: 11a frågeflöde, 11b tregruppersbesked).
// Ersätter platshållartexten i behållarna. Register: samma som content.ts — sakligt,
// på föreningens sida, inga utropstecken, ingen säljcopy. Ansvarsgränsen är BINDANDE:
// "matchar" och "saknar", ALDRIG "berättigad". Kommunen avgör behörighet.

export const TRATT = {
  // ---- Ingång ----
  start: {
    rubrik: 'Vad kan er förening söka?',
    // B4 (Jacob 2026-08-06): B3 gjorde tratten till tre frågor och bytte
    // gapanalys-löftet ("vad som krävs för dem ni inte når än") mot två
    // grupper som inte påstår att något fattas — ingressen låg kvar med
    // den gamla fyra-frågors-texten och det inaktuella löftet.
    ingress: 'Svara på tre korta frågor, så visar vi vilka bidrag som finns i er kommun och vilka som passar er förening bäst.',
    startknapp: 'Börja',
    // "Börja om" ljög om vad knappen gör — svaren nollställs inte (sajten
    // lovar att de sparas, TRATT.besked.minne). Etiketten beskriver nu
    // exakt handlingen: gå tillbaka och ändra ett svar, se beskedet
    // uppdateras. Löser samtidigt Designs H6 (synlig väg att rätta ett
    // svar) — ingen logikändring, bara rätt namn på det knappen redan gjorde.
    knappBorjaOm: 'Ändra svar',
    // C2 (ÅTGÄRDSSPEC, 2026-08-03 kväll): den gamla raden ("Vår äldsta
    // avläsning mot en kommuns egen sida är från {datum}") satte
    // värsta-fallet i sidans mitt, ovanpå kommunlistan — flyttad till
    // /om/ under Så verifierar vi (OM.senastAvlastRad, content.ts,
    // exakt samma ordalydelse, bara ny plats). Förstasidan får i stället
    // en evergreen, alltid sann rad utan datum — Jacobs egna ord,
    // ordagrant.
    senastAvlastRad: 'Varje bidrag visar när vi senast läste kommunens sida.',
  },

  // ---- Räknaren (SPEC B3, D-A, 2026-08-06) ----
  // B3.2/B3.4: räknaren är kommunens TOTALSUMMA aktiva bidrag, satt vid
  // kommunval, OFÖRÄNDRAD av de tre följande svaren — aldrig "matchar er
  // förening" (den gamla trafffar/en/noll-modellen räknade matchKommun-
  // resultatet, en personlig siffra B3 uttryckligen underkänner). Egen,
  // skild komponent från förloppet (se stegbar-uppdelningen i skriptet).
  raknare: {
    // Innan kommun är vald (B3, "Vad Code behöver veta" §4) — raden
    // står kvar med sin form, aldrig borttagen, bara tom.
    tom: 'Välj kommun, så visar vi hur många bidrag som finns.',
    mall: '{antal} kommunala bidrag i {kommun}',
    mallEtt: '1 kommunalt bidrag i {kommun}',
    // Beskedskärmens rubrikvariant — samma tal, en förklarande sats till
    // (räknaren BLIR sidans rubrik där, B3 D-A "På beskedskärmen").
    beskedTillagg: ' — ordnade efter vad ni svarat. Alla visas.',
  },

  // ---- Fråga 1: kommun ----
  fraga_kommun: {
    fraga: 'Var finns er förening?',
    hjalp: 'Kommunen där föreningen har sitt säte.',
    // Återanvänder kommunväljaren; placeholder därifrån.
  },

  // ---- Fråga 2: verksamhet (flerval) ----
  fraga_verksamhet: {
    fraga: 'Vad sysslar ni med?',
    hjalp: 'Välj det som stämmer — flera går bra.',
    alternativ: [
      { id: 'idrott', etikett: 'Idrott och motion' },
      { id: 'kultur', etikett: 'Kultur, musik, teater' },
      { id: 'hembygd', etikett: 'Hembygd och lokalhistoria' },
      { id: 'friluft', etikett: 'Friluftsliv och natur' },
      { id: 'social', etikett: 'Social verksamhet och stöd' },
      { id: 'ungdom', etikett: 'Barn- och ungdomsverksamhet' },
      { id: 'annat', etikett: 'Annat' },
    ],
  },

  // ---- Fråga 3: storlek (intervall) ----
  fraga_storlek: {
    fraga: 'Hur många medlemmar är ni?',
    hjalp: 'Ungefär räcker.',
    alternativ: [
      { id: 'xs', etikett: 'Färre än 25' },
      { id: 's', etikett: '25–100' },
      { id: 'm', etikett: '100–500' },
      { id: 'l', etikett: 'Fler än 500' },
    ],
  },

  // fraga_tid (verksamhetstid) BORTTAGEN 2026-08-02 (G7, Jacob): skuren
  // ur flödet — min_verksamhetstid_manader är fältet som fylls minst i
  // datan, vilket gjorde frågan till en avhoppspunkt som nästan aldrig
  // gav en matchning. Flödet är nu fyra frågor: kommun, verksamhet,
  // storlek, sökt förut. profil.alder finns kvar i datamodellen
  // (foreningsprofil.ts) — bara frågan och dess copy borttagna.

  // ---- Fråga 4: sökt förut (proxy för registrering, gaten) ----
  // Frågas som ERFARENHET, aldrig som status. Ett nej/vet inte triggar Börja här-beskedet.
  fraga_sokt: {
    fraga: 'Har ni sökt bidrag i kommunen förut?',
    hjalp: 'Det säger oss om ni redan finns med i kommunens föreningsregister.',
    alternativ: [
      { id: 'ja', etikett: 'Ja, vi har sökt förut' },
      { id: 'nej', etikett: 'Nej, aldrig' },
      { id: 'osaker', etikett: 'Vet inte' },
    ],
    // 1c (SPRINT: Huvudprocessen, MOCKAR_huvudprocessen.md §1c) — visas
    // direkt när nej/osäker väljs, inte först på beskedet.
    gateBesked: 'Då börjar ni inte med ansökan. Ni behöver först bli godkända som bidragsberättigade. Vi visar vad det kräver.',
    visaBeskedetKnapp: 'Visa beskedet',
  },

  // ---- BESKEDET: tre grupper, aldrig ett enda tal ----
  besked: {
    rubrik: 'Det här hittade vi för er förening',

    // H5 (SPEC: Det som återstår, 2026-07-28): återuppta en avbruten
    // tratt. Visas överst på beskedet BARA om profilen inte är komplett
    // (färre än 5 frågor besvarade) — kassörer jobbar i femminuters-
    // fönster, och en återvändande session hoppar i dag rakt till
    // beskedet utan att märka att frågor står obesvarade. {antal} fylls
    // i av matcha/index.astro.
    atervand: {
      // P1.C (Jacob 2026-08-17): "Ni har svarat på 1 frågor" — flaggad
      // 12 augusti, levde kvar för att radMall aldrig hade en
      // singularform. formateraBevakarText (bevakningKlient.ts) finns
      // redan för exakt den här buggklassen ("1 föreningar") men
      // återanvändes aldrig här.
      radMall: 'Ni har svarat på {antal} frågor — fortsätt där ni slutade.',
      radMallSingular: 'Ni har svarat på 1 fråga — fortsätt där ni slutade.',
      knappFortsatt: 'Fortsätt',
      knappMejla: 'Mejla mig en länk',
      epostPlaceholder: 'din@forening.se',
      knappSkicka: 'Skicka',
      kvitto: 'Länk skickad — kolla din inkorg.',
    },

    // Förstasidans två förhandsvisningskort (under rubrikerna nedan) —
    // skrivna för att göra korten till en anledning att börja, inte en
    // beskrivning av en produkt.
    //
    // B4 (Jacob 2026-08-06): de gamla tre korten (kanSoka/behover/
    // borjaHar) beskrev en gapanalys-modell B3 tog bort — kortet
    // "Kan sökas nu" lovade att vi vet vilka krav föreningen uppfyller
    // (vi sorterar, vi prövar inte), "Nära — det här saknas" lovade en
    // gapanalys som inte längre finns. Ersatta av grupper-rubrikerna
    // nedan + ny kortcopy nedan. Registreringskortet (borjaHar) är
    // oförändrat och kortUnderBorjaHar likaså.
    kortUnderPassar: 'Bidrag vars inriktning stämmer med det ni gör.',
    kortUnderKanGalla: 'Resten av kommunens bidrag. Vi utesluter ingenting vi inte vet.',
    kortUnderBorjaHar: 'Det formella steget som fäller flest ansökningar, med kommunens handläggningstid.',

    // Grupp 3 — Börja här (registreringsbeskedet). Produktens skarpaste ögonblick.
    // Visas när fraga_sokt == nej/osaker, ELLER när ett bidrag kräver registrering.
    borjaHar: {
      rubrik: 'Börja här',
      brodtext: 'Nästan alla kommunala bidrag kräver att föreningen först är registrerad som bidragsberättigad. Det är ett eget steg, det tar tid, och det är den vanligaste anledningen att en ansökan inte går igenom. Är ni inte registrerade ännu är det här ni ska börja — inte med bidragsansökan.',
      // Utfällbart djup (disclosure):
      fallRubrik: 'Vad krävs för att bli godkänd?',
      fallText: 'Det varierar mellan kommuner, men handlar oftast om att ni har antagna stadgar, en demokratiskt vald styrelse, ett organisationsnummer och ett föreningskonto. Godkännandet har egen handläggningstid, så räkna baklänges från bidragets sista ansökningsdag — inte framåt från idag.',
      // Övergång till betald hjälp — lugn, aldrig påträngande:
      hjalpText: 'Vi kan förbereda er registreringsansökan mot just er kommuns krav, så inget fattas när ni lämnar in.',
      // B3 (SPRINT: Produkten, Opus/Fable 2026-07-31): "Hjälp oss registrera"
      // läst som svenska säger att HON hjälper OSS — bytt 2026-08-01.
      hjalpKnapp: 'Förbered vår registreringsansökan',
    },

    // SPEC B3 (Design, runda 6, 2026-08-06), D-B — trattens NYA
    // beskedsmodell. borjaHar ovan lever kvar oförändrat (registrera-
    // sidan). kanSoka/behover (trattens gamla tregruppsmodell) och
    // förstasidans kort som beskrev dem är borttagna i B4 — samma
    // rubriker (grupper nedan) används nu även på förstasidan.
    //
    // "Vad Code behöver veta" §5: grupperna bär listan i ALLA tre
    // sökt-lägena, byter aldrig struktur på ett svar. Bara blocket
    // OVANFÖR listan skiljer sig (registrering nedan).
    //
    // M2.3 (Jacob 2026-08-17, precisionsordern): "Passar er verksamhet"/
    // "Kan gälla er ändå" var två rubriker — ersatta av tre nivåer
    // (matching.ts sorteraForTratt, i strikt prövningsordning:
    // foreningstyp → kategori → varken/eller). Skälet visas per RAD, inte
    // bara under rubriken, eftersom troligenRelevantSkal interpolerar
    // bidragets EGNA matchandeForeningstyp-värden — samma rad kan alltså
    // ha olika skäl-text beroende på vilket bidrag det gäller.
    // garInteAttBedomaSkal är INTE "matchar inte" — frånvaro av
    // kategoriöverlapp bevisar ingen obehörighet, formuleringen får aldrig
    // antyda det (Jacobs egen gräns för den här nivån).
    grupper: {
      troligenRelevant: 'Troligen relevant',
      // {foreningstyp} = svenskLista(rad.matchandeForeningstyp), satt av anropsstället.
      troligenRelevantSkal: 'Kommunen riktar bidraget till {foreningstyp}.',
      kanVaraRelevant: 'Kan vara relevant',
      kanVaraRelevantSkal: 'Kategorin stämmer, men kommunen anger ingen målgrupp vi kunnat läsa.',
      garInteAttBedoma: 'Går inte att bedöma',
      garInteAttBedomaSkal: 'Vi vet inte om det gäller er. Kommunen anger ingen målgrupp, och kategorin stämmer inte med era svar.',
    },
    // Blocket ovanför listan, sokt=nej/vet inte (B3, "De tre sökt-lägena").
    // sokt=ja: inget block, grupperna direkt (ingen copy behövs).
    registrering: {
      etikett: 'Börja här',
      budskapNej: 'Ni svarade att ni inte sökt bidrag i {kommun} förut. Då börjar de flesta här — det är ett eget ärende, och det som fäller flest ansökningar när det hoppas över.',
      knapp: 'Så blir ni godkända →',
      // Rubrik+rad för listan under registreringssteget (bara sokt=nej) —
      // "gruppinledning", inte ett tredje beskedsläge. Gränsen ligger i
      // registreringssteget ovanför, inte på korten (vanlig ram, ingen
      // attention/oxblod — se .tratt__bidrag, orört).
      vantarRubrik: 'Det här väntar när ni är godkända',
      vantarText: 'Inget är avslaget. Vi vet bara inte om ni är godkända än — så de ligger redo, inte stängda.',
      // sokt=vet inte: kontrollfråga i stället för besked, + kommunens
      // egen länk (VOID_MARK.kallaKnappMall-mönstret, samma "Läs på
      // {host}" som redan används i den okartlagda gruppen ovan).
      kontrollfraga: 'Är ni godkända som bidragsberättigade i {kommun}?',
    },

    // Avslutning — kopplingen till föreningsminnet
    minne: 'Era svar sparas i er föreningsprofil. Nästa gång känner vi igen er, och ni ser direkt vad som är nytt sedan sist.',

    // H7 (SPEC: Kluster 3 — en förening blir fler, 2026-07-28): delbart
    // besked. Köpbeslutet fattas av styrelsen, inte kassören ensam —
    // delbarhet ÄR köpprocessen. Mejlversionen (api/dela-besked.ts,
    // mejl.ts sendDelbartBesked) innehåller de matchade bidragen direkt,
    // ingen länk som kräver att svaren fylls i på nytt.
    dela: {
      rubrik: 'Dela beskedet',
      brodtext: 'Skicka till styrelsen eller skriv ut inför nästa möte.',
      knappMejla: 'Mejla',
      knappSkrivUt: 'Skriv ut',
      epostPlaceholder: 'din@forening.se',
      knappSkicka: 'Skicka',
      kvitto: 'Skickat.',
    },
  },

  // ---- Ansvarsraden (följer beskedet, bindande formulering) ----
  ansvar: 'Vi visar vad er förening matchar utifrån kommunens publicerade krav. Kommunen avgör själv om ni godkänns — vi förbereder, vi kan inte lova bifall.',
};
