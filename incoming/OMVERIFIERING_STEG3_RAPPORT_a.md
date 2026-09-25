# Passrapport — omverifiering steg 3, pass A

Session 1, 24–25 september 2026. Gren `omverifiering-steg3-a`, utgången från
`origin/release-2026-09-24`. Worktree `~/Desktop/code_projects/fg-omverif-steg3-a`.

## Läge

| | |
|---|---|
| Kommuner klara | 23 av 72 |
| Bidrag lästa | 301 av 705 |
| Rättade | 27 |
| Tillagda | 6 |
| Till browserkön | 0 |

Alla tjugotre är committade och pushade. Båda grindarna gröna före varje
commit, pre-commit-kroken grön på samtliga.

## Klara kommuner

| Kommun | Bidrag | Rättade | Not |
|---|---|---|---|
| Hammarö | 12 | 7 | senregeln saknades i sju poster |
| Katrineholm | 13 | 0 | |
| Sjöbo | 12 | 0 | webbplatsen omlagd, portalen lever |
| Mörbylånga | 19 | 0 | |
| Göteborg | 16 | 2 | beloppsnivå och extra höstutlysning |
| Köping | 8 | 0 | |
| Leksand | 14 | 0 | |
| Ulricehamn | 28 | 0 | delat verifierad-fält |
| Lilla Edet | 10 | 0 | nya bestämmelser nov 2025 |
| Umeå | 9 | 2 | belopp saknades, pott tillagd |
| Östersund | 17 | 0 | |
| Ale | 13 | 0 | ny riktlinje dec 2025 |
| Falköping | 9 | 0 | |
| Gällivare | 16 | 0 | |
| Hylte | 11 | 0 | |
| Jönköping | 23 | 6 | ett bidrag tillagt, deadline utan källa borttagen |
| Nykvarn | 12 | 3 | kommunen länkar en föråldrad riktlinje |
| Rättvik | 10 | 1 | bygdepengen var öppen för fel sökande |
| Sundsvall | 4 | 3 | vägbidragets längdkrav var vänt |
| Älvkarleby | 7 | 0 | två tillagda från blankettsidan |
| Åre | 10 | 2 | ett tillagt, lokalbidragets datum flyttat |
| Årjäng | 14 | 1 | ett tillagt, lönebidrag låg bara i dokumentlistan |
| Båstad | 14 | 0 | |

## Rättelser

**Hammarö, sju poster, `sen_ansokan`.** Före: "Ej angivet i källan".
Efter: "För sent inkomna ansökningar för övriga bidragstyper behandlas
inte." Källa: Regler för föreningsbidrag i Hammarö kommun, KF 2025-06-23
§84, punkt 3.2.2. Aktivitetsstödets egen trappa i 3.2.1 (10 procents
avdrag 1–7 dagar, 50 procent 8–14 dagar, därefter ingen beredning) stod
redan rätt.

**Göteborg, `goteborg-kultur-utjamningsbidrag`, `belopp`.** Före:
"Subventionen beräknas per genomfört och godkänt besök och betalas ut i
efterhand mot faktura." Efter: samma, men med de två publicerade nivåerna
100 kronor per besökande barn för produktion på fast plats när biljetten
sålts för minst 40 kronor inklusive moms, och 50 procent av priset vid
uppsökande eller såld produktion. Källa: kulturstödets sida för
utjämningsbidrag.

**Göteborg, `goteborg-lokalt-foreningsbidrag-sydvast`, `anteckning`.**
Tillagt att socialförvaltningen Sydväst hösten 2026 har en extra
utlysning på högst 25 000 kronor för kostnadsfria aktiviteter för
10–20-åringar mellan 27 oktober och 18 december, sista ansökningsdag
1 november. Den ligger på samma sida och inom samma stödform, så den är
noterad i posten i stället för att läggas till som egen.

**Umeå, `umea-trygga-idrottsplatser`, `belopp`.** Före: "Stödbeloppet
bestäms efter prövning; kommunen publicerar ingen beloppsnivå." Efter:
"Upp till 1 500 kronor per genomfört tillfälle, högst 20 000 kronor per
förening." `belopp_status` från ingen_regel till kontrollast. Källa:
kommunens sida för trygga idrottsplatser.

**Umeå, `umea-landsbygdsstod-llu`, `belopp`.** Kompletterat med att den
totala årsbudgeten är 395 000 kronor, utöver de 35 000 kronor per projekt
som redan stod. Källa: sidan om stöd till landsbygdsutveckling.

**Jönköping, `jonkoping-investeringsbidrag`, `deadlines`.** Före: 1 oktober
och 31 december. Efter: bara 1 oktober. Den andra fristen finns inte i
källan. Riktlinjen har stort investeringsbidrag (investeringskostnad från
100 000 kr, tak 2 mkr) senast 1 oktober och litet investeringsbidrag
(10 000–100 000 kr) löpande under året. Båda står nu i anteckningen.
`belopp_status` ingen_regel till kontrollast: procentnivåerna 50 och 70
samt taket står i källan.

**Jönköping, tre anteckningar med läckt platshållartext.** `anteckning`
slutade i fragmentet "Ej angivet i källan" på aktivitetsbidraget och
investeringsbidraget, och var bara den frasen på det långsiktiga
verksamhetsbidraget. Två `sen_ansokan` bar "Ansökningsfristen är inte
verifierad. Kontrollera kommunens aktuella information."

**Jönköping, `jonkoping-studieforbund`, TILLAGT.** Kommunbidrag till
studieförbund, sista ansökningsdag 2 maj, har egen sida i bidragsmenyn men
saknades i filen. Grundbidrag 75 procent av anslaget som ligger fast två
år, rörligt bidrag 25 procent som omfördelas årligen. Hittad genom att
läsa menyn via sitemap — sidnavigeringen exponerar inte syskonsidorna.
Idépeng är däremot inte tillagd: riktlinjens 3.7 säger att
"Föreningar/organisationer får inte söka bidraget".

**Nykvarn, `nykvarn-aktivitetsbidrag`, källkonflikt i anteckningen.**
Kommunens sida Föreningsbidrag länkar riktlinjerna som antogs 2024-01-17,
där beloppet är 8 kronor per deltagare. Den riktlinje kultur- och
fritidsnämnden reviderade 2025-12-09 anger 10 kronor. Vårt belopp och vår
`kalla_url` pekar på den gällande versionen, men en kassör som klickar
kommunens länk får fel siffra, så konflikten står i anteckningen.

**Nykvarn, `nykvarn-arets-forening`, `deadline_status`.** Kontrollast till
olast. Källan är en nyhet om 2025 års priser med sista dag 8 februari 2026.
Att priserna delas ut varje år står där, men inte att datumet återkommer.

**Rättvik, `rattvik-bygdepeng-dalfors-orebygden`.** Posten sa att stödet
"kan sökas av både föreningar och privatpersoner" och hade privatpersoner i
`malgrupp`. Ansökningsblanketten, som kommunens sida pekar ut som
villkorskälla, säger motsatsen: bara registrerade föreningar och
organisationer, inte företag eller privatpersoner. Följdrättelser ur samma
blankett: taket 100 000 kr per sökande och år (`belopp_avser` ren_pott till
per_forening), och `kommunens_pott` som sa "300 000 kr per år" utan källa —
potten är en andel av bruttoersättningen från Hedbobergets vindkraftverk
och varierar; enda publicerade siffran är 405 000 kr för 2023.

**Sundsvall, `sundsvall-vagbidrag`, `krav`.** Kravet sa att väglängden
"efter avdrag för de första 150 meterna" ska vara minst 293 meter. Källan
säger att den totala längden ska vara minst 293 meter, varefter 150 meter
dras av — kommunens eget räkneexempel visar det. Som posten stod hade en
väg på 443 meter sett bidragsberättigad ut. Även: upprustningsbidrag går
inte att söka alls, inte bara "inte kombineras", och taket på 15 procent av
statsbidraget saknades.

**Sundsvall, `sundsvall-stiftelser-fonder`, `deadlines`.** 31 augusti hörde
till Grafström-Sandqvistska konststipendiet, som bara enskilda konstnärer
kan söka, och är borttaget. 21 april och 28 oktober saknades och är
tillagda. Anteckningen kopplar nu varje datum till sin fond.

**Sundsvall, `sundsvall-medfinansiering-evenemang`, `krav`.** "Senast den
15:e i månaden före det kvartal" stämde inte — fristerna ligger ungefär sex
veckor före. De fyra datumen står nu utskrivna.

**Åre, `are-lokalbidrag`, `deadlines`.** 31 maj till 30 mars. Kommunens sida
Föreningsstöd och bidrag, uppdaterad 27 maj 2026, räknar uttryckligen upp
Lokalbidrag under rubriken "Sista ansökningsdag den 30 mars gäller för". Den
särskilda portalomgång som gav 31 maj finns inte längre bland de öppna
formulären i are.e-serve.se. Skälet ligger i postens `qa_anteckning`.

**Åre, `are-elbidrag`, `deadline_status`.** Kontrollast till olast, se
12-31-avsnittet nedan.

**Årjäng, `arjang-investeringsstod`, `belopp_status`.** Kontrollast till olast.
Posten hävdar "högst 30 procent av den godkända totala investeringskostnaden",
men `kalla_url` är kultur- och fritidsnämndens protokoll 2024-05-07 där
riktlinjen ANTOGS, inte riktlinjen själv. Riktlinjen är inte publicerad på
arjang.se och stödet nämns inte på sidan Föreningsstöd. Värdet står kvar utan
anspråk.

## Tillagda bidrag

**Jönköping, `jonkoping-studieforbund`.** Se ovan.

**Älvkarleby, `alvkarleby-kultur-och-fritidspris`.** 10 000 kr till person
ELLER förening. Reglementet (SBN 2011-03-11 §42, reviderat 2026-02-08) säger
"Priset kan inte sökas" — det nomineras, samma form som Nykvarns Årets
förening. `deadline_status: olast`: 19 april gäller 2026 års nominering,
reglementet låter nämnden bestämma tidpunkten varje år.

**Älvkarleby, `alvkarleby-en-pase-pengar`.** Ungdomar 13-20 år som ordnar
arrangemang för andra barn och unga. Inte uteslutet som individstöd, eftersom
villkoren kräver "en juridisk person (exempelvis en förening)" bakom
arrangemanget — samma gräns som Jönköpings IdéJkpg och Lidköpings ungdomspeng.
Nykvarns Idépeng föll åt andra hållet: där står uttryckligen att föreningar
inte får söka.

**Åre, `are-evenemangsfond`.** Utvecklingsstöd för nytt eller befintligt
evenemang, länkat från samma bidragssida men hanterat av kommunstyrelsen.
Kommunen publicerar varken villkor, belopp eller ansökningsperiod utanför
e-tjänsten, så posten är ärligt tunn: `krav_fullstandiga: false`, belopp och
deadline `ingen_regel`.

**Årjäng, `arjang-lonebidrag`.** 3 000 kr per år vid 10 procents anställning
upp till 30 000 kr vid heltid, högst två årsarbetare per förening. Riktlinjen
ligger som relaterat dokument på sidan Föreningsstöd tillsammans med två
ansökningsmallar, men nämns inte i brödtexten — den syns bara i dokumentlistan
längst ned. Söks hos Ekonomiavdelningen, inte Kultur och Fritid.

## 12-31 som behållits, med citat ur källan

Regeln (Jacob 2026-09-25): 31 december godtas bara om datumet står
uttryckligen i källan. Två poster har prövats mot den hittills.

**Hylte, `hylte-arsbidrag-till-kulturforening` — behållet.** Bidragsnormer för
föreningsbidrag, KFN 2025-11-20, avsnitt ÅRSBIDRAG FÖR KULTURFÖRENINGAR,
under rubriken Ansökan: *"Ansökan om bidrag ska lämnas senast den 31 december
för nästkommande år."* Noterat: postens `kalla_url` pekar på tjänsteskrivelsen
om 2026 års fördelning, som bär potten 130 000 kr men inte ansökningsregeln.

**Åre, `are-elbidrag` — behållet, men `deadline_status` sänkt till olast.**
Portalen are.e-serve.se skriver under Elbidrag: *"Sista ansökningsdatum:
2026-12-31"*. Datumet står alltså i källan. Men samma kort anger *"Period: 01
januari 2024 - 31 december 2026"*, så datumet är slutet på formulärets
giltighet, inte en årlig frist. Datumet står kvar, anspråket är borta, och
anteckningen säger vad portalen faktiskt visar.

**Borttaget före regeln:** Jönköpings investeringsbidrag hade 12-31 som andra
datum utan stöd i riktlinjen. Det var fyndet som föranledde regeln.

**Mätning vid införandet:** 32 bidrag i 28 kommuner bär 12-31 i datan. De tas
vid den omverifiering som ändå ska göras, inte i ett eget svep.

## Punkt 2 — sådant som avviker

**Sjöbo har lagt om sin webbplats.** `sitemap.xml`, `foreningsliv.html`
och `foreningsstod.html` ger alla 404 och ingen bidragsmeny går att nå
från startsidan. Regelverks-PDF:en från 2018 och portalen
`sjobo.fri-go.se` lever däremot, och alla belopp och datum stämde.
Portalen listar femton stödformer mot filens tretton: skillnaden är att
portalen delar hyres-, investerings-, arrangemangs- och utvecklingsstöd
samt föreningsägd anläggning i var sin kultur- och fritidsvariant. Ingen
stödform saknas. Värt en egen kontroll om Sjöbo ska ha delade poster.

**Tre kommuner har nya styrdokument** som filen ändå stämde mot: Lilla
Edets bestämmelser från november 2025 (BIN 2025/449, gäller från 2026),
Ales riktlinje från kommunfullmäktige 2025-12-15 § 230 och Hammarös från
2025-06-23 § 84.

**Uppgifter som inte gick att belägga men inte heller motsägs** och
därför står kvar: Östersunds samlingslokalsdatum 30 maj (PDF:en saknar
ansökningsdag och kommunens två sidor ger 404), Falköpings
belysningsnivåer 75 procent, 3 000 kr och 750 kr per ljuspunkt, och
Gällivares 25 februari och 25 augusti för verksamhetsbidraget.

**Ingen kommun hade mer än hälften av bidragen ändrade** och inget
regressionsskydd fällde.

**Rättviks fyra e-tjänstsidor är serverrenderade** och gick att läsa med
curl. Ingen browserkö behövdes. Samma sak för Åres are.e-serve.se och
Båstads bastad.rbok.se, och för Älvkarlebys sjalvservice.alvkarleby.se.
Regeln ligger nu i ordern, punkt 2 i arbetsgången, så den gäller alla pass.

**Tre kommuner publicerar bidrag som deras egen bidragssida inte nämner.**
Jönköpings studieförbundsbidrag syns bara via sitemap, Älvkarlebys två via
blankettsidan och Årjängs lönebidrag bara i dokumentlistan längst ned på
sidan. Att läsa brödtexten på bidragssidan räcker inte — dokumentlistor,
blankettsidor och sitemap måste med.

## Två saker om arbetsgången

**Listan och skriptet är ospårade i `fg-production-batch-01`.** Ordern,
`OMVERIFIERING_STEG3_LISTA.md` och `omverif_steg3_lista.py` ligger bara i
arbetsträdet där, inte i någon commit, så en ny worktree från
`origin/release-2026-09-24` får dem inte med sig. Jag kopierade in dem
manuellt. Session 2 och 3 behöver göra detsamma.

**Två schemavarianter för datumfältet, som i steg 2.** De flesta filer
har `senast_verifierad` per bidrag. Ulricehamn har det inte alls utan bär
bara kommunens gemensamma `verifierad`. Ett skript som bara ersätter
befintliga rader bumpar då ingenting och commiten blir tom utan att något
syns. Kiruna, Kumla och Mjölby har samma mönster på delar av sina poster
och ligger kvar i passet.

En detalj till: filerna blandar `- id:` först i posten och `id:` sist.
Ett skript som letar `^\s*id:` missar de förra.

## Kvar i passet

49 kommuner, 404 bidrag. Nästa åtta i listans ordning: Bollebygd (16),
Botkyrka (1), Danderyd (12), Emmaboda (20), Essunga (11), Falkenberg (2),
Gislaved (1), Gullspång (3).
