import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const run = (cwd, command, args) => execFileSync(command, args, { cwd, stdio: 'inherit' });
const npmCli = process.env.npm_execpath || path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
if (!fs.existsSync(npmCli)) throw new Error(`Unable to locate npm CLI: ${npmCli}`);
const runNpm = (cwd, ...args) => run(cwd, process.execPath, [npmCli, ...args]);

git(root, 'fetch', '--prune', 'origin', 'master', 'gh-pages');
const remoteMaster = git(root, 'rev-parse', 'origin/master');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nvm-whitepaper-release-'));
const sourceDir = path.join(tempRoot, 'source');
const publishDir = path.join(tempRoot, 'publish');
const assertContained = (target) => {
  const resolved = path.resolve(target);
  const releaseRoot = path.resolve(tempRoot);
  if (resolved !== releaseRoot && !resolved.startsWith(`${releaseRoot}${path.sep}`)) throw new Error(`Refusing operation outside temporary release root: ${resolved}`);
  return resolved;
};

try {
  git(root, 'worktree', 'add', '--detach', sourceDir, 'origin/master');
  git(root, 'worktree', 'add', '--detach', publishDir, 'origin/gh-pages');
  runNpm(sourceDir, 'ci');
  runNpm(sourceDir, 'run', 'check');
  runNpm(sourceDir, 'run', 'build:pages');
  const firstBuildManifest = JSON.parse(fs.readFileSync(path.join(sourceDir, 'dist', 'deploy-manifest.json'), 'utf8'));
  runNpm(sourceDir, 'run', 'build:pages');
  const secondBuildManifest = JSON.parse(fs.readFileSync(path.join(sourceDir, 'dist', 'deploy-manifest.json'), 'utf8'));
  if (firstBuildManifest.artifacts.artifactSetSHA256 !== secondBuildManifest.artifacts.artifactSetSHA256 || firstBuildManifest.releaseId !== secondBuildManifest.releaseId) {
    throw new Error('NON_REPRODUCIBLE_BUILD: two isolated release builds produced different artifact identity.');
  }
  runNpm(sourceDir, 'run', 'check:dist');

  for (const entry of fs.readdirSync(publishDir)) {
    if (entry === '.git') continue;
    const target = assertContained(path.join(publishDir, entry));
    fs.rmSync(target, { recursive: true, force: true });
  }
  fs.cpSync(path.join(sourceDir, 'dist'), publishDir, { recursive: true });
  git(publishDir, 'add', '-A');
  const changes = git(publishDir, 'status', '--porcelain');
  if (changes) {
    const manifest = JSON.parse(fs.readFileSync(path.join(publishDir, 'deploy-manifest.json'), 'utf8'));
    git(publishDir, 'commit', '-m', `deploy: master ${remoteMaster.slice(0, 12)} / artifacts ${manifest.artifacts.artifactSetSHA256.slice(0, 12)}`);
    git(publishDir, 'push', 'origin', 'HEAD:gh-pages');
  } else {
    console.log('ALREADY_CURRENT: gh-pages already matches the release artifact set.');
  }

  run(sourceDir, process.execPath, ['scripts/check-deploy-lineage.mjs', '--remote']);
  run(sourceDir, process.execPath, ['scripts/check-deploy-lineage.mjs', '--live']);
  git(root, 'worktree', 'remove', '--force', publishDir);
  git(root, 'worktree', 'remove', '--force', sourceDir);
  fs.rmSync(assertContained(tempRoot), { recursive: true, force: true });
  console.log(`PASS: published origin/master ${remoteMaster} and verified origin/gh-pages plus anonymous live bytes.`);
} catch (error) {
  console.error(`Release failed; diagnostic worktrees retained under ${tempRoot}`);
  throw error;
}
