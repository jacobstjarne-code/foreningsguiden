/**
 * kopExport.ts — H16 (SPEC: Det som återstår, 2026-07-28): docx/pdf-
 * nedladdning av det köpta underlaget (mina-sidor/kop/[session]/). Ren
 * rendering av redan validerat innehåll (RegistreringsUtkastRad[],
 * Bilagepost[]) — ingen ny svensk text skrivs här, bara samma strängar
 * som redan renderas i mejlet/sidan (samma "Code skriver ingen egen
 * text"-princip som mejl.ts filhuvud).
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { RegistreringsUtkastRad } from './utkastGenerator';
import type { Bilagepost } from './kopDokument';

export interface KopDokumentInnehall {
  kommunNamn: string;
  checklista: RegistreringsUtkastRad[];
  bilagor: Bilagepost[];
  ansokningssystemNamn: string;
  ansokningssystemUrl: string;
  ansvarsrad: string;
}

export async function genereraKopDocx(innehall: KopDokumentInnehall): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({ text: `Registreringschecklista — ${innehall.kommunNamn}`, heading: HeadingLevel.TITLE }),
  ];

  innehall.checklista.forEach((rad, i) => {
    children.push(new Paragraph({ text: `${i + 1}. ${rad.vad}`, heading: HeadingLevel.HEADING_2 }));
    children.push(new Paragraph({ children: [new TextRun(rad.beskrivning)] }));
    children.push(new Paragraph({ children: [new TextRun(rad.ledtidText)] }));
    if (rad.giltighetText) children.push(new Paragraph({ children: [new TextRun(rad.giltighetText)] }));
    children.push(new Paragraph({ children: [new TextRun({ text: `Källa: ${rad.kallaUrl}`, italics: true })] }));
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

export async function genereraKopPdf(innehall: KopDokumentInnehall): Promise<Uint8Array> {
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

  skrivRad(`Registreringschecklista — ${innehall.kommunNamn}`, { font: fontBold, storlek: 16 });
  y -= 6;

  innehall.checklista.forEach((rad, i) => {
    nyRadOmBehovs(30);
    skrivRad(`${i + 1}. ${rad.vad}`, { font: fontBold, storlek: 12 });
    skrivRad(rad.beskrivning);
    skrivRad(rad.ledtidText);
    if (rad.giltighetText) skrivRad(rad.giltighetText);
    skrivRad(`Källa: ${rad.kallaUrl}`, { font: fontItalic, farg: [0.35, 0.35, 0.35] });
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
