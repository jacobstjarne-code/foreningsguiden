/**
 * Deterministisk apply av .fg-belopp-avser-H/PROPOSAL_REVIEWED.json.
 *
 * Modellen klassificerar och föreslår strängar. Det här skriptet är den
 * enda komponent som får skriva dem till YAML. Okända poster lämnas helt
 * orörda. Blandfall kräver både individuellt belopp och kommunens pott;
 * annars lämnas posten orörd i stället för att skriptet gissar en delning.
 *
 * Kör:
 *   node --experimental-strip-types scripts/migrate-belopp-avser-reviewed.ts
 *   node --experimental-strip-types scripts/migrate-belopp-avser-reviewed.ts --apply
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import yaml from 'js-yaml';

type Classification = 'ren_pott' | 'blandfall' | 'per_forening' | 'okand';
interface ProposalChange {
  slug: string;
  bidrag_id: string;
  namn: string;
  classification: Classification;
  individuellt_belopp: string | null;
  kommunens_pott: string | null;
  source_url: string;
  reason: string;
  review_verdict: 'accept' | 'revise' | 'uncertain';
}
interface Proposal { changes: ProposalChange[] }

const root = process.cwd();
const apply = process.argv.includes('--apply');
const proposalPath = resolve(root, '.fg-belopp-avser-H', 'PROPOSAL_REVIEWED.json');
const auditPath = resolve(root, 'BELOPP_AVSER_MIGRATION_AUDIT.json');
const proposal = JSON.parse(readFileSync(proposalPath, 'utf8')) as Proposal;

function scalar(value: string | null): string {
  if (value === null) return 'null';
  // JSON-strängar är giltiga YAML-skalärer och håller alltid hela värdet
  // på en rad. Det undviker js-yamls automatiska flerradsbrytning.
  return JSON.stringify(value);
}

function replaceBidragFields(
  source: string,
  bidragId: string,
  values: { belopp: string | null; belopp_avser: 'per_forening' | 'okand'; kommunens_pott: string | null },
): string {
  const escaped = bidragId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const idMatch = source.match(new RegExp(`^(?:- |  )id: ${escaped}\\s*$`, 'm'));
  if (!idMatch || idMatch.index === undefined) throw new Error(`Hittar inte bidrag ${bidragId}`);
  const previousItem = source.lastIndexOf('\n- ', idMatch.index);
  const start = idMatch[0].startsWith('- ') ? idMatch.index : previousItem === -1 ? 0 : previousItem + 1;
  const rest = source.slice(idMatch.index + idMatch[0].length);
  const endMatch = rest.match(/\n(?=- |[a-z_]+:)/);
  const end = endMatch?.index === undefined ? source.length : idMatch.index + idMatch[0].length + endMatch.index;
  let block = source.slice(start, end);
  block = block.replace(/^  (?:belopp_avser|kommunens_pott):.*\n/gm, '');
  // Befintliga fria belopp är ibland vikta över fortsättningsrader med
  // fyra mellanslag. Ersätt hela skalären, inte bara första raden.
  const beloppLine = /^  belopp:.*(?:\n    .*)*/m;
  if (!beloppLine.test(block)) throw new Error(`${bidragId} saknar belopp-fält`);
  block = block.replace(
    beloppLine,
    `  belopp: ${scalar(values.belopp)}\n  belopp_avser: ${values.belopp_avser}\n  kommunens_pott: ${scalar(values.kommunens_pott)}`,
  );
  return source.slice(0, start) + block + source.slice(end);
}

const bySlug = new Map<string, ProposalChange[]>();
for (const change of proposal.changes) {
  const list = bySlug.get(change.slug) ?? [];
  list.push(change);
  bySlug.set(change.slug, list);
}

const applied: Record<string, unknown>[] = [];
const skipped: Record<string, unknown>[] = [];
const changedFiles = new Set<string>();

for (const [slug, changes] of bySlug) {
  const relativePath = `data/kommuner/${slug}.yaml`;
  const filePath = resolve(root, relativePath);
  const currentText = readFileSync(filePath, 'utf8');
  const baselineText = execFileSync('git', ['show', `HEAD:${relativePath}`], { encoding: 'utf8' });
  const doc = yaml.load(baselineText) as { bidrag?: Array<Record<string, unknown>> };
  let afterText = baselineText;

  for (const change of changes) {
    const current = doc.bidrag?.find((b) => b.id === change.bidrag_id);
    if (!current) throw new Error(`Proposal pekar på saknad post ${slug}/${change.bidrag_id}`);
    if (current.namn !== change.namn) throw new Error(`Namn skiljer för ${slug}/${change.bidrag_id}`);
    if (current.kalla_url !== change.source_url) throw new Error(`Källa skiljer för ${slug}/${change.bidrag_id}`);
    if (change.review_verdict === 'uncertain') {
      skipped.push({ slug, bidrag_id: change.bidrag_id, classification: change.classification, reason: 'review_verdict_uncertain' });
      continue;
    }

    const currentBelopp = typeof current.belopp === 'string' ? current.belopp : null;
    let values: { belopp: string | null; belopp_avser: 'per_forening' | 'okand'; kommunens_pott: string | null } | null = null;
    let valueSource = 'proposal';

    if (change.classification === 'ren_pott') {
      const pott = change.kommunens_pott ?? currentBelopp;
      if (pott !== null) {
        values = { belopp: null, belopp_avser: 'okand', kommunens_pott: pott };
        if (change.kommunens_pott === null) valueSource = 'reviewed_classification+current_belopp';
      }
    } else if (change.classification === 'per_forening') {
      const individuellt = change.individuellt_belopp ?? currentBelopp;
      if (individuellt !== null) {
        values = { belopp: individuellt, belopp_avser: 'per_forening', kommunens_pott: null };
        if (change.individuellt_belopp === null) valueSource = 'reviewed_classification+current_belopp';
      }
    } else if (change.classification === 'blandfall') {
      if (change.individuellt_belopp !== null && change.kommunens_pott !== null) {
        values = {
          belopp: change.individuellt_belopp,
          belopp_avser: 'per_forening',
          kommunens_pott: change.kommunens_pott,
        };
      }
    }

    if (!values) {
      skipped.push({
        slug,
        bidrag_id: change.bidrag_id,
        classification: change.classification,
        reason: change.classification === 'okand' ? 'classification_okand' : 'reviewed_fields_incomplete',
      });
      continue;
    }

    afterText = replaceBidragFields(afterText, change.bidrag_id, values);
    applied.push({
      slug,
      bidrag_id: change.bidrag_id,
      classification: change.classification,
      review_verdict: change.review_verdict,
      value_source: valueSource,
      before: { belopp: currentBelopp },
      after: values,
      source_url: change.source_url,
    });
  }

  if (afterText !== baselineText) {
    changedFiles.add(relativePath);
    if (apply) {
      if (currentText !== baselineText && currentText !== afterText) {
        throw new Error(`${relativePath} innehåller andra lokala ändringar än denna migrering`);
      }
      if (currentText !== afterText) writeFileSync(filePath, afterText);
    }
  }
}

const countBy = (items: Record<string, unknown>[], key: string) =>
  Object.fromEntries([...new Set(items.map((x) => String(x[key])))].sort().map((value) => [value, items.filter((x) => String(x[key]) === value).length]));

const audit = {
  schema_version: 1,
  generated_for: '2026-08-16',
  proposal: '.fg-belopp-avser-H/PROPOSAL_REVIEWED.json',
  proposal_entries: proposal.changes.length,
  mode: apply ? 'apply' : 'dry-run',
  summary: {
    applied: applied.length,
    skipped: skipped.length,
    changed_files: changedFiles.size,
    applied_by_class: countBy(applied, 'classification'),
    skipped_by_reason: countBy(skipped, 'reason'),
  },
  invariants: {
    okand_entries_changed: 0,
    uncertain_entries_changed: 0,
    mixed_entries_require_both_values: true,
    yaml_targets_must_match_id_name_and_source: true,
  },
  changed_files: [...changedFiles].sort(),
  applied,
  skipped,
};

if (apply) writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`);
console.log(JSON.stringify(audit.summary, null, 2));
console.log(apply ? `Audit skriven: ${auditPath}` : 'Dry run — ingen fil ändrad.');
