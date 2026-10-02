const EN_PROTOCOL_SOURCE = String.raw`\b(?:FIDO(?:\s*2(?:\.0)?)?|WebAuthn|CTAP(?:2)?)\b`;
const EN_HARDWARE_SOURCE = String.raw`\b(?:Secure[- ]Element|SE|physical unclonable function|PUF|one-time programmable memory|OTP|electrically erasable programmable read-only memory|EEPROM|eFlash|embedded Flash|Flash|multi-time programmable memory|MTP|magnetoresistive RAM|MRAM|specific memor(?:y|ies)|memory type|non-volatile memory|NVM)\b`;
const ZH_PROTOCOL_SOURCE = String.raw`(?:FIDO(?:\s*2(?:\.0)?)?|WebAuthn|CTAP(?:2)?)`;
const ZH_HARDWARE_SOURCE = String.raw`(?:Secure Element|\bSE\b|\bPUF\b|\bOTP\b|\bEEPROM\b|\bFlash\b|\bMTP\b|\bMRAM\b|\bNVM\b|安全元件|一次性可編程記憶體|多次可編程記憶體|快閃記憶體|磁阻式記憶體|非揮發性記憶體|特定記憶體|記憶體類型)`;

const EN_PROTOCOL = new RegExp(EN_PROTOCOL_SOURCE, 'i');
const EN_HARDWARE = new RegExp(EN_HARDWARE_SOURCE, 'i');
const ZH_PROTOCOL = new RegExp(ZH_PROTOCOL_SOURCE, 'i');
const ZH_HARDWARE = new RegExp(ZH_HARDWARE_SOURCE, 'i');

const EN_LOCAL_MANDATES = [
  new RegExp(String.raw`\b(?:requires?|mandates?|demands?|compels?|obliges?|obligates?|dictates?|stipulates?|prescribes?|needs?|calls?\s+for)\b[^.!?;\n]{0,80}${EN_HARDWARE_SOURCE}`, 'i'),
  new RegExp(String.raw`\b(?:must|shall|has\s+to|have\s+to|is\s+required\s+to|are\s+required\s+to)\s+(?:use|adopt|include|implement|integrate|employ|contain|incorporate)\b[^.!?;\n]{0,56}${EN_HARDWARE_SOURCE}`, 'i'),
  new RegExp(String.raw`\b(?:makes?|treats?|designates?|classifies?|defines?|specifies?)\b[^.!?;\n]{0,64}${EN_HARDWARE_SOURCE}[^.!?;\n]{0,48}\b(?:as\s+)?(?:required|mandated|mandatory|compulsory|obligatory|a\s+requirement|a\s+prerequisite|a\s+mandatory\s+component)\b`, 'i'),
  new RegExp(String.raw`${EN_HARDWARE_SOURCE}[^.!?;\n]{0,56}\b(?:is|are|be|becomes?)\s+(?:required|mandated|mandatory|compulsory|obligatory|a\s+(?:FIDO(?:\s*2(?:\.0)?)?|WebAuthn|CTAP(?:2)?)\s+requirement|a\s+prerequisite|a\s+mandatory\s+component)\b`, 'i'),
  new RegExp(String.raw`${EN_HARDWARE_SOURCE}[^.!?;\n]{0,40}\b(?:must|shall|has\s+to|have\s+to)\s+be\s+(?:used|adopted|included|implemented|integrated|employed|incorporated)\b`, 'i'),
  new RegExp(String.raw`${EN_HARDWARE_SOURCE}[^.!?;\n]{0,40}\b(?:is|are)\s+(?:indispensable|essential)\b`, 'i'),
  new RegExp(String.raw`${EN_HARDWARE_SOURCE}\s*(?:[:=]|[-–—]>?)?\s*(?:required|mandated|mandatory|compulsory|obligatory)\b`, 'i'),
  new RegExp(String.raw`\b(?:required|mandated|mandatory|compulsory|obligatory)\b[^.!?;\n]{0,48}${EN_HARDWARE_SOURCE}`, 'i'),
  new RegExp(String.raw`\bimposes?\s+(?:an?\s+)?(?:requirement|mandate|obligation)\b[^.!?;\n]{0,56}${EN_HARDWARE_SOURCE}`, 'i'),
  new RegExp(String.raw`\b(?:compliance|conformity)\b[^.!?;\n]{0,32}\bdepends?\s+on\b[^.!?;\n]{0,32}${EN_HARDWARE_SOURCE}`, 'i'),
  new RegExp(String.raw`${EN_HARDWARE_SOURCE}[^.!?;\n]{0,40}\b(?:requirement|prerequisite|mandatory\s+component)\b[^.!?;\n]{0,40}${EN_PROTOCOL_SOURCE}`, 'i'),
  new RegExp(String.raw`${EN_PROTOCOL_SOURCE}\s*[-–—]\s*(?:required|mandated|mandatory)[^.!?;\n]{0,40}${EN_HARDWARE_SOURCE}`, 'i')
];

const ZH_LOCAL_MANDATES = [
  new RegExp(String.raw`(?:要求(?:使用|採用|包含|整合|內建|實作|配置)?|強制(?:要求|使用|採用|包含|整合|內建|實作|配置)?|規定(?:必須|須|要)?(?:使用|採用|包含|整合|內建|實作|配置)?|明定(?:必須|須|要)?(?:使用|採用|包含|整合|內建|實作|配置)?|指定(?:必須|須|要)?(?:使用|採用|包含|整合|內建|實作|配置)?)[^，。！？；;\n]{0,48}${ZH_HARDWARE_SOURCE}`, 'i'),
  new RegExp(String.raw`(?:必須|須要?|一律要)(?:使用|採用|包含|整合|內建|實作|配置)?[^，。！？；;\n]{0,40}${ZH_HARDWARE_SOURCE}`, 'i'),
  new RegExp(String.raw`(?:將|把)?\s*${ZH_HARDWARE_SOURCE}[^，。！？；;\n]{0,32}(?:列為|視為|認定為|定為|指定為)[^，。！？；;\n]{0,24}(?:必備|必要|強制|必須|規定)`, 'i'),
  new RegExp(String.raw`${ZH_HARDWARE_SOURCE}[^，。！？；;\n]{0,40}(?:是|為|屬於|被|受)[^，。！？；;\n]{0,32}(?:必備元件|必要元件|強制元件|必備技術|必要條件|強制要求|要求採用|規定採用|所要求|所強制|所規定)`, 'i'),
  new RegExp(String.raw`${ZH_HARDWARE_SOURCE}[^，。！？；;\n]{0,32}${ZH_PROTOCOL_SOURCE}[^，。！？；;\n]{0,32}(?:要求採用|規定採用|規定必須|列為必備|視為必要)`, 'i'),
  new RegExp(String.raw`${ZH_HARDWARE_SOURCE}[^，。！？；;\n]{0,32}(?:不可或缺|不得缺少|不能省略)`, 'i'),
  new RegExp(String.raw`${ZH_HARDWARE_SOURCE}\s*(?:[：:=]|[-–—]>?)?\s*(?:必備|必要|強制|必須)`, 'i'),
  new RegExp(String.raw`(?:必備|必要|強制|必須)[^，。！？；;\n]{0,32}${ZH_HARDWARE_SOURCE}`, 'i')
];

const EN_FORCED_WITHOUT = new RegExp(String.raw`\b(?:cannot|can['’]t)\s+(?:comply|conform|operate|work|function|authenticate|be\s+(?:implemented|certified|compliant))\b[^.!?;\n]{0,48}\bwithout\b[^.!?;\n]{0,32}${EN_HARDWARE_SOURCE}`, 'i');
const ZH_FORCED_WITHOUT = new RegExp(String.raw`(?:若無|沒有|未使用|未採用|缺少)[^。！？；;\n]{0,24}${ZH_HARDWARE_SOURCE}[^。！？；;\n]{0,48}(?:無法|不能|不得)(?:符合|遵循|實作|運作|通過認證|完成認證)`, 'i');
const EN_FORCED_PRESENCE = new RegExp(String.raw`\b(?:cannot|can['’]t|must\s+not|may\s+not)\s+(?:omit|exclude|avoid|remove|dispense\s+with)\b[^.!?;\n]{0,40}${EN_HARDWARE_SOURCE}`, 'i');
const ZH_FORCED_PRESENCE = new RegExp(String.raw`(?:不得|不能)(?:省略|缺少|移除|排除|不使用|不採用)[^，。！？；;\n]{0,32}${ZH_HARDWARE_SOURCE}`, 'i');

const EN_NEGATIONS = [
  /\bneither\b[^.!?;\n]*\bnor\b/i,
  /\bwithout\s+(?:requiring|mandating|forcing|using|adopting|including)\b/i,
  /\b(?:does|do|did|will|would|can|could|should|must|is|are|was|were|has|have|had)\s+(?:not|never)\b/i,
  /\b(?:doesn['’]t|don['’]t|didn['’]t|isn['’]t|aren['’]t|wasn['’]t|weren['’]t|hasn['’]t|haven['’]t|hadn['’]t|won['’]t|wouldn['’]t|cannot|can['’]t|couldn['’]t|shouldn['’]t|mustn['’]t)\b/i,
  /\bneed\s+not\b/i,
  /\bno\s+(?:FIDO\s+)?(?:requirement|mandate|obligation)\b/i,
  /\bnot\s+(?:an?\s+)?(?:FIDO(?:\s*2(?:\.0)?)?|WebAuthn|CTAP(?:2)?)?\s*(?:requirement|mandate|prerequisite|mandatory\s+component)\b/i,
  /\bnot\s+(?:required|mandated|mandatory|compulsory|obligatory)\b/i,
  /\b(?:no|not)\b[^.!?;\n]{0,28}\b(?:evidence|finding|proof)\b[^.!?;\n]{0,32}\b(?:requires?|mandates?|requirement|mandate)\b/i,
  /\b(?:no\s+evidence\s+was|was\s+not|were\s+not)\s+found\b[^.!?;\n]{0,48}\b(?:requires?|mandates?|requirement|mandate)\b/i,
  /\b(?:requires?|mandates?)\s+(?:public\s+|direct\s+|supporting\s+)?(?:evidence|proof|validation|review|testing|analysis)\b[^.!?;\n]{0,80}\b(?:before|to)\b/i,
  /\b(?:requires?|mandates?)\s+(?:the\s+)?(?:protection|security|confidentiality|integrity|encryption|validation|testing|review|analysis|proof|evidence|access\s+control)\b[^.!?;\n]{0,64}\b(?:for|of|before|around|when)\b/i,
  /\b(?:requires?|mandates?)\s+(?:user|credential|device|authenticator|platform)\s+(?:verification|validation|testing|review)\b[^.!?;\n]{0,64}\b(?:before|for|of|around|when)\b/i,
  new RegExp(String.raw`\b(?:the|this|that|our|a|an)\s+(?:product|implementation|profile|authenticator|vendor|platform|system|design|deployment|application|company|customer)\b[^.!?;\n]{0,32}\b(?:not|rather\s+than)\s+${EN_PROTOCOL_SOURCE}[^.!?;\n]{0,40}\b(?:requires?|mandates?)\b`, 'i')
];

const ZH_NEGATIONS = [
  /(?:並)?(?:不|未|無|毋)(?:會|必|須|需|曾|再)?(?:直接|明文|特別|一律|通用)?(?:要求|強制|規定|指定|明定|列為|視為|認定為|限定)/i,
  /(?:沒有|並無|亦無)(?:明文|通用|任何)?(?:要求|規定|強制|必要|必須)/i,
  /(?:並非|不是|不屬於)[^，。！？；;\n]{0,32}(?:必備|必要|強制|必須|要求|規定)/i,
  /(?:並)?非[^，。！？；;\n]{0,24}(?:必備|必要|強制|必須|要求|規定)/i,
  /(?:不必|無須|毋須|無需)(?:使用|採用|包含|整合|內建|實作|配置)?/i,
  /(?:未找到|找不到|沒有找到)[^，。！？；;\n]{0,56}(?:要求|規定|強制|證據)/i,
  /(?:沒有|並無|未有|欠缺)[^，。！？；;\n]{0,32}(?:證據|依據)[^，。！？；;\n]{0,32}(?:要求|規定|強制|必須)/i,
  /(?:不限定|未限定)[^，。！？；;\n]{0,24}(?:必須|須要?|使用|採用)/i,
  /(?:要求|規定)(?:提出|提供|具備|取得)?(?:公開|直接|支持)?(?:證據|依據|驗證|評估|審查)[，,]?[^，。！？；;\n]{0,40}(?:才能|方可|之前|以便)/i,
  /(?:要求|規定)(?:保護|加密|驗證|測試|審查|評估|分析|證明|管控|存取控制)[^，。！？；;\n]{0,64}/i,
  /(?:不代表|不等同於|不意味著|不構成)[^，。！？；;\n]{0,40}(?:要求|強制|必須|規定)/i,
  new RegExp(String.raw`(?:產品|實作|設定檔|認證器|供應商|平台|系統|設計|部署|應用|公司|客戶)[^，。！？；;\n]{0,24}(?:而非|而不是|不是)\s*${ZH_PROTOCOL_SOURCE}[^，。！？；;\n]{0,32}(?:要求|強制|規定|必須)`, 'i')
];

const EN_COMPETING_OWNER = new RegExp(String.raw`(?:\b(?:this|that|the|our|a|an)\s+(?:product|implementation|profile|authenticator|vendor|platform|system|design|deployment|application|company|customer)\b[^.!?;\n]{0,32}\b(?:requires?|mandates?|makes?|treats?|is|are)\b|${EN_HARDWARE_SOURCE}[^.!?;\n]{0,32}\b(?:required|mandated|mandatory)\b[^.!?;\n]{0,20}\b(?:by|for)\s+(?:this|that|the|our|a|an)\s+(?:product|implementation|profile|authenticator|vendor|platform|system|design|deployment|application|company|customer)\b|${EN_HARDWARE_SOURCE}[^.!?;\n]{0,24}\b(?:is|are)\s+(?:an?\s+)?(?:product|implementation|profile|vendor|platform|system|design|deployment|application|company|customer)\s+requirement\b)`, 'i');
const ZH_COMPETING_OWNER = new RegExp(String.raw`(?:(?:此|該|本|我們的|客戶的)?(?:產品|實作|設定檔|認證器|供應商|平台|系統|設計|部署|應用|公司|客戶)[^，。！？；;\n]{0,24}(?:要求|強制|規定|必須|列為|視為|認定為|是|為)|${ZH_HARDWARE_SOURCE}[^，。！？；;\n]{0,28}(?:是|為|屬於)[^，。！？；;\n]{0,20}(?:產品|實作|設定檔|供應商|平台|系統|設計|部署|應用|公司|客戶)(?:要求|規定|必要條件|必備元件))`, 'i');
const EN_OWNER = /\b(?:this|that|the|our|a|an)\s+(?:product|implementation|profile|authenticator|vendor|platform|system|design|deployment|application|company|customer)\b/i;
const ZH_OWNER = /(?:此|該|本|我們的|客戶的)?(?:產品|實作|設定檔|認證器|供應商|平台|系統|設計|部署|應用|公司|客戶)/i;
const EN_PROTOCOL_OPERATOR = /\b(?:requires?|mandates?|demands?|compels?|obliges?|obligates?|dictates?|stipulates?|prescribes?|needs?|makes?|treats?|designates?|classifies?|defines?|specifies?|calls?\s+for|must|shall)\b/i;
const ZH_PROTOCOL_OPERATOR = /(?:要求|強制|規定|明定|指定|將|把|列為|視為|認定為|必須|須要?)/i;

const splitSentences = (text, locale) => String(text || '')
  .split(locale === 'en' ? /(?<!\d)\.(?!\d)|[!?\n]+/ : /[。！？\n]+/)
  .map((value) => value.trim())
  .filter(Boolean);

const splitClauses = (sentence, locale) => {
  const delimiter = locale === 'en'
    ? /(;|,?\s+(?:but|however|yet|while|and|or)\s+)/gi
    : /([；;]|[，,]?\s*(?:但(?:是)?|然而|可是|卻|並且|而且|同時|並(?!非)|且)\s*)/g;
  const parts = sentence.split(delimiter);
  const clauses = [];
  let connector = '';
  for (const part of parts) {
    if (!part) continue;
    if (part.match(new RegExp(`^(?:${delimiter.source})$`, locale === 'en' ? 'i' : ''))) {
      connector = part.trim().toLowerCase();
      continue;
    }
    clauses.push({ text: part.trim(), connector });
    connector = '';
  }
  return clauses.filter((item) => item.text);
};

const hasAny = (patterns, value) => patterns.some((pattern) => pattern.test(value));
const startsAsSubjectlessContinuation = (value, locale) => locale === 'en'
  ? /^\s*(?:(?:it|they)\s+)?(?:requires?|mandates?|must|shall|has\s+to|have\s+to|makes?|treats?|designates?|classifies?|defines?|specifies?|calls?\s+for)\b/i.test(value)
  : /^\s*(?:(?:它|其|該規範)\s*)?(?:要求|強制|規定|明定|指定|必須|須要?|將|把|列為|視為|認定為)/i.test(value);

const connectorCarriesSubject = (connector, clause, locale) => {
  if (!connector) return false;
  if (connector === ';' || connector === '；') return startsAsSubjectlessContinuation(clause, locale);
  return true;
};

const hasCompetingMandateOwner = (clause, locale) => {
  const competing = locale === 'en' ? EN_COMPETING_OWNER : ZH_COMPETING_OWNER;
  if (!competing.test(clause)) return false;
  const protocol = locale === 'en' ? EN_PROTOCOL : ZH_PROTOCOL;
  const owner = locale === 'en' ? EN_OWNER : ZH_OWNER;
  const protocolIndex = clause.search(protocol);
  const ownerIndex = clause.search(owner);
  if (protocolIndex < 0 || ownerIndex < 0 || protocolIndex >= ownerIndex) return true;
  const between = clause.slice(protocolIndex, ownerIndex);
  const operator = locale === 'en' ? EN_PROTOCOL_OPERATOR : ZH_PROTOCOL_OPERATOR;
  return !operator.test(between);
};

const clauseHasAttributedMandate = (clause, locale, attributed) => {
  if (!attributed) return false;
  const hardware = locale === 'en' ? EN_HARDWARE : ZH_HARDWARE;
  if (!hardware.test(clause)) return false;
  if (hasCompetingMandateOwner(clause, locale)) return false;
  const forcedPresence = locale === 'en'
    ? [EN_FORCED_WITHOUT, EN_FORCED_PRESENCE]
    : [ZH_FORCED_WITHOUT, ZH_FORCED_PRESENCE];
  if (hasAny(forcedPresence, clause)) return true;
  const negations = locale === 'en' ? EN_NEGATIONS : ZH_NEGATIONS;
  if (hasAny(negations, clause)) return false;
  return hasAny(locale === 'en' ? EN_LOCAL_MANDATES : ZH_LOCAL_MANDATES, clause);
};

export const containsHardwareMandate = (values, locale) => {
  if (!['en', 'zh'].includes(locale)) throw new TypeError(`Unsupported locale: ${locale}`);
  const protocol = locale === 'en' ? EN_PROTOCOL : ZH_PROTOCOL;

  return values.some((value) => splitSentences(value, locale).some((sentence) => {
    let protocolContext = false;
    for (const { text: clause, connector } of splitClauses(sentence, locale)) {
      const explicitProtocol = protocol.test(clause);
      const inheritedProtocol = protocolContext && connectorCarriesSubject(connector, clause, locale);
      if (clauseHasAttributedMandate(clause, locale, explicitProtocol || inheritedProtocol)) return true;
      protocolContext = explicitProtocol || inheritedProtocol;
    }
    return false;
  }));
};
