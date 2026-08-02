/**
 * kopExport.ts — H16 (SPEC: Det som återstår, 2026-07-28): docx/pdf-
 * nedladdning av det köpta underlaget (mina-sidor/kop/[session]/). Ren
 * rendering av redan validerat innehåll — ingen ny svensk text skrivs
 * här, bara samma strängar som redan renderas i mejlet/sidan (samma
 * "Code skriver ingen egen text"-princip som mejl.ts filhuvud).
 *
 * DokumentInnehall (2026-07-30, bidragsutkastet — CODE_UPPDRAG_
 * KOMMERSIELL §1.B): en delad mellanrepresentation ("sektioner", vad
 * varje krav/steg SÄGER) i stället för att docx/pdf-renderarna kände
 * till RegistreringsUtkastRad[] respektive UtkastKravRad[] var för sig.
 * checklistaTillDokument()/bidragsutkastTillDokument() gör mappningen —
 * en sanning för hur ett dokument ser ut, oavsett vilken produkt det kom
 * ifrån.
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
import type { RegistreringsUtkastRad, UtkastDokument } from './utkastGenerator';
import type { Bilagepost } from './kopDokument';
import type { Foreningsuppgifter } from './kop';
import { foreningsuppgifterSektion } from './kopDokument';

export interface DokumentSektion {
  rubrik: string;
  stycken: string[];
  kalla?: string; // renderas som egen kursiv "Källa: {kalla}"-rad
}

export interface DokumentInnehall {
  titel: string;
  sektioner: DokumentSektion[];
  bilagor: Bilagepost[];
  ansokningssystemNamn: string;
  ansokningssystemUrl: string;
  ansvarsrad: string;
}

export function checklistaTillDokument(
  kommunNamn: string,
  checklista: RegistreringsUtkastRad[],
  bilagor: Bilagepost[],
  ansokningssystemNamn: string,
  ansokningssystemUrl: string,
  ansvarsrad: string,
  foreningsuppgifter?: Foreningsuppgifter
): DokumentInnehall {
  return {
    titel: `Registreringschecklista — ${kommunNamn}`,
    // §0 — föreningsuppgifterna som en egen, första sektion (ingen
    // radnumrering, det är inte ett krav ur kommunens checklista, det är
    // formulärdata om FÖRENINGEN själv).
    sektioner: [
      foreningsuppgifterSektion(foreningsuppgifter),
      ...checklista.map((rad, i) => ({
        rubrik: `${i + 1}. ${rad.vad}`,
        stycken: [rad.beskrivning, rad.ledtidText, ...(rad.giltighetText ? [rad.giltighetText] : [])],
        kalla: rad.kallaUrl,
      })),
    ],
    bilagor,
    ansokningssystemNamn,
    ansokningssystemUrl,
    ansvarsrad,
  };
}

export function bidragsutkastTillDokument(
  doc: UtkastDokument,
  bilagor: Bilagepost[],
  ansokningssystemNamn: string,
  ansokningssystemUrl: string
): DokumentInnehall {
  return {
    titel: `Utkast till ansökan — ${doc.bidragNamn} (${doc.kommun})`,
    sektioner: doc.kravRader.map((rad, i) => ({
      rubrik: `${i + 1}. ${rad.kravText}`,
      stycken: [rad.innehall],
    })),
    bilagor,
    ansokningssystemNamn,
    ansokningssystemUrl,
    ansvarsrad: doc.ansvarsrad,
  };
}

export async function genereraKopDocx(innehall: DokumentInnehall): Promise<Buffer> {
  const children: Paragraph[] = [new Paragraph({ text: innehall.titel, heading: HeadingLevel.TITLE })];

  innehall.sektioner.forEach((sektion) => {
    children.push(new Paragraph({ text: sektion.rubrik, heading: HeadingLevel.HEADING_2 }));
    sektion.stycken.forEach((stycke) => children.push(new Paragraph({ children: [new TextRun(stycke)] })));
    if (sektion.kalla) {
      children.push(new Paragraph({ children: [new TextRun({ text: `Källa: ${sektion.kalla}`, italics: true })] }));
    }
    children.push(new Paragraph({ text: '' }));
  });

  if (innehall.bilagor.length > 0) {
    children.push(new Paragraph({ text: 'Underlag som nämns i kraven', heading: HeadingLevel.HEADING_1 }));
    for (const b of innehall.bilagor) {
      children.push(new Paragraph({ text: `${b.etikett} (nämnt under: ${b.kallaVad})`, bullet: { level: 0 } }));
    }
    children.push(new Paragraph({ text: '' }));
  }

  children.push(
    new Paragraph({
      text: `Ansökan lämnas in via: ${innehall.ansokningssystemNamn} (${innehall.ansokningssystemUrl})`,
    })
  );
  children.push(new Paragraph({ children: [new TextRun({ text: innehall.ansvarsrad, italics: true })] }));

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}

const SIDMARGINAL = 56;
const RADHOJD = 15;

function wrapText(font: PDFFont, storlek: number, text: string, maxBredd: number): string[] {
  const ord = text.split(/\s+/).filter(Boolean);
  const rader: string[] = [];
  let aktuell = '';
  for (const w of ord) {
    const kandidat = aktuell ? `${aktuell} ${w}` : w;
    if (font.widthOfTextAtSize(kandidat, storlek) > maxBredd && aktuell) {
      rader.push(aktuell);
      aktuell = w;
    } else {
      aktuell = kandidat;
    }
  }
  if (aktuell) rader.push(aktuell);
  return rader;
}

export async function genereraKopPdf(innehall: DokumentInnehall): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  let page = pdf.addPage();
  let { width, height } = page.getSize();
  let y = height - SIDMARGINAL;
  const maxBredd = width - SIDMARGINAL * 2;

  function nyRadOmBehovs(marginal = RADHOJD) {
    if (y < SIDMARGINAL + marginal) {
      page = pdf.addPage();
      ({ width, height } = page.getSize());
      y = height - SIDMARGINAL;
    }
  }

  function skrivRad(text: string, opts: { font?: PDFFont; storlek?: number; farg?: [number, number, number] } = {}) {
    const f = opts.font ?? font;
    const storlek = opts.storlek ?? 10;
    const farg = opts.farg ?? [0, 0, 0];
    for (const rad of wrapText(f, storlek, text, maxBredd)) {
      nyRadOmBehovs();
      page.drawText(rad, { x: SIDMARGINAL, y, size: storlek, font: f, color: rgb(...farg) });
      y -= RADHOJD;
    }
  }

  skrivRad(innehall.titel, { font: fontBold, storlek: 16 });
  y -= 6;

  innehall.sektioner.forEach((sektion) => {
    nyRadOmBehovs(30);
    skrivRad(sektion.rubrik, { font: fontBold, storlek: 12 });
    sektion.stycken.forEach((stycke) => skrivRad(stycke));
    if (sektion.kalla) skrivRad(`Källa: ${sektion.kalla}`, { font: fontItalic, farg: [0.35, 0.35, 0.35] });
    y -= 8;
  });

  if (innehall.bilagor.length > 0) {
    nyRadOmBehovs(24);
    skrivRad('Underlag som nämns i kraven', { font: fontBold, storlek: 13 });
    for (const b of innehall.bilagor) {
      skrivRad(`– ${b.etikett} (nämnt under: ${b.kallaVad})`);
    }
    y -= 8;
  }

  skrivRad(`Ansökan lämnas in via: ${innehall.ansokningssystemNamn} (${innehall.ansokningssystemUrl})`);
  skrivRad(innehall.ansvarsrad, { font: fontItalic, farg: [0.35, 0.35, 0.35] });

  return pdf.save();
}
