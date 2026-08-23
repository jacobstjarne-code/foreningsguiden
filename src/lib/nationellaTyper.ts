import type { Datatillstand, DeadlineTyp, Kategori, Verksamhet } from './kommunTyper.ts';

export const STOD_NIVAER = ['kommunal', 'nationell'] as const;
export type StodNiva = (typeof STOD_NIVAER)[number];

/**
 * Gemensam identitet för sådant som kan renderas, bevakas eller länkas.
 * Nationella stöd får avsiktligt aldrig ett kommunSlug-sentinelvärde.
 */
export type StodRef =
  | { niva: 'kommunal'; kommunSlug: string; bidragId: string }
  | { niva: 'nationell'; stodId: string };

export interface NationellKalla {
  id: string;
  titel: string;
  url: string;
  last_datum: string;
  giltig_fran: string | null;
  kalltyp: 'foreskrift' | 'informationssida' | 'faq';
}

export interface NationelltKrav {
  id: string;
  text: string;
  kalla_id: string;
}

export interface NationellRedovisningsperiod {
  fran: string; // MM-DD
  till: string; // MM-DD
  ar_relation: 'samma_ar' | 'foregaende_ar';
}

export interface NationellDeadline {
  datum: string; // MM-DD, samma återkommande mekanik som kommunbidragen
  avser: NationellRedovisningsperiod;
  kalla_id: string;
}

export interface NationellaDeadlines {
  typ: Extract<DeadlineTyp, 'fasta'>;
  datum: string[];
  perioder: NationellDeadline[];
}

export interface BeloppTillfalle {
  tillfalle: number;
  belopp_ore: number;
}

export interface Deltagarstodstrappa {
  id: string;
  alder_min: number;
  alder_max: number | null;
  tillampen: string | null;
  tillfallen: BeloppTillfalle[];
}

export interface NationellBeloppstrappa {
  typ: 'trappa';
  valuta: 'SEK';
  ledarstod: {
    en_ledare_ore: number;
    tva_eller_fler_ledare_ore: number;
    enhet: 'per_aktivitet';
  };
  deltagarstod: Deltagarstodstrappa[];
  kalla_id: string;
}

export interface Sanktionsperiod {
  fran: string; // MM-DD
  till: string | null; // null = från och med, utan publicerat slut i T1
}

export interface Sanktionsteg {
  perioder: Sanktionsperiod[];
  pafoljd: 'reducering' | 'avslag';
  reducering_procent: number | null;
}

export interface Sanktionstrappa {
  status: Datatillstand;
  steg: Sanktionsteg[];
  undantag: string;
  kalla_id: string;
}

export interface SystembyteFlagga {
  typ: 'systembyte';
  status: Datatillstand;
  galler_fran: string; // YYYY-MM eller YYYY-MM-DD
  system_fore: string;
  system_efter: string;
  beskrivning: string;
  kalla_id: string;
}

export interface Behorighetsflagga {
  typ: 'behorighet';
  status: Datatillstand;
  galler_fran: string;
  omfattning: 'idrottsarenan_ekonomiska_stod';
  kravd_roll: string;
  e_legitimation: 'Freja+';
  beskrivning: string;
  aktiveras_for_stodet_vid_flagga: 'systembyte';
  kalla_id: string;
}

export type NationellDataflagga = SystembyteFlagga | Behorighetsflagga;

export interface NationelltStod {
  id: string;
  namn: string;
  niva: 'nationell';
  omfattning: { kommuner: 'alla'; antal_kommuner: 290 };
  status: 'aktiv' | 'pausad' | 'avskaffat';
  kategori: Kategori[];
  foreningstyp: Verksamhet[] | null;
  malgrupp: string;
  ansokningssystem: { namn: string; url: string };

  krav: NationelltKrav[];
  krav_status: Datatillstand;
  krav_fullstandiga: boolean | null;
  deadlines: NationellaDeadlines;
  deadline_status: Datatillstand;
  belopp: NationellBeloppstrappa;
  belopp_status: Datatillstand;
  belopp_avser: 'per_forening';

  sanktionstrappa: Sanktionstrappa;
  dataflaggor: NationellDataflagga[];
  qa_anteckning: string | null;

  kalla_url: string;
  kallor: NationellKalla[];
  senast_verifierad: string;

  /** Nationella stöd säljs aldrig som kommunalt bidragsutkast. */
  kopbar: false;
}

export interface NationellDeadlineEntry {
  ref: Extract<StodRef, { niva: 'nationell' }>;
  niva: 'nationell';
  stodId: string;
  stodNamn: string;
  kategori: Kategori[];
  isLopande: false;
  dateISO: string;
  deadlineStatus: Datatillstand;
}
