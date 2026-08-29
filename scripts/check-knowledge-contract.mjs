import { phase2Whitepaper } from '../src/data/phase2_paper.js';
import { phase4Metadata } from '../src/data/phase4_metadata.js';
import { readFile } from 'node:fs/promises';

const failures = [];
const isHttps = (value) => /^https:\/\//u.test(value ?? '');
const pov = JSON.parse(await readFile(new URL('../governance/pov-contract.json', import.meta.url), 'utf8'));
const evidenceLabels = new Set(pov.evidenceTaxonomyLabels);
const actorLabels = new Set(pov.actorTaxonomyLabels);

if (phase2Whitepaper.chapters.length !== 5) failures.push(`expected 5 whitepaper chapters, found ${phase2Whitepaper.chapters.length}`);
for (const chapter of phase2Whitepaper.chapters) {
  const label = chapter.id || 'unnamed chapter';
  for (const field of ['evidenceClass', 'limitation', 'openValidation']) {
    if (!String(chapter[field] ?? '').trim()) failures.push(`${label} missing ${field}`);
  }
  if (!evidenceLabels.has(chapter.evidenceClass)) failures.push(`${label} uses non-canonical evidenceClass ${chapter.evidenceClass}`);
  if (!Array.isArray(chapter.sources) || !chapter.sources.length) failures.push(`${label} has no source binding`);
  for (const source of chapter.sources ?? []) {
    if (!source.id || !source.label || !source.evidenceClass || !source.actor || !isHttps(source.url)) failures.push(`${label} has an incomplete source contract`);
    if (!evidenceLabels.has(source.evidenceClass)) failures.push(`${label}/${source.id} uses non-canonical evidenceClass ${source.evidenceClass}`);
    if (!actorLabels.has(source.actor)) failures.push(`${label}/${source.id} uses non-canonical actor ${source.actor}`);
  }
}
const ownerNote = phase2Whitepaper.chapters.flatMap((chapter) => chapter.sources ?? []).find((source) => source.id === 'OWNER-NOTE-PGM-IO-001');
if (!ownerNote || ownerNote.sourceRole !== 'owner-provided' || ownerNote.actor !== 'Author' || ownerNote.evidenceClass !== 'Bounded inference') {
  failures.push('OWNER-NOTE-PGM-IO-001 is not independently identified and scoped');
}

if (JSON.stringify(phase4Metadata.evidenceTaxonomy) !== JSON.stringify(pov.evidenceTaxonomyLabels)) failures.push('SharePoint EvidenceClass taxonomy diverges from POV governance');
if (JSON.stringify(phase4Metadata.actorTaxonomy) !== JSON.stringify(pov.actorTaxonomyLabels)) failures.push('SharePoint actor taxonomy diverges from POV governance');

const canonicalFieldNames = [
  'Technology Family', 'State Contract', 'Application Domain', 'Process Node',
  'Evidence Class', 'Source', 'Limitation', 'Review Status'
];
if (phase4Metadata.canonicalFields.length !== canonicalFieldNames.length) failures.push(`expected ${canonicalFieldNames.length} canonical SharePoint fields`);
for (const name of canonicalFieldNames) {
  const field = phase4Metadata.canonicalFields.find((item) => item.field === name);
  if (!field) { failures.push(`missing canonical SharePoint field ${name}`); continue; }
  for (const key of ['internalKey', 'type', 'required', 'values', 'visibility', 'indexed']) {
    if (!(key in field) || (typeof field[key] === 'string' && !field[key].trim())) failures.push(`${name} missing ${key}`);
  }
}
const canonicalByKey = new Map(phase4Metadata.canonicalFields.map((field) => [field.internalKey, field]));
const canonicalKeys = phase4Metadata.canonicalFields.map((field) => field.internalKey);
const choiceKeys = ['TechnologyFamily', 'StateContract', 'ApplicationDomain', 'EvidenceClass', 'ReviewStatus'];
for (const key of choiceKeys) {
  if (!Array.isArray(canonicalByKey.get(key)?.values) || !canonicalByKey.get(key).values.length) failures.push(`${key} must expose machine-readable allowed values`);
}
for (const field of phase4Metadata.operationalFields) {
  for (const key of ['displayName', 'internalKey', 'type', 'required', 'visibility', 'indexed']) {
    if (!(key in field) || (typeof field[key] === 'string' && !field[key].trim())) failures.push(`operational field ${field.displayName ?? 'unknown'} missing ${key}`);
  }
}
if (phase4Metadata.publicRecords.length !== 3) failures.push(`expected 3 bounded public records, found ${phase4Metadata.publicRecords.length}`);
for (const record of phase4Metadata.publicRecords) {
  for (const key of ['RecordID', 'RecordRevision', 'Title', ...canonicalKeys, 'SourceID', 'SourceActor', 'LastReviewed', 'ReviewerKey', 'ContentOwnerKey', 'EditorialPublisherKey', 'Visibility', 'POVContractID', 'MigrationID']) {
    if (!String(record[key] ?? '').trim()) failures.push(`${record.RecordID ?? 'public record'} missing ${key}`);
  }
  if (!isHttps(record.SourceLocator)) failures.push(`${record.RecordID} SourceLocator must be HTTPS`);
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(record.LastReviewed ?? '')) failures.push(`${record.RecordID} LastReviewed must be YYYY-MM-DD`);
  if (!actorLabels.has(record.SourceActor)) failures.push(`${record.RecordID} uses non-canonical SourceActor ${record.SourceActor}`);
  for (const key of choiceKeys) {
    if (!canonicalByKey.get(key)?.values.includes(record[key])) failures.push(`${record.RecordID} ${key}=${record[key]} is outside the declared SharePoint taxonomy`);
  }
  if (/Public review complete/iu.test(record.ReviewStatus ?? '')) failures.push(`${record.RecordID} uses an unreceipted review-complete claim`);
  if (record.POVContractID !== phase4Metadata.povContractId) failures.push(`${record.RecordID} POVContractID diverges from package governance`);
  if (record.MigrationID !== record.RecordID) failures.push(`${record.RecordID} MigrationID does not round-trip its record identity`);
}

if (failures.length) {
  console.error(`Whitepaper/SharePoint knowledge-contract gate failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  process.exit(1);
}
console.log(`PASS: ${phase2Whitepaper.chapters.length} chapters and ${phase4Metadata.publicRecords.length} public records round-trip governed source, limitation, review and SharePoint metadata.`);
