import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const root = new URL('..', import.meta.url);
const targets = [new URL('index.html', root), new URL('src/', root), new URL('public/', root),
  ...['research/NVM晶圓代工路線圖_20260910.json', 'research/NVM晶圓代工路線圖英文_20260910.json', 'diagrams/晶圓成熟度地圖.json'].map(file => new URL(file, root))];
const shippedTextExtensions = new Set(['.css', '.html', '.js', '.json', '.svg', '.txt', '.xml']);
const banned = [
  ['confidential watermark', /INTERNAL\s+CONFIDENTIAL/i],
  ['restricted example', /Customer\s+Restricted\s+NDA/i],
  ['unsupported readiness language', /silicon[- ]proven/i],
  ['unsupported deployment maturity', /deployment[- ]proven/i],
  ['unsupported foundry maturity', /foundry[- ]verified/i],
  ['legacy fictional product', /\bNeoOTP\b/i],
  ['unrendered Markdown heading', /(^|\n)\s*#{2,6}\s/m],
  ['unrendered Markdown bold', /\*\*[^*]+\*\*/],
  ['unrendered TeX token', /\$V_\{|\\text\{|10\^\{/],
  ['local Windows user path', /[A-Za-z]:\\Users\\/i]
];

async function collectAll(url) {
  const entries = await readdir(url, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const child = new URL(entry.name + (entry.isDirectory() ? '/' : ''), url);
    return entry.isDirectory() ? collectAll(child) : [child];
  }));
  return nested.flat();
}

async function collect(url) {
  const path = url.pathname;
  if (extname(path)) return [url];
  const entries = await readdir(url, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const child = new URL(entry.name + (entry.isDirectory() ? '/' : ''), url);
    return entry.isDirectory() ? collect(child) : (shippedTextExtensions.has(extname(entry.name).toLowerCase()) ? [child] : []);
  }));
  return nested.flat();
}

const files = (await Promise.all(targets.map(collect))).flat();
const failures = [];
const publicArtifacts = await collectAll(new URL('public/', root));
for (const file of publicArtifacts) {
  if (/\.visual-check\./i.test(file.pathname)) failures.push(`QA sidecar must not ship from public/: ${file.pathname}`);
}
for (const file of files) {
  const content = await readFile(file, 'utf8');
  for (const [label, pattern] of banned) {
    if (pattern.test(content)) failures.push(`${label}: ${file.pathname}`);
  }
}

const html = await readFile(new URL('index.html', root), 'utf8');
if ((html.match(/<h1\b/g) || []).length !== 1) failures.push('index.html must contain exactly one H1');
if (!html.includes('role="tablist"')) failures.push('accessible tablist is missing');
if (!html.includes('rel="canonical"')) failures.push('canonical URL is missing');

if (failures.length) {
  console.error('Public-content gate failed:\n' + failures.map((item) => `- ${item}`).join('\n'));
  process.exit(1);
}
console.log(`Public-content gate passed across ${files.length} source and shipped static text files.`);
