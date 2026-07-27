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
    // Sitewide färskhetsrad (förstasidan) — {datum} injiceras av Code med
    // det senaste `verifierad`-datumet över alla kommuner.
    senastAvlastRad: 'Uppgifterna stämdes senast av mot kommunernas egna sidor {datum}.',
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

  // ---- Fråga 4: verksamhetstid ----
  fraga_tid: {
    fraga: 'Hur länge har föreningen funnits?',
    hjalp: 'Många bidrag kräver att föreningen varit verksam en tid.',
    alternativ: [
      { id: 'ny', etikett: 'Mindre än ett år' },
      { id: 'mellan', etikett: '1–3 år' },
      { id: 'etablerad', etikett: 'Mer än 3 år' },
    ],
  },

  // ---- Fråga 5: sökt förut (proxy för registrering) ----
  // Frågas som ERFARENHET, aldrig som status. Ett nej/vet inte triggar Börja här-beskedet.
  fraga_sokt: {
    fraga: 'Har ni sökt bidrag i kommunen förut?',
    hjalp: 'Det säger oss om ni redan finns med i kommunens föreningsregister.',
    alternativ: [
      { id: 'ja', etikett: 'Ja, vi har sökt förut' },
      { id: 'nej', etikett: 'Nej, aldrig' },
      { id: 'osaker', etikett: 'Vet inte' },
    ],
  },

  // ---- BESKEDET: tre grupper, aldrig ett enda tal ----
  besked: {
    rubrik: 'Det här hittade vi för er förening',

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
      // Per bidrag: konkret vad som fattas. Mallar för de vanliga fallen:
      saknarTid: 'Kräver {krav} verksamhet — ni angav {angivet}. Det här löser sig med tiden.',
      saknarMedlemmar: 'Kräver minst {krav} medlemmar — ni angav {angivet}.',
      saknarTyp: 'Riktar sig till {krav}. Stämmer det in på er verksamhet? Justera svaret ovan.',
      saknarRegistrering: 'Kräver att föreningen är registrerad som bidragsberättigad i kommunen — se Börja här nedan.',
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
      hjalpKnapp: 'Hjälp oss registrera',
    },

    // Avslutning — kopplingen till föreningsminnet
    minne: 'Era svar sparas i er föreningsprofil. Nästa gång känner vi igen er, och ni ser direkt vad som är nytt sedan sist.',
  },

  // ---- Ansvarsraden (följer beskedet, bindande formulering) ----
  ansvar: 'Vi visar vad er förening matchar utifrån kommunens publicerade krav. Kommunen avgör själv om ni godkänns — vi förbereder, vi kan inte lova bifall.',
};
