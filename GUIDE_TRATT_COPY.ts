// GUIDE_TRATT_COPY.ts — Fable, 2026-07-24
// Skarp copy för matchningstratten (Designs turn 11: 11a frågeflöde, 11b tregruppersbesked).
// Ersätter platshållartexten i behållarna. Register: samma som content.ts — sakligt,
// på föreningens sida, inga utropstecken, ingen säljcopy. Ansvarsgränsen är BINDANDE:
// "matchar" och "saknar", ALDRIG "berättigad". Kommunen avgör behörighet.

export const TRATT = {
  // ---- Ingång ----
  start: {
    rubrik: 'Vad kan er förening söka?',
    ingress: 'Svara på fyra korta frågor, så visar vi vilka bidrag i er kommun som passar er förening — och vad som krävs för dem ni inte når än.',
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

  // ---- Löpande räknare (uppdateras efter varje svar) ----
  raknare: {
    tom: 'Svara för att se vad ni matchar',
    trafffar: '{antal} bidrag matchar er förening', // {antal} injiceras
    en: '1 bidrag matchar er förening',
    noll: 'Inga bidrag matchar ännu — men läs vidare, det kan bero på ett krav ni kan åtgärda',
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
      radMall: 'Ni har svarat på {antal} frågor — fortsätt där ni slutade.',
      knappFortsatt: 'Fortsätt',
      knappMejla: 'Mejla mig en länk',
      epostPlaceholder: 'din@forening.se',
      knappSkicka: 'Skicka',
      kvitto: 'Länk skickad — kolla din inkorg.',
    },

    // Förstasidans tre förhandsvisningskort (under rubrikerna nedan) —
    // skrivna för att göra korten till en anledning att börja, inte en
    // beskrivning av en produkt.
    kortUnderMatchar: 'Bidrag där ni uppfyller de krav kommunen publicerat.',
    kortUnderSaknar: 'Bidrag som ligger nära — och exakt vad som fattas för att nå dem.',
    kortUnderBorjaHar: 'Det formella steget som fäller flest ansökningar, med kommunens handläggningstid.',

    // Grupp 1 — matchande bidrag
    kanSoka: {
      rubrik: 'Kan sökas nu',
      tom: 'Inget bidrag matchar er profil fullt ut ännu — se vad som saknas nedan.',
      // Per bidrag renderas namn, deadline, belopp ur YAML. Ingen ny copy behövs.
    },

    // Kostnadsramen — bara när matchningsdata faktiskt finns (harMatchningsdata,
    // matching.ts) OCH minst ett matchat bidrag har ett parseat krontak
    // (parseBeloppTak, kommunTyper.ts). kostnadsramEnkel när antalMedTak === 1.
    kostnadsram: 'De här bidragen är värda upp till {summa} kr för er förening. Att söka dem kostar tid — vi kan göra det åt er.',
    kostnadsramEnkel: 'Det här bidraget är värt upp till {summa} kr för er förening.',
    // Fallback när harMatchningsdata === false (dagens läge, före Haiku-
    // passet) — summerar ALLA kommunens bidrag, inte matchade, och ljuger
    // aldrig om att potten redan är personlig.
    kostnadsramOgfiltrerad: 'Föreningarna i {kommun} delar på bidrag värda upp till {summa} kr om året. Fyll i er profil så ser ni vilka som passar just er.',
    // Fotnoten (Design turn-14, incoming/foreningsguiden-tratt-tryck-v3-
    // livedata.html) — null-belopp exkluderas ur summan ovan, aldrig tyst.
    // uncapped=0 → sumFotnotCappat. uncapped>0 → sumFotnotOkant, med
    // {uncappedText} fylld av sumFotnotOkantEtt (=1) eller
    // sumFotnotOkantFlera (>1).
    sumFotnotCappat: 'Summan av angivna maxbelopp för {antal} bidrag.',
    sumFotnotOkant: 'Summan gäller {antal} bidrag med angivet tak. {uncappedText} angivet belopp och kan höja summan.',
    sumFotnotOkantEtt: 'Ett bidrag saknar',
    sumFotnotOkantFlera: '{antal} bidrag saknar',

    // Grupp 2 — nära-matchningar med vad som saknas
    behover: {
      rubrik: 'Nära — det här saknas',
      // Per bidrag: konkret vad som fattas. Mallar för de vanliga fallen.
      // saknarTid (verksamhetstid) BORTTAGEN 2026-08-02 (G7) — samma skäl
      // som fraga_tid ovan, matchBidrag kan inte längre producera det skälet.
      saknarMedlemmar: 'Kräver minst {krav} medlemmar — ni angav {angivet}.',
      saknarTyp: 'Riktar sig till {krav}. Stämmer det in på er verksamhet? Justera svaret ovan.',
      saknarRegistrering: 'Kräver att föreningen är registrerad som bidragsberättigad i kommunen — se Börja här nedan.',
      // C3/D2 (ÅTGÄRDSSPEC, 2026-08-03 kväll): "Nära — det här saknas"
      // påstår att vi känner till HELA kravbilden för bidraget — sant
      // bara när D1 är uppfyllt (krav_status: verifierad + minst tre
      // krav). Är kraven inte kartlagda ännu hamnar bidraget här i
      // stället, länkat till källan (VOID_MARK.kallaKnappMall,
      // content.ts — samma "Läs på {host}"-fras som VoidMark) i stället
      // för ett gissat gap. Ingen ny brödtext — Code hittar inte på
      // prosa; rubriken (Jacobs egna ord) och källänken bär beskedet.
      rubrikOkartlagd: 'Kan gälla er — kraven inte kartlagda ännu',
    },

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

    // H9 (SPEC: Kluster 3, samma dokument): paketpris — bara när fler än
    // ett bidrag matchar. {antal}/{paketpris}/{styckpris} fylls i av
    // matcha/index.astro (PRIS_PAKET_ORE/PRIS_REGISTRERINGSUTKAST_ORE,
    // priser.ts).
    paket: {
      rad: 'Ni matchade {antal} bidrag. Vi kan göra utkast till alla — {paketpris} kr i stället för {styckpris} kr per bidrag.',
    },
  },

  // ---- Ansvarsraden (följer beskedet, bindande formulering) ----
  ansvar: 'Vi visar vad er förening matchar utifrån kommunens publicerade krav. Kommunen avgör själv om ni godkänns — vi förbereder, vi kan inte lova bifall.',
};
