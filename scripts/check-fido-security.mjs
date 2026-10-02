import { access, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fidoSecurity, FIDO_EVIDENCE_CLASSES } from '../src/data/fido_security.js';
import { applicationAtlas } from '../src/data/application_atlas.js';
import { containsHardwareMandate } from './fido-content-semantics.mjs';

const root = new URL('..', import.meta.url);
const failures = [];
const researchEvidence = await readFile(new URL('research/fido2-se-security-evidence.md', root), 'utf8');
const requiredSources = [
  'WA3', 'CTAP22', 'ASPR17', 'ASPR16', 'ASPR151', 'CERTLEVELS', 'L3', 'L3PLUS', 'KEY2015',
  'GPSEPP', 'EUCLEAK', 'IACR1380', 'YSA202403', 'ATECC608B', 'NXPLPCPUF',
  'STSAFEA100', 'NXPP40', 'CORON2010', 'NISTPQC'
];

const isLocalized = (value) => value && typeof value === 'object'
  && typeof value.en === 'string' && value.en.trim()
  && typeof value.zh === 'string' && value.zh.trim();

const collectVisibleLocalizedValues = (value, path = [], output = { en: [], zh: [] }) => {
  if (isLocalized(value)) {
    const isRejectedClaimText = path[0] === 'claims' && path.at(-1) === 'claim';
    const isSourceMetadata = path[0] === 'sources';
    if (!isRejectedClaimText && !isSourceMetadata) {
      output.en.push(value.en);
      output.zh.push(value.zh);
    }
    return output;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectVisibleLocalizedValues(item, [...path, String(index)], output));
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => collectVisibleLocalizedValues(item, [...path, key], output));
  }
  return output;
};

const requireLocalizedFields = (items, fields, collection) => {
  items.forEach((item, index) => fields.forEach((field) => {
    if (!isLocalized(item[field])) failures.push(`${collection}[${index}].${field} 缺少完整英／繁中值`);
  }));
};

const sourceIds = new Set();
const sourcesById = new Map();
for (const source of fidoSecurity.sources) {
  if (sourceIds.has(source.id)) failures.push(`FIDO source id 重複：${source.id}`);
  sourceIds.add(source.id);
  sourcesById.set(source.id, source);
  if (!FIDO_EVIDENCE_CLASSES.includes(source.class)) failures.push(`${source.id} 使用未知證據類別：${source.class}`);
  if (!isLocalized(source.label) || !isLocalized(source.actor) || !isLocalized(source.locator)) failures.push(`${source.id} 缺少完整英／繁中來源欄位`);
  if (!/^https:\/\//.test(source.url)) failures.push(`${source.id} 必須使用 HTTPS 來源`);
}
for (const id of requiredSources) if (!sourceIds.has(id)) failures.push(`缺少必要 FIDO 來源：${id}`);

const requiredSourceClasses = {
  ASPR17: 'CERTIFICATION REQUIREMENT',
  YSA202403: 'VENDOR SECURITY ADVISORY',
  NISTPQC: 'AUTHORITATIVE GUIDANCE',
  FIPSIG: 'CERTIFICATION GUIDANCE',
  IACR1380: 'INDEPENDENT ATTACK'
};
for (const [id, expectedClass] of Object.entries(requiredSourceClasses)) {
  if (sourcesById.get(id)?.class !== expectedClass) failures.push(`${id} 證據類別必須維持為 ${expectedClass}`);
}
const webAuthnSource = sourcesById.get('WA3');
if (!webAuthnSource?.actor.en.includes('W3C Recommendation') || !webAuthnSource.actor.en.includes('25 August 2026') || /Candidate Recommendation/.test(webAuthnSource.actor.en)) failures.push('WA3 必須標示為 2026-08-25 W3C Recommendation，而非 Candidate Recommendation');
const aspr17Source = sourcesById.get('ASPR17');
if (!aspr17Source?.actor.en.includes('ACTIVE') || !aspr17Source.actor.en.includes('Review Draft') || !aspr17Source.locator.en.includes('not intended as an implementation basis')) failures.push('ASPR17 必須區分認證頁的 ACTIVE 與來源文件的 Review Draft／非實作依據狀態');
const certificationLevels = sourcesById.get('CERTLEVELS');
for (const token of ['v1.7 ACTIVE', 'v1.6 active until 2027-01-13', 'v1.5.1 has no expiry', 'must be used for L3/L3+']) if (!certificationLevels?.locator.en.includes(token)) failures.push(`CERTLEVELS 缺少版本狀態：${token}`);
if (!sourcesById.get('IACR1380')?.actor.en.includes('Thomas Roche') || !sourcesById.get('IACR1380')?.actor.en.includes('NinjaLab')
  || !sourcesById.get('IACR1380')?.actor.zh.includes('Thomas Roche') || !sourcesById.get('IACR1380')?.actor.zh.includes('NinjaLab')) {
  failures.push('IACR1380 英／繁中 actor 必須標示 Thomas Roche／NinjaLab，而非出版識別碼');
}

const evidenceCollections = [
  ['verdicts', fidoSecurity.verdicts],
  ['ceremonies', fidoSecurity.ceremonies],
  ['keyClasses', fidoSecurity.keyClasses],
  ['storageModels', fidoSecurity.storageModels],
  ['backupEligibility', fidoSecurity.backupEligibility],
  ['memoryRoles', fidoSecurity.memoryRoles],
  ['namedExamples', fidoSecurity.namedExamples],
  ['assuranceMatrix', fidoSecurity.assuranceMatrix],
  ['eucleak', [fidoSecurity.eucleak]],
  ['claims', fidoSecurity.claims]
];
for (const [name, items] of evidenceCollections) {
  for (const [index, item] of items.entries()) {
    const ids = [...(item.sourceIds || []), ...(item.requirementSourceIds || []), ...(item.patternSourceIds || []), ...(item.cautionSourceIds || [])];
    if (!ids.length) failures.push(`${name}[${index}] 沒有來源 ID`);
    for (const id of ids) if (!sourceIds.has(id)) failures.push(`${name}[${index}] 引用未知來源：${id}`);
  }
}

requireLocalizedFields(fidoSecurity.verdicts, ['label', 'headline', 'body'], 'verdicts');
requireLocalizedFields(fidoSecurity.ceremonies, ['title', 'question', 'boundary'], 'ceremonies');
requireLocalizedFields(fidoSecurity.keyClasses, ['name', 'role', 'persistence', 'boundary'], 'keyClasses');
requireLocalizedFields(fidoSecurity.storageModels, ['label', 'title', 'nvmPressure', 'body', 'candidates'], 'storageModels');
requireLocalizedFields(fidoSecurity.backupEligibility, ['label', 'title', 'body', 'state'], 'backupEligibility');
requireLocalizedFields(fidoSecurity.memoryRoles, ['technology', 'asset', 'value', 'limit'], 'memoryRoles');
requireLocalizedFields(fidoSecurity.namedExamples, ['product', 'pattern', 'insight'], 'namedExamples');
requireLocalizedFields(fidoSecurity.assuranceMatrix, ['threat', 'levelScope', 'certificationClaimStatus', 'toeScope', 'outcome', 'patterns', 'caution'], 'assuranceMatrix');
requireLocalizedFields(fidoSecurity.claims, ['claim', 'status', 'correction'], 'claims');
if (!isLocalized(fidoSecurity.pov)) failures.push('FIDO POV 必須有完整英／繁中值');

const exactIds = (items, expected) => {
  if (items.length !== expected.length) return false;
  const actualIds = items.map((item) => item.id);
  if (new Set(actualIds).size !== actualIds.length) return false;
  const actual = [...actualIds].sort();
  const expectedSorted = [...expected].sort();
  return actual.every((id, index) => id === expectedSorted[index]);
};
if (!exactIds(fidoSecurity.storageModels, ['discoverable', 'server-side'])) failures.push('Storage modality ID 必須精確為 discoverable 與 server-side');
if (!exactIds(fidoSecurity.backupEligibility, ['single-device', 'multi-device'])) failures.push('Backup eligibility ID 必須精確為 single-device 與 multi-device，且不得混入 storage modality');
for (const [index, model] of fidoSecurity.storageModels.entries()) {
  if (model.evidenceClass !== 'SPECIFICATION' || !model.semanticSourceIds?.length) failures.push(`storageModels[${index}] 缺少規格語意來源層`);
  if (model.candidateStatus !== 'REFERENCE ARCHITECTURE' || !model.candidateSourceIds?.length) failures.push(`storageModels[${index}] 缺少候選實作來源層`);
  const expectedSources = new Set([...(model.semanticSourceIds || []), ...(model.candidateSourceIds || [])]);
  if (expectedSources.size !== model.sourceIds?.length || model.sourceIds.some((id) => !expectedSources.has(id))) failures.push(`storageModels[${index}] sourceIds 必須等於語意與候選實作來源聯集`);
}

const registration = fidoSecurity.ceremonies.find((item) => item.id === 'registration');
if (!registration?.boundary.en.includes('not provably authentic without attestation')) failures.push('AAGUID 邊界必須明示未經 attestation 不具可證明的真實性');
if (!registration?.boundary.zh.includes('未經 attestation，AAGUID 不具可證明的真實性')) failures.push('繁中 AAGUID 邊界必須明示未經 attestation 不具可證明的真實性');
const credentialKey = fidoSecurity.keyClasses.find((item) => item.id === 'credential-private-key');
for (const token of ['Credential-source modality', 'private-key material', 'Backup eligibility is an independent credential property']) {
  if (!credentialKey?.persistence.en.includes(token)) failures.push(`Credential private key persistence 未分開必要軸線：${token}`);
}
for (const token of ['Credential source modality', '私鑰材料', 'Backup eligibility 是獨立的 credential property']) {
  if (!credentialKey?.persistence.zh.includes(token)) failures.push(`繁中 Credential private key persistence 未分開必要軸線：${token}`);
}
const attestationKey = fidoSecurity.keyClasses.find((item) => item.id === 'attestation-private-component');
if (!attestationKey?.persistence.en.includes('Basic uses a model-/batch-specific attestation key pair')) failures.push('Basic attestation 必須維持 model-/batch-specific attestation key pair 定義');
if (!attestationKey?.persistence.zh.includes('Basic 使用特定型號／批次共用的 attestation key pair')) failures.push('繁中 Basic attestation 必須維持特定型號／批次共用的 key pair 定義');
if (!attestationKey?.boundary.en.includes('Enterprise is a separate controlled-deployment conveyance mode')) failures.push('Enterprise 必須維持為獨立 conveyance／request mode，而非 attestation type');
if (!attestationKey?.boundary.zh.includes('Enterprise 是受控部署中的另一種 conveyance 模式')) failures.push('繁中 Enterprise 必須維持為獨立 conveyance／request mode，而非 attestation type');
if (/Enterprise/.test(attestationKey?.persistence.en || '')) failures.push('Enterprise 不得被列入 WebAuthn attestation type 清單');
if (/Enterprise/.test(attestationKey?.persistence.zh || '')) failures.push('繁中 Enterprise 不得被列入 WebAuthn attestation type 清單');
const credentialAxesGate = fidoSecurity.decisionGates.find((item) => item.en.includes('Choose both credential axes'));
for (const token of ['storage modality', 'backup eligibility', 'BE is immutable after creation', 'BS is current backup state', 'BE=0 with BS=1 is invalid']) {
  if (!credentialAxesGate?.en.includes(token)) failures.push(`Credential decision gate 缺少 invariant：${token}`);
}
for (const token of ['儲存 modality', 'backup eligibility', 'BE 建立後不得改變', 'BS 表示目前備份狀態', 'BE=0、BS=1 是不合法組合']) {
  if (!credentialAxesGate?.zh.includes(token)) failures.push(`繁中 Credential decision gate 缺少 invariant：${token}`);
}

const singleDevice = fidoSecurity.backupEligibility.find((item) => item.id === 'single-device');
for (const token of ['not eligible for backup']) if (!singleDevice?.body.en.includes(token)) failures.push(`Single-device card 缺少：${token}`);
if (!singleDevice?.state.en.includes('BS remains 0')) failures.push('Single-device card 必須維持 BS remains 0');
if (!singleDevice?.body.zh.includes('不允許備份') || !singleDevice?.state.zh.includes('BS 維持 0')) failures.push('繁中 single-device card 必須明示不允許備份且 BS 維持 0');
const multiDevice = fidoSecurity.backupEligibility.find((item) => item.id === 'multi-device');
for (const token of ['eligible to be backed up', 'synchronization is one possible mechanism', 'BS separately reports whether it is currently backed up']) {
  if (!multiDevice?.body.en.includes(token)) failures.push(`Multi-device card 缺少：${token}`);
}
for (const token of ['Credential 允許被備份', '同步只是可能機制之一', 'BS 另行表示目前是否已備份']) {
  if (!multiDevice?.body.zh.includes(token)) failures.push(`繁中 multi-device card 缺少：${token}`);
}
if (!multiDevice?.state.en.includes('BE is immutable after creation') || !multiDevice?.state.en.includes('BS may change with backup state')) failures.push('Multi-device state 必須分開 BE 不可變與 BS 當前狀態');
if (!multiDevice?.state.zh.includes('BE 建立後不得改變') || !multiDevice?.state.zh.includes('BS 可隨備份狀態改變')) failures.push('繁中 multi-device state 必須分開 BE 不可變與 BS 當前狀態');
const discoverable = fidoSecurity.storageModels.find((item) => item.id === 'discoverable');
if (/backup|synchronization/i.test(discoverable?.candidates.en || '') && !discoverable.candidates.en.includes('when BE=1')) failures.push('Discoverable candidate 提及 backup／synchronization 時必須限定 BE=1');
if (/備份|同步/.test(discoverable?.candidates.zh || '') && !discoverable.candidates.zh.includes('僅於 BE=1 時適用')) failures.push('繁中 discoverable candidate 提及備份／同步時必須限定 BE=1');

const c01 = researchEvidence.match(/### C01｜[\s\S]*?(?=### C02｜)/)?.[0] || '';
const c04 = researchEvidence.match(/### C04｜[\s\S]*?(?=### C05｜)/)?.[0] || '';
const c05 = researchEvidence.match(/### C05｜[\s\S]*?(?=### C06｜)/)?.[0] || '';
for (const token of ['FIDO2 不要求 Secure Element', '不限定必須由 Secure Element 實作']) if (!c01.includes(token)) failures.push(`研究證據 C01 缺少協定邊界：${token}`);
for (const token of ['實質相同的 authenticator 必須共用 AAGUID', '未經 attestation 驗證的 AAGUID 不具密碼學真實性']) if (!c04.includes(token)) failures.push(`研究證據 C04 缺少 AAGUID invariant：${token}`);
for (const token of ['storage modality', 'backup eligibility', 'BE 在 credential 建立後不得改變', 'BS 表示目前備份狀態', 'BE=0, BS=1` 是不合法組合']) if (!c05.includes(token)) failures.push(`研究證據 C05 缺少 credential invariant：${token}`);
if (/BE=0, BS=1`? 是合法組合|BE=0, BS=1 is valid/i.test(c05)) failures.push('研究證據 C05 不得把 BE=0、BS=1 寫成合法組合');
if (/balanced logic|balanced implementation|controlled noise|noise injection/i.test(researchEvidence)) failures.push('研究證據帳本不得列入尚未逐項直接舉證的 balanced／noise 對策');

const positiveHardwareCorpus = collectVisibleLocalizedValues(fidoSecurity);
if (containsHardwareMandate(positiveHardwareCorpus.en, 'en')) failures.push('英文正向內容不得宣稱 FIDO／WebAuthn／CTAP 強制特定安全硬體或記憶體');
if (containsHardwareMandate(positiveHardwareCorpus.zh, 'zh')) failures.push('繁中正向內容不得宣稱 FIDO／WebAuthn／CTAP 強制特定安全硬體或記憶體');
const researchPositiveCorpus = researchEvidence.split(/\r?\n/).filter((line) => !/^- 判定：/.test(line) && !/^### .*「/.test(line));
if (containsHardwareMandate(researchPositiveCorpus, 'en') || containsHardwareMandate(researchPositiveCorpus, 'zh')) failures.push('研究證據帳本的安全措辭、限制與來源不得宣稱 FIDO／WebAuthn／CTAP 強制特定安全硬體或記憶體');
if (!fidoSecurity.memoryRoles.some((item) => item.id === 'logical-otp')) failures.push('缺少 logical OTP／locked-NVM 對照');
if (!fidoSecurity.claims.some((item) => item.claim.en.includes('entire FIDO') && item.correction.en.includes('post-quantum'))) failures.push('缺少 AES-256 非整體後量子保證的主張稽核');
if (!fidoSecurity.claims.some((item) => item.claim.en.includes('entire EEPROM'))) failures.push('缺少 tamper 不等於全面抹除 EEPROM 的主張稽核');
if (!fidoSecurity.claims.some((item) => item.correction.en.includes('PUF-derived mapping'))) failures.push('缺少 PUF-derived scrambling 的 proposed／configuration-specific 邊界');
if (fidoSecurity.assuranceMatrix.some((item) => !item.requirementSourceIds?.includes('ASPR151') && /L3/.test(item.levelScope.en))) failures.push('L3／L3+ assurance row 未綁定 ASPR v1.5.1');
if (fidoSecurity.assuranceMatrix.some((item) => !item.certificationClaimStatus.en.includes('NOT ESTABLISHED'))) failures.push('Assurance row 未明示產品認證未被建立');

const allowedPatternSourceClasses = new Set(['CERTIFICATION REQUIREMENT', 'NAMED IMPLEMENTATION', 'VENDOR COLLATERAL', 'INDEPENDENT ATTACK', 'INDEPENDENT RESEARCH']);
for (const [index, item] of fidoSecurity.assuranceMatrix.entries()) {
  if (item.requirementStatus !== 'CERTIFICATION REQUIREMENT') failures.push(`assuranceMatrix[${index}] requirementStatus 必須為 CERTIFICATION REQUIREMENT`);
  if (item.patternStatus !== 'REFERENCE ARCHITECTURE') failures.push(`assuranceMatrix[${index}] patternStatus 必須為 REFERENCE ARCHITECTURE`);
  for (const id of item.requirementSourceIds || []) {
    if (sourcesById.get(id)?.class !== 'CERTIFICATION REQUIREMENT') failures.push(`assuranceMatrix[${index}] requirementSourceIds 含非認證要求來源：${id}`);
  }
  for (const id of item.patternSourceIds || []) {
    if (!allowedPatternSourceClasses.has(sourcesById.get(id)?.class)) failures.push(`assuranceMatrix[${index}] patternSourceIds 含不合格的實作／攻擊證據：${id}`);
  }
  if (!item.cautionSourceIds?.length) failures.push(`assuranceMatrix[${index}] 缺少 residual-risk 來源`);
  const expectedSources = new Set([...(item.requirementSourceIds || []), ...(item.patternSourceIds || []), ...(item.cautionSourceIds || [])]);
  if (expectedSources.size !== item.sourceIds?.length || item.sourceIds.some((id) => !expectedSources.has(id))) failures.push(`assuranceMatrix[${index}] sourceIds 必須等於 requirementSourceIds 與 patternSourceIds 的聯集`);
}

const allowedClaimStatuses = new Set(['REJECTED', 'NARROWED']);
for (const [index, item] of fidoSecurity.claims.entries()) {
  if (!allowedClaimStatuses.has(item.status.en)) failures.push(`claims[${index}] 使用未知判定：${item.status.en}`);
  if (!item.sourceIds?.length) failures.push(`claims[${index}] 缺少判定來源`);
  if (item.status.en === 'NARROWED' && item.sourceIds.length < 2) failures.push(`claims[${index}] 的 NARROWED 判定至少需要兩筆互補來源`);
  if (/FIDO|attestation|passkey|AES-256/.test(item.claim.en) && !item.sourceIds.some((id) => ['SPECIFICATION', 'CERTIFICATION REQUIREMENT'].includes(sourcesById.get(id)?.class))) failures.push(`claims[${index}] 的協定／認證主張未綁定規格或認證要求來源`);
}

const scaRow = fidoSecurity.assuranceMatrix.find((item) => item.id === 'sca-leakage');
if (!scaRow) failures.push('缺少具穩定 ID 的 SCA assurance row');
else {
  for (const token of ['Req. 5.4: L1+', 'reqs. 5.5 and 5.7: L3', 'req. 5.6: L1+, L2+']) if (!scaRow.levelScope.en.includes(token)) failures.push(`SCA assurance row 缺少精確適用層級：${token}`);
  for (const token of ['remotely observable timing variations', 'must not depend on its value']) if (!scaRow.outcome.en.includes(token)) failures.push(`SCA assurance row 缺少規範成果：${token}`);
  for (const token of ['Req. 5.4：L1+', 'reqs. 5.5 與 5.7：L3', 'req. 5.6：L1+、L2+']) if (!scaRow.levelScope.zh.includes(token)) failures.push(`繁中 SCA assurance row 缺少精確適用層級：${token}`);
  for (const token of ['功耗／EM 洩漏', '遠端可觀察 timing 變化', '不得依其值而改變']) if (!scaRow.outcome.zh.includes(token)) failures.push(`繁中 SCA assurance row 缺少規範成果：${token}`);
  if (!scaRow.requirementSourceIds.includes('ASPR151')) failures.push('SCA assurance row 必須綁定 ASPR v1.5.1');
  for (const token of ['Constant-time arithmetic', 'masking or blinding', 'target-evaluated randomization']) if (!scaRow.patterns.en.includes(token)) failures.push(`SCA 對策缺少可追溯模式：${token}`);
  if (/balanced|controlled noise|noise injection/i.test(scaRow.patterns.en)) failures.push('SCA 對策不得重新加入尚未逐項直接舉證的 balanced／noise 模式');
  for (const token of ['Constant-time 運算', 'masking／blinding', '經目標晶片評估的隨機化']) if (!scaRow.patterns.zh.includes(token)) failures.push(`繁中 SCA 對策缺少可追溯模式：${token}`);
  if (/恆定功耗|平衡邏輯|雜訊注入|保證功耗軌跡完全平坦/.test(scaRow.patterns.zh)) failures.push('繁中 SCA 對策不得宣稱未舉證的平衡邏輯／雜訊注入或保證平坦功耗軌跡');
  for (const id of ['EUCLEAK', 'IACR1380', 'CORON2010', 'NXPP40']) if (!scaRow.patternSourceIds.includes(id)) failures.push(`SCA 對策缺少直接或具名來源：${id}`);
}

const eucleakConditions = fidoSecurity.eucleak.conditions.map((condition) => condition.en).join(' ');
const eucleakConditionsZh = fidoSecurity.eucleak.conditions.map((condition) => condition.zh).join(' ');
for (const token of ['Physical possession', 'repeated vulnerable ECDSA signing operations', 'affected library and firmware generation']) if (!eucleakConditions.includes(token)) failures.push(`EUCLEAK 前提缺少：${token}`);
for (const token of ['200 signatures', 'five successful recoveries', '40 traces per successful case on average', 'not a universal minimum']) if (!eucleakConditions.includes(token)) failures.push(`EUCLEAK 公開實驗數字或適用邊界缺少：${token}`);
for (const token of ['需要實體取得目標裝置', '重複觸發並量測有弱點的 ECDSA 簽章', '受影響的 library 與 firmware 世代', '200 次簽章', '5 次成功恢復', '平均每個成功案例約需 40 組 trace', '不是通用最低值']) if (!eucleakConditionsZh.includes(token)) failures.push(`繁中 EUCLEAK 前提、數字或適用邊界缺少：${token}`);
if (/只需一次簽章|普遍恢復所有 FIDO 私鑰/.test(eucleakConditionsZh)) failures.push('繁中 EUCLEAK 不得宣稱單次簽章即可普遍恢復所有 FIDO 私鑰');
if (!fidoSecurity.eucleak.summary.en.includes('not a break of WebAuthn or CTAP')) failures.push('EUCLEAK 必須維持為實作層攻擊，而非 WebAuthn／CTAP 協定破解');
if (!fidoSecurity.eucleak.summary.zh.includes('不是 WebAuthn 或 CTAP 協定遭破解')) failures.push('繁中 EUCLEAK 必須維持為實作層攻擊，而非 WebAuthn／CTAP 協定破解');
for (const id of ['EUCLEAK', 'IACR1380', 'YSA202403']) if (!fidoSecurity.eucleak.sourceIds.includes(id)) failures.push(`EUCLEAK 缺少必要來源：${id}`);

const tamperClaim = fidoSecurity.claims.find((item) => item.id === 'tamper-erases-eeprom');
if (!tamperClaim || tamperClaim.status.en !== 'REJECTED' || tamperClaim.status.zh !== '退回' || !['ASPR151', 'ASPR16'].every((id) => tamperClaim.sourceIds.includes(id))) failures.push('Tamper／全面抹除 EEPROM 主張必須在英／繁中退回並綁定 ASPR 5.3 證據');
for (const token of ['zeroization as one possible response', 'neither requires blanket EEPROM erasure', 'nor sets a universal response-time bound']) if (!tamperClaim?.correction.en.includes(token)) failures.push(`Tamper correction 缺少非通用邊界：${token}`);
if (/FIDO requires blanket EEPROM erasure|within microseconds/i.test(tamperClaim?.correction.en || '')) failures.push('Tamper correction 不得宣稱 FIDO 要求全面 EEPROM 微秒抹除');
for (const token of ['金鑰 zeroization 列為一種可能回應', '不要求全面抹除 EEPROM', '未設定通用反應時間上限']) if (!tamperClaim?.correction.zh.includes(token)) failures.push(`繁中 tamper correction 缺少非通用邊界：${token}`);
if (/FIDO 強制要求.*(?:幾微秒|全面抹除 EEPROM)/.test(tamperClaim?.correction.zh || '')) failures.push('繁中 tamper correction 不得宣稱 FIDO 強制全面 EEPROM 微秒抹除');
const aesClaim = fidoSecurity.claims.find((item) => item.id === 'aes-system-pq');
if (!aesClaim || aesClaim.status.en !== 'REJECTED' || aesClaim.status.zh !== '退回' || !aesClaim.sourceIds.includes('NISTPQC')) failures.push('AES-256 整體後量子主張必須在英／繁中退回並綁定 NIST guidance');
for (const token of ['algorithm-level resistance', 'does not by itself establish system-level post-quantum security', 'must also cover authentication, attestation, PKI, firmware-update, provisioning and migration algorithms']) if (!aesClaim?.correction.en.includes(token)) failures.push(`AES-256 correction 缺少系統層限縮：${token}`);
if (/makes the (?:whole|entire) system post-quantum safe/i.test(aesClaim?.correction.en || '')) failures.push('AES-256 correction 不得宣稱單一演算法建立整體系統後量子安全');
for (const token of ['演算法層抵抗力', '不能建立系統層後量子安全', '系統主張仍須端到端涵蓋 authentication、attestation、PKI、firmware update、provisioning 與遷移演算法']) if (!aesClaim?.correction.zh.includes(token)) failures.push(`繁中 AES-256 correction 缺少系統層限縮：${token}`);
if (/AES-256.*(?:保證|建立).*整套系統.*後量子安全/.test(aesClaim?.correction.zh || '')) failures.push('繁中 AES-256 correction 不得宣稱單一演算法保證整體系統後量子安全');
if (!sourcesById.get('ASPR151')?.locator.en.includes('5.3–5.9')
  || !sourcesById.get('ASPR151')?.locator.en.includes('5.3 names key zeroization')
  || !sourcesById.get('ASPR151')?.locator.en.includes('5.4 bounds secret-key use')) {
  failures.push('ASPR v1.5.1 locator 必須明列 requirements 5.3–5.9、5.3 key zeroization 與 5.4 使用上限');
}

const fidoCase = applicationAtlas.cases.find((item) => item.id === 'APP-FIDO-AUTH-033');
if (!fidoCase || fidoCase.sequence !== '18' || fidoCase.evidenceLabel !== 'PUBLIC REQUIREMENT') failures.push('Application Atlas 缺少正確的 FIDO case');
if (!fidoCase?.sources.some((source) => source.label.en.includes('v1.5.1'))) failures.push('Application Atlas FIDO case 缺少 L3／L3+ v1.5.1 基準');
if (!fidoCase?.summary.en.includes('without mandating an SE or memory type')) failures.push('Application Atlas FIDO case 必須明示 WebAuthn 不強制 SE 或 memory type');
if (!fidoCase?.summary.zh.includes('不強制 SE 或記憶體類型')) failures.push('繁中 Application Atlas FIDO case 必須明示 WebAuthn 不強制 SE 或記憶體類型');
if (!fidoCase?.notProof.en.includes('do not require a Secure Element, PUF')) failures.push('Application Atlas FIDO case 的 notProof 必須明示 SE／PUF 非強制邊界');
if (!fidoCase?.notProof.zh.includes('規範不要求 Secure Element、PUF')) failures.push('繁中 Application Atlas FIDO case 的 notProof 必須明示 SE／PUF 非強制邊界');
const atlasFidoCorpus = (locale) => [
  fidoCase?.title[locale],
  fidoCase?.subtitle[locale],
  fidoCase?.summary[locale],
  ...Object.values(fidoCase?.stateFlow || {}).map((value) => value[locale]),
  fidoCase?.proof[locale],
  fidoCase?.notProof[locale],
  ...Object.values(fidoCase?.contract || {}).map((value) => value[locale]),
  fidoCase?.validationGate[locale]
].filter(Boolean);
if (containsHardwareMandate(atlasFidoCorpus('en'), 'en')) failures.push('Application Atlas 英文 FIDO 內容不得宣稱協定強制特定安全硬體或記憶體');
if (containsHardwareMandate(atlasFidoCorpus('zh'), 'zh')) failures.push('Application Atlas 繁中 FIDO 內容不得宣稱協定強制特定安全硬體或記憶體');

const renderer = await readFile(new URL('src/js/modules/fido_security_view.js', root), 'utf8');
for (const marker of ['keyClasses', 'backupEligibility', 'namedExamples', 'semanticSourceIds', 'candidateSourceIds', 'requirementSourceIds', 'patternSourceIds', 'cautionSourceIds', 'L(fidoSecurity.pov)']) {
  if (!renderer.includes(marker)) failures.push(`FIDO renderer 缺少資料面：${marker}`);
}
if (/<iframe\b/i.test(renderer)) failures.push('FIDO renderer 不得以 iframe 內嵌 Archify 圖');

const index = await readFile(new URL('index.html', root), 'utf8');
if (!index.includes('data-view="security"') || !index.includes('id="panel-security"')) failures.push('入口頁缺少 FIDO security tab／panel');

for (const [file, locale] of [
  ['diagrams/fido2-hardware-trust-v1.dataflow.json', 'en'],
  ['diagrams/fido2-hardware-trust-v1-zh.dataflow.json', 'zh']
]) {
  const document = JSON.parse(await readFile(new URL(file, root), 'utf8'));
  const nodes = new Map(document.nodes.map((node) => [node.id, node]));
  if (locale === 'en' && document.meta.locale !== 'en') failures.push('英文 FIDO diagram 必須使用 locale=en');
  if (locale === 'zh' && 'locale' in document.meta) failures.push('繁中 FIDO diagram 必須省略 Archify 不支援的 locale，避免誤用 zh-CN');
  if (document.meta.legend.entries.default.label.includes('Verified') || document.meta.legend.entries.default.label.includes('驗證')) failures.push(`${file} 的圖例不得把所有 flow 宣稱為已驗證`);
  if (nodes.get('attestationModel')?.type === 'database') failures.push(`${file} 不得把 attestation mode 畫成 database`);
  if (!nodes.get('credentialSource')?.sublabel.match(/regenerated|重新導出/)) failures.push(`${file} 缺少 regenerated credential material`);
  if (nodes.get('credentialSource')?.type === 'database') failures.push(`${file} 不得以 database 語意涵蓋 regenerated credential material`);
  if (!nodes.get('immutablePolicy')?.sublabel.match(/physical vs logical OTP|實體與邏輯 OTP/)) failures.push(`${file} 必須明確區分實體 OTP 與 logical OTP`);
  const rootDescription = `${nodes.get('deviceRoot')?.sublabel || ''} ${nodes.get('deviceRoot')?.tag || ''}`;
  if (!/PUF/.test(rootDescription) || !/reconstruct|重建/.test(rootDescription)) failures.push(`${file} 必須以 PUF reconstruction 描述裝置根`);
}

for (const [file, receiptFile] of [
  ['public/fido2-hardware-trust-map.html', 'research/qa-receipts/fido2-hardware-trust-map.visual-check.json'],
  ['public/fido2-hardware-trust-map-zh.html', 'research/qa-receipts/fido2-hardware-trust-map-zh.visual-check.json']
]) {
  try {
    await access(new URL(file, root));
    const html = await readFile(new URL(file, root), 'utf8');
    if (!/<h1\b/i.test(html) || (html.match(/<h1\b/gi) || []).length !== 1) failures.push(`${file} 必須只有一個 H1`);
    if (/<iframe\b/i.test(html)) failures.push(`${file} 不得含 iframe`);
    if (!html.includes('Credential Material') && !html.includes('Credential material')) failures.push(`${file} 尚未由最新版 diagram 重新產生`);
    if (!/@media \(max-width: 720px\)[\s\S]*?\.toolbar \{[\s\S]*?flex-wrap: wrap;[\s\S]*?width: 100%;/.test(html)) failures.push(`${file} 缺少 390px 可換行的完整 toolbar 防護`);
    const receipt = JSON.parse(await readFile(new URL(receiptFile, root), 'utf8'));
    const artifactSha256 = createHash('sha256').update(html).digest('hex');
    if (receipt.status !== 'pass' || receipt.ok !== true) failures.push(`${receiptFile} 未記錄通過的視覺檢查`);
    if (receipt.artifact?.sha256 !== artifactSha256) failures.push(`${receiptFile} 與目前 HTML 雜湊不一致`);
    if (!receipt.containment?.viewports?.length || receipt.containment.viewports.some((viewport) => !viewport.ok || !viewport.readabilityOk || viewport.overflowX || viewport.overflowY)) failures.push(`${receiptFile} 含未通過的視窗或可讀性結果`);
  } catch {
    failures.push(`缺少或無法解析 Archify 產物／視覺收據：${file}`);
  }
}

if (failures.length) {
  console.error(`FIDO 安全性 gate 失敗：\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  process.exit(1);
}

console.log(`FIDO 安全性 gate 通過：${fidoSecurity.sources.length} 筆來源、${fidoSecurity.claims.length} 筆主張稽核、${fidoSecurity.namedExamples.length} 個具名實作，規格／認證／產品／攻擊證據已分層。`);
