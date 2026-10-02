import { access, readFile } from 'node:fs/promises';
import { applicationAtlas, APPLICATION_EVIDENCE_LABELS } from '../src/data/application_atlas.js';
import { hasLocalizedValue } from '../src/data/i18n.js';
import { containsHardwareMandate } from './fido-content-semantics.mjs';

const root = new URL('..', import.meta.url);
const failures = [];
const ids = new Set();
const rationaleIds = new Set(applicationAtlas.rationales.map((item) => item.id));
const requiredLocalized = ['title', 'subtitle', 'summary', 'proof', 'notProof', 'validationGate'];
const requiredFlow = ['trigger', 'payload', 'reader', 'consumer'];
const requiredContract = ['writeCadence', 'candidateTechnology', 'processLens'];
const requiredExplorerLocalized = ['title', 'body', 'cta', 'boundary', 'href'];
const evidenceLedger = await readFile(new URL('research/application-atlas-evidence.md', root), 'utf8');
const reviewBundle = await readFile(new URL('research/application-atlas-review-bundle.md', root), 'utf8');
const sensitiveQueryName = /(^|[-_])(access[-_]?token|api[-_]?key|auth|authorization|credential|password|passwd|session|signature|sig|secret)([-_]|$)/i;

function isPrivateHostname(hostname) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host === '::1' || host === '0.0.0.0') return true;
  if (['.localhost', '.local', '.internal', '.intranet', '.corp', '.lan'].some((suffix) => host.endsWith(suffix))) return true;
  if (/^(fc|fd)[0-9a-f]{2}:/i.test(host) || /^fe[89ab][0-9a-f]:/i.test(host)) return true;
  const octets = host.split('.').map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return false;
  return octets[0] === 10
    || octets[0] === 127
    || (octets[0] === 169 && octets[1] === 254)
    || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31)
    || (octets[0] === 192 && octets[1] === 168);
}

if (!/^R\d+-NVM-APPLICATION-ATLAS-\d{4}-\d{2}-\d{2}$/.test(applicationAtlas.freezeId || '')) failures.push('Application Atlas 缺少有效的公開來源凍結版本');
if (!/^\d{4}-\d{2}-\d{2}$/.test(applicationAtlas.reviewedDate || '')) failures.push('Application Atlas 缺少有效的審閱日期');
if (!applicationAtlas.freezeId?.endsWith(applicationAtlas.reviewedDate || '')) failures.push('公開來源凍結版本與審閱日期不一致');
if (!evidenceLedger.includes(`Freeze ID: \`${applicationAtlas.freezeId}\``)) failures.push('證據清單的 Freeze ID 與 Application Atlas 資料不一致');
if (!evidenceLedger.includes(`Reviewed: \`${applicationAtlas.reviewedDate}\``)) failures.push('證據清單的審閱日期與 Application Atlas 資料不一致');
if (!reviewBundle.includes(`Freeze: ${applicationAtlas.freezeId}`)) failures.push('審閱包的公開來源凍結版本與 Application Atlas 資料不一致');

if (applicationAtlas.cases.length < 18) failures.push('Application Atlas 必須至少包含 18 個受治理案例');

for (const item of applicationAtlas.cases) {
  if (!/^APP-[A-Z0-9-]+$/.test(item.id)) failures.push(`${item.id || '(missing id)'} has an invalid canonical ID`);
  if (ids.has(item.id)) failures.push(`${item.id} is duplicated`);
  ids.add(item.id);
  if (!rationaleIds.has(item.rationale) || item.rationale === 'all') failures.push(`${item.id} has an invalid rationale`);
  if (!APPLICATION_EVIDENCE_LABELS.includes(item.evidenceLabel)) failures.push(`${item.id} has a non-canonical evidence label`);
  for (const key of requiredLocalized) if (!hasLocalizedValue(item[key])) failures.push(`${item.id}.${key} is not fully bilingual`);
  for (const key of requiredFlow) if (!hasLocalizedValue(item.stateFlow?.[key])) failures.push(`${item.id}.stateFlow.${key} is not fully bilingual`);
  for (const key of requiredContract) if (!hasLocalizedValue(item.contract?.[key])) failures.push(`${item.id}.contract.${key} is not fully bilingual`);
  if (!Array.isArray(item.sources) || !item.sources.length) failures.push(`${item.id} has no public source`);
  if (!evidenceLedger.includes(`| \`${item.id}\` |`)) failures.push(`${item.id} 未綁定至公開證據清單`);
  for (const source of item.sources || []) {
    if (!hasLocalizedValue(source.label) || !hasLocalizedValue(source.actor)) failures.push(`${item.id} source metadata is not fully bilingual`);
    try {
      const url = new URL(source.url);
      if (url.protocol !== 'https:') failures.push(`${item.id} source must use HTTPS: ${source.url}`);
      if (url.username || url.password) failures.push(`${item.id} 公開來源網址不得包含帳號或密碼：${source.url}`);
      if (url.port && url.port !== '443') failures.push(`${item.id} 公開來源網址不得使用非標準連接埠：${source.url}`);
      if (isPrivateHostname(url.hostname)) failures.push(`${item.id} 公開來源網址不得指向內部或私有主機：${source.url}`);
      for (const name of url.searchParams.keys()) {
        if (sensitiveQueryName.test(name)) failures.push(`${item.id} 公開來源網址不得包含敏感查詢參數 ${name}：${source.url}`);
      }
    } catch {
      failures.push(`${item.id} has an invalid source URL: ${source.url}`);
    }
    if (!evidenceLedger.includes(source.url)) failures.push(`${item.id} 來源未逐筆綁定至公開證據清單：${source.url}`);
  }
}

for (const rationale of applicationAtlas.rationales) {
  if (!hasLocalizedValue(rationale.label)) failures.push(`Rationale ${rationale.id} is not fully bilingual`);
}
for (const item of applicationAtlas.history) {
  if (!hasLocalizedValue(item.year) || !hasLocalizedValue(item.title) || !hasLocalizedValue(item.body)) failures.push(`History entry ${item.year?.en || '(missing year)'} is not fully bilingual`);
}

const hbm = applicationAtlas.cases.find((item) => item.id === 'APP-AI-HBM-002');
if (!hbm || hbm.evidenceLabel !== 'NAMED IMPLEMENTATION') failures.push('HBM repair must remain a named implementation');
if (!/Base Die/.test(hbm?.notProof?.en || '') || !/Logic Die/.test(hbm?.notProof?.en || '')) failures.push('HBM die-location boundary is missing');
if (/\b(Base Die|Logic Die)\b/i.test(`${hbm?.summary?.en || ''} ${hbm?.proof?.en || ''}`)) failures.push('HBM positive claim overstates die placement');

const retimer = applicationAtlas.cases.find((item) => item.id === 'APP-RETIMER-025');
if (retimer?.evidenceLabel !== 'BOUNDED INFERENCE') failures.push('Retimer opportunity must remain a bounded inference');
const photonics = applicationAtlas.cases.find((item) => item.id === 'APP-PHOTONICS-026');
if (photonics?.evidenceLabel !== 'EMERGING RESEARCH') failures.push('Photonics case must remain emerging research');
const rp2350 = applicationAtlas.cases.find((item) => item.id === 'APP-RP2350-028');
if (rp2350?.evidenceLabel !== 'INDEPENDENT OBSERVATION') failures.push('RP2350 attack must remain an independent observation');
const oaiFru = applicationAtlas.cases.find((item) => item.id === 'APP-OAI-FRU-031');
if (oaiFru?.sequence !== '16' || oaiFru?.evidenceLabel !== 'PUBLIC REQUIREMENT') failures.push('OAI UBB FRU must remain public-requirement case 16');
const elsfpNv = applicationAtlas.cases.find((item) => item.id === 'APP-ELSFP-NV-032');
if (elsfpNv?.sequence !== '17' || elsfpNv?.evidenceLabel !== 'PUBLIC REQUIREMENT') failures.push('ELSFP saved configuration must remain public-requirement case 17');
const fidoAuthenticator = applicationAtlas.cases.find((item) => item.id === 'APP-FIDO-AUTH-033');
if (fidoAuthenticator?.sequence !== '18' || fidoAuthenticator?.evidenceLabel !== 'PUBLIC REQUIREMENT') failures.push('FIDO authenticator 必須維持為第 18 個 PUBLIC REQUIREMENT 案例');
if (!fidoAuthenticator?.sources.some((source) => source.label.en.includes('v1.5.1'))) failures.push('FIDO authenticator 案例缺少 L3／L3+ 必用的 ASPR v1.5.1 來源');
if (!fidoAuthenticator?.summary.en.includes('without mandating an SE or memory type')) failures.push('FIDO authenticator 摘要必須明示 WebAuthn 不強制 SE 或記憶體類型');
if (!fidoAuthenticator?.summary.zh.includes('不強制 SE 或記憶體類型')) failures.push('繁中 FIDO authenticator 摘要必須明示 WebAuthn 不強制 SE 或記憶體類型');
if (!fidoAuthenticator?.notProof.en.includes('do not require a Secure Element, PUF')) failures.push('FIDO authenticator notProof 必須保留 SE／PUF／指定記憶體非強制邊界');
if (!fidoAuthenticator?.notProof.zh.includes('規範不要求 Secure Element、PUF')) failures.push('繁中 FIDO authenticator notProof 必須保留 SE／PUF／指定記憶體非強制邊界');
const fidoCaseCorpus = (locale) => [
  fidoAuthenticator?.title[locale],
  fidoAuthenticator?.subtitle[locale],
  fidoAuthenticator?.summary[locale],
  ...Object.values(fidoAuthenticator?.stateFlow || {}).map((value) => value[locale]),
  fidoAuthenticator?.proof[locale],
  fidoAuthenticator?.notProof[locale],
  ...Object.values(fidoAuthenticator?.contract || {}).map((value) => value[locale]),
  fidoAuthenticator?.validationGate[locale]
].filter(Boolean);
if (containsHardwareMandate(fidoCaseCorpus('en'), 'en')) failures.push('FIDO authenticator 英文內容不得宣稱協定強制特定安全硬體或記憶體');
if (containsHardwareMandate(fidoCaseCorpus('zh'), 'zh')) failures.push('FIDO authenticator 繁中內容不得宣稱協定強制特定安全硬體或記憶體');
const webAuthnSource = fidoAuthenticator?.sources.find((source) => source.url === 'https://www.w3.org/TR/webauthn-3/');
if (!webAuthnSource?.actor.en.includes('W3C Recommendation') || !webAuthnSource.actor.en.includes('25 August 2026') || /Candidate Recommendation/.test(webAuthnSource.actor.en)) failures.push('FIDO authenticator 的 WebAuthn Level 3 來源狀態必須標示為 2026-08-25 W3C Recommendation');
const aspr17Source = fidoAuthenticator?.sources.find((source) => source.url.includes('v1.7-rd-20260506'));
if (!aspr17Source?.actor.en.includes('ACTIVE') || !aspr17Source.actor.en.includes('Review Draft') || !aspr17Source.actor.zh.includes('ACTIVE') || !aspr17Source.actor.zh.includes('Review Draft')) failures.push('FIDO authenticator 的 ASPR v1.7 來源必須同時保留認證頁 ACTIVE 與文件 Review Draft 邊界');

const fpgaRoot = applicationAtlas.cases.find((item) => item.id === 'APP-FPGA-ROOT-024');
if (!fpgaRoot?.notProof.en.includes('does not name eMemory or NeoFuse')) failures.push('FPGA RoT 英文來源邊界必須明示 Achronix 未指名 eMemory 或 NeoFuse');
if (!fpgaRoot?.notProof.zh.includes('未指名 eMemory 或 NeoFuse')) failures.push('FPGA RoT 繁中來源邊界必須明示 Achronix 未指名 eMemory 或 NeoFuse');

const explorerIds = new Set();
for (const explorer of applicationAtlas.explorers || []) {
  if (!/^[a-z0-9-]+$/.test(explorer.id || '')) failures.push(`${explorer.id || '(missing explorer id)'} has an invalid explorer ID`);
  if (explorerIds.has(explorer.id)) failures.push(`${explorer.id} explorer is duplicated`);
  explorerIds.add(explorer.id);
  for (const key of requiredExplorerLocalized) if (!hasLocalizedValue(explorer[key])) failures.push(`${explorer.id}.${key} is not fully bilingual`);
  for (const href of [explorer.href?.en, explorer.href?.zh]) {
    if (!/^\.\/[a-z0-9-]+\.html$/.test(href || '')) failures.push(`${explorer.id} has an unsafe or non-local href: ${href}`);
  }
  if (!Array.isArray(explorer.relatedCaseIds) || !explorer.relatedCaseIds.length) failures.push(`${explorer.id} has no related cases`);
  for (const id of explorer.relatedCaseIds || []) if (!ids.has(id)) failures.push(`${explorer.id} references unknown case ${id}`);
}
if (!explorerIds.has('state-lifecycle') || !explorerIds.has('ocp-ai-system') || explorerIds.size !== 2) failures.push('Exactly the lifecycle and OCP AI explorer concepts are required');
const lifecycleExplorer = applicationAtlas.explorers.find((item) => item.id === 'state-lifecycle');
if (lifecycleExplorer?.href?.en !== './nvm-state-path.html' || lifecycleExplorer?.href?.zh !== './nvm-state-path.html') failures.push('Lifecycle explorer href contract changed');
const ocpExplorer = applicationAtlas.explorers.find((item) => item.id === 'ocp-ai-system');
if (ocpExplorer?.href?.en !== './ocp-ai-nvm-opportunity-map.html' || ocpExplorer?.href?.zh !== './ocp-ai-nvm-opportunity-map-zh.html') failures.push('OCP AI localized explorer href contract changed');

const moduleSource = await readFile(new URL('src/js/modules/application_atlas_view.js', root), 'utf8');
if (!moduleSource.includes('applicationAtlas.explorers.map')) failures.push('Archify explorers must render from the governed data contract');
if (!moduleSource.includes('target="_blank"') || !moduleSource.includes('rel="noreferrer"')) failures.push('Archify explorer CTA must open safely in a new tab');
if (/<iframe\b/i.test(moduleSource)) failures.push('Application Atlas must not embed Archify in an iframe');
const standaloneExplorers = [
  ['public/nvm-state-path.html', /State That Survives Power Loss/i],
  ['public/ocp-ai-nvm-opportunity-map.html', /NVM Opportunities Across an OCP AI System/i],
  ['public/ocp-ai-nvm-opportunity-map-zh.html', /OCP 導向 AI 系統中的分散式持久狀態契約/]
];
for (const [path, title] of standaloneExplorers) {
  try {
    await access(new URL(path, root));
    const explorer = await readFile(new URL(path, root), 'utf8');
    if (!title.test(explorer)) failures.push(`${path} title contract is missing`);
    if ((explorer.match(/<h1\b/gi) || []).length !== 1) failures.push(`${path} must contain exactly one H1`);
    if (/<iframe\b/i.test(explorer)) failures.push(`${path} must not contain an iframe`);
  } catch {
    failures.push(`Archify standalone explorer is missing from ${path}`);
  }
}

if (failures.length) {
  console.error('Application Atlas gate failed:\n' + failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

const sourceCount = applicationAtlas.cases.reduce((count, item) => count + item.sources.length, 0);
console.log(`Application Atlas gate passed: ${applicationAtlas.cases.length} bilingual cases, ${ids.size} unique IDs, ${sourceCount} source bindings, freeze ${applicationAtlas.freezeId}, six evidence classes and three standalone Archify artifacts across two explorer concepts.`);
