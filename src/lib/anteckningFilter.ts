/**
 * anteckningFilter.ts — A1 (Jacob 2026-08-08). `Bidrag.anteckning` blandar
 * användarvänd kontext ("Ansökningsperiod 15 augusti–15 september...")
 * med QA-spår från extraktionspasset ("KÄLLKONFLIKT §2.5...",
 * "RESEARCH_SPEC_v2.md §2.4"), i samma fritextfält, utan separation —
 * 230 poster i 41 kommuner (mätt mot main 2026-08-08). Detta filtrerar
 * BORT processspråket vid RENDERING, aldrig i YAML-filerna (GPT arbetar
 * i dem — se A1 punkt 1: "Rör aldrig YAML-filerna").
 *
 * Spärr tills fältet delas i två (anteckning/qa_anteckning på sikt,
 * A1 punkt 3) — det här är inte den slutgiltiga lösningen, bara det
 * som stoppar läckaget innan en textrunda städar datan på riktigt.
 */

const PROCESSSPRAK_MONSTER: RegExp[] = [
  /RESEARCH_SPEC/i,
  /KÄLLKONFLIKT/i,
  /SAKNADES I FÖREGÅENDE/i,
  /föregående version/i,
  /uteslutningsskäl/i,
  /§\d+\.\d+/,
  // Diarienummer, t.ex. "KFN 2025/84-50"
  /[A-ZÅÄÖ]{2,4} \d{4}\/\d+/,
];

// Kända förkortningar som INTE ska tolkas som meningsslut — utan de här
// undantagen splittrar en naiv meningsdelare sönder text som
// "(bl.a. Ansjö Bygdegård, ...)" eller "(t.ex. Boverket)" mitt i en mening,
// eftersom ett stort begynnelsebokstav (ett egennamn) råkar följa punkten.
const FORKORTNINGAR = ['t.ex.', 'bl.a.', 'm.fl.', 'dvs.', 'resp.', 'nr.', 'st.', 'mm.', 'ca.', 'jfr.', 'osv.'];

function slutarPaForkortning(text: string): boolean {
  const nedre = text.toLowerCase();
  return FORKORTNINGAR.some((f) => nedre.endsWith(f));
}

/** Delar text på meningsgräns (punkt/utrop/fråga + mellanslag + versal), men slår aldrig isär en känd förkortning. */
export function delaIMeningar(text: string): string[] {
  const rader = text.split(/(?<=[.!?])\s+(?=[A-ZÅÄÖ])/);
  const meningar: string[] = [];
  for (const rad of rader) {
    const forra = meningar[meningar.length - 1];
    if (forra !== undefined && slutarPaForkortning(forra)) {
      meningar[meningar.length - 1] = `${forra} ${rad}`;
    } else {
      meningar.push(rad);
    }
  }
  return meningar;
}

export interface AnteckningFilterResultat {
  /** Kvarvarande text efter filtrering, eller null om allt filtrerades bort. */
  kvar: string | null;
  /** Meningar som stryktes, i originalordning — underlag för textrundan. */
  strukna: string[];
}

/** Stryker processspråk ur anteckning-fältet, mening för mening. Rör aldrig källan — bara vad som renderas. */
export function strippaProcessSprak(anteckning: string | null): AnteckningFilterResultat {
  if (!anteckning) return { kvar: null, strukna: [] };

  const meningar = delaIMeningar(anteckning.trim());
  const strukna: string[] = [];
  const behallna: string[] = [];

  for (const mening of meningar) {
    if (PROCESSSPRAK_MONSTER.some((monster) => monster.test(mening))) {
      strukna.push(mening.trim());
    } else if (mening.trim()) {
      behallna.push(mening);
    }
  }

  const kvar = behallna.join(' ').trim();
  return { kvar: kvar || null, strukna };
}
