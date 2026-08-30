import { readFile, readdir } from 'node:fs/promises';
import { extname } from 'node:path';
import { hasLocalizedValue, uiStrings } from '../src/data/i18n.js';
import { nvmIpSpecs } from '../src/data/nvm_specs.js';
import { phase1KnowledgeBase } from '../src/data/phase1_kb.js';
import { phase2Whitepaper } from '../src/data/phase2_paper.js';
import { phase3Templates } from '../src/data/phase3_templates.js';
import { phase4Metadata } from '../src/data/phase4_metadata.js';

const root = new URL('..', import.meta.url);
const failures = [];
const placeholders = (value) => [...String(value).matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((match) => match[1]).sort();

for (const [key, entry] of Object.entries(uiStrings)) {
  if (!entry || typeof entry.en !== 'string' || !entry.en.trim()) failures.push(`UI key ${key} is missing English`);
  if (!entry || typeof entry.zh !== 'string' || !entry.zh.trim()) failures.push(`UI key ${key} is missing Traditional Chinese`);
  if (JSON.stringify(placeholders(entry?.en)) !== JSON.stringify(placeholders(entry?.zh))) {
    failures.push(`UI key ${key} has mismatched interpolation placeholders`);
  }
}

const html = await readFile(new URL('index.html', root), 'utf8');
const markupKeys = [...html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map((match) => match[1]);
for (const key of markupKeys) {
  if (!uiStrings[key]) failures.push(`Markup references unknown i18n key: ${key}`);
}
if ((html.match(/class="language-option"/g) || []).length !== 2) failures.push('Exactly two language options are required');
if (!html.includes('hreflang="zh-Hant"')) failures.push('Traditional Chinese alternate-language link is missing');

async function collectJavaScript(url) {
  const entries = await readdir(url, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const child = new URL(entry.name + (entry.isDirectory() ? '/' : ''), url);
    if (entry.isDirectory()) return collectJavaScript(child);
    return extname(entry.name) === '.js' ? [child] : [];
  }));
  return files.flat();
}

for (const file of await collectJavaScript(new URL('src/js/', root))) {
  const source = await readFile(file, 'utf8');
  const codeKeys = [
    ...source.matchAll(/\bU\('([^']+)'/g),
    ...source.matchAll(/\bt\('([^']+)'/g)
  ].map((match) => match[1]);
  for (const key of codeKeys) {
    if (!uiStrings[key]) failures.push(`${file.pathname} references unknown i18n key: ${key}`);
  }
}

const missingContent = new Set();
const requireLocalized = (value) => {
  if (typeof value === 'string' && !hasLocalizedValue(value)) missingContent.add(value);
};

phase1KnowledgeBase.stateContracts.forEach((item) => ['contract', 'role', 'owner', 'updateCadence', 'selectionQuestion', 'evidenceBoundary'].forEach((field) => requireLocalized(item[field])));
phase1KnowledgeBase.technologyFamilies.forEach((item) => ['family', 'mechanism', 'strongestFit', 'processLens', 'limit', 'status'].forEach((field) => requireLocalized(item[field])));
phase1KnowledgeBase.processLenses.forEach((item) => ['range', 'title', 'body', 'decision'].forEach((field) => requireLocalized(item[field])));
phase1KnowledgeBase.selectionSequence.forEach((item) => ['name', 'detail'].forEach((field) => requireLocalized(item[field])));

['title', 'subtitle', 'version'].forEach((field) => requireLocalized(phase2Whitepaper[field]));
phase2Whitepaper.chapters.forEach((chapter) => {
  ['title', 'lede', 'evidenceClass', 'limitation', 'openValidation'].forEach((field) => requireLocalized(chapter[field]));
  chapter.paragraphs.forEach(requireLocalized);
  chapter.takeaways.forEach(requireLocalized);
  chapter.sources.forEach((source) => ['label', 'evidenceClass', 'actor'].forEach((field) => requireLocalized(source[field])));
});

phase3Templates.forEach((template) => {
  ['type', 'title', 'targetAudience', 'summary'].forEach((field) => requireLocalized(template[field]));
  template.sections.forEach((section) => {
    requireLocalized(section.heading);
    requireLocalized(section.body);
  });
});

phase4Metadata.canonicalFields.forEach((field) => {
  ['field', 'type', 'visibility', 'purpose', 'example'].forEach((key) => requireLocalized(field[key]));
  (Array.isArray(field.values) ? field.values : [field.values]).forEach(requireLocalized);
});
phase4Metadata.operationalFields.forEach((field) => ['displayName', 'type', 'visibility'].forEach((key) => requireLocalized(field[key])));
phase4Metadata.publicRecords.forEach((record) => ['Title', 'TechnologyFamily', 'StateContract', 'ApplicationDomain', 'ProcessNode', 'EvidenceClass', 'Limitation', 'ReviewStatus', 'SourceActor', 'Visibility'].forEach((key) => requireLocalized(record[key])));

nvmIpSpecs.forEach((profile) => {
  ['profile', 'applicationDomain', 'processNode', 'family', 'contract', 'nodeLens', 'updateModel', 'strongestFit', 'boundary', 'evidenceClass', 'sourceActor', 'reviewStatus', 'scope', 'limitation', 'openValidation'].forEach((field) => requireLocalized(profile[field]));
});

if (missingContent.size) {
  failures.push('Missing Traditional Chinese display values:\n' + [...missingContent].sort().map((value) => `  - ${value}`).join('\n'));
}

if (failures.length) {
  console.error('i18n contract failed:\n' + failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`i18n contract passed: ${Object.keys(uiStrings).length} UI keys, ${markupKeys.length} static bindings, full governed-display coverage.`);
