import { readFile } from 'node:fs/promises';
import { matrixPackageMetadata, nvmIpSpecs } from '../src/data/nvm_specs.js';
import { phase4Metadata } from '../src/data/phase4_metadata.js';
import { buildGovernedRecords } from '../src/js/modules/matrix.js';

const pov = JSON.parse(await readFile(new URL('../governance/pov-contract.json', import.meta.url), 'utf8'));
const evidenceLabels = new Set(pov.evidenceTaxonomyLabels);
const actorLabels = new Set(pov.actorTaxonomyLabels);
const sharePointFields = new Map(phase4Metadata.canonicalFields.map((field) => [field.internalKey, field]));

const requiredMetadata = [
  'schemaVersion', 'packageId', 'packageRevision', 'povContractId', 'povScopeId',
  'accountableOwnerPersonKey', 'editorialPublisherKey', 'visibility'
];
const requiredRecordFields = [
  'id', 'profile', 'technologyFamilyKey', 'stateContractKey', 'applicationDomain', 'processNode',
  'family', 'contract', 'nodeLens', 'updateModel', 'strongestFit', 'boundary', 'evidenceClass',
  'sourceActor', 'reviewStatus', 'sourceId', 'sourceUrl', 'scope', 'limitation', 'reviewedDate', 'openValidation'
];
const failures = [];

for (const field of requiredMetadata) {
  if (!String(matrixPackageMetadata[field] ?? '').trim()) failures.push(`matrix package metadata missing ${field}`);
}
if (nvmIpSpecs.length !== 8) failures.push(`expected 8 governed profiles, found ${nvmIpSpecs.length}`);
const ids = new Set();
for (const [index, record] of nvmIpSpecs.entries()) {
  const label = record.id || `record[${index}]`;
  if (ids.has(record.id)) failures.push(`duplicate record ID ${record.id}`);
  ids.add(record.id);
  for (const field of requiredRecordFields) {
    if (!String(record[field] ?? '').trim()) failures.push(`${label} missing ${field}`);
  }
  if (!/^https:\/\//u.test(record.sourceUrl ?? '')) failures.push(`${label} sourceUrl must be HTTPS`);
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(record.reviewedDate ?? '')) failures.push(`${label} reviewedDate must be YYYY-MM-DD`);
  if (!evidenceLabels.has(record.evidenceClass)) failures.push(`${label} uses non-canonical evidenceClass ${record.evidenceClass}`);
  if (!actorLabels.has(record.sourceActor)) failures.push(`${label} uses non-canonical sourceActor ${record.sourceActor}`);
  for (const [key, value] of [['TechnologyFamily', record.technologyFamilyKey], ['StateContract', record.stateContractKey], ['ApplicationDomain', record.applicationDomain], ['EvidenceClass', record.evidenceClass], ['ReviewStatus', record.reviewStatus]]) {
    if (!sharePointFields.get(key)?.values?.includes(value)) failures.push(`${label} ${key}=${value} cannot round-trip through the SharePoint contract`);
  }
}

const serialized = JSON.stringify(nvmIpSpecs);
const unsupportedPrecision = [
  ['shipment-scale claim', /\b\d+(?:\.\d+)?\s*[BM]\+?\s+(?:devices|units)(?:\s+shipped)?\b/iu],
  ['unsupported readiness claim', /\b(?:silicon[- ]proven|foundry[- ]verified|deployment[- ]proven|qualified across)\b/iu],
  ['unsupported certification shorthand', /\b(?:PSA\s+L3|SESIP\s+L3|FIPS\s+140-2\s+Level\s+4)\b/iu],
  ['absolute mask claim', /\b(?:zero|0)\s+(?:extra\s+)?mask(?:s|\s+adder)?\b/iu],
  ['absolute bus claim', /"busExposure"\s*:\s*"None"/iu]
];
for (const [label, pattern] of unsupportedPrecision) {
  if (pattern.test(serialized)) failures.push(`${label} must not appear without a record-specific primary-source contract`);
}

const renderer = await readFile(new URL('../src/js/modules/matrix.js', import.meta.url), 'utf8');
for (const visibleField of ['nodeLens', 'boundary', 'evidenceClass', 'sourceActor', 'sourceId', 'sourceUrl', 'scope', 'limitation', 'reviewedDate', 'openValidation']) {
  if (!renderer.includes(`item.${visibleField}`)) failures.push(`decision matrix does not visibly render ${visibleField}`);
}
for (const exportField of ['PackageContentSHA256', 'RecordRevision', 'RecordSHA256', 'POVContractID', 'POVScopeID', 'ContentOwnerKey', 'EditorialPublisherKey', 'Visibility', 'LastReviewed', 'MigrationID']) {
  if (!renderer.includes(exportField)) failures.push(`matrix export lineage missing ${exportField}`);
}
if (!renderer.includes("crypto.subtle.digest('SHA-256'")) failures.push('matrix export does not compute SHA-256 lineage');

const governed = await buildGovernedRecords(nvmIpSpecs);
const canonicalKeys = phase4Metadata.canonicalFields.map((field) => field.internalKey);
const operationalKeys = phase4Metadata.operationalFields.map((field) => field.internalKey);
for (const record of governed) {
  for (const key of [...canonicalKeys, ...operationalKeys]) if (!String(record[key] ?? '').trim()) failures.push(`${record.RecordID} export missing SharePoint key ${key}`);
  for (const [key, field] of sharePointFields) {
    if (Array.isArray(field.values) && !field.values.includes(record[key])) failures.push(`${record.RecordID} export ${key}=${record[key]} is outside declared values`);
  }
  if (!/^[0-9a-f]{64}$/u.test(record.RecordSHA256) || !/^[0-9a-f]{64}$/u.test(record.PackageContentSHA256)) failures.push(`${record.RecordID} export hash lineage is invalid`);
}

if (failures.length) {
  console.error(`Decision-matrix evidence gate failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  process.exit(1);
}
console.log(`PASS: ${nvmIpSpecs.length} decision profiles expose bounded evidence, limitations, open validation and governed export lineage.`);
