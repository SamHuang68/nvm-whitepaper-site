import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const remote = process.argv.includes('--remote') || process.argv.includes('--live');
const live = process.argv.includes('--live');
const expectRelease = process.argv.includes('--expect-release') || remote;
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const failures = [];

function validateManifest(manifest, label, readArtifact) {
  if (manifest.schemaVersion !== '1.0' || manifest.site !== 'nvm-whitepaper-site') failures.push(`${label}: invalid manifest identity`);
  for (const field of ['repository', 'branch', 'commit', 'tree', 'commitTime']) if (!manifest.source?.[field]) failures.push(`${label}: source.${field} missing`);
  if (!Array.isArray(manifest.artifacts?.files) || !manifest.artifacts.files.length) failures.push(`${label}: artifact list missing`);
  const paths = new Set();
  for (const file of manifest.artifacts?.files ?? []) {
    if (!file.path || path.posix.isAbsolute(file.path) || file.path.includes('..') || file.path.includes('\\') || file.path === 'deploy-manifest.json') failures.push(`${label}: invalid artifact path ${file.path}`);
    const folded = file.path.toLowerCase();
    if (paths.has(folded)) failures.push(`${label}: duplicate/case-colliding artifact path ${file.path}`);
    paths.add(folded);
  }
  const computedSet = sha256((manifest.artifacts?.files ?? []).map((file) => `${file.path}\0${file.bytes}\0${file.sha256}\n`).join(''));
  if (computedSet !== manifest.artifacts?.artifactSetSHA256) failures.push(`${label}: artifact-set hash mismatch`);
  if (manifest.artifacts?.count !== manifest.artifacts?.files?.length) failures.push(`${label}: artifact count mismatch`);
  if (manifest.build?.base !== './') failures.push(`${label}: public base must be ./`);
  if (expectRelease && (manifest.releaseMode !== 'release' || manifest.source?.clean !== true)) failures.push(`${label}: expected a clean release-mode manifest`);
  for (const field of ['packageLockSHA256', 'povContractSHA256', 'hubGovernanceReferenceSHA256']) {
    if (expectRelease && !/^[0-9a-f]{64}$/u.test(manifest.inputs?.[field] ?? '')) failures.push(`${label}: inputs.${field} must be a SHA-256 digest`);
  }
  for (const file of manifest.artifacts?.files ?? []) {
    if (/(?:^|\/)(?:\.env(?:\.|$)|node_modules|src)(?:\/|$)|\.map$/iu.test(file.path)) failures.push(`${label}: forbidden public artifact ${file.path}`);
    const bytes = readArtifact(file.path);
    if (!bytes) { failures.push(`${label}: missing ${file.path}`); continue; }
    if (bytes.length !== file.bytes || sha256(bytes) !== file.sha256) failures.push(`${label}: hash/size mismatch for ${file.path}`);
  }
}

const localManifestPath = path.join(dist, 'deploy-manifest.json');
if (!fs.existsSync(localManifestPath)) throw new Error('dist/deploy-manifest.json is missing; run npm run build:pages first.');
const localManifestText = fs.readFileSync(localManifestPath, 'utf8');
const localManifest = JSON.parse(localManifestText);
validateManifest(localManifest, 'local dist', (relative) => {
  const target = path.resolve(dist, relative);
  if (!target.startsWith(`${dist}${path.sep}`) || !fs.existsSync(target) || fs.lstatSync(target).isSymbolicLink() || !fs.lstatSync(target).isFile()) return null;
  return fs.readFileSync(target);
});
const localPaths = fs.readdirSync(dist, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => path.relative(dist, path.join(entry.parentPath, entry.name)).replaceAll('\\', '/'))
  .sort();
const expectedLocalPaths = [...localManifest.artifacts.files.map((file) => file.path), 'deploy-manifest.json'].sort();
if (JSON.stringify(localPaths) !== JSON.stringify(expectedLocalPaths)) failures.push(`local dist: public path set differs; expected ${expectedLocalPaths.length}, found ${localPaths.length}`);

if (remote) {
  git('fetch', '--prune', 'origin', 'master', 'gh-pages');
  const remoteMaster = git('rev-parse', 'origin/master');
  const remoteMasterTree = git('show', '-s', '--format=%T', remoteMaster);
  const remoteManifestText = git('show', 'origin/gh-pages:deploy-manifest.json');
  const remoteManifest = JSON.parse(remoteManifestText);
  if (remoteManifest.source.commit !== remoteMaster) failures.push(`remote: manifest source ${remoteManifest.source.commit} != origin/master ${remoteMaster}`);
  if (localManifest.source.commit !== remoteMaster) failures.push(`remote: local dist source ${localManifest.source.commit} != origin/master ${remoteMaster}`);
  if (localManifest.releaseMode !== 'release' || remoteManifest.releaseMode !== 'release') failures.push('remote: local and published manifests must both be release mode');
  if (localManifest.source.tree !== remoteMasterTree || remoteManifest.source.tree !== remoteMasterTree) failures.push('remote: source tree mismatch');
  validateManifest(remoteManifest, 'origin/gh-pages', (relative) => {
    try { return execFileSync('git', ['show', `origin/gh-pages:${relative}`], { cwd: root }); } catch { return null; }
  });
  const remotePaths = git('ls-tree', '-r', '--name-only', 'origin/gh-pages').split(/\r?\n/u).filter(Boolean).sort();
  const expectedPaths = [...remoteManifest.artifacts.files.map((file) => file.path), 'deploy-manifest.json'].sort();
  if (JSON.stringify(remotePaths) !== JSON.stringify(expectedPaths)) failures.push(`remote: published path set differs; expected ${expectedPaths.length}, found ${remotePaths.length}`);
  for (const [relative, manifestField] of [
    ['package-lock.json', 'packageLockSHA256'],
    ['governance/pov-contract.json', 'povContractSHA256'],
    ['governance/hub-governance-reference.json', 'hubGovernanceReferenceSHA256']
  ]) {
    const sourceBytes = execFileSync('git', ['show', `${remoteMaster}:${relative}`], { cwd: root });
    if (sha256(sourceBytes) !== remoteManifest.inputs?.[manifestField]) failures.push(`remote: ${relative} hash does not match source commit`);
  }
  if (localManifest.artifacts.artifactSetSHA256 !== remoteManifest.artifacts.artifactSetSHA256) failures.push('remote: local and published artifact sets differ');

  if (live) {
    const base = 'https://samhuang68.github.io/nvm-whitepaper-site/';
    const delays = [0, 2000, 5000, 10000, 20000, 40000];
    let converged = false;
    for (const delay of delays) {
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      const liveManifestResponse = await fetch(`${base}deploy-manifest.json?lineage=${Date.now()}`, { cache: 'no-store' });
      if (!liveManifestResponse.ok) continue;
      const liveManifest = await liveManifestResponse.json();
      if (liveManifest.source?.commit !== remoteMaster || liveManifest.artifacts?.artifactSetSHA256 !== remoteManifest.artifacts.artifactSetSHA256) continue;
      const fileResults = await Promise.all(remoteManifest.artifacts.files.filter((file) => !file.path.startsWith('.')).map(async (file) => {
        const response = await fetch(`${base}${file.path.split('/').map(encodeURIComponent).join('/')}?lineage=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) return false;
        const bytes = Buffer.from(await response.arrayBuffer());
        return bytes.length === file.bytes && sha256(bytes) === file.sha256;
      }));
      if (fileResults.every(Boolean)) { converged = true; break; }
    }
    if (!converged) failures.push('live: deployment did not converge to the remote manifest within the bounded retry window');
  }
}

if (failures.length) {
  console.error(`Deployment-lineage gate failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  process.exit(1);
}
console.log(`PASS: ${remote ? 'local + remote' : 'local'} deployment lineage binds ${localManifest.source.commit.slice(0, 12)} to ${localManifest.artifacts.files.length} hashed artifacts${live ? ' and anonymous live Pages' : ''}.`);
