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

/** Sökbar funktionsrad — för header/hero, INTE lockupen. Nära söktermen. */
export const FUNKTIONSRAD = 'Kommunala föreningsbidrag, samlade';

/** Global site-title-suffix (Base.astro sätter "{sidtitel} — Föreningsguiden"). */
export const SITE_NAMN = 'Föreningsguiden';

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
