const bi = (en, zh) => ({ en, zh });

export const FIDO_EVIDENCE_CLASSES = [
  'SPECIFICATION',
  'HISTORICAL SPECIFICATION',
  'CERTIFICATION REQUIREMENT',
  'NAMED IMPLEMENTATION',
  'VENDOR SECURITY ADVISORY',
  'VENDOR COLLATERAL',
  'AUTHORITATIVE GUIDANCE',
  'CERTIFICATION GUIDANCE',
  'INDEPENDENT ATTACK',
  'INDEPENDENT RESEARCH',
  'REFERENCE ARCHITECTURE'
];

export const fidoSecurity = {
  schemaVersion: '1.1.0',
  reviewedDate: '2026-09-04',
  pov: bi('neutral NVM Knowledge Hub editor', '中立的 NVM Knowledge Hub 編輯者'),
  title: bi(
    'FIDO2 hardware trust is an assurance architecture—not a memory checklist',
    'FIDO2 硬體信任是一套安全保證架構，不是一張指定記憶體清單'
  ),
  lede: bi(
    'WebAuthn and CTAP define ceremonies, credential semantics and protocol behavior; FIDO security-certification requirements define assurance outcomes. OTP, PUF, updateable NVM and hardening circuits are implementation choices that must be tied to a threat model, lifecycle and evidence.',
    'WebAuthn 與 CTAP 定義互動儀式、credential 語義與協定行為；FIDO 安全認證要求則定義安全保證成果。OTP、PUF、可更新 NVM 與防護電路屬實作選擇，必須綁定威脅模型、生命週期與證據。'
  ),
  verdicts: [
    {
      id: 'se-not-required',
      label: bi('PROTOCOL BOUNDARY', '協定邊界'),
      headline: bi('A Secure Element is a route, not a FIDO2 mandate', 'Secure Element 是可行路徑，不是 FIDO2 強制條件'),
      body: bi(
        'A conforming authenticator may be implemented in an SE, TPM, TEE, protected SoC subsystem, external roaming device or another boundary. Higher security certification narrows acceptable protection, but still evaluates outcomes rather than naming one memory technology.',
        '合規 authenticator 可實作於 SE、TPM、TEE、受保護 SoC 子系統、外接 roaming device 或其他邊界。較高安全認證會收斂可接受的防護強度，但仍評估安全成果，而非指定單一記憶體技術。'
      ),
      evidenceClass: 'SPECIFICATION',
      sourceIds: ['WA3', 'ASPR17', 'ASPR151', 'CERTLEVELS', 'L3', 'L3PLUS']
    },
    {
      id: 'attestation-registration',
      label: bi('CEREMONY BOUNDARY', '互動儀式邊界'),
      headline: bi('Attestation belongs to registration; assertions authenticate', 'Attestation 用於註冊；assertion 才執行登入驗證'),
      body: bi(
        'Optional attestation can help a relying party evaluate authenticator provenance during credential creation. Routine sign-in uses the RP-scoped credential private key to sign an authentication assertion; it does not repeatedly present an OTP-held “chip identity card.”',
        '可選的 attestation 可在建立 credential 時協助 RP 評估 authenticator 來源。日常登入則由綁定 RP 的 credential private key 簽署 authentication assertion，不是每次都由 OTP 出示「晶片身分證」。'
      ),
      evidenceClass: 'SPECIFICATION',
      sourceIds: ['WA3', 'KEY2015', 'MDS31']
    },
    {
      id: 'storage-flexibility',
      label: bi('STORAGE BOUNDARY', '儲存邊界'),
      headline: bi('Credential state is logical; the physical medium is implementation-defined', 'Credential state 是邏輯模型；物理媒介由實作決定'),
      body: bi(
        'Discoverable credentials need client-side state. Server-side credentials can place an encrypted credential source in an RP-held credential ID, allowing an authenticator to approach stateless operation. Backup eligibility is a separate axis: a multi-device credential is permitted to be backed up, while the BS flag indicates whether it is currently backed up.',
        'Discoverable credential 需要 client-side state；server-side credential 可將加密 credential source 封裝於由 RP 保存的 credential ID，使 authenticator 接近無個別 credential 狀態。Backup eligibility 是另一個獨立軸線：multi-device credential 允許被備份；BS flag 才表示目前是否已備份。'
      ),
      evidenceClass: 'SPECIFICATION',
      sourceIds: ['WA3', 'CTAP22', 'ASPR16']
    }
  ],
  ceremonies: [
    {
      id: 'registration',
      sequence: '01',
      title: bi('Registration', '註冊'),
      question: bi('Should this new credential be trusted', '這組新 credential 是否應被信任'),
      steps: [
        bi('RP creates a challenge and credential policy', 'RP 建立 challenge 與 credential policy'),
        bi('Authenticator creates an RP-scoped key pair', 'Authenticator 建立綁定 RP 的 key pair'),
        bi('If requested and available, attestation may convey evidence about authenticator provenance or properties', '若有請求且可取得，attestation 可傳遞 authenticator 來源或特性的證據'),
        bi('RP validates the registration response; when attestation evidence is conveyed, it verifies the statement and, where applicable, its trust path and metadata against local policy', 'RP 驗證註冊回應；若有傳遞 attestation 證據，則依本地政策驗證 statement，並在適用時查核 trust path 與 metadata'),
        bi('RP stores the credential public key and identifier', 'RP 保存 credential public key 與識別資料')
      ],
      boundary: bi(
        'Default attestation conveyance is none. AAGUID identifies a model or implementation class—not one chip—and is not provably authentic without attestation.',
        '預設 attestation conveyance 為 none。AAGUID 識別型號或實作品類，不代表單一晶片；未經 attestation，AAGUID 不具可證明的真實性。'
      ),
      sourceIds: ['WA3', 'MDS31']
    },
    {
      id: 'authentication',
      sequence: '02',
      title: bi('Authentication', '登入驗證'),
      question: bi('Can this authenticator prove control of the RP-scoped private key', '這個 authenticator 能否證明它控制綁定 RP 的私鑰'),
      steps: [
        bi('RP sends a fresh challenge and RP context', 'RP 傳送新的 challenge 與 RP 情境'),
        bi('Authenticator checks RP binding and user presence or verification', 'Authenticator 檢查 RP 綁定與使用者在場或驗證'),
        bi('Credential private key signs the authenticator data and challenge binding', 'Credential private key 簽署 authenticator data 與 challenge 綁定'),
        bi('RP verifies the assertion with the stored public key', 'RP 以已保存的 public key 驗證 assertion'),
        bi('Counter and risk signals may inform policy but are not universal clone proof', 'Counter 與風險訊號可輔助政策判定，但不是通用的複製證明')
      ],
      boundary: bi(
        'The credential private key remains controlled by the authenticator boundary; the specification does not dictate a cache, EEPROM or PUF data path.',
        'Credential private key 由 authenticator 邊界控制；規範不指定 cache、EEPROM 或 PUF 的資料路徑。'
      ),
      sourceIds: ['WA3', 'ASPR16']
    }
  ],
  keyClasses: [
    {
      id: 'credential-private-key',
      name: bi('Credential private key', 'Credential private key'),
      role: bi('Signs an RP-scoped authentication assertion', '簽署綁定 RP 的 authentication assertion'),
      persistence: bi('Credential-source modality is client-side discoverable or server-side; private-key material may be stored, wrapped or implementation-specifically derived. Backup eligibility is an independent credential property.', 'Credential source modality 為 client-side discoverable 或 server-side；私鑰材料則可由實作採保存、wrapped 或衍生。Backup eligibility 是獨立的 credential property。'),
      boundary: bi('A protocol object; not a synonym for a device root, attestation key or EEPROM record.', '屬於協定物件；不等同裝置根、attestation key 或 EEPROM 紀錄。'),
      sourceIds: ['WA3', 'CTAP22']
    },
    {
      id: 'attestation-private-component',
      name: bi('Attestation private component', 'Attestation private component'),
      role: bi('Supports an optional registration-time attestation model', '支援可選的註冊階段 attestation 模型'),
      persistence: bi('Basic uses a model-/batch-specific attestation key pair; Self uses the credential key; AttCA and AnonCA are CA-mediated; None carries no attestation information', 'Basic 使用特定型號／批次共用的 attestation key pair；Self 使用 credential key；AttCA 與 AnonCA 由 CA 介入；None 不攜帶 attestation information'),
      boundary: bi('Enterprise is a separate controlled-deployment conveyance mode. Key existence, uniqueness and storage depend on type, conveyance and lifecycle.', 'Enterprise 是受控部署中的另一種 conveyance 模式。金鑰是否存在、是否唯一與如何儲存，取決於 type、conveyance 與生命週期。'),
      sourceIds: ['WA3', 'ASPR16', 'MDS31']
    },
    {
      id: 'authenticator-seed',
      name: bi('Authenticator seed / wrapping key', 'Authenticator seed／wrapping key'),
      role: bi('Derives or authenticates a credential envelope', '衍生或驗證 credential envelope'),
      persistence: bi('Protected internal state; may reduce per-credential local storage', '受保護的內部狀態；可降低個別 credential 的本地儲存需求'),
      boundary: bi('An allowed internal architecture, not a universally named WebAuthn object.', '屬於允許的內部架構，不是 WebAuthn 統一定名的物件。'),
      sourceIds: ['WA3', 'GPSEPP', 'STSAFEA100']
    },
    {
      id: 'device-root',
      name: bi('Device root / HUK / KEK', 'Device root／HUK／KEK'),
      role: bi('Anchors a product-specific key hierarchy or secure-storage boundary', '錨定產品特定的金鑰階層或安全儲存邊界'),
      persistence: bi('May be PUF-reconstructed, provisioned in protected NVM, or supplied by a key ladder', '可由 PUF 重建、佈署於受保護 NVM，或由 key ladder 提供'),
      boundary: bi('A product architecture term; FIDO does not prescribe its source or name.', '屬於產品架構術語；FIDO 不規定其來源或名稱。'),
      sourceIds: ['SYNPUF', 'NXPLPCPUF', 'GPSEPP']
    }
  ],
  storageModels: [
    {
      id: 'discoverable',
      label: bi('DISCOVERABLE', '可探索'),
      title: bi('Client-side credential state', 'Client-side credential state'),
      nvmPressure: bi('Higher per-credential persistent-state demand', '較高的個別 credential 持久狀態需求'),
      body: bi(
        'The authenticator or client platform can locate a credential from the RP ID without the RP first supplying a credential ID. Protected updateable storage is therefore a natural—but not uniquely prescribed—implementation.',
        'Authenticator 或 client platform 可僅依 RP ID 找到 credential，不必先由 RP 提供 credential ID。因此受保護的可更新儲存是自然選項，但並非唯一指定實作。'
      ),
      candidates: bi('Secure NVM, encrypted platform storage, protected backup or synchronization when BE=1', 'Secure NVM、加密平台儲存，以及僅於 BE=1 時適用的受保護備份或同步'),
      evidenceClass: 'SPECIFICATION',
      semanticSourceIds: ['WA3', 'CTAP22'],
      candidateStatus: 'REFERENCE ARCHITECTURE',
      candidateSourceIds: ['GPSEPP', 'STSAFEA100'],
      sourceIds: ['WA3', 'CTAP22', 'GPSEPP', 'STSAFEA100']
    },
    {
      id: 'server-side',
      label: bi('SERVER-SIDE', '伺服器端'),
      title: bi('Wrapped credential source', 'Wrapped credential source'),
      nvmPressure: bi('Lower per-credential local-NVM demand', '較低的個別 credential 本地 NVM 需求'),
      body: bi(
        'An encrypted, integrity-protected credential source can be carried inside the credential ID that the RP returns later. The authenticator still needs durable wrapping or derivation secrets and lifecycle protection.',
        '加密並具完整性保護的 credential source 可封裝在 credential ID 中，之後由 RP 回傳。Authenticator 仍需持久的 wrapping／derivation secret 與生命週期保護。'
      ),
      candidates: bi('Device wrapping key, PUF-derived key, protected root secret', 'Device wrapping key、PUF-derived key、受保護 root secret'),
      evidenceClass: 'SPECIFICATION',
      semanticSourceIds: ['WA3', 'CTAP22'],
      candidateStatus: 'REFERENCE ARCHITECTURE',
      candidateSourceIds: ['GPSEPP', 'STSAFEA100', 'SYNPUF', 'NXPLPCPUF'],
      sourceIds: ['WA3', 'CTAP22', 'GPSEPP', 'STSAFEA100', 'SYNPUF', 'NXPLPCPUF']
    }
  ],
  backupEligibility: [
    {
      id: 'single-device',
      label: bi('BE = 0', 'BE = 0'),
      title: bi('Single-device credential', 'Single-device credential'),
      body: bi('The credential is not eligible for backup. This does not determine whether its credential source is discoverable, wrapped or regenerated.', 'Credential 不允許備份；這不決定其 credential source 採 discoverable、wrapped 或重新導出。'),
      state: bi('BS remains 0', 'BS 維持 0'),
      sourceIds: ['WA3']
    },
    {
      id: 'multi-device',
      label: bi('BE = 1', 'BE = 1'),
      title: bi('Multi-device credential', 'Multi-device credential'),
      body: bi('The credential is eligible to be backed up; synchronization is one possible mechanism. BS separately reports whether it is currently backed up.', 'Credential 允許被備份；同步只是可能機制之一。BS 另行表示目前是否已備份。'),
      state: bi('BE is immutable after creation; BS may change with backup state', 'BE 建立後不得改變；BS 可隨備份狀態改變'),
      sourceIds: ['WA3']
    }
  ],
  memoryRoles: [
    {
      id: 'immutable-policy',
      technology: bi('Physical OTP / ROM candidate', '實體 OTP／ROM 候選'),
      asset: bi('Immutable boot policy, lifecycle, trust anchors, revocation budget', '不可變 boot policy、生命週期、trust anchor、撤銷預算'),
      value: bi('Strong write-once state and compact on-chip trust anchor', '提供強健的一次寫入狀態與精簡 on-chip trust anchor'),
      limit: bi('FIDO does not prescribe Anti-Fuse, eFuse or any OTP bitcell. Product evidence must establish the physical implementation; irreversible provisioning magnifies custody and recovery risk.', 'FIDO 不指定 Anti-Fuse、eFuse 或任何 OTP bitcell；實體結構必須由具名產品證據證明，且不可逆佈署會放大保管與復原風險。'),
      status: 'REFERENCE ARCHITECTURE',
      sourceIds: ['WA3', 'ASPR16', 'CCICPP']
    },
    {
      id: 'logical-otp',
      technology: bi('Logical OTP / locked-NVM zone', 'Logical OTP／鎖定 NVM 區'),
      asset: bi('Provisioned constants, configuration or lifecycle state', '已佈署常數、設定或生命週期狀態'),
      value: bi('A reprogrammable NVM region may become permanently read-only after provisioning.', '可重寫 NVM 區域可在 provisioning 後永久鎖定為唯讀。'),
      limit: bi('The term “OTP zone” does not establish an Anti-Fuse or eFuse bitcell. The physical medium must be verified from product evidence.', '「OTP zone」這個名稱不能證明底層採 Anti-Fuse 或 eFuse bitcell；實體媒介必須由產品證據確認。'),
      status: 'NAMED IMPLEMENTATION',
      sourceIds: ['ATECC608B']
    },
    {
      id: 'device-root',
      technology: bi('SRAM PUF or protected root-key NVM', 'SRAM PUF 或受保護 root-key NVM'),
      asset: bi('Device-bound root or key-encryption key', 'Device-bound root 或 key-encryption key'),
      value: bi('A PUF can reconstruct a root secret at startup without storing that secret in plaintext NVM.', 'PUF 可在啟動時重建 root secret，而不必將該祕密以明文保存於 NVM。'),
      limit: bi('Enrollment, helper-data integrity, error correction, PVT/aging, failure recovery, KDF isolation and transient leakage remain in scope.', 'Enrollment、helper-data 完整性、error correction、PVT／老化、失效復原、KDF 隔離與暫態洩漏仍須納入。'),
      status: 'REFERENCE ARCHITECTURE',
      sourceIds: ['SYNPUF', 'NXPLPCPUF', 'IACRPUF2015', 'IACRPUF2017']
    },
    {
      id: 'updateable-state',
      technology: bi('Protected EEPROM / Flash / MTP / MRAM candidate', '受保護 EEPROM／Flash／MTP／MRAM 候選'),
      asset: bi('Discoverable credential source, metadata, retries, rollback state', 'Discoverable credential source、metadata、retry、rollback state'),
      value: bi('Supports authenticated updates, deletion and bounded lifecycle changes.', '支援具驗證的更新、刪除與有限生命週期變更。'),
      limit: bi('Encryption alone is insufficient: integrity, freshness, rollback, access control, power-fail behavior and destruction need explicit contracts.', '僅有加密仍不足夠；完整性、新鮮度、rollback、access control、掉電行為與銷毀都需要明確契約。'),
      status: 'REFERENCE ARCHITECTURE',
      sourceIds: ['WA3', 'GPSEPP', 'NXPSE050', 'STSAFEA100']
    },
    {
      id: 'transient-state',
      technology: bi('Secure SRAM / registers', 'Secure SRAM／register'),
      asset: bi('Reconstructed secrets, masks, intermediate values and session state', '重建祕密、mask、中間值與 session state'),
      value: bi('Shortens plaintext lifetime and keeps key use inside a controlled boundary.', '縮短明文存活時間，並將金鑰使用限制於受控邊界。'),
      limit: bi('Volatile does not mean invisible: power, EM, fault, remanence and debug paths still require controls.', '揮發性不代表不可觀察；功耗、EM、fault、remanence 與 debug path 仍需控制。'),
      status: 'REFERENCE ARCHITECTURE',
      sourceIds: ['ASPR16', 'NXPSE050', 'ATECC608B']
    }
  ],
  namedExamples: [
    {
      id: 'synopsys-secure-storage',
      product: bi('Synopsys Secure Storage Solution', 'Synopsys Secure Storage Solution'),
      pattern: bi('SRAM PUF + OTP + cryptographic engine + secure controller', 'SRAM PUF＋OTP＋cryptographic engine＋secure controller'),
      insight: bi('Public material establishes an integrated secure-storage block set. It does not by itself establish FIDO certification, credential modality or every physical hardening feature.', '公開資料可證明整合式安全儲存方塊組合，但不能單獨證明 FIDO 認證、credential modality 或每項實體防護功能。'),
      evidenceClass: 'NAMED IMPLEMENTATION',
      sourceIds: ['SYNSSS', 'SYNPUF']
    },
    {
      id: 'nxp-lpc-puf',
      product: bi('NXP LPC55Sxx SRAM PUF', 'NXP LPC55Sxx SRAM PUF'),
      pattern: bi('Device-unique KEK with activation code and key codes in protected flash', 'Device-unique KEK；activation code 與 key code 位於受保護 Flash'),
      insight: bi('A concrete example that “the root secret is not stored in plaintext” still requires persistent helper or activation material and a defined zeroize path.', '具體證明「root secret 不以明文儲存」仍需要持久 helper／activation material，以及明確的 zeroize 路徑。'),
      evidenceClass: 'NAMED IMPLEMENTATION',
      sourceIds: ['NXPLPCPUF']
    },
    {
      id: 'microchip-logical-otp',
      product: bi('Microchip ATECC608B-TFLXTLS', 'Microchip ATECC608B-TFLXTLS'),
      pattern: bi('A locked OTP zone implemented inside an EEPROM array', '在 EEPROM array 內實作並鎖定的 OTP zone'),
      insight: bi('A decisive counterexample: a product label such as “OTP zone” does not disclose the physical bitcell.', '具決定性的反例：產品使用「OTP zone」名稱，不代表已揭露其實體 bitcell。'),
      evidenceClass: 'NAMED IMPLEMENTATION',
      sourceIds: ['ATECC608B']
    },
    {
      id: 'nxp-se050-objects',
      product: bi('NXP EdgeLock SE050', 'NXP EdgeLock SE050'),
      pattern: bi('Persistent and transient secure objects with protected import/export', '持久與暫態 secure object，加上受保護 import／export'),
      insight: bi('Shows that an SE can combine NVM descriptors, RAM-resident transient content and protected remote storage rather than one universal EEPROM database.', '說明 SE 可以組合 NVM descriptor、位於 RAM 的暫態內容與受保護遠端儲存，不必只有單一通用 EEPROM database。'),
      evidenceClass: 'NAMED IMPLEMENTATION',
      sourceIds: ['NXPSE050']
    },
    {
      id: 'stsafe-envelope',
      product: bi('STSAFE-A100', 'STSAFE-A100'),
      pattern: bi('Partitioned EEPROM plus wrap/unwrap envelopes for host storage', '分區 EEPROM，加上提供 host storage 的 wrap／unwrap envelope'),
      insight: bi('Shows how the local wrapping key can stay inside the SE while an encrypted and authenticated envelope resides in host storage.', '說明 local wrapping key 可留在 SE 內，而經加密與驗證的 envelope 可位於 host storage。'),
      evidenceClass: 'NAMED IMPLEMENTATION',
      sourceIds: ['STSAFEA100']
    },
    {
      id: 'optiga-object-store',
      product: bi('Infineon OPTIGA Trust M', 'Infineon OPTIGA Trust M'),
      pattern: bi('Tamper-resistant NVM with object, certificate and key slots', '具防竄改能力的 NVM，搭配 object、certificate 與 key slot'),
      insight: bi('Public evidence supports protected object storage, but does not justify inferring a PUF root or a particular address-scrambling design.', '公開證據支持受保護 object storage，但不能據此推論 PUF root 或特定位址 scrambling 設計。'),
      evidenceClass: 'NAMED IMPLEMENTATION',
      sourceIds: ['OPTIGATM']
    }
  ],
  assuranceMatrix: [
    {
      id: 'sca-leakage',
      threat: bi('Power, EM and timing leakage', '功耗、EM 與 timing 洩漏'),
      levelScope: bi('Req. 5.4: L1+ and higher · reqs. 5.5 and 5.7: L3 and higher · req. 5.6: L1+, L2+ and higher; relevant guidance at L2', 'Req. 5.4：L1+ 以上 · reqs. 5.5 與 5.7：L3 以上 · req. 5.6：L1+、L2+ 以上；L2 另有相關指引'),
      certificationClaimStatus: bi('REQUIREMENT ONLY · PRODUCT CERTIFICATION NOT ESTABLISHED', '僅代表認證要求 · 未證明產品已取得認證'),
      toeScope: bi('Exact authenticator boundary, algorithm, library, silicon, firmware, package and configuration', '確切 authenticator 邊界、演算法、library、silicon、firmware、package 與 configuration'),
      requirementStatus: 'CERTIFICATION REQUIREMENT',
      requirementSourceIds: ['ASPR151', 'CERTLEVELS'],
      outcome: bi('Secret-key operations must stay within defined use bounds. Applicable power/EM leakage and remotely observable timing variations must not reduce secret/private ASP below its claimed strength; at L3 and higher, cryptographic execution time using a secret/private ASP must not depend on its value.', '祕密金鑰操作必須維持在定義的使用上限內。適用的功耗／EM 洩漏與遠端可觀察 timing 變化，不得使祕密／私密 ASP 低於宣稱強度；在 L3 以上，使用祕密／私密 ASP 的密碼運算時間不得依其值而改變。'),
      patterns: bi('Constant-time arithmetic, masking or blinding, and target-evaluated randomization', 'Constant-time 運算、masking／blinding，以及經目標晶片評估的隨機化'),
      patternStatus: 'REFERENCE ARCHITECTURE',
      patternSourceIds: ['EUCLEAK', 'IACR1380', 'CORON2010', 'NXPP40'],
      caution: bi('No single technique guarantees a flat trace or makes DPA categorically fail; leakage must be measured on the target.', '沒有單一技術能保證功耗軌跡完全平坦，或讓 DPA 必然失效；必須在目標晶片上量測洩漏。'),
      cautionSourceIds: ['EUCLEAK', 'IACR1380', 'CORON2010'],
      sourceIds: ['ASPR151', 'CERTLEVELS', 'EUCLEAK', 'IACR1380', 'CORON2010', 'NXPP40']
    },
    {
      id: 'fault-injection',
      threat: bi('Fault injection and control-flow corruption', 'Fault injection 與控制流程破壞'),
      levelScope: bi('Level-specific applicability · L3/L3+ use mapped attack-potential evaluation', '依認證等級適用 · L3／L3+ 採對應攻擊能力評估'),
      certificationClaimStatus: bi('REQUIREMENT ONLY · PRODUCT CERTIFICATION NOT ESTABLISHED', '僅代表認證要求 · 未證明產品已取得認證'),
      toeScope: bi('Exact authenticator boundary, silicon, firmware, package and enabled lifecycle state', '確切 authenticator 邊界、silicon、firmware、package 與啟用的生命週期狀態'),
      requirementStatus: 'CERTIFICATION REQUIREMENT',
      requirementSourceIds: ['ASPR151', 'CERTLEVELS'],
      outcome: bi('Induced faults must not expose secrets or bypass the security objective.', '誘發錯誤不得洩露祕密或繞過安全目標。'),
      patterns: bi('Voltage/clock/temperature sensors, redundant checks, result verification, hardened control flow, safe failure state', '電壓／時脈／溫度 sensor、冗餘檢查、結果驗證、強化控制流程、安全失效狀態'),
      patternStatus: 'REFERENCE ARCHITECTURE',
      patternSourceIds: ['NXPP40', 'CCICPP'],
      caution: bi('Sensors and zeroization are product responses, not a universal FIDO circuit prescription.', 'Sensor 與 zeroization 是產品回應，不是 FIDO 通用電路處方。'),
      cautionSourceIds: ['ASPR151', 'NXPP40'],
      sourceIds: ['ASPR151', 'CERTLEVELS', 'NXPP40', 'CCICPP']
    },
    {
      id: 'physical-extraction',
      threat: bi('Probing, delayering and NVM imaging', '探針、逐層拆解與 NVM imaging'),
      levelScope: bi('L3 and higher · physical-tamper outcome with companion evaluation', 'L3 以上 · 實體竄改成果與搭配認證評估'),
      certificationClaimStatus: bi('REQUIREMENT ONLY · PRODUCT CERTIFICATION NOT ESTABLISHED', '僅代表認證要求 · 未證明產品已取得認證'),
      toeScope: bi('Exact TOE, package, exposed interfaces, physical boundary and companion certificate', '確切 TOE、package、暴露介面、實體邊界與搭配 certificate'),
      requirementStatus: 'CERTIFICATION REQUIREMENT',
      requirementSourceIds: ['ASPR151', 'L3', 'L3PLUS'],
      outcome: bi('Physical access must not reveal directly usable secret material within the evaluated effort.', '在受評估攻擊強度內，實體存取不得洩露可直接使用的祕密材料。'),
      patterns: bi('Active shield, encrypted NVM, protected buses, tamper response, split or derived secrets', 'Active shield、加密 NVM、受保護 bus、tamper response、拆分或衍生祕密'),
      patternStatus: 'REFERENCE ARCHITECTURE',
      patternSourceIds: ['NXPP40', 'CCICPP', 'STSCRAMBLE'],
      caution: bi('Address scrambling raises mapping cost but does not replace authenticated encryption or access control.', 'Address scrambling 可提高實體映射成本，但不能取代具驗證加密或 access control。'),
      cautionSourceIds: ['ASPR151', 'STSCRAMBLE'],
      sourceIds: ['ASPR151', 'L3', 'L3PLUS', 'NXPP40', 'CCICPP', 'STSCRAMBLE']
    },
    {
      id: 'state-integrity',
      threat: bi('Rollback, replay and state substitution', 'Rollback、replay 與狀態置換'),
      levelScope: bi('All claimed ASP protections · external storage adds stale-data replay protection', '所有宣稱的 ASP 防護 · 外部儲存另須防止重播舊資料'),
      certificationClaimStatus: bi('REQUIREMENT ONLY · PRODUCT CERTIFICATION NOT ESTABLISHED', '僅代表認證要求 · 未證明產品已取得認證'),
      toeScope: bi('Exact security parameter, storage boundary, update path, rollback model and destruction rule', '確切 security parameter、儲存邊界、更新路徑、rollback 模型與銷毀規則'),
      requirementStatus: 'CERTIFICATION REQUIREMENT',
      requirementSourceIds: ['ASPR16', 'GPSEPP'],
      outcome: bi('All authenticator security parameters require protection against modification or substitution; secret parameters also require protection against disclosure. Parameters stored outside the authenticator boundary additionally require cryptographic protection against stale-data replay.', '所有 authenticator security parameter 都須防止未授權修改或置換；屬於祕密者還須防止洩露。儲存在 authenticator 邊界之外的參數，另須以密碼機制防止重播舊資料。'),
      patterns: bi('AEAD or MAC, version binding, monotonic state, authenticated metadata, atomic update and recovery', 'AEAD 或 MAC、版本綁定、monotonic state、具驗證 metadata、atomic update 與復原'),
      patternStatus: 'REFERENCE ARCHITECTURE',
      patternSourceIds: ['GPSEPP', 'STSAFEA100'],
      caution: bi('A counter may be global, per credential or absent; it is only one risk signal.', 'Counter 可為全域、個別 credential 或未實作；它只是其中一種風險訊號。'),
      cautionSourceIds: ['WA3'],
      sourceIds: ['ASPR16', 'GPSEPP', 'STSAFEA100', 'WA3']
    }
  ],
  eucleak: {
    title: bi('EUCLEAK shows why evaluated implementation matters', 'EUCLEAK 說明為何必須驗證實作'),
    summary: bi(
      'The 2024 EUCLEAK research recovered a FIDO ECDSA private key from a YubiKey 5Ci by exploiting near-field EM leakage from a non-constant-time modular inversion in Infineon’s ECDSA library. Yubico separately identified affected pre-remediation product generations. This was an implementation attack, not a break of WebAuthn or CTAP.',
      '2024 年 EUCLEAK 研究利用 Infineon ECDSA library 中非 constant-time modular inversion 所產生的近場 EM 洩漏，從 YubiKey 5Ci 恢復一把 FIDO ECDSA 私鑰；Yubico 另行公布受影響的修正前產品世代。這是實作層攻擊，不是 WebAuthn 或 CTAP 協定遭破解。'
    ),
    conditions: [
      bi('Physical possession of the target device', '需要實體取得目標裝置'),
      bi('Specialized near-field EM acquisition and analysis', '需要專業近場 EM 擷取與分析'),
      bi('Ability to trigger and measure repeated vulnerable ECDSA signing operations; the reported demonstration used 200 signatures and obtained five successful recoveries—about 40 traces per successful case on average, not a universal minimum', '必須能重複觸發並量測有弱點的 ECDSA 簽章；公開示範使用 200 次簽章並得到 5 次成功恢復，平均每個成功案例約需 40 組 trace，但這不是通用最低值'),
      bi('An affected library and firmware generation plus target-account context; PIN/UV or credential ID may be required by credential policy—not every FIDO authenticator is affected', '需要受影響的 library 與 firmware 世代及目標帳號情境；依 credential policy，可能另需 PIN／UV 或 credential ID，且並非所有 FIDO authenticator 都受影響')
    ],
    lesson: bi(
      'A secure chip label, protocol certification or protected NVM does not substitute for measured side-channel resistance of the exact algorithm, library, silicon and firmware path.',
      'Secure chip 標籤、協定認證或受保護 NVM，都不能取代對確切演算法、library、silicon 與 firmware path 的側道量測。'
    ),
    sourceIds: ['EUCLEAK', 'IACR1380', 'YSA202403']
  },
  claims: [
    {
      id: 'mandatory-se-trio',
      claim: bi('“FIDO2 requires an SE with OTP, PUF and EEPROM.”', '「FIDO2 要求 SE 必須同時具備 OTP、PUF 與 EEPROM。」'),
      status: bi('REJECTED', '退回'),
      correction: bi('FIDO specifies behavior and assurance outcomes; this trio is one reference architecture.', 'FIDO 規定行為與安全保證成果；這組合只是一種參考架構。'),
      sourceIds: ['WA3', 'ASPR16']
    },
    {
      id: 'attestation-every-login',
      claim: bi('“The attestation key is always stored in OTP and shown at every login.”', '「Attestation key 一定放在 OTP，且每次登入都會出示。」'),
      status: bi('REJECTED', '退回'),
      correction: bi('Attestation is generally a registration-time signal. WebAuthn types include Basic, Self, AttCA, AnonCA and None; enterprise is a separate controlled-deployment conveyance and request mode.', 'Attestation 通常是註冊階段訊號。WebAuthn type 包含 Basic、Self、AttCA、AnonCA 與 None；enterprise 則是受控部署中的另一種 conveyance 與 request mode。'),
      sourceIds: ['WA3', 'ASPR16', 'MDS31']
    },
    {
      id: 'passkey-in-eeprom',
      claim: bi('“Every passkey private key resides in SE EEPROM.”', '「每一把 passkey 私鑰都常駐在 SE EEPROM。」'),
      status: bi('REJECTED', '退回'),
      correction: bi('Credential storage may be client-side discoverable or server-side. Backup eligibility is a separate dimension: a credential may be single-device or multi-device. The physical medium remains implementation-defined.', 'Credential storage 可為 client-side discoverable 或 server-side；backup eligibility 是另一個獨立維度，credential 可為 single-device 或 multi-device。物理媒介仍由實作決定。'),
      sourceIds: ['WA3', 'CTAP22', 'GPSEPP']
    },
    {
      id: 'puf-no-secret-memory',
      claim: bi('“PUF means no secret ever exists in memory.”', '「採用 PUF 就代表任何記憶體中都不會出現祕密。」'),
      status: bi('NARROWED', '限縮'),
      correction: bi('A root secret need not persist in plaintext NVM, but reconstructed and derived material exists transiently and must be protected.', 'Root secret 不必以明文持久保存，但重建與衍生材料仍會短暫存在，必須受到保護。'),
      sourceIds: ['NXPLPCPUF', 'IACRPUF2015', 'IACRPUF2017']
    },
    {
      id: 'scrambling-defeats-fib',
      claim: bi('“Address scrambling defeats FIB extraction.”', '「Address scrambling 能阻止 FIB 擷取。」'),
      status: bi('NARROWED', '限縮'),
      correction: bi('It may raise physical mapping cost, but does not replace encryption, integrity or access control. FIDO does not bind the mapping to a PUF; a PUF-derived mapping remains a proposed or configuration-specific feature unless direct product evidence establishes it.', '它可提高實體映射成本，但不能取代加密、完整性或 access control。FIDO 也沒有規定 mapping 必須由 PUF 決定；除非具名產品證據直接證明，PUF-derived mapping 必須標為 proposed architecture／configuration-specific feature。'),
      sourceIds: ['ASPR16', 'STSCRAMBLE']
    },
    {
      id: 'otp-zone-physical-cell',
      claim: bi('“An OTP zone proves an Anti-Fuse or eFuse implementation.”', '「名稱為 OTP zone，就能證明底層是 Anti-Fuse 或 eFuse。」'),
      status: bi('REJECTED', '退回'),
      correction: bi('An OTP zone may be a permanently locked region of EEPROM or Flash. Its physical bitcell must be established from product evidence.', 'OTP zone 也可能是永久鎖定的 EEPROM 或 Flash 區；實體 bitcell 必須由產品證據確認。'),
      sourceIds: ['ATECC608B']
    },
    {
      id: 'tamper-erases-eeprom',
      claim: bi('“A tamper event automatically erases the entire EEPROM.”', '「偵測到竄改時，裝置一定會自動抹除整顆 EEPROM。」'),
      status: bi('REJECTED', '退回'),
      correction: bi('A product may zeroize selected secrets, invalidate a wrapping key or object, lock or reset, enter a secure error state, or decommission. FIDO names key zeroization as one possible response; it neither requires blanket EEPROM erasure nor sets a universal response-time bound.', '產品可以歸零特定祕密、使 wrapping key 或物件失效、鎖定或 reset、進入安全錯誤狀態，或 decommission。FIDO 僅把金鑰 zeroization 列為一種可能回應；既不要求全面抹除 EEPROM，也未設定通用反應時間上限。'),
      sourceIds: ['ASPR151', 'ASPR16', 'GPSEPP', 'FIPSIG']
    },
    {
      id: 'aes-system-pq',
      claim: bi('“AES-256 makes the entire FIDO secure-storage system post-quantum safe.”', '「採用 AES-256，就能證明整套 FIDO 安全儲存系統具備後量子安全性。」'),
      status: bi('REJECTED', '退回'),
      correction: bi('AES-256 is expected to retain substantial algorithm-level resistance to known quantum key-search methods; it does not by itself establish system-level post-quantum security. Any system claim must also cover authentication, attestation, PKI, firmware-update, provisioning and migration algorithms end to end.', 'AES-256 對已知量子金鑰搜尋方法仍預期保有相當的演算法層抵抗力；但它本身不能建立系統層後量子安全。任何系統主張仍須端到端涵蓋 authentication、attestation、PKI、firmware update、provisioning 與遷移演算法。'),
      sourceIds: ['NISTPQC', 'WA3']
    }
  ],
  decisionGates: [
    bi('Choose the deployment boundary: roaming token, platform authenticator, SE applet, TEE/TPM or SoC security subsystem.', '先選定部署邊界：roaming token、platform authenticator、SE applet、TEE／TPM 或 SoC security subsystem。'),
    bi('Choose both credential axes: storage modality (client-side discoverable or server-side) and backup eligibility (single-device or multi-device). BE is immutable after creation; BS is current backup state, and BE=0 with BS=1 is invalid.', '分別選定兩個 credential 軸線：儲存 modality（client-side discoverable 或 server-side）與 backup eligibility（single-device 或 multi-device）。BE 建立後不得改變；BS 表示目前備份狀態，而 BE=0、BS=1 是不合法組合。'),
    bi('Define acceptable attestation types and the RP conveyance policy separately: Basic, Self, AttCA, AnonCA or None; and none, indirect, direct or enterprise conveyance as applicable.', '分別定義可接受的 attestation type 與 RP conveyance policy：type 為 Basic、Self、AttCA、AnonCA 或 None；conveyance preference 則依情境採 none、indirect、direct 或 enterprise。'),
    bi('Inventory every authenticator security parameter, its storage location, protection, input/output path and destruction rule.', '盤點每項 authenticator security parameter 的儲存位置、防護、輸入輸出路徑與銷毀規則。'),
    bi('Bind OTP, PUF and updateable NVM roles to provisioning custody, revocation, rollback, recovery and power-fail behavior.', '把 OTP、PUF 與可更新 NVM 角色綁定到佈署保管、撤銷、rollback、復原與掉電行為。'),
    bi('Validate side-channel, fault and physical resistance on the exact silicon, library, firmware and package configuration.', '在確切 silicon、library、firmware 與 package configuration 上驗證側道、fault 與實體攻擊抵抗能力。'),
    bi('Map evidence to the claimed FIDO security level and any companion CC, FIPS or product certification.', '將證據對應到宣稱的 FIDO security level，以及任何搭配的 CC、FIPS 或產品認證。')
  ],
  sources: [
    { id: 'WA3', class: 'SPECIFICATION', label: bi('Web Authentication Level 3', 'Web Authentication Level 3'), actor: bi('W3C Recommendation · 25 August 2026', 'W3C Recommendation · 2026 年 8 月 25 日'), locator: bi('§1, §4, §6.1.1, §6.2.2, §6.5, §7.1–7.2, §13.4.4', '§1、§4、§6.1.1、§6.2.2、§6.5、§7.1–7.2、§13.4.4'), url: 'https://www.w3.org/TR/webauthn-3/' },
    { id: 'CTAP22', class: 'SPECIFICATION', label: bi('Client to Authenticator Protocol 2.2', 'Client to Authenticator Protocol 2.2'), actor: bi('FIDO Alliance Proposed Standard', 'FIDO Alliance Proposed Standard'), locator: bi('§6.1.3 and credential-management sections', '§6.1.3 與 credential-management 章節'), url: 'https://fidoalliance.org/specs/fido-v2.2-ps-20250714/fido-client-to-authenticator-protocol-v2.2-ps-20250714.html' },
    { id: 'ASPR17', class: 'CERTIFICATION REQUIREMENT', label: bi('Authenticator Security and Privacy Requirements v1.7', 'Authenticator Security and Privacy Requirements v1.7'), actor: bi('FIDO certification table: ACTIVE; source document: Review Draft', 'FIDO 認證頁列為 ACTIVE；來源文件本身為 Review Draft'), locator: bi('Certification-version status only; the document states that it is not intended as an implementation basis', '僅用於認證版本狀態；文件明示不應作為實作依據'), url: 'https://fidoalliance.org/specs/fido-security-requirements/fido-authenticator-security-requirements-v1.7-rd-20260506.html' },
    { id: 'ASPR16', class: 'CERTIFICATION REQUIREMENT', label: bi('Authenticator Security and Privacy Requirements v1.6', 'Authenticator Security and Privacy Requirements v1.6'), actor: bi('FIDO Alliance', 'FIDO Alliance'), locator: bi('General ASP and storage protections; active until 2027-01-13', '一般 ASP 與儲存防護；有效至 2027-01-13'), url: 'https://fidoalliance.org/specs/fido-security-requirements/fido-authenticator-security-requirements-v1.6-fd-20250312.html' },
    { id: 'ASPR151', class: 'CERTIFICATION REQUIREMENT', label: bi('Authenticator Security and Privacy Requirements v1.5.1', 'Authenticator Security and Privacy Requirements v1.5.1'), actor: bi('FIDO Alliance', 'FIDO Alliance'), locator: bi('§3.5 requirements 5.1 and 5.3–5.9; 5.3 names key zeroization only as one possible tamper response; 5.4 bounds secret-key use; required baseline for L3/L3+', '§3.5 requirements 5.1 與 5.3–5.9；5.3 僅把金鑰 zeroization 列為一種可能的竄改回應；5.4 限制祕密金鑰使用次數；L3／L3+ 必用基準'), url: 'https://fidoalliance.org/specs/fido-security-requirements/fido-authenticator-security-requirements-v1.5.1-fd-20251016.html' },
    { id: 'CERTLEVELS', class: 'CERTIFICATION REQUIREMENT', label: bi('Authenticator certification levels and active versions', 'Authenticator 認證等級與有效版本'), actor: bi('FIDO Alliance', 'FIDO Alliance'), locator: bi('v1.7 ACTIVE; v1.6 active until 2027-01-13; v1.5.1 has no expiry and must be used for L3/L3+', 'v1.7 為 ACTIVE；v1.6 有效至 2027-01-13；v1.5.1 未列到期日且 L3／L3+ 必須使用'), url: 'https://fidoalliance.org/certification/authenticator-certification-levels/' },
    { id: 'L3', class: 'CERTIFICATION REQUIREMENT', label: bi('Authenticator Level 3', 'Authenticator Level 3'), actor: bi('FIDO Alliance', 'FIDO Alliance'), locator: bi('L3 architecture and companion-certification paths', 'L3 架構與搭配認證路徑'), url: 'https://fidoalliance.org/certification/authenticator-certification-levels/authenticator-level-3/' },
    { id: 'L3PLUS', class: 'CERTIFICATION REQUIREMENT', label: bi('Authenticator Level 3+', 'Authenticator Level 3+'), actor: bi('FIDO Alliance', 'FIDO Alliance'), locator: bi('Moderate/high-effort chip-level attack scope and companion-certification path', '中度／高度攻擊能力的晶片層範圍與搭配認證路徑'), url: 'https://fidoalliance.org/certification/authenticator-certification-levels/authenticator-level-3-plus/' },
    { id: 'MDS31', class: 'SPECIFICATION', label: bi('FIDO Metadata Statement 3.1', 'FIDO Metadata Statement 3.1'), actor: bi('FIDO Alliance', 'FIDO Alliance'), locator: bi('AAGUID and authenticator metadata', 'AAGUID 與 authenticator metadata'), url: 'https://fidoalliance.org/specs/mds/fido-metadata-statement-v3.1-ps-20250521.html' },
    { id: 'KEY2015', class: 'HISTORICAL SPECIFICATION', label: bi('FIDO 2.0 Key Attestation Format (historical)', 'FIDO 2.0 Key Attestation Format（歷史文件）'), actor: bi('FIDO Alliance, 2015', 'FIDO Alliance，2015'), locator: bi('§2 attestation models and status notice; superseded context only', '§2 attestation model 與文件狀態說明；僅作歷史脈絡'), url: 'https://fidoalliance.org/specs/fido-v2.0-ps-20150904/fido-key-attestation-v2.0-ps-20150904.html' },
    { id: 'GPSEPP', class: 'CERTIFICATION REQUIREMENT', label: bi('Protection Profile for FIDO2 SE v1.0 · GPC_SPE_210', 'FIDO2 SE Protection Profile v1.0 · GPC_SPE_210'), actor: bi('GlobalPlatform · published March 2025', 'GlobalPlatform · 2025 年 3 月發布'), locator: bi('FCS_CKM.4 key destruction; FPT_PHP.3 physical-tamper response; FPT_EMS.1 leakage resistance; SE TOE only', 'FCS_CKM.4 金鑰銷毀；FPT_PHP.3 實體竄改回應；FPT_EMS.1 洩漏抵抗；僅限 SE TOE'), url: 'https://globalplatform.org/specs-library/fido2-se-protection-profile/' },
    { id: 'EUCLEAK', class: 'INDEPENDENT ATTACK', label: bi('EUCLEAK full technical report', 'EUCLEAK 完整技術報告'), actor: bi('NinjaLab', 'NinjaLab'), locator: bi('pp. 12, 15–16, 58 and 62: YubiKey 5Ci target, physical setup, 200 signatures and demonstrated effort', '第 12、15–16、58、62 頁：YubiKey 5Ci、實體量測、200 次簽章與示範成本'), url: 'https://ninjalab.io/wp-content/uploads/2024/09/20240903_eucleak.pdf' },
    { id: 'IACR1380', class: 'INDEPENDENT ATTACK', label: bi('EUCLEAK technical paper · ePrint 2024/1380', 'EUCLEAK 技術論文 · ePrint 2024/1380'), actor: bi('Thomas Roche · NinjaLab', 'Thomas Roche · NinjaLab'), locator: bi('§5.4.3 attack results and §5.5 conclusions', '§5.4.3 攻擊結果與 §5.5 結論'), url: 'https://eprint.iacr.org/2024/1380.pdf' },
    { id: 'YSA202403', class: 'VENDOR SECURITY ADVISORY', label: bi('YSA-2024-03 security advisory', 'YSA-2024-03 安全公告'), actor: bi('Yubico', 'Yubico'), locator: bi('Summary; Affected; Affected Use Cases → YubiKey FIDO → Authentication / Attestation', 'Summary、Affected 與 Affected Use Cases → YubiKey FIDO → Authentication／Attestation'), url: 'https://www.yubico.com/support/security-advisories/ysa-2024-03/' },
    { id: 'SYNSSS', class: 'NAMED IMPLEMENTATION', label: bi('Secure Storage Solution for OTP', 'Secure Storage Solution for OTP'), actor: bi('Synopsys', 'Synopsys'), locator: bi('SRAM PUF, crypto engine, secure controller and OTP integration', 'SRAM PUF、crypto engine、secure controller 與 OTP 整合'), url: 'https://www.synopsys.com/designware-ip/memories-logic-libraries/secure-storage-otp-ip.html' },
    { id: 'SYNPUF', class: 'NAMED IMPLEMENTATION', label: bi('Physical Unclonable Function IP', 'Physical Unclonable Function IP'), actor: bi('Synopsys', 'Synopsys'), locator: bi('SRAM PUF-derived key reconstruction', 'SRAM PUF-derived key 重建'), url: 'https://www.synopsys.com/designware-ip/security-ip/cryptography-ip/puf/security-puf-ip.html' },
    { id: 'NXPSE050', class: 'NAMED IMPLEMENTATION', label: bi('EdgeLock SE050 data sheet', 'EdgeLock SE050 data sheet'), actor: bi('NXP', 'NXP'), locator: bi('§3.2 credential and secure-object storage', '§3.2 credential 與 secure-object 儲存'), url: 'https://cache.nxp.com/docs/en/data-sheet/SE050-DATASHEET.pdf' },
    { id: 'OPTIGATM', class: 'NAMED IMPLEMENTATION', label: bi('OPTIGA Trust M data sheet', 'OPTIGA Trust M data sheet'), actor: bi('Infineon', 'Infineon'), locator: bi('Protected objects, key slots, user memory and counters', '受保護 object、key slot、user memory 與 counter'), url: 'https://www.infineon.com/assets/row/public/documents/30/49/infineon-optiga-trust-m-datasheet-en.pdf' },
    { id: 'STSAFEL010', class: 'NAMED IMPLEMENTATION', label: bi('STSAFE-L010 product page', 'STSAFE-L010 產品頁'), actor: bi('STMicroelectronics', 'STMicroelectronics'), locator: bi('Factory personalization and device key example', '工廠個人化與裝置金鑰範例'), url: 'https://www.st.com/en/secure-mcus/stsafe-l010.html' },
    { id: 'NXPLPCPUF', class: 'NAMED IMPLEMENTATION', label: bi('AN12324 — LPC55Sxx SRAM PUF', 'AN12324 — LPC55Sxx SRAM PUF'), actor: bi('NXP', 'NXP'), locator: bi('pp. 1–8: SRAM startup, activation/key codes, GetKey and Zeroize', '第 1–8 頁：SRAM startup、activation／key code、GetKey 與 Zeroize'), url: 'https://www.nxp.com/docs/en/application-note/AN12324.pdf' },
    { id: 'ATECC608B', class: 'NAMED IMPLEMENTATION', label: bi('ATECC608B-TFLXTLS data sheet', 'ATECC608B-TFLXTLS data sheet'), actor: bi('Microchip', 'Microchip'), locator: bi('pp. 20–22: OTP zone inside EEPROM array; SRAM and TempKey', '第 20–22 頁：位於 EEPROM array 的 OTP zone；SRAM 與 TempKey'), url: 'https://ww1.microchip.com/downloads/en/DeviceDoc/ATECC608B-TFLXTLS-CryptoAuthentication-Data-Sheet-DS40002249A.pdf' },
    { id: 'STSAFEA100', class: 'NAMED IMPLEMENTATION', label: bi('STSAFE-A100 data sheet', 'STSAFE-A100 data sheet'), actor: bi('STMicroelectronics', 'STMicroelectronics'), locator: bi('p. 16 and pp. 19–22: partitioned EEPROM and wrap/unwrap envelope', '第 16、19–22 頁：分區 EEPROM 與 wrap／unwrap envelope'), url: 'https://www.st.com/resource/en/datasheet/stsafe-a100.pdf' },
    { id: 'IACRPUF2015', class: 'INDEPENDENT RESEARCH', label: bi('Efficient Fuzzy Extraction of PUF-Induced Secrets', 'PUF-induced secret 的高效率 fuzzy extraction'), actor: bi('IACR ePrint 2015/854', 'IACR ePrint 2015/854'), locator: bi('Abstract: noisy response, fuzzy extractor and entropy', '摘要：noisy response、fuzzy extractor 與 entropy'), url: 'https://eprint.iacr.org/2015/854' },
    { id: 'IACRPUF2017', class: 'INDEPENDENT RESEARCH', label: bi('Helper-data manipulation analysis', 'Helper-data manipulation 分析'), actor: bi('IACR ePrint 2017/493', 'IACR ePrint 2017/493'), locator: bi('pp. 1–2 and p. 12: helper data and manipulation risk', '第 1–2、12 頁：helper data 與 manipulation risk'), url: 'https://eprint.iacr.org/2017/493.pdf' },
    { id: 'CCICPP', class: 'CERTIFICATION REQUIREMENT', label: bi('Security IC Platform Protection Profile v2.0', 'Security IC Platform Protection Profile v2.0'), actor: bi('Common Criteria', 'Common Criteria'), locator: bi('pp. 6–9: assets, optional packages and implementation-neutral security objectives', '第 6–9 頁：資產、選用 package 與技術中立的安全目標'), url: 'https://www.commoncriteriaportal.org/nfs/ccpfiles/files/ppfiles/pp0084V2b_pdf.pdf' },
    { id: 'FIPSIG', class: 'CERTIFICATION GUIDANCE', label: bi('FIPS 140-3 Implementation Guidance', 'FIPS 140-3 Implementation Guidance'), actor: bi('NIST CMVP', 'NIST CMVP'), locator: bi('§§5.A, 9.7.A and 9.7.B; scoped to FIPS 140-3 modules', '§§5.A、9.7.A 與 9.7.B；僅適用 FIPS 140-3 module 範圍'), url: 'https://csrc.nist.gov/CSRC/media/Projects/cryptographic-module-validation-program/documents/fips%20140-3/FIPS%20140-3%20IG.pdf' },
    { id: 'STSCRAMBLE', class: 'VENDOR COLLATERAL', label: bi('Automotive hardware secure element for digital key', '車用數位金鑰硬體安全元件'), actor: bi('STMicroelectronics technical presentation', 'STMicroelectronics 技術簡報'), locator: bi('p. 4: bus/memory scrambling and encryption shown as distinct controls', '第 4 頁：bus／memory scrambling 與 encryption 分列為不同控制'), url: 'https://www.st.com/content/dam/OLM%20Email%20Marketing/2023/asia_pac/events/2023-st-tw-techday/sm03_st-automotive-hw-secure-element-for-digital-key.pdf' },
    { id: 'NXPP40', class: 'NAMED IMPLEMENTATION', label: bi('P40 Security Target Lite', 'P40 Security Target Lite'), actor: bi('NXP', 'NXP'), locator: bi('p. 4 and pp. 60–64: active shield, sensors, secure reset, scrambling, encryption and randomization', '第 4、60–64 頁：active shield、sensor、secure reset、scrambling、encryption 與 randomization'), url: 'https://www.commoncriteriaportal.org/files/epfiles/P40_HW_SecurityTargetLite_v15.pdf' },
    { id: 'CORON2010', class: 'INDEPENDENT RESEARCH', label: bi('An Efficient Method for Random Delay Countermeasures', 'Random delay 對策的有效分析方法'), actor: bi('Coron and Kizhvatov · CHES 2010', 'Coron 與 Kizhvatov · CHES 2010'), locator: bi('Random-delay realignment and residual-leakage analysis', 'Random delay 重新對齊與殘餘洩漏分析'), url: 'https://www.iacr.org/archive/ches2010/62250090/62250090.pdf' },
    { id: 'NISTPQC', class: 'AUTHORITATIVE GUIDANCE', label: bi('Post-Quantum Cryptography FAQ', 'Post-Quantum Cryptography FAQ'), actor: bi('NIST', 'NIST'), locator: bi('AES and Grover key-search discussion; algorithm-level scope', 'AES 與 Grover 金鑰搜尋說明；僅限演算法層範圍'), url: 'https://csrc.nist.gov/Projects/Post-Quantum-Cryptography/faqs' }
  ]
};
