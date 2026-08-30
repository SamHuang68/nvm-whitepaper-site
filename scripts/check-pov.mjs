import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pov = JSON.parse(fs.readFileSync(path.join(root, 'governance', 'pov-contract.json'), 'utf8'));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const paper = fs.readFileSync(path.join(root, 'src', 'data', 'phase2_paper.js'), 'utf8');
const reader = fs.readFileSync(path.join(root, 'src', 'js', 'modules', 'phase2_reader.js'), 'utf8');
const metadata = fs.readFileSync(path.join(root, 'src', 'data', 'phase4_metadata.js'), 'utf8');
const failures = [];

for (const binding of [
  `data-pov-contract-id="${pov.aggregateContractId}"`,
  `data-pov-scope-id="${pov.scopeId}"`,
  `data-artifact-mode="${pov.artifactMode}"`,
  `data-accountable-owner-key="${pov.authorPersonKey}"`
]) if (!html.includes(binding)) failures.push(`index.html lacks ${binding}`);
if (!paper.includes(`author: '${pov.authorDisplayName}'`)) failures.push('whitepaper author is not bound to the accountable person');
if (!paper.includes(`editorialPublisher: '${pov.editorialPublisherDisplayName}'`)) failures.push('editorial publisher is not declared separately');
if (!paper.includes(`povContractId: '${pov.aggregateContractId}'`)) failures.push('whitepaper data lacks aggregate POV contract');
if (!paper.includes(`povScopeId: '${pov.scopeId}'`)) failures.push('whitepaper data lacks scoped POV ID');
const hasAuthorBinding = reader.includes('<dt>AUTHOR</dt>') || reader.includes("U('whitepaper.author')");
const hasPublisherBinding = reader.includes('<dt>EDITORIAL PUBLISHER</dt>') || reader.includes("U('whitepaper.publisher')");
if (!hasAuthorBinding || !hasPublisherBinding || reader.includes('EDITORIAL OWNER')) failures.push('reader conflates author and editorial publisher');
for (const forbidden of ['ContentOwnerUPN', 'Content Owner UPN', 'EDITORIAL OWNER']) if (`${metadata}\n${reader}`.includes(forbidden)) failures.push(`public artifact contains forbidden unresolved identity field: ${forbidden}`);

if (failures.length) {
  console.error(`POV gate failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  process.exit(1);
}
console.log(`PASS: ${pov.scopeId} separates author, editorial publisher and public migration keys.`);
