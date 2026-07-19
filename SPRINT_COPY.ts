// SPRINT-COPY — helgen 18–20 juli 2026. Fable.
// Allt svenskt språk för beta-lanseringen. In i content.ts (eller egen fil
// mejl.ts för mejlmallarna — Codes val). Mallvariabler i {}.
// Register som alltid: sakligt, på kassörens sida, inga utropstecken.

// ============================================================
// BETA — etiketten och vad den betyder
// ============================================================
export const BETA = {
  badge: 'Beta',
  // Kort rad under/vid badgen där utrymme finns (t.ex. sidfot):
  rad: 'Föreningsguiden är i öppen beta. Allt är gratis medan vi bygger.',
  // Egen sektion på /om/ — ärlig deklaration:
  omRubrik: 'Om betan',
  omStycken: [
    'Föreningsguiden är i öppen beta. Det betyder att allt du ser är gratis att använda, att vi bygger vidare i högt tempo, och att enstaka saker kan vara ofärdiga eller ändras.',
    'Det som fungerar i dag: bidragsguider för 20 kommuner med verifierade uppgifter och källänkar, deadlinekalendern, och e-postbevakning som påminner innan sista ansökningsdag.',
    'Det som kommer: en tjänst som skriver utkast till er ansökan utifrån kommunens egna krav. Den öppnar senare i betan — du kan ställa dig på väntelistan redan nu.',
    'Hittar du fel, eller saknar du din kommun? Hör av dig till redaktionen. Betan blir bättre av varje påpekande.',
  ],
};

// ============================================================
// MEJLMALLAR — utskicksmotorn
// Avsändarnamn: "Föreningsguiden". Ingen no-reply — svar ska gå att skicka.
// Varje mejl slutar med avregistreringsrad (obligatorisk).
// ============================================================
export const MEJL = {
  // Gemensam sidfot i alla utskick:
  sidfot:
    'Du får det här mejlet för att den här adressen bevakar bidrag på Föreningsguiden. Vill du sluta bevaka? Avregistrera dig direkt: {avregLank} — då raderar vi adressen.',

  // --- 1. Bekräftelsemejl (dubbel opt-in — aktiverar den parkerade copyn) ---
  bekraftelse: {
    amne: 'Bekräfta er bevakning hos Föreningsguiden',
    body: [
      'Hej,',
      'Någon — förhoppningsvis du — har anmält den här adressen för att bevaka bidragsdeadlines i {kommunLista} hos Föreningsguiden.',
      'Klicka på länken för att bekräfta, så börjar bevakningen: {bekraftaLank}',
      'Var det inte du? Då kan du bortse från det här mejlet — utan bekräftelse sparar vi ingenting.',
    ],
  },

  // --- 2. Välkomstmejl (efter bekräftelse) ---
  valkomst: {
    amne: 'Bevakningen är igång',
    body: [
      'Hej,',
      'Nu bevakar vi {kommunLista} åt er. Så här fungerar det: vi mejlar två veckor före sista ansökningsdag för bidragen i era kommuner, och en gång till tre dagar före. Inget annat — inga nyhetsbrev, ingen reklam.',
      'Ett tips redan nu: kontrollera att föreningen är godkänd som bidragsberättigad i er kommun. I flera kommuner förfaller godkännandet tyst efter en tid, och utan det spelar deadlines ingen roll. Ni ser vad som gäller er kommun här: {kommunLank}',
      'Föreningsguiden är gratis under betan.',
    ],
  },

  // --- 3. Deadlinepåminnelse, två veckor före ---
  paminnelse14: {
    amne: 'Två veckor kvar: {bidragsnamn} i {kommun}',
    body: [
      'Hej,',
      'Den {datum} är sista ansökningsdag för {bidragsnamn} i {kommun}.',
      'Två saker att kontrollera i god tid: att föreningen är godkänd som bidragsberättigad (det är ett eget ärende med egen handläggningstid), och att ni har underlagen som krävs. Kraven, beloppen och länken till kommunens ansökan finns här: {bidragLank}',
      'Vi påminner en gång till tre dagar före.',
    ],
  },

  // --- 4. Deadlinepåminnelse, tre dagar före ---
  paminnelse3: {
    amne: 'Tre dagar kvar: {bidragsnamn} i {kommun}',
    body: [
      'Hej,',
      'På {veckodag} den {datum} stänger ansökan för {bidragsnamn} i {kommun}.',
      'Är ansökan inte inskickad än: allt ni behöver finns här — krav, belopp och länk till kommunens system: {bidragLank}',
      'En för sent inlämnad ansökan behandlas i många kommuner inte alls, så tre dagar är marginal, inte utrymme.',
    ],
  },

  // --- 5. Giltighetsvarning (kräver årsmötesdatum från giltighetskollen) ---
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

// ============================================================
// GILTIGHETSKOLLEN — widget på kommunsidan (station 3-området)
// Ny aha-yta. Ett datum in, ett besked ut, erbjudande om påminnelse.
// ============================================================
export const GILTIGHETSKOLL = {
  rubrik: 'Är er bidragsstatus fortfarande giltig?',
  intro: 'I {kommun} förfaller godkännandet som bidragsberättigad förening om det inte förnyas. Ange när föreningen senast hade årsmöte, så räknar vi ut var ni står.',
  datumLabel: 'Föreningens senaste årsmöte',
  knapp: 'Kontrollera',
  // Kommun med känd giltighetsregel — beräknat besked:
  svarRisk: 'Med årsmöte {arsmotesdatum} och regeln i {kommun} ({giltighetsregel}) kan er status ha förfallit eller vara nära att förfalla. Kontrollera i {system} att uppgifterna är uppdaterade — och gör det före nästa deadline, inte vid den.',
  svarOk: 'Med årsmöte {arsmotesdatum} bör er status vara giltig ännu en tid. Men den förfaller om den inte förnyas — {giltighetsregel}.',
  // Kommun utan känd giltighetsregel — ärligt besked, ingen beräkning:
  svarOkand: '{kommun} anger ingen tidsgräns för godkännandet i sina publicerade regler. Flera kommuner kräver ändå årlig uppdatering av föreningens uppgifter — kontrollera med kommunen. Vi har inte hittat en regel att räkna mot, så vi gissar inte.',
  // Erbjudandet (tratten till bevakningen):
  erbjudande: 'Vill ni att vi säger till i god tid innan statusen behöver förnyas?',
  erbjudandeKnapp: 'Ja, påminn oss',
  // (E-postfältet + samtycke återanvänder BEVAKNING-copyn.)
};

// ============================================================
// KOMMUNSIFFRAN — aha-rad överst på kommunsidan
// Renderas ENDAST där vi har utlämnad sammanställning (nu: Berg).
// Fylls på i takt med att fler kommuner lämnar ut.
// ============================================================
export const KOMMUNSIFFRA = {
  template: 'Förra året delade {antalForeningar} föreningar i {kommun} på {summa} kronor i {bidragstyp}.',
  kalla: 'Källa: kommunens egen sammanställning, utlämnad {utlamnadDatum}.',
  // Bergs värden (KS 2025/120): antalForeningar: 30, summa: '781 117',
  // bidragstyp: 'drift- och underhållsbidrag', utlamnadDatum: 'juli 2026'.
};

// ============================================================
// VÄNTELISTAN — station 5-knappen under betan
// Priset står. Klicket mäts. Beskedet ljuger inte.
// ============================================================
export const VANTELISTA = {
  // Knappen på station 5 (ersätter länken till kommunens system):
  knapp: 'Skapa utkast till ansökan',
  prisRad: '149 kr när tjänsten öppnar — gratis att ställa sig i kön',
  // Beskedet efter klick:
  rubrik: 'Utkasttjänsten öppnar senare i betan',
  besked: 'Vi bygger just nu tjänsten som skriver ett utkast till er ansökan utifrån {kommun}s egna krav. Den är inte öppen än — vi kalibrerar den mot verkliga ansökningar först, för att den ska hålla måttet.',
  cta: 'Lämna er e-postadress så säger vi till när den öppnar. Föreningar på väntelistan får prova först.',
  epostLabel: 'E-postadress',
  knappVantelista: 'Ställ oss i kön',
  kvitto: 'Ni står i kön. Vi hör av oss när utkasttjänsten öppnar — och inte om något annat.',
  // Ansvarsraden följer med även här:
  ansvar: 'Vi skriver utkastet. Ansökan lämnar ni in själva, och beslutet fattar kommunen.',
};
