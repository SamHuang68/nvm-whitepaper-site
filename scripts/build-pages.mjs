import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const release = process.argv.includes('--release');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const read = (target) => fs.readFileSync(target);

if (release) {
  const dirty = git('status', '--porcelain');
  if (dirty) throw new Error('Release build requires a completely clean source worktree, including non-ignored untracked files.');
  const sourceCommit = git('rev-parse', 'HEAD');
  const remoteCommit = git('rev-parse', 'origin/master');
  if (sourceCommit !== remoteCommit) throw new Error(`Release build requires exact origin/master; HEAD is ${sourceCommit} and origin/master is ${remoteCommit}`);
}

await build({ root, logLevel: 'info' });
fs.writeFileSync(path.join(dist, '.nojekyll'), '', 'utf8');

const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const target = path.join(directory, entry.name);
  if (entry.isDirectory()) return walk(target);
  if (entry.name === 'deploy-manifest.json') return [];
  return [target];
});

const sourceCommit = git('rev-parse', 'HEAD');
const sourceInput = (relative) => release
  ? execFileSync('git', ['show', `${sourceCommit}:${relative}`], { cwd: root })
  : read(path.join(root, ...relative.split('/')));
const packageLockBytes = sourceInput('package-lock.json');
const packageLock = JSON.parse(packageLockBytes.toString('utf8'));
const governancePath = path.join(root, 'governance', 'hub-governance-reference.json');
const files = walk(dist).map((target) => {
  const bytes = read(target);
  return {
    path: path.relative(dist, target).replaceAll('\\', '/'),
    bytes: bytes.length,
    sha256: sha256(bytes)
  };
}).sort((a, b) => Buffer.compare(Buffer.from(a.path), Buffer.from(b.path)));
const artifactSetSHA256 = sha256(files.map((file) => `${file.path}\0${file.bytes}\0${file.sha256}\n`).join(''));
if (release && !fs.existsSync(governancePath)) throw new Error('Release build requires governance/hub-governance-reference.json.');
const packageLockSHA256 = sha256(packageLockBytes);
const sourceTree = git('show', '-s', '--format=%T', sourceCommit);
const manifest = {
  schemaVersion: '1.0',
  artifactKind: 'github-pages-static-site',
  site: 'nvm-whitepaper-site',
  releaseMode: release ? 'release' : 'preview',
  source: {
    repository: git('config', '--get', 'remote.origin.url'),
    branch: release ? 'master' : (git('branch', '--show-current') || null),
    commit: sourceCommit,
    tree: sourceTree,
    commitTime: git('show', '-s', '--format=%cI', sourceCommit),
    clean: release
  },
  build: {
    tool: 'vite',
    version: packageLock.packages?.['node_modules/vite']?.version ?? null,
    nodeVersion: process.version,
    base: './'
  },
  inputs: {
    packageLockSHA256,
    povContractSHA256: sha256(sourceInput('governance/pov-contract.json')),
    hubGovernanceReferenceSHA256: fs.existsSync(governancePath) ? sha256(sourceInput('governance/hub-governance-reference.json')) : null
  },
  artifacts: {
    hashAlgorithm: 'sha256',
    canonicalization: 'path<NUL>bytes<NUL>sha256<LF>; UTF-8 paths sorted bytewise; manifest excluded',
    count: files.length,
    artifactSetSHA256,
    files
  },
  releaseId: `sha256:${sha256(`${sourceCommit}\0${sourceTree}\0${packageLockSHA256}\0${artifactSetSHA256}\n`)}`
};

fs.writeFileSync(path.join(dist, 'deploy-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`PASS: ${manifest.releaseMode} build ${sourceCommit.slice(0, 12)} produced ${files.length} files; artifact set ${artifactSetSHA256}.`);
