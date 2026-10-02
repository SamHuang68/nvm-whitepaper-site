import { containsHardwareMandate } from './fido-content-semantics.mjs';

const mustReject = {
  en: [
    'FIDO2 requires a Secure Element.',
    'WebAuthn mandates OTP.',
    'CTAP must use PUF.',
    'FIDO2 makes a Secure Element mandatory.',
    'FIDO2 treats EEPROM as required.',
    'A Secure Element is required by FIDO2.',
    'OTP is a FIDO2 requirement.',
    'FIDO2 does not require a Secure Element, but mandates OTP.',
    'FIDO 2.0 authenticators shall include Flash.',
    'Under WebAuthn, MTP is mandatory.',
    'MRAM is mandatory under CTAP2.',
    'FIDO calls for non-volatile memory.',
    'CTAP specifies NVM as a mandatory component.',
    'FIDO2 does not mandate SE and does require EEPROM.',
    'FIDO2 does not merely recommend MTP; it requires MTP.',
    'FIDO2-required hardware must include OTP.',
    'FIDO2 demands MTP.',
    'WebAuthn stipulates the use of EEPROM.',
    'CTAP obligates authenticators to integrate MRAM.',
    'OTP must be used for FIDO2.',
    'A Secure Element is indispensable for CTAP.',
    'FIDO2 cannot be implemented without PUF.',
    'WebAuthn authenticators need Flash.',
    'CTAP prescribes the inclusion of NVM.',
    'FIDO2: OTP required.',
    'WebAuthn requires a physical unclonable function.',
    'CTAP makes eFlash mandatory.'
  ],
  zh: [
    'FIDO2 要求使用 Secure Element。',
    'WebAuthn 強制採用 OTP。',
    'CTAP 必須使用 PUF。',
    'FIDO2 將 Secure Element 列為必備元件。',
    'FIDO2 視 EEPROM 為必要條件。',
    'Secure Element 是 FIDO2 必備元件。',
    'OTP 為 WebAuthn 的必要條件。',
    'FIDO2 不要求 Secure Element，但強制使用 OTP。',
    'FIDO 2.0 規定必須採用 Flash。',
    '依 WebAuthn 規定，MTP 是必備元件。',
    'MRAM 為 CTAP2 所要求。',
    'FIDO 明定使用非揮發性記憶體。',
    'CTAP 將 NVM 指定為必要條件。',
    'FIDO2 不強制 SE，並要求採用 EEPROM。',
    'FIDO2 並非只是建議 MTP；它要求使用 MTP。',
    'FIDO2 強制要求認證器內建 OTP。',
    '依 FIDO2，Secure Element 為強制元件。',
    'PUF 是 WebAuthn 規定必須採用的技術。',
    '根據 CTAP，OTP 不可或缺。',
    'EEPROM 被 FIDO2 要求採用。',
    'FIDO2 以 MTP 為必要條件。',
    '若無 MRAM，CTAP 無法完成認證。',
    'WebAuthn 明定認證器必須內建 Flash。',
    'NVM 屬於 FIDO2 必備元件。',
    'FIDO2：OTP 必備。'
  ]
};

const mustAllow = {
  en: [
    'FIDO2 neither requires a Secure Element nor mandates OTP.',
    'A Secure Element is a route, not a FIDO2 mandate.',
    'WebAuthn defines credential semantics without requiring EEPROM.',
    'FIDO2 does not require a Secure Element.',
    'Flash is not required by CTAP.',
    'FIDO2 has no requirement for MTP.',
    'MRAM is a product requirement, not a WebAuthn requirement.',
    'FIDO2 does not require SE, but this product mandates OTP.',
    'FIDO2 requires evidence before claiming that OTP is mandatory for a product.',
    'No evidence was found that CTAP requires EEPROM.',
    'FIDO2 requirements can be implemented without using PUF.',
    'FIDO2 discusses storage; OTP is mandatory for this product.',
    'FIDO2 recommends OTP but does not require it.',
    'FIDO2 requires protection for keys stored in OTP.',
    'WebAuthn requires user verification before PUF activation.',
    'CTAP mandates access control for an EEPROM-backed implementation.',
    'The product, not FIDO2, requires MTP.',
    'Secure Element support is optional under WebAuthn.',
    'MRAM may be used by a CTAP authenticator.',
    'FIDO2: OTP not required.'
  ],
  zh: [
    'FIDO2 不會要求 Secure Element。',
    'FIDO2 沒有規定採用 OTP。',
    'Secure Element 是可行路徑，不是 FIDO2 強制條件。',
    'WebAuthn 不強制 SE 或記憶體類型。',
    'Flash 並非 CTAP 的必備元件。',
    'FIDO2 對 MTP 沒有通用要求。',
    'MRAM 是產品要求，不是 WebAuthn 的要求。',
    'FIDO2 不要求 SE，但此產品要求 OTP。',
    'FIDO2 要求提出證據，才能宣稱產品必須使用 OTP。',
    '未找到 CTAP 要求 EEPROM 的證據。',
    'FIDO2 規範可在無須採用 PUF 的情況下實作。',
    'FIDO2 討論儲存；此產品強制使用 OTP。',
    'FIDO2 建議評估 OTP，但並不要求採用。',
    'FIDO2 要求保護儲存在 OTP 的金鑰。',
    'WebAuthn 要求先完成使用者驗證，才能啟動 PUF。',
    'CTAP 規定管控 EEPROM 實作的存取權限。',
    '產品而非 FIDO2 要求採用 MTP。',
    'Secure Element 在 WebAuthn 下屬於選配。',
    'MRAM 可由 CTAP 認證器採用。',
    'FIDO2：OTP 非必備。'
  ]
};

const failures = [];

const protocolMatrix = {
  en: ['FIDO2', 'WebAuthn', 'CTAP'],
  zh: ['FIDO2', 'WebAuthn', 'CTAP']
};
const hardwareMatrix = {
  en: ['Secure Element', 'SE', 'PUF', 'OTP', 'EEPROM', 'Flash', 'MTP', 'MRAM', 'NVM', 'memory type'],
  zh: ['Secure Element', 'SE', 'PUF', 'OTP', 'EEPROM', 'Flash', 'MTP', 'MRAM', 'NVM', '記憶體類型']
};
const generatedReject = { en: [], zh: [] };
const generatedAllow = { en: [], zh: [] };

for (const protocol of protocolMatrix.en) {
  for (const hardware of hardwareMatrix.en) {
    generatedReject.en.push(
      `${protocol} requires ${hardware}.`,
      `${hardware} is required by ${protocol}.`,
      `${protocol} makes ${hardware} mandatory.`,
      `${protocol} does not require SE, but mandates ${hardware}.`
    );
    generatedAllow.en.push(
      `${protocol} does not require ${hardware}.`,
      `${hardware} is optional under ${protocol}.`,
      `${protocol} requires protection for keys stored in ${hardware}.`,
      `${protocol} discusses storage and this product requires ${hardware}.`
    );
  }
}
for (const protocol of protocolMatrix.zh) {
  for (const hardware of hardwareMatrix.zh) {
    generatedReject.zh.push(
      `${protocol} 要求使用 ${hardware}。`,
      `${hardware} 是 ${protocol} 必備元件。`,
      `${protocol} 將 ${hardware} 列為必要條件。`,
      `${protocol} 不要求 SE，但強制採用 ${hardware}。`
    );
    generatedAllow.zh.push(
      `${protocol} 不要求使用 ${hardware}。`,
      `${hardware} 在 ${protocol} 下是選配。`,
      `${protocol} 要求保護儲存在 ${hardware} 的金鑰。`,
      `${protocol} 討論儲存，而且此產品要求 ${hardware}。`
    );
  }
}

for (const locale of ['en', 'zh']) {
  for (const value of [...mustReject[locale], ...generatedReject[locale]]) {
    if (!containsHardwareMandate([value], locale)) failures.push(`未拒絕：${value}`);
  }
  for (const value of [...mustAllow[locale], ...generatedAllow[locale]]) {
    if (containsHardwareMandate([value], locale)) failures.push(`誤判合法否定或非協定歸因：${value}`);
  }
}

if (failures.length) {
  console.error(`FIDO 硬體強制語意規則失敗：\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  process.exit(1);
}

const rejectCount = mustReject.en.length + mustReject.zh.length + generatedReject.en.length + generatedReject.zh.length;
const allowCount = mustAllow.en.length + mustAllow.zh.length + generatedAllow.en.length + generatedAllow.zh.length;
console.log(`FIDO 硬體強制語意規則通過：${rejectCount} 個違規案例被拒絕，${allowCount} 個合法否定或非協定歸因獲放行。`);
