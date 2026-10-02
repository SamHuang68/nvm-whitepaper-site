const bi = (en, zh) => ({ en, zh });

export const APPLICATION_EVIDENCE_LABELS = [
  'PUBLIC REQUIREMENT',
  'NAMED IMPLEMENTATION',
  'INDEPENDENT OBSERVATION',
  'VENDOR DISCLOSURE',
  'BOUNDED INFERENCE',
  'EMERGING RESEARCH'
];

export const applicationAtlas = {
  schemaVersion: '1.2.0',
  freezeId: 'R24-NVM-APPLICATION-ATLAS-2026-09-04',
  reviewedDate: '2026-09-04',
  pov: 'neutral NVM Knowledge Hub editor',
  rationales: [
    { id: 'all', label: bi('All applications', '全部應用') },
    { id: 'security', label: bi('Security & identity', '安全與身分') },
    { id: 'repair', label: bi('Repair & reliability', '修復與可靠度') },
    { id: 'configuration', label: bi('Configuration & power', '設定與電源') },
    { id: 'calibration', label: bi('Calibration & product data', '校準與產品資料') },
    { id: 'emerging', label: bi('Emerging & opportunity', '新興技術與機會') }
  ],
  cases: [
    {
      id: 'APP-AI-ROOT-001',
      sequence: '01',
      rationale: 'security',
      title: bi('AI accelerator root of trust', 'AI 加速器信任根'),
      subtitle: bi('Immutable state anchors module identity and boot decisions', '不可變狀態支撐模組身分與開機決策'),
      summary: bi('The OAI-OAM specification defines immutable root-of-trust behavior and names OTP as one possible implementation. The system requirement is public; the memory macro remains a design choice.', 'OAI-OAM 規範定義不可變的信任根行為，並將 OTP 列為可能實作之一。系統需求是公開的，但記憶體 macro 仍屬設計選擇。'),
      evidenceLabel: 'PUBLIC REQUIREMENT',
      stateFlow: {
        trigger: bi('Manufacturing or ownership provisioning', '製造或所有權佈署'),
        payload: bi('Identity, key digest and security-version state', '身分、金鑰摘要與安全版本狀態'),
        reader: bi('Root-of-trust boot logic', '信任根開機邏輯'),
        consumer: bi('Module authentication and secure boot', '模組驗證與 secure boot')
      },
      contract: {
        writeCadence: bi('Once or monotonic lifecycle updates', '一次寫入或單向生命週期更新'),
        candidateTechnology: bi('OTP or another immutable memory implementation', 'OTP 或其他不可變記憶體實作'),
        processLens: bi('Advanced-node accelerator or companion security logic', '先進節點加速器或伴隨式安全邏輯')
      },
      proof: bi('A public accelerator-module specification requires immutable trust state and explicitly gives OTP as an example.', '公開的加速器模組規範要求不可變信任狀態，並明確以 OTP 作為範例。'),
      notProof: bi('It does not mandate a vendor, PUF, density, physical location or one NVM technology.', '它不指定供應商、PUF、容量、實體位置或單一 NVM 技術。'),
      validationGate: bi('Close the lifecycle, revocation, capacity, threat model and target-process implementation.', '確認生命週期、撤銷機制、容量、威脅模型與目標製程實作。'),
      sources: [
        { label: bi('OCP OAI-OAM Base Specification r2.0', 'OCP OAI-OAM 基礎規範 r2.0'), actor: bi('Public specification', '公開規範'), url: 'https://www.opencompute.org/documents/oai-oam-base-specification-r2-0-v1-0-20230919-pdf' }
      ]
    },
    {
      id: 'APP-AI-HBM-002',
      sequence: '02',
      rationale: 'repair',
      title: bi('HBM persistent repair', 'HBM 持久化修復'),
      subtitle: bi('A repaired mapping must survive reset and remain visible to attestation', '修復後的映射必須跨越重置，並能被 attestation 正確反映'),
      summary: bi('Public NVIDIA documentation establishes fuse-programmed HBM repair and its effect on attestation. It does not disclose a universal bitcell, capacity, interface or die location.', 'NVIDIA 公開文件建立了 fuse-programmed HBM 修復及其對 attestation 的影響，但未揭露通用 bitcell、容量、介面或所在 die。'),
      evidenceLabel: 'NAMED IMPLEMENTATION',
      stateFlow: {
        trigger: bi('Post-package memory failure and controlled repair', '封裝後記憶體失效與受控修復'),
        payload: bi('Persistent row or channel remap state', '持久化 row 或 channel remap 狀態'),
        reader: bi('HBM initialization and memory controller', 'HBM 初始化與記憶體控制器'),
        consumer: bi('RAS operation, inventory and attestation', 'RAS 運作、資產盤點與 attestation')
      },
      contract: {
        writeCadence: bi('Rare service event; irreversible or tightly governed', '罕見維修事件；不可逆或高度受控'),
        candidateTechnology: bi('Persistent fuse-backed repair state; exact technology undisclosed', 'fuse-backed 持久修復狀態；確切技術未公開'),
        processLens: bi('HBM stack and package lifecycle boundary', 'HBM 堆疊與封裝生命週期邊界')
      },
      proof: bi('A named production platform documents persistent HBM repair, fuse programming and attestation consequences.', '具名量產平台公開記載 HBM 持久修復、fuse programming 與 attestation 後果。'),
      notProof: bi('The sources do not establish Base Die or Logic Die placement, nor OTP, eFuse or antifuse as the universal technology.', '來源無法證明必然位於 Base Die 或 Logic Die，也無法證明通用技術必然是 OTP、eFuse 或 antifuse。'),
      validationGate: bi('Identify generation-specific state location, repair budget, programming authority and attestation policy.', '確認特定世代的狀態位置、修復預算、燒錄權責與 attestation 政策。'),
      sources: [
        { label: bi('NVIDIA HBM3 repair advisory', 'NVIDIA HBM3 修復公告'), actor: bi('Named platform documentation', '具名平台文件'), url: 'https://docs.nvidia.com/attestation/secureai-advisory-hbm3-resiliency-impact-on-driver-versions-r550-0-r550-90-12/index.html' },
        { label: bi('NVIDIA A100 row remapping', 'NVIDIA A100 row remapping'), actor: bi('Named platform documentation', '具名平台文件'), url: 'https://docs.nvidia.com/deploy/a100-gpu-mem-error-mgmt/595/row-remapping.html' }
      ]
    },
    {
      id: 'APP-SOC-REPAIR-018',
      sequence: '03',
      rationale: 'repair',
      title: bi('AI SoC SRAM and cache repair', 'AI SoC SRAM 與 cache 修復'),
      subtitle: bi('Repair signatures restore usable capacity after every reset', '修復 signature 在每次重置後恢復可用容量'),
      summary: bi('Synopsys STAR Memory System publicly describes repair flows that can interface with OTP or foundry eFuse. The system need is credible; the preferred storage family remains target-specific.', 'Synopsys STAR Memory System 公開說明可連接 OTP 或 foundry eFuse 的修復流程。系統需求可信，但偏好的儲存技術仍取決於目標設計。'),
      evidenceLabel: 'VENDOR DISCLOSURE',
      stateFlow: {
        trigger: bi('Wafer, package or power-on memory test', '晶圓、封裝或上電記憶體測試'),
        payload: bi('Row and column repair signatures', 'row 與 column 修復 signature'),
        reader: bi('Memory repair controller at initialization', '初始化階段的記憶體修復控制器'),
        consumer: bi('SRAM, cache and register-file availability', 'SRAM、cache 與 register file 可用性')
      },
      contract: {
        writeCadence: bi('Factory write with optional later repair events', '工廠寫入，可選擇支援後續修復事件'),
        candidateTechnology: bi('OTP or foundry eFuse interface', 'OTP 或 foundry eFuse 介面'),
        processLens: bi('Repair density, pad current, test flow and advanced-node area', '修復密度、pad 電流、測試流程與先進節點面積')
      },
      proof: bi('The vendor discloses an integrated repair flow and both OTP and foundry-eFuse interfaces.', '供應商公開整合式修復流程，以及 OTP 與 foundry-eFuse 兩種介面。'),
      notProof: bi('It does not publish a universal density crossover, preferred NVM family or named AI customer design.', '它未公開通用密度交叉點、優先 NVM 家族或具名 AI 客戶設計。'),
      validationGate: bi('Model bit count, programming pads and current, package-stage repair, redundancy and exact PDK support.', '建模 bit 數、燒錄 pad 與電流、封裝階段修復、redundancy 與確切 PDK 支援。'),
      sources: [
        { label: bi('Synopsys STAR Memory System datasheet', 'Synopsys STAR Memory System datasheet'), actor: bi('Vendor', '供應商'), url: 'https://www.synopsys.com/content/dam/synopsys/implementation%26signoff/datasheets/star-bist-ds.pdf' }
      ]
    },
    {
      id: 'APP-BMC-019',
      sequence: '04',
      rationale: 'security',
      title: bi('BMC secure boot and lifecycle', 'BMC secure boot 與生命週期'),
      subtitle: bi('The management controller persists trust before the host is available', '管理控制器在 host 尚未啟動前就必須保留信任狀態'),
      summary: bi('ASPEED socsec tooling exposes OTP-image, key, patch and ECC workflows for supported BMC devices. This is a concrete implementation, not a universal BMC memory map.', 'ASPEED socsec 工具公開支援 BMC 裝置的 OTP image、key、patch 與 ECC 流程。這是具體實作，不代表所有 BMC 都採用相同 memory map。'),
      evidenceLabel: 'NAMED IMPLEMENTATION',
      stateFlow: {
        trigger: bi('Board provisioning and lifecycle transition', '板級佈署與生命週期轉換'),
        payload: bi('Key hashes, boot policy, patch and ECC state', '金鑰 hash、開機政策、patch 與 ECC 狀態'),
        reader: bi('BMC ROM and security engine', 'BMC ROM 與安全引擎'),
        consumer: bi('Platform secure boot and remote management trust', '平台 secure boot 與遠端管理信任')
      },
      contract: {
        writeCadence: bi('Staged irreversible provisioning', '分階段不可逆佈署'),
        candidateTechnology: bi('On-chip OTP with hardware-managed access', '具硬體管理存取的 on-chip OTP'),
        processLens: bi('Management-controller SoC and board provisioning flow', '管理控制器 SoC 與板級佈署流程')
      },
      proof: bi('Public tools and product material document a real OTP provisioning workflow on supported ASPEED devices.', '公開工具與產品資料記載支援 ASPEED 裝置的實際 OTP 佈署流程。'),
      notProof: bi('It does not show that every BMC uses the same OTP organization, bitcell, PUF or provisioning sequence.', '它不代表每個 BMC 都使用相同 OTP 組織、bitcell、PUF 或佈署順序。'),
      validationGate: bi('Bind the exact device generation, field map, secure update path, factory custody and recovery policy.', '綁定確切裝置世代、field map、安全更新路徑、工廠保管與恢復政策。'),
      sources: [
        { label: bi('ASPEED socsec repository', 'ASPEED socsec repository'), actor: bi('Named implementation tooling', '具名實作工具'), url: 'https://github.com/AspeedTech-BMC/socsec' },
        { label: bi('ASPEED AST2600 product page', 'ASPEED AST2600 產品頁'), actor: bi('Product vendor', '產品供應商'), url: 'https://www.aspeedtech.com/server_ast2600/' }
      ]
    },
    {
      id: 'APP-CALIPTRA-020',
      sequence: '05',
      rationale: 'security',
      title: bi('Caliptra root of trust', 'Caliptra 信任根'),
      subtitle: bi('Persistent lifecycle fuses and a PUF solve different parts of trust', '持久 lifecycle fuse 與 PUF 解決不同的信任問題'),
      summary: bi('Caliptra integration requires the SoC to supply persistent fuse fields. A standards-compliant PUF may provide an obfuscation key, but it complements rather than removes revocation and lifecycle state.', 'Caliptra 整合要求 SoC 提供持久 fuse 欄位。符合標準的 PUF 可提供 obfuscation key，但它是補強，而不是取代撤銷與生命週期狀態。'),
      evidenceLabel: 'PUBLIC REQUIREMENT',
      stateFlow: {
        trigger: bi('SoC manufacturing, ownership and revocation events', 'SoC 製造、所有權與撤銷事件'),
        payload: bi('UDS seed, hashes, revocation masks and lifecycle', 'UDS seed、hash、撤銷 mask 與生命週期'),
        reader: bi('Caliptra ROM and key-vault logic', 'Caliptra ROM 與 key-vault 邏輯'),
        consumer: bi('Measured boot, identity and update authorization', 'measured boot、身分與更新授權')
      },
      contract: {
        writeCadence: bi('Provision once plus monotonic revocation', '一次佈署加上單向撤銷'),
        candidateTechnology: bi('Persistent fuses with optional PUF-assisted obfuscation', '持久 fuse，搭配可選的 PUF-assisted obfuscation'),
        processLens: bi('RoT integration boundary in advanced SoCs', '先進 SoC 的 RoT 整合邊界')
      },
      proof: bi('The public integration contract names persistent fields and defines where a PUF may participate.', '公開整合契約列出持久欄位，並定義 PUF 可參與的位置。'),
      notProof: bi('It does not mandate one fuse technology or state that a PUF eliminates lifecycle and revocation storage.', '它不指定單一 fuse 技術，也未宣稱 PUF 可消除生命週期與撤銷儲存。'),
      validationGate: bi('Resolve fuse ownership, provisioning custody, obfuscation-key behavior, revocation budget and recovery.', '確認 fuse 權責、佈署保管、obfuscation key 行為、撤銷預算與恢復機制。'),
      sources: [
        { label: bi('Caliptra ROM fuse-register documentation', 'Caliptra ROM fuse-register 文件'), actor: bi('Open specification', '開放規範'), url: 'https://github.com/chipsalliance/caliptra-sw/blob/main/rom/dev/README.md' },
        { label: bi('Caliptra integration specification', 'Caliptra 整合規範'), actor: bi('Open specification', '開放規範'), url: 'https://github.com/chipsalliance/caliptra-rtl/blob/main/docs/CaliptraIntegrationSpecification.md' }
      ]
    },
    {
      id: 'APP-RP2350-028',
      sequence: '06',
      rationale: 'security',
      title: bi('RP2350 provisioning and physical attack', 'RP2350 佈署與實體攻擊'),
      subtitle: bi('A named OTP implementation also reveals why system-level protection matters', '具名 OTP 實作同時說明為何仍需系統層級保護'),
      summary: bi('Raspberry Pi documents Synopsys OTP for keys, locks and configuration. IOActive extracted state from the tested 40-nm family, invalidating absolute invisibility claims without proving every antifuse implementation is identical.', 'Raspberry Pi 公開 Synopsys OTP 用於 key、lock 與設定。IOActive 從受測 40-nm 家族擷取狀態，推翻絕對不可見的說法，但不能推論所有 antifuse 實作都相同。'),
      evidenceLabel: 'INDEPENDENT OBSERVATION',
      stateFlow: {
        trigger: bi('Device personalization and irreversible locking', '裝置個人化與不可逆鎖定'),
        payload: bi('Key fingerprints, flash keys, locks and configuration', '金鑰 fingerprint、flash key、lock 與設定'),
        reader: bi('Boot ROM and OTP controller', 'Boot ROM 與 OTP controller'),
        consumer: bi('Secure boot, flash decryption and lifecycle enforcement', 'secure boot、flash 解密與生命週期執行')
      },
      contract: {
        writeCadence: bi('Staged irreversible provisioning', '分階段不可逆佈署'),
        candidateTechnology: bi('Gate-dielectric-breakdown antifuse OTP in the tested family', '受測家族採 gate-dielectric-breakdown antifuse OTP'),
        processLens: bi('Tested TSMC 40-nm family; later nodes remain separate evidence questions', '受測 TSMC 40-nm 家族；更先進節點需另行建立證據')
      },
      proof: bi('Product documentation identifies the OTP role; an independent evaluator demonstrated a sophisticated invasive extraction path.', '產品文件辨識 OTP 角色；獨立評估者示範高階 invasive extraction 路徑。'),
      notProof: bi('It does not show that every node, macro or threat model is attacked with the same cost or method.', '它不能證明每個節點、macro 或 threat model 都能以相同成本或方法攻擊。'),
      validationGate: bi('Evaluate encrypted payloads, PUF-derived ephemeral keys, lifecycle controls and the intended physical threat model.', '評估加密 payload、PUF-derived ephemeral key、生命週期控制與目標實體威脅模型。'),
      sources: [
        { label: bi('Raspberry Pi RP2350 datasheet', 'Raspberry Pi RP2350 datasheet'), actor: bi('Named product documentation', '具名產品文件'), url: 'https://pip-assets.raspberrypi.com/categories/1214-rp2350/documents/RP-008373-DS-2-rp2350-datasheet.pdf?disposition=inline' },
        { label: bi('IOActive RP2350 physical-attack report', 'IOActive RP2350 實體攻擊報告'), actor: bi('Independent evaluator', '獨立評估者'), url: 'https://ioactive.com/wp-content/uploads/2025/01/IOActive-RP2350HackingChallenge.pdf' }
      ]
    },
    {
      id: 'APP-SHIELD-029',
      sequence: '07',
      rationale: 'security',
      title: bi('SHIELD authenticity dielet', 'SHIELD 真偽驗證 dielet'),
      subtitle: bi('A tiny persistent identity follows a component through the supply chain', '微型持久身分伴隨元件穿越整個供應鏈'),
      summary: bi('DARPA documents a 28-nm dielet with a 256-bit NVM-programmed secret. A historical Kilopass disclosure names a 320-bit OTP block; the public record does not resolve the bit allocation.', 'DARPA 公開 28-nm dielet 與 256-bit NVM-programmed secret；Kilopass 歷史資料提及 320-bit OTP block，但公開紀錄未解析 bit 分配。'),
      evidenceLabel: 'NAMED IMPLEMENTATION',
      stateFlow: {
        trigger: bi('Wafer-probe identity provisioning', 'wafer-probe 身分佈署'),
        payload: bi('Unique identity and cryptographic secret', '唯一身分與密碼學祕密'),
        reader: bi('Dielet authentication logic', 'dielet 驗證邏輯'),
        consumer: bi('Supply-chain challenge response and provenance', '供應鏈 challenge-response 與 provenance')
      },
      contract: {
        writeCadence: bi('Program once at trusted manufacturing', '在可信製造階段一次寫入'),
        candidateTechnology: bi('Custom low-power OTP within a security dielet', '安全 dielet 內的客製低功耗 OTP'),
        processLens: bi('Public 28-nm TSMC program evidence', '公開 28-nm TSMC 計畫證據')
      },
      proof: bi('Official program material establishes the dielet, node and NVM-programmed secret; a vendor record identifies an OTP contribution.', '官方計畫資料建立 dielet、節點與 NVM-programmed secret；供應商紀錄辨識 OTP 貢獻。'),
      notProof: bi('The 320-bit block cannot be silently equated to the 256-bit secret, and later implementations may differ.', '不能直接把 320-bit block 等同於 256-bit secret，後續實作也可能不同。'),
      validationGate: bi('Resolve the public bit map, generation, threat evaluation and exact macro qualification.', '釐清公開 bit map、世代、威脅評估與確切 macro qualification。'),
      sources: [
        { label: bi('DARPA SHIELD program', 'DARPA SHIELD 計畫'), actor: bi('Public program', '公開計畫'), url: 'https://www.darpa.mil/research/programs/supply-chain-hardware-integrity-for-electronics-defense' },
        { label: bi('DARPA SHIELD dielet presentation', 'DARPA SHIELD dielet 簡報'), actor: bi('Public program', '公開計畫'), url: 'https://eri-summit.darpa.mil/docs/20180725_1545_SHIELD.pdf' },
        { label: bi('Kilopass historical disclosure', 'Kilopass 歷史揭露'), actor: bi('Historical vendor disclosure', '歷史供應商揭露'), url: 'https://www.chipestimate.com/KilopassUltra-LowPowerOTPNVMProvidesStorageforNorthropGrummanAdvancedSiliconProcessorThatPreventsCounterfeitElectronicPartsEnteringDoDSupplyChains/Kilopass-Technology-a-part-of-Synopsys/news/41935' }
      ]
    },
    {
      id: 'APP-DDR5-PMIC-016',
      sequence: '08',
      rationale: 'configuration',
      title: bi('DDR5 PMIC configuration and logging', 'DDR5 PMIC 設定與記錄'),
      subtitle: bi('Power policy must persist beside the memory module it controls', '電源政策必須與受控記憶體模組一同持久保留'),
      summary: bi('The Renesas P8911 discloses MTP-backed configuration and persistent error logging in a JEDEC-compatible DDR5 PMIC. JEDEC defines behavior; the named product supplies the physical implementation example.', 'Renesas P8911 公開 JEDEC-compatible DDR5 PMIC 的 MTP-backed 設定與持久 error log。JEDEC 定義行為，具名產品提供實體實作範例。'),
      evidenceLabel: 'NAMED IMPLEMENTATION',
      stateFlow: {
        trigger: bi('Module manufacturing, power tuning and fault events', '模組製造、電源調校與 fault 事件'),
        payload: bi('Rail values, sequencing, policy and persistent error log', '電壓軌、時序、政策與持久 error log'),
        reader: bi('PMIC state machine and host management path', 'PMIC state machine 與 host 管理路徑'),
        consumer: bi('DDR5 power-up, reliability and service diagnostics', 'DDR5 上電、可靠度與維修診斷')
      },
      contract: {
        writeCadence: bi('Factory configuration plus bounded updates and logs', '工廠設定加上有限更新與 log'),
        candidateTechnology: bi('On-chip MTP in the named product', '具名產品中的 on-chip MTP'),
        processLens: bi('PMIC process, I/O rails, write energy and qualification', 'PMIC 製程、I/O rail、寫入能量與 qualification')
      },
      proof: bi('A named DDR5 PMIC explicitly discloses MTP-backed configuration and persistent logging.', '具名 DDR5 PMIC 明確公開 MTP-backed 設定與持久記錄。'),
      notProof: bi('JEDEC compatibility does not mandate this physical MTP cell or prove every compliant PMIC uses embedded MTP.', 'JEDEC 相容性不代表規範指定此物理 MTP cell，也不能證明所有相容 PMIC 都採 embedded MTP。'),
      validationGate: bi('Confirm target register ownership, update count, log retention, programming rail and supplier qualification.', '確認目標 register 權責、更新次數、log retention、燒錄電源與供應商 qualification。'),
      sources: [
        { label: bi('Renesas P8911 short-form datasheet', 'Renesas P8911 short-form datasheet'), actor: bi('Named product documentation', '具名產品文件'), url: 'https://www.renesas.com/en/document/sds/p8911-short-form-datasheet' }
      ]
    },
    {
      id: 'APP-DDR5-SPD-017',
      sequence: '09',
      rationale: 'configuration',
      title: bi('DDR5 SPD Hub descriptors', 'DDR5 SPD Hub 描述資料'),
      subtitle: bi('Protected rewritable blocks travel with the module identity', '受保護的可重寫 block 隨模組身分一同存在'),
      summary: bi('The Renesas SPD5118 exposes a 1,024-byte EEPROM arranged as sixteen protected blocks. The application is concrete; the physical cell architecture and lifecycle ownership remain open.', 'Renesas SPD5118 公開 1,024-byte EEPROM，分成十六個受保護 block。應用是具體的，但物理 cell 架構與生命週期權責仍待確認。'),
      evidenceLabel: 'NAMED IMPLEMENTATION',
      stateFlow: {
        trigger: bi('DIMM assembly, characterization and controlled update', 'DIMM 組裝、characterization 與受控更新'),
        payload: bi('Module descriptors, vendor data and protected configuration', '模組描述、vendor data 與受保護設定'),
        reader: bi('SPD Hub and host memory initialization', 'SPD Hub 與 host 記憶體初始化'),
        consumer: bi('Memory discovery, timing policy and service inventory', '記憶體辨識、時序政策與服務盤點')
      },
      contract: {
        writeCadence: bi('Factory write with protected field updates', '工廠寫入與受保護欄位更新'),
        candidateTechnology: bi('1,024-byte EEPROM in the named product', '具名產品中的 1,024-byte EEPROM'),
        processLens: bi('Hub IC integration, protection granularity and module lifecycle', 'Hub IC 整合、保護粒度與模組生命週期')
      },
      proof: bi('A named DDR5 SPD Hub publishes its EEPROM capacity and block-protection organization.', '具名 DDR5 SPD Hub 公開 EEPROM 容量與 block-protection 組織。'),
      notProof: bi('The product page does not disclose the physical cell, endurance budget or every system owner allowed to write.', '產品頁未揭露物理 cell、endurance 預算或所有可寫入的系統權責者。'),
      validationGate: bi('Confirm write ownership, protected ranges, update budget, recovery and exact JEDEC/customer policy.', '確認寫入權責、保護範圍、更新預算、恢復機制與確切 JEDEC／客戶政策。'),
      sources: [
        { label: bi('Renesas SPD5118 product page', 'Renesas SPD5118 產品頁'), actor: bi('Named product documentation', '具名產品文件'), url: 'https://www.renesas.com/en/products/spd5118' }
      ]
    },
    {
      id: 'APP-ADAS-PMIC-021',
      sequence: '10',
      rationale: 'configuration',
      title: bi('Automotive digital-power profiles', '車用數位電源 profile'),
      subtitle: bi('Configuration and fault policy must survive every ignition cycle', '設定與 fault 政策必須跨越每次點火循環'),
      summary: bi('The MPS MPQ2967 discloses on-chip MTP with CRC and ECC for persistent configuration. Capacity, endurance, process node and any third-party NVM supplier are not public.', 'MPS MPQ2967 公開 on-chip MTP，搭配 CRC 與 ECC 保存設定；容量、endurance、製程節點與第三方 NVM 供應商均未公開。'),
      evidenceLabel: 'NAMED IMPLEMENTATION',
      stateFlow: {
        trigger: bi('Factory calibration, platform tuning and service policy', '工廠校準、平台調校與維修政策'),
        payload: bi('Rail profile, protection limits and fault parameters', '電壓軌 profile、保護限制與 fault 參數'),
        reader: bi('Digital power controller at start-up', '啟動時的數位電源控制器'),
        consumer: bi('ADAS and infotainment power integrity', 'ADAS 與 infotainment 電源完整性')
      },
      contract: {
        writeCadence: bi('Factory write plus controlled profile updates', '工廠寫入加上受控 profile 更新'),
        candidateTechnology: bi('On-chip MTP with CRC and ECC', '具 CRC 與 ECC 的 on-chip MTP'),
        processLens: bi('Automotive PMIC qualification and mission profile', '車用 PMIC qualification 與 mission profile')
      },
      proof: bi('A named automotive-grade digital-power product identifies on-chip MTP and data-protection features.', '具名車規數位電源產品明確指出 on-chip MTP 與資料保護功能。'),
      notProof: bi('The public record does not reveal capacity, endurance, process node, macro provider or universal PMIC architecture.', '公開紀錄未揭露容量、endurance、製程節點、macro 供應商或通用 PMIC 架構。'),
      validationGate: bi('Validate write cycles, retention, fault coverage, ASIL context, rails and exact automotive qualification.', '驗證寫入次數、retention、fault coverage、ASIL 情境、電源軌與確切車規 qualification。'),
      sources: [
        { label: bi('MPS MPQ2967 datasheet', 'MPS MPQ2967 datasheet'), actor: bi('Named product documentation', '具名產品文件'), url: 'https://www.monolithicpower.com/en/documentview/productdocument/index/version/2/document_type/Datasheet/lang/en/sku/MPQ2967GQKTE/' }
      ]
    },
    {
      id: 'APP-EDGE-VISION-022',
      sequence: '11',
      rationale: 'calibration',
      title: bi('Edge-vision traceability data', 'Edge-vision 追溯資料'),
      subtitle: bi('A small per-device record can matter more than model storage', '少量 per-device 紀錄可能比模型儲存更實際'),
      summary: bi('The ST VD55G1 discloses embedded OTP with 32-bit programming and at least 1 Kbit of user area for traceability and customer data. It does not say that AI models, root keys or calibration live there.', 'ST VD55G1 公開 embedded OTP、32-bit programming，以及至少 1 Kbit user area 用於追溯與客戶資料；它未說明 AI model、root key 或 calibration 儲存在其中。'),
      evidenceLabel: 'NAMED IMPLEMENTATION',
      stateFlow: {
        trigger: bi('Sensor-module manufacturing and personalization', '感測器模組製造與個人化'),
        payload: bi('Traceability and customer-programmable data', '追溯與客戶可程式化資料'),
        reader: bi('Sensor control and module software', '感測器控制與模組軟體'),
        consumer: bi('Inventory, configuration and field traceability', '資產盤點、設定與現場追溯')
      },
      contract: {
        writeCadence: bi('Program once in 32-bit words', '以 32-bit word 一次寫入'),
        candidateTechnology: bi('Embedded OTP in the named image sensor', '具名影像感測器中的 embedded OTP'),
        processLens: bi('CIS process integration and module test flow', 'CIS 製程整合與模組測試流程')
      },
      proof: bi('A named image sensor publishes the embedded OTP interface and minimum user area.', '具名影像感測器公開 embedded OTP 介面與最小 user area。'),
      notProof: bi('The source does not place AI models, calibration, secure-boot material or root keys in that OTP.', '來源未將 AI model、calibration、secure-boot 資料或 root key 放入該 OTP。'),
      validationGate: bi('Confirm payload ownership, write protection, sensor process support and module-manufacturing sequence.', '確認 payload 權責、寫入保護、感測器製程支援與模組製造順序。'),
      sources: [
        { label: bi('ST VD55G1 datasheet', 'ST VD55G1 datasheet'), actor: bi('Named product documentation', '具名產品文件'), url: 'https://www.st.com/resource/en/datasheet/vd55g1.pdf' }
      ]
    },
    {
      id: 'APP-SENSOR-023',
      sequence: '12',
      rationale: 'calibration',
      title: bi('Factory sensor compensation', '工廠感測器補償'),
      subtitle: bi('Every reading depends on trim state written before shipment', '每次讀值都依賴出貨前寫入的 trim state'),
      summary: bi('Bosch documents factory compensation coefficients stored in NVM and read during operation. The datasheet does not identify OTP, MTP, cell type, process node or IP supplier.', 'Bosch 文件說明工廠補償係數儲存在 NVM，並於運作時讀取；datasheet 未辨識 OTP、MTP、cell type、製程節點或 IP 供應商。'),
      evidenceLabel: 'NAMED IMPLEMENTATION',
      stateFlow: {
        trigger: bi('Factory characterization and trim', '工廠 characterization 與 trim'),
        payload: bi('Per-device compensation coefficients', 'per-device 補償係數'),
        reader: bi('Sensor driver during initialization and conversion', '初始化與轉換時的感測器 driver'),
        consumer: bi('Compensated pressure, temperature and humidity output', '補償後的壓力、溫度與濕度輸出')
      },
      contract: {
        writeCadence: bi('Factory-only; customer cannot modify', '僅工廠寫入；客戶不可修改'),
        candidateTechnology: bi('NVM; physical family not publicly disclosed', 'NVM；物理技術家族未公開'),
        processLens: bi('Mixed-signal sensor process and per-die test', 'mixed-signal 感測器製程與 per-die test')
      },
      proof: bi('A named sensor datasheet establishes persistent factory trim and operational readout.', '具名感測器 datasheet 建立持久工廠 trim 與運作時讀取。'),
      notProof: bi('It does not disclose the NVM cell, customer programmability, process node or external IP supplier.', '它未揭露 NVM cell、客戶可程式化能力、製程節點或外部 IP 供應商。'),
      validationGate: bi('Determine bit count, test ownership, retention across the mission profile and exact technology fit.', '確認 bit 數、測試權責、mission profile 下的 retention 與確切技術適配。'),
      sources: [
        { label: bi('Bosch BME280 datasheet', 'Bosch BME280 datasheet'), actor: bi('Named product documentation', '具名產品文件'), url: 'https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bme280-ds002.pdf' }
      ]
    },
    {
      id: 'APP-FPGA-ROOT-024',
      sequence: '13',
      rationale: 'security',
      title: bi('FPGA identity and key derivation', 'FPGA 身分與金鑰衍生'),
      subtitle: bi('Persistent identity and unclonable entropy can share a trust architecture', '持久身分與 unclonable entropy 可共用信任架構'),
      summary: bi('eMemory announced Achronix Speedster7t adoption of NeoFuse and NeoPUF. Achronix product material separately confirms PUF-backed key protection in the same family, but does not name eMemory or NeoFuse. These are participant disclosures, not an independent security certification.', 'eMemory 宣布 Achronix Speedster7t 採用 NeoFuse 與 NeoPUF。Achronix 產品資料另行確認同一家族採用 PUF-backed 金鑰保護，但未指名 eMemory 或 NeoFuse。這些都是參與方揭露，不是獨立安全認證。'),
      evidenceLabel: 'VENDOR DISCLOSURE',
      stateFlow: {
        trigger: bi('FPGA manufacture and device enrollment', 'FPGA 製造與裝置 enrollment'),
        payload: bi('Persistent identity plus PUF-derived key material', '持久身分加上 PUF-derived key material'),
        reader: bi('Hardware root-of-trust logic', 'hardware root-of-trust 邏輯'),
        consumer: bi('Authentication, bitstream trust and device services', '驗證、bitstream trust 與裝置服務')
      },
      contract: {
        writeCadence: bi('Identity provisioned once; PUF response reconstructed as needed', '身分一次佈署；PUF response 依需重建'),
        candidateTechnology: bi('NeoFuse plus NeoPUF in the disclosed adoption', '公開 adoption 中的 NeoFuse 加 NeoPUF'),
        processLens: bi('Advanced FPGA platform; exact lifecycle is not public', '先進 FPGA 平台；確切生命週期未公開')
      },
      proof: bi('The eMemory disclosure names NeoFuse and NeoPUF in Speedster7t; Achronix product material separately confirms PUF-backed key protection in that FPGA family.', 'eMemory 揭露指名 Speedster7t 採用 NeoFuse 與 NeoPUF；Achronix 產品資料另行確認該 FPGA 家族採用 PUF-backed 金鑰保護。'),
      notProof: bi('Achronix material does not name eMemory or NeoFuse, and neither participant source is an independent teardown, attack evaluation, certification or complete lifecycle disclosure.', 'Achronix 資料未指名 eMemory 或 NeoFuse，且兩個參與方來源都不是獨立 teardown、攻擊評估、認證或完整生命週期揭露。'),
      validationGate: bi('Confirm shipped configuration, enrollment, helper data, failure handling and independent attack evidence.', '確認出貨設定、enrollment、helper data、失效處理與獨立攻擊證據。'),
      sources: [
        { label: bi('eMemory Achronix adoption announcement', 'eMemory Achronix adoption 公告'), actor: bi('Vendor disclosure', '供應商揭露'), url: 'https://ft.ememory.com.tw/en-US/News/2021-04-28/Achronix-Adopts-eMemory-IP-for-FPGA-Hardware-Root-of-Trust' },
        { label: bi('Achronix Speedster7t announcement', 'Achronix Speedster7t 公告'), actor: bi('Named customer', '具名客戶'), url: 'https://www.achronix.com/press-releases/achronix-introduces-ground-breaking-fpga-family-delivering-new-levels-performance' }
      ]
    },
    {
      id: 'APP-RETIMER-025',
      sequence: '14',
      rationale: 'emerging',
      title: bi('PCIe and CXL retimer opportunity', 'PCIe 與 CXL retimer 機會'),
      subtitle: bi('External configuration today defines an embedded-NVM qualification question', '今日的外部設定揭示 embedded NVM 的 qualification 問題'),
      summary: bi('Public retimer products load firmware or configuration from external EEPROM or SPI flash. Replacing that storage with embedded MTP, eFlash or MRAM is a bounded opportunity hypothesis, not a disclosed design win.', '公開 retimer 產品從 external EEPROM 或 SPI flash 載入 firmware／設定。以 embedded MTP、eFlash 或 MRAM 取代，是有邊界的機會假設，不是已公開 design win。'),
      evidenceLabel: 'BOUNDED INFERENCE',
      stateFlow: {
        trigger: bi('Board assembly, lane tuning and firmware update', '板級組裝、lane 調校與 firmware 更新'),
        payload: bi('Equalization profiles, lane map, configuration and code', 'equalization profile、lane map、設定與程式碼'),
        reader: bi('Retimer boot loader and link-training logic', 'retimer boot loader 與 link-training 邏輯'),
        consumer: bi('PCIe or CXL link bring-up and recovery', 'PCIe 或 CXL link bring-up 與恢復')
      },
      contract: {
        writeCadence: bi('Factory image plus managed field updates', '工廠 image 加上受管理的現場更新'),
        candidateTechnology: bi('Embedded MTP, eFlash or MRAM candidate', 'embedded MTP、eFlash 或 MRAM 候選'),
        processLens: bi('SerDes process, capacity, boot time and recovery architecture', 'SerDes 製程、容量、boot time 與 recovery 架構')
      },
      proof: bi('Named products establish persistent boot/configuration state and an external-memory dependency.', '具名產品建立持久 boot／設定狀態與外部記憶體依賴。'),
      notProof: bi('No cited source proves an embedded NVM implementation, selected technology or production design win.', '引用來源均無法證明 embedded NVM 實作、選定技術或量產 design win。'),
      validationGate: bi('Quantify code size, update frequency, rollback, power-fail recovery, process option and BOM value.', '量化程式容量、更新頻率、rollback、掉電恢復、製程選項與 BOM 價值。'),
      sources: [
        { label: bi('TI DS160PT801 datasheet', 'TI DS160PT801 datasheet'), actor: bi('Named product documentation', '具名產品文件'), url: 'https://www.ti.com/lit/ds/symlink/ds160pt801.pdf' },
        { label: bi('Microchip PM8691 brochure', 'Microchip PM8691 brochure'), actor: bi('Named product documentation', '具名產品文件'), url: 'https://www.microchip.com/content/dam/mchp/documents/DCS/ProductDocuments/Brochures/XpressConnect-PCIe-Gen-6-and-CXL-Retimer-Family-DS00006433.pdf' }
      ]
    },
    {
      id: 'APP-PHOTONICS-026',
      sequence: '15',
      rationale: 'emerging',
      title: bi('Nonvolatile photonic routing state', '非揮發性光子路由狀態'),
      subtitle: bi('Phase-change material can hold an optical setting without static power', 'phase-change material 可在無靜態功耗下保持光學設定'),
      summary: bi('Peer-reviewed GST photonic-switch research demonstrates nonvolatile optical state. It is a research result, not commercial OTP or MTP IP availability, qualification or a production design win.', '經同儕審查的 GST photonic-switch 研究展示非揮發性光學狀態。它是研究成果，不代表商用 OTP／MTP IP 可用性、qualification 或量產 design win。'),
      evidenceLabel: 'EMERGING RESEARCH',
      stateFlow: {
        trigger: bi('Optical network calibration or routing update', '光學網路校準或路由更新'),
        payload: bi('Phase state defining an optical path', '定義光學路徑的 phase state'),
        reader: bi('Photonic circuit during signal propagation', '訊號傳輸時的 photonic circuit'),
        consumer: bi('Programmable switching without static hold power', '無靜態保持功耗的可程式切換')
      },
      contract: {
        writeCadence: bi('Research-dependent reconfiguration cycles', '依研究條件而異的重設定次數'),
        candidateTechnology: bi('GST phase-change photonic element', 'GST phase-change photonic element'),
        processLens: bi('Silicon-photonics integration, optical loss and endurance', 'silicon-photonics 整合、optical loss 與 endurance')
      },
      proof: bi('A peer-reviewed experiment demonstrates a programmable nonvolatile photonic switching element.', '經同儕審查的實驗展示可程式化非揮發性 photonic switching element。'),
      notProof: bi('It does not establish commercial OTP or MTP IP, foundry qualification, product availability or volume adoption.', '它不能建立商用 OTP／MTP IP、foundry qualification、產品可用性或量產採用。'),
      validationGate: bi('Validate endurance, drift, optical loss, write energy, control integration and commercial foundry support.', '驗證 endurance、drift、optical loss、寫入能量、控制整合與商用 foundry 支援。'),
      sources: [
        { label: bi('ACS Photonics programmable-unit paper', 'ACS Photonics programmable-unit 論文'), actor: bi('Peer-reviewed research', '同儕審查研究'), url: 'https://pubs.acs.org/doi/10.1021/acsphotonics.2c00452' }
      ]
    },
    {
      id: 'APP-OAI-FRU-031',
      sequence: '16',
      rationale: 'calibration',
      title: bi('OAI UBB FRU identity', 'OAI UBB FRU 身分資料'),
      subtitle: bi('A BMC-accessible EEPROM keeps board identity with the UBB', 'BMC 可存取的 EEPROM 讓板級身分資料隨 UBB 保留'),
      summary: bi('The OAI-UBB specification directly requires one BMC-accessible FRU EEPROM on the board, dedicated to the BMC and formatted according to the IPMI FRU model. This establishes a board-level rewritable-NVM socket, not an embedded-MTP design win.', 'OAI-UBB 規範直接要求板上配置一個 BMC 可存取、專供 BMC 使用，並依 IPMI FRU 格式組織的 FRU EEPROM。這建立了板級可重寫 NVM socket，但不代表 embedded MTP 已取得 design win。'),
      evidenceLabel: 'PUBLIC REQUIREMENT',
      stateFlow: {
        trigger: bi('UBB manufacturing, inventory creation or governed service update', 'UBB 製造、資產資料建立或受控維修更新'),
        payload: bi('Board identity and IPMI-format FRU information', '板級身分與 IPMI 格式 FRU 資訊'),
        reader: bi('Baseboard management controller', 'Baseboard management controller'),
        consumer: bi('Platform inventory and service workflow', '平台資產盤點與維修流程')
      },
      contract: {
        writeCadence: bi('Rewritable EEPROM; write cadence and authority are not defined by the cited clauses', '可重寫 EEPROM；引用條文未定義寫入頻率與權責'),
        candidateTechnology: bi('Board-level FRU EEPROM as specified; embedded MTP is only an integration candidate', '規範指定板級 FRU EEPROM；embedded MTP 僅是整合候選'),
        processLens: bi('Board EEPROM today; integration requires process, endurance and service-flow validation', '現行為板級 EEPROM；若要整合，仍須驗證製程、endurance 與維修流程')
      },
      proof: bi('OAI-UBB directly specifies one BMC-accessible FRU EEPROM and an IPMI-standard FRU format.', 'OAI-UBB 直接指定一個 BMC 可存取的 FRU EEPROM，以及符合 IPMI 標準的 FRU 格式。'),
      notProof: bi('It does not require SoC integration, embedded MTP, a particular EEPROM density, one IP supplier or a commercial design win.', '它不要求 SoC 整合、embedded MTP、特定 EEPROM 容量、單一 IP 供應商或商業 design win。'),
      validationGate: bi('Determine whether the target retains external EEPROM or integrates equivalent rewritable NVM, then close capacity, write ownership, service updates, retention and recovery.', '確認目標設計保留 external EEPROM，或整合等效可重寫 NVM；再完成容量、寫入權責、維修更新、retention 與 recovery 驗證。'),
      sources: [
        { label: bi('OCP OAI-UBB Base Specification r2.0 · §7.1.2 and §10.3', 'OCP OAI-UBB 基礎規範 r2.0 · §7.1.2 與 §10.3'), actor: bi('Public specification', '公開規範'), url: 'https://www.opencompute.org/documents/oai-ubb-base-specification-r2-0-v0-5-2-pdf' }
      ]
    },
    {
      id: 'APP-ELSFP-NV-032',
      sequence: '17',
      rationale: 'configuration',
      title: bi('ELSFP saved lane configuration', 'ELSFP 持久化 lane 設定'),
      subtitle: bi('Two host-selected slots preserve selected controls beside a factory set', '兩個 host-selected slot 在 factory set 之外保存選定控制值'),
      summary: bi('OIF ELSFP-CMIS 1.0 defines Page 03h as User NV RAM and lets a host save selected lane power/current controls and alarm/warning masks into nonvolatile memory. The interface exposes persistent configuration directly while leaving the physical NVM implementation open.', 'OIF ELSFP-CMIS 1.0 將 Page 03h 定義為 User NV RAM，並允許 host 將選定的 lane power／current control 與 alarm／warning mask 儲存到非揮發性記憶體。介面直接揭示持久化設定需求，但保留物理 NVM 實作選擇。'),
      evidenceLabel: 'PUBLIC REQUIREMENT',
      stateFlow: {
        trigger: bi('Host configuration and explicit save command', 'Host 設定與明確 save command'),
        payload: bi('Lane power/current controls and alarm/warning masks', 'Lane power／current control 與 alarm／warning mask'),
        reader: bi('ELSFP module controller during restore', 'ELSFP module controller 在 restore 階段讀取'),
        consumer: bi('Restored optical-module operating configuration', '恢復後的光學模組運作設定')
      },
      contract: {
        writeCadence: bi('Host-initiated saves to two selectable slots; endurance remains implementation-specific', 'Host 可寫入兩個可選 slot；endurance 仍由實作決定'),
        candidateTechnology: bi('Implementation-specific rewritable NVM; MTP or EEPROM are qualification candidates', '實作特定的可重寫 NVM；MTP 或 EEPROM 均為 qualification 候選'),
        processLens: bi('ELSFP controller integration, atomic save/restore, endurance, retention and module qualification', 'ELSFP controller 整合、atomic save／restore、endurance、retention 與模組 qualification')
      },
      proof: bi('ELSFP-CMIS defines User NV RAM plus save and restore behavior for selected lane controls and masks.', 'ELSFP-CMIS 定義 User NV RAM，以及選定 lane control 與 mask 的 save／restore 行為。'),
      notProof: bi('It does not mandate OTP, MTP or EEPROM bitcell technology, density, endurance, programming voltage, temperature tables or a module vendor.', '它不指定 OTP、MTP 或 EEPROM bitcell 技術、容量、endurance、programming voltage、溫度表或模組供應商。'),
      validationGate: bi('Bind the exact CMIS profile, update frequency, atomicity, power-fail recovery, endurance, retention, temperature range and access-control policy.', '綁定確切 CMIS profile、更新頻率、atomicity、掉電恢復、endurance、retention、溫度範圍與 access-control policy。'),
      sources: [
        { label: bi('OIF ELSFP-CMIS 1.0 · Table 1 and §8.8', 'OIF ELSFP-CMIS 1.0 · Table 1 與 §8.8'), actor: bi('Public specification', '公開規範'), url: 'https://www.oiforum.com/wp-content/uploads/OIF-ELSFP-CMIS-01.0.pdf' }
      ]
    },
    {
      id: 'APP-FIDO-AUTH-033',
      sequence: '18',
      rationale: 'security',
      title: bi('FIDO authenticator persistent state', 'FIDO authenticator 持久狀態'),
      subtitle: bi('Credential modality—not the protocol name—defines the NVM pressure', 'Credential modality，而非協定名稱，決定 NVM 壓力'),
      summary: bi('WebAuthn defines credential-source semantics without mandating an SE or memory type. Discoverable credentials need client-side state; server-side credentials may wrap the credential source into an RP-held credential ID. OTP, PUF and updateable NVM remain bounded implementation choices.', 'WebAuthn 定義 credential-source 語義，但不強制 SE 或記憶體類型。Discoverable credential 需要 client-side state；server-side credential 可將 credential source 封裝到由 RP 保存的 credential ID。OTP、PUF 與可更新 NVM 仍是有邊界的實作選擇。'),
      evidenceLabel: 'PUBLIC REQUIREMENT',
      stateFlow: {
        trigger: bi('Credential registration, lifecycle provisioning or account enrollment', 'Credential 註冊、生命週期佈署或帳號 enrollment'),
        payload: bi('RP-bound public key credential source and implementation-defined local policy state', '綁定 RP 的 public key credential source 與實作定義的本地政策狀態'),
        reader: bi('Authenticator secure boundary during registration or authentication', '註冊或登入驗證期間的 authenticator 安全邊界'),
        consumer: bi('RP registration policy and signed authentication assertions', 'RP 註冊政策與簽署的 authentication assertion')
      },
      contract: {
        writeCadence: bi('Local persistent state grows per registration for discoverable credentials; a wrapped server-side design instead creates an RP-held ciphertext per registration while local root state follows its own lifecycle.', 'Discoverable credential 的本地持久狀態會隨註冊增加；wrapped server-side 設計則在每次註冊產生由 RP 保存的 ciphertext，而本地 root state 依其自身生命週期管理。'),
        candidateTechnology: bi('Protected updateable NVM, wrapped credential ID, PUF-derived or stored device root', '受保護可更新 NVM、wrapped credential ID、PUF-derived 或持久裝置根'),
        processLens: bi('Authenticator boundary, storage modality, backup eligibility, assurance level and provisioning model', 'Authenticator 邊界、storage modality、backup eligibility、安全保證等級與佈署模型')
      },
      proof: bi('Current WebAuthn and CTAP specifications define credential storage modalities, RP binding and authenticator-controlled private-key operation.', '現行 WebAuthn 與 CTAP 規範定義 credential storage modality、RP 綁定，以及由 authenticator 控制的私鑰運作。'),
      notProof: bi('They do not require a Secure Element, PUF, OTP-held attestation key, EEPROM-resident passkeys, address scrambling or one side-channel circuit recipe.', '規範不要求 Secure Element、PUF、存於 OTP 的 attestation key、常駐 EEPROM 的 passkey、address scrambling 或單一側道防護電路配方。'),
      validationGate: bi('Select the deployment boundary, storage modality, backup eligibility, attestation model, persistent assets, revocation/recovery policy and target security-evaluation level.', '選定部署邊界、storage modality、backup eligibility、attestation model、持久資產、撤銷／復原政策與目標安全評估等級。'),
      sources: [
        { label: bi('W3C Web Authentication Level 3', 'W3C Web Authentication Level 3'), actor: bi('W3C Recommendation · 25 August 2026', 'W3C Recommendation · 2026 年 8 月 25 日'), url: 'https://www.w3.org/TR/webauthn-3/' },
        { label: bi('FIDO CTAP 2.2 Proposed Standard', 'FIDO CTAP 2.2 Proposed Standard'), actor: bi('Current authenticator protocol', '現行 authenticator 協定'), url: 'https://fidoalliance.org/specs/fido-v2.2-ps-20250714/fido-client-to-authenticator-protocol-v2.2-ps-20250714.html' },
        { label: bi('FIDO Authenticator Security and Privacy Requirements v1.7', 'FIDO Authenticator Security and Privacy Requirements v1.7'), actor: bi('Certification table: ACTIVE; source document: Review Draft', '認證頁列為 ACTIVE；來源文件本身為 Review Draft'), url: 'https://fidoalliance.org/specs/fido-security-requirements/fido-authenticator-security-requirements-v1.7-rd-20260506.html' },
        { label: bi('FIDO Authenticator Security and Privacy Requirements v1.6', 'FIDO Authenticator Security and Privacy Requirements v1.6'), actor: bi('General security certification requirements', '一般安全認證要求'), url: 'https://fidoalliance.org/specs/fido-security-requirements/fido-authenticator-security-requirements-v1.6-fd-20250312.html' },
        { label: bi('FIDO Authenticator Security and Privacy Requirements v1.5.1', 'FIDO Authenticator Security and Privacy Requirements v1.5.1'), actor: bi('Mandatory certification baseline for L3/L3+', 'L3／L3+ 強制認證基準'), url: 'https://fidoalliance.org/specs/fido-security-requirements/fido-authenticator-security-requirements-v1.5.1-fd-20251016.html' },
        { label: bi('FIDO Authenticator Certification Levels', 'FIDO Authenticator 認證等級'), actor: bi('Active-version table and L3/L3+ rule', '有效版本表與 L3／L3+ 規則'), url: 'https://fidoalliance.org/certification/authenticator-certification-levels/' }
      ]
    }
  ],
  explorers: [
    {
      id: 'state-lifecycle',
      title: bi('State that survives power loss', '斷電後仍需保留的狀態'),
      body: bi('Trace repair and calibration, identity and lifecycle, plus configuration and logs from write event to system consumer.', '從寫入事件一路追蹤 repair／calibration、identity／lifecycle，以及 configuration／logs，直到系統使用端。'),
      cta: bi('Open lifecycle map', '開啟生命週期圖'),
      boundary: bi('Conceptual lifecycle paths · English explorer · not a product-selection claim', '概念性生命週期路徑 · 英文 explorer · 不代表產品選定'),
      href: bi('./nvm-state-path.html', './nvm-state-path.html'),
      relatedCaseIds: ['APP-AI-ROOT-001', 'APP-AI-HBM-002', 'APP-SOC-REPAIR-018', 'APP-DDR5-PMIC-016']
    },
    {
      id: 'ocp-ai-system',
      title: bi('NVM opportunities across an OCP AI system', 'OCP 導向 AI 系統中的 NVM 機會'),
      body: bi('Compare four distributed persistent-state paths across accelerator trust, UBB service identity, HBM repair and ELSFP saved configuration.', '比較分布在 accelerator trust、UBB 維修身分、HBM repair 與 ELSFP 持久化設定中的四條狀態路徑。'),
      cta: bi('Open OCP AI system map', '開啟 OCP AI 系統圖'),
      boundary: bi('Public requirements and bounded candidates remain visibly separated · no universal bitcell or design-win claim', '公開需求與有邊界的候選方案分開標示 · 不宣稱通用 bitcell 或 design win'),
      href: bi('./ocp-ai-nvm-opportunity-map.html', './ocp-ai-nvm-opportunity-map-zh.html'),
      relatedCaseIds: ['APP-AI-ROOT-001', 'APP-AI-HBM-002', 'APP-BMC-019', 'APP-CALIPTRA-020', 'APP-RETIMER-025', 'APP-OAI-FRU-031', 'APP-ELSFP-NV-032']
    }
  ],
  history: [
    {
      year: bi('Before 2017', '2017 年以前'),
      title: bi('Synopsys AEON MTP', 'Synopsys AEON MTP'),
      body: bi('Synopsys already had a public MTP portfolio before the later acquisitions.', 'Synopsys 在後續併購前，已擁有公開的 MTP 產品組合。')
    },
    {
      year: bi('2017', '2017 年'),
      title: bi('Sidense joins Synopsys', 'Sidense 併入 Synopsys'),
      body: bi('Sidense added publicly described 1T-Fuse OTP capability and application history.', 'Sidense 帶入公開描述的 1T-Fuse OTP 能力與應用歷史。')
    },
    {
      year: bi('2018', '2018 年'),
      title: bi('Kilopass joins Synopsys', 'Kilopass 併入 Synopsys'),
      body: bi('Kilopass added 1T and 2T antifuse OTP plus code-storage and security positioning.', 'Kilopass 帶入 1T／2T antifuse OTP，以及 code-storage 與 security 定位。')
    },
    {
      year: bi('Current public portfolio', '現行公開產品組合'),
      title: bi('DesignWare NVM portfolio', 'DesignWare NVM 產品組合'),
      body: bi('Public material presents OTP, FTP, MTP and secure-storage choices without proving a one-to-one genealogy for every current macro.', '公開資料呈現 OTP、FTP、MTP 與 secure-storage 選項，但未證明每個現行 macro 的一對一技術系譜。')
    }
  ],
  sharePointFields: [
    'Application',
    'PersistentState',
    'UpdateCadence',
    'TechnologyFamily',
    'ProcessNode',
    'VoltageLens',
    'EvidenceClass',
    'SourceActor',
    'SourceURL',
    'SourceLocator',
    'ReviewedDate',
    'Limitation',
    'OpenValidation'
  ]
};
